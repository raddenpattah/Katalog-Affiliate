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

function parseProduct(responseText) {
  const jsonText = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let generated;
  try {
    generated = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('Hasil AI tidak valid: respons bukan JSON valid.', { cause: error });
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

async function generateWithGemini({ title, category, description, options }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: (options.model && String(options.model).trim()) || 'gemini-3.8-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json',
    },
  });
  const prompt = `Nama produk: ${title}\nKategori: ${category}\nDeskripsi mentah dari Shopee:\n${description}`;
  const result = await model.generateContent(prompt);
  return parseProduct(result.response.text());
}

async function generateWithGroq({ title, category, description, options }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY tidak dikonfigurasi.');

  const client = new Groq({ apiKey, maxRetries: 0 });
  const completion = await client.chat.completions.create({
    model: (options.model && String(options.model).trim()) || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Nama produk: ${title}\nKategori: ${category}\nDeskripsi mentah dari Shopee:\n${description}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });

  const responseText = completion?.choices?.[0]?.message?.content || '';
  return parseProduct(responseText);
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
  let lastValidationError;

  for (const name of configuredOrder) {
    const provider = providers[name];
    if (!provider || !provider.enabled || !provider.configured) continue;

    try {
      const generated = await provider.generate({ title, category, description, options: provider.options });
      return validateProduct(generated);
    } catch (error) {
      errors.push(name);
      if (error instanceof Error && error.message.startsWith('Hasil AI tidak valid:')) {
        lastValidationError = error;
      }
    }
  }

  if (errors.length === 0) {
    throw new Error('Tidak ada provider AI produk yang aktif atau memiliki API key.');
  }
  if (lastValidationError) throw lastValidationError;
  throw new Error('Generator gagal menghasilkan konten produk yang valid. Periksa data sumber dan coba lagi.');
}