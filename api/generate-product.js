import { generateProduct } from '../lib/product-ai.js';

const REPOSITORY = 'raddenpattah/Katalog-Affiliate';
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_BY_IP = 20;
const RATE_LIMIT_BY_ACCOUNT = 10;
const rateLimits = new Map();

function clientIp(request) {
  const headers = request.headers || {};
  const forwardedFor = headers['x-forwarded-for'];
  const address = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '';
  return address || request.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(key, limit) {
  const now = Date.now();
  const existing = rateLimits.get(key);
  if (!existing || existing.expiresAt <= now) {
    rateLimits.set(key, { count: 1, expiresAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

// In-memory counters are best-effort and scoped to each serverless instance.
function cleanRateLimitEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (entry.expiresAt <= now) rateLimits.delete(key);
  }
}

async function verifyGithubWriter(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  let userResponse;
  try {
    userResponse = await fetch('https://api.github.com/user', { headers });
  } catch {
    return { ok: false, status: 503, error: 'Autentikasi GitHub tidak dapat diverifikasi saat ini.' };
  }
  if (userResponse.status === 401) {
    return { ok: false, status: 401, error: 'Sesi GitHub tidak valid. Login ulang ke CMS.' };
  }
  if (!userResponse.ok) {
    return { ok: false, status: 503, error: 'Autentikasi GitHub tidak dapat diverifikasi saat ini.' };
  }

  let user;
  try {
    user = await userResponse.json();
  } catch {
    return { ok: false, status: 503, error: 'Respons autentikasi GitHub tidak valid.' };
  }
  if (typeof user.login !== 'string' || !user.login) {
    return { ok: false, status: 401, error: 'Identitas sesi GitHub tidak valid.' };
  }

  let repositoryResponse;
  try {
    repositoryResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}`, { headers });
  } catch {
    return { ok: false, status: 503, error: 'Hak akses repository tidak dapat diverifikasi saat ini.' };
  }
  if (repositoryResponse.status === 401) {
    return { ok: false, status: 401, error: 'Sesi GitHub tidak valid. Login ulang ke CMS.' };
  }
  if (repositoryResponse.status === 403 || repositoryResponse.status === 404) {
    return { ok: false, status: 403, error: 'Akun GitHub tidak memiliki hak akses ke repository.' };
  }
  if (!repositoryResponse.ok) {
    return { ok: false, status: 503, error: 'Hak akses repository tidak dapat diverifikasi saat ini.' };
  }

  let repository;
  try {
    repository = await repositoryResponse.json();
  } catch {
    return { ok: false, status: 503, error: 'Respons hak akses GitHub tidak valid.' };
  }
  const permissions = repository.permissions;
  if (!permissions || !(permissions.push || permissions.maintain || permissions.admin)) {
    return { ok: false, status: 403, error: 'Akun GitHub harus memiliki hak push ke repository.' };
  }

  return { ok: true, login: user.login };
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (process.env.ENABLE_AI_GENERATOR !== 'true') {
    return response.status(403).json({ error: 'AI product generation is disabled' });
  }

  cleanRateLimitEntries();
  const ip = clientIp(request);
  const ipLimit = checkRateLimit(`ip:${ip}`, RATE_LIMIT_BY_IP);
  if (!ipLimit.allowed) {
    response.setHeader('Retry-After', String(ipLimit.retryAfter));
    return response.status(429).json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' });
  }

  const authorization = request.headers?.authorization || '';
  const tokenMatch = authorization.match(/^Bearer\s+(\S+)$/i);
  if (!tokenMatch) {
    return response.status(401).json({ error: 'Sesi GitHub Decap diperlukan.' });
  }

  const auth = await verifyGithubWriter(tokenMatch[1]);
  if (!auth.ok) {
    return response.status(auth.status).json({ error: auth.error });
  }

  const accountLimit = checkRateLimit(`account:${auth.login.toLowerCase()}`, RATE_LIMIT_BY_ACCOUNT);
  if (!accountLimit.allowed) {
    response.setHeader('Retry-After', String(accountLimit.retryAfter));
    return response.status(429).json({ error: 'Batas permintaan generator untuk akun ini tercapai.' });
  }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response.status(400).json({ error: 'JSON object diperlukan.' });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  if (description.length < 80) {
    return response.status(400).json({ error: 'tempel deskripsi Shopee dulu (minimal 80 karakter).' });
  }
  if (!title || !category) {
    return response.status(400).json({ error: 'Nama produk dan kategori wajib diisi.' });
  }
  if (title.length > 200 || category.length > 100 || description.length > 800) {
    return response.status(400).json({ error: 'Data sumber terlalu panjang.' });
  }

  try {
    const product = await generateProduct({ title, category, description });
    return response.status(200).json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('Hasil AI tidak valid:')) {
      return response.status(502).json({ error: message });
    }
    console.error('AI product generation failed.');
    return response.status(502).json({
      error: message === 'Tidak ada provider AI produk yang aktif atau memiliki API key.'
        ? message
        : 'Generator produk gagal. Coba lagi nanti.',
    });
  }
}
