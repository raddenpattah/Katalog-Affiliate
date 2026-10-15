import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readConfig } from './config-store.js';

const systemPrompt = `${readFileSync(
  fileURLToPath(new URL('../src/data/product-writing-rules.md', import.meta.url)),
  'utf8',
).trim()}

Kembalikan hanya JSON valid dengan bentuk {"title":"judul blog","titlePinterest":"judul Pinterest","slug":"url-friendly","description":"2-3 paragraf","metaDescription":"deskripsi metadata","specs":["poin 1","poin 2","poin 3"],"perluDilengkapi":[]} tanpa teks di luar JSON.`;

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function redactSecrets(value) {
  let text = String(value ?? '');
  const secrets = [
    process.env.GEMINI_API_KEY,
    process.env.GROQ_API_KEY,
    process.env.AI_SETTINGS_ADMIN_TOKEN,
    process.env.BLOB_AI_CONFIG_READ_WRITE_TOKEN,
  ].filter(secret => typeof secret === 'string' && secret.length > 0);
  for (const secret of secrets) {
    text = text.replaceAll(secret, '[redacted]');
  }
  return text
    .replace(/\b(?:AIza[0-9A-Za-z_-]{20,}|gsk_[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/g, '[redacted]')
    .replace(/(Bearer\s+)[^\s,;]+/gi, '$1[redacted]')
    .replace(/([?&](?:key|api_key|token)=)[^&\s]+/gi, '$1[redacted]');
}

function extractJsonObject(responseText) {
  const rawText = typeof responseText === 'string' ? responseText : '';
  const text = rawText.replace(/^\uFEFF/, '').trim();
  const fencedBlocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(match => match[1]);
  const candidates = [...fencedBlocks, text];

  for (const source of candidates) {
    for (let start = source.indexOf('{'); start >= 0; start = source.indexOf('{', start + 1)) {
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = start; index < source.length; index += 1) {
        const character = source[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (character === '\\') escaped = true;
          else if (character === '"') inString = false;
          continue;
        }
        if (character === '"') inString = true;
        else if (character === '{') depth += 1;
        else if (character === '}') {
          depth -= 1;
          if (depth === 0) {
            const candidate = source.slice(start, index + 1);
            try {
              const parsed = JSON.parse(candidate);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return candidate;
            } catch {
              break;
            }
          }
        }
      }
    }
  }

  const excerpt = redactSecrets(rawText.slice(0, 200)).slice(0, 200);
  throw new Error(`Hasil AI tidak valid: respons bukan JSON valid. Cuplikan: ${excerpt || '(kosong)'}`);
}

export function parseProductResponse(responseText) {
  let generated;
  try {
    generated = JSON.parse(extractJsonObject(responseText));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Hasil AI tidak valid:')) throw error;
    throw new Error('Hasil AI tidak valid: object JSON tidak dapat dibaca.', { cause: error });
  }
  if (!generated || typeof generated !== 'object' || Array.isArray(generated)) {
    throw new Error('Hasil AI tidak valid: respons harus berupa object JSON.');
  }
  return generated;
}

function validateProduct(generated) {
  if (!generated || typeof generated !== 'object' || Array.isArray(generated)) {
    throw new Error('Hasil AI tidak valid: respons harus berupa object JSON.');
  }
  const isText = value => typeof value === 'string';
  const title = isText(generated.title) ? generated.title.trim() : '';
  const titlePinterest = isText(generated.titlePinterest) ? generated.titlePinterest.trim() : '';
  const slug = isText(generated.slug) ? generated.slug.trim() : '';
  const description = isText(generated.description) ? generated.description.trim() : '';
  const metaDescription = isText(generated.metaDescription) ? generated.metaDescription.trim() : '';
  const specs = generated.specs;
  const perluDilengkapi = generated.perluDilengkapi;

  if (!title || title.length > 60) {
    throw new Error('Hasil AI tidak valid: title wajib diisi dan maksimal 60 karakter.');
  }
  if (!titlePinterest || titlePinterest.length > 90) {
    throw new Error('Hasil AI tidak valid: titlePinterest wajib diisi dan maksimal 90 karakter.');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Hasil AI tidak valid: slug harus berupa kebab-case huruf kecil.');
  }
  if (!description || description.length > 800) {
    throw new Error('Hasil AI tidak valid: description wajib diisi dan maksimal 800 karakter.');
  }
  const paragraphs = description.split(/\r?\n\s*\r?\n/).filter(paragraph => paragraph.trim());
  if (paragraphs.length < 2 || paragraphs.length > 3) {
    throw new Error('Hasil AI tidak valid: description harus terdiri dari 2-3 paragraf pendek.');
  }
  if (metaDescription.length < 130 || metaDescription.length > 155) {
    throw new Error('Hasil AI tidak valid: metaDescription harus 130-155 karakter.');
  }
  if (metaDescription === description) {
    throw new Error('Hasil AI tidak valid: metaDescription harus berbeda dari description.');
  }
  if (
    !Array.isArray(specs) ||
    specs.length < 3 ||
    specs.length > 6 ||
    specs.some(spec => !isText(spec) || !spec.trim())
  ) {
    throw new Error('Hasil AI tidak valid: specs harus berisi 3-6 poin teks yang tidak kosong.');
  }
  if (
    !Array.isArray(perluDilengkapi) ||
    perluDilengkapi.some(item => !isText(item) || !item.trim())
  ) {
    throw new Error('Hasil AI tidak valid: perluDilengkapi harus berupa array teks.');
  }

  return {
    title,
    titlePinterest,
    slug,
    description,
    metaDescription,
    specs: specs.map(spec => spec.trim()),
    perluDilengkapi: perluDilengkapi.map(item => item.trim()),
  };
}

async function generateWithGemini({ title, category, description, options, formatRetry = false }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: (options.model && String(options.model).trim()) || 'gemini-3.5-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json',
    },
  });
  const prompt = `Nama produk: ${title}\nKategori: ${category}\nDeskripsi mentah dari Shopee:\n${description}${formatRetry
    ? '\n\nPerbaiki format respons: keluarkan tepat satu object JSON valid sesuai skema. Jangan gunakan markdown, code fence, atau teks pengantar.'
    : ''}`;
  const result = await model.generateContent(prompt);
  return parseProductResponse(result.response.text());
}

