import { generatePin, AVAILABLE_STYLES } from './lib/pin-generator.js';

export const maxDuration = 30;

const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;

function getBaseUrl(request) {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  const host = request.headers.host || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response.status(400).json({ error: 'JSON object diperlukan' });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : 'Artikel';
  const style = typeof body.style === 'string' ? body.style.trim().toLowerCase() : 'minimalis';

  if (!title || !imageUrl) {
    return response.status(400).json({ error: 'Title dan imageUrl wajib diisi' });
  }
  if (title.length > MAX_TITLE_LENGTH || category.length > MAX_CATEGORY_LENGTH) {
    return response.status(400).json({ error: 'Title atau category terlalu panjang' });
  }
  if (!AVAILABLE_STYLES.includes(style)) {
    return response.status(400).json({
      error: `Style "${style}" tidak dikenal`,
      availableStyles: AVAILABLE_STYLES,
    });
  }

  try {
    const baseUrl = getBaseUrl(request);
    console.info(`[generate-pin] Render style="${style}" title="${title.slice(0, 40)}..."`);
    console.info(`[generate-pin] imageUrl="${imageUrl}" baseUrl="${baseUrl}"`);

    const pngBuffer = await generatePin({
      title,
      imageUrl,
      category,
      style,
      baseUrl,
    });

    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Cache-Control', 'public, max-age=3600');
    response.setHeader('X-Pin-Style', style);

    return response.status(200).send(pngBuffer);
  } catch (error) {
    console.error('[generate-pin] Error:', error);
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal generate pin',
    });
  }
}