async function generateWithGroq({ title, category, description, options, formatRetry = false }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY tidak dikonfigurasi.');

  const client = new Groq({ apiKey, maxRetries: 0 });
  const completion = await client.chat.completions.create({
    model: (options.model && String(options.model).trim()) || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Nama produk: ${title}\nKategori: ${category}\nDeskripsi mentah dari Shopee:\n${description}${formatRetry
          ? '\n\nPerbaiki format respons: keluarkan tepat satu object JSON valid sesuai skema. Jangan gunakan markdown, code fence, atau teks pengantar.'
          : ''}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const responseText = completion?.choices?.[0]?.message?.content || '';
  return parseProductResponse(responseText);
}

export async function generateProduct({ title, category, description = '' }) {
  const config = await readConfig();
  const configuredOrder = Array.isArray(config?.providerOrder) && config.providerOrder.length > 0
    ? config.providerOrder
    : (process.env.AI_PROVIDER_ORDER || process.env.AI_PROVIDER || 'gemini,groq')
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);
  const providers = {
    gemini: {
      enabled: config?.gemini?.enabled !== false,
      configured: Boolean(process.env.GEMINI_API_KEY),
      options: { model: config?.gemini?.model },
      generate: generateWithGemini,
    },
    groq: {
      enabled: config?.groq?.enabled !== false,
      configured: Boolean(process.env.GROQ_API_KEY),
      options: { model: config?.groq?.model },
      generate: generateWithGroq,
    },
  };
  const errors = [];

  for (const name of configuredOrder) {
    const provider = providers[name];
    if (!provider || !provider.enabled || !provider.configured) continue;

    for (let formatAttempt = 0; formatAttempt < 2; formatAttempt += 1) {
      try {
        const generated = await provider.generate({
          title,
          category,
          description,
          options: provider.options,
          formatRetry: formatAttempt === 1,
        });
        return validateProduct(generated);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error provider tidak diketahui.';
        errors.push({ provider: name, message });
        if (message.startsWith('Hasil AI tidak valid:') && formatAttempt === 0) {
          continue;
        }
        break;
      }
    }
  }

  if (errors.length === 0) {
    throw new Error('Tidak ada provider AI produk yang aktif atau memiliki API key.');
  }
  const details = errors
    .map(({ provider, message }) => `${provider}: ${redactSecrets(message).slice(0, 500)}`)
    .join(' | ');
  throw new Error(`Semua provider AI gagal. ${details}`);
}