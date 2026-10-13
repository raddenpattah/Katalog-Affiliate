import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { readConfig } from './config-store.js';

const systemPrompt = `Anda adalah asisten katalog produk dekorasi rumah berbahasa Indonesia.
Buat judul yang bersih dan maksimal 60 karakter, deskripsi 2-3 kalimat, serta 3-6 spesifikasi dalam bentuk poin.
Jangan mengarang ukuran, bahan, fitur, atau klaim yang tidak ada pada informasi sumber. Jika detail teknis tidak tersedia, tulis poin tentang fungsi atau penempatan produk yang didukung judul dan kategori.
Kembalikan hanya JSON valid dengan bentuk {"slug":"url-friendly","title":"judul produk","description":"2-3 kalimat","spesifikasi":["poin 1","poin 2"]} tanpa teks di luar JSON.`;

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseProduct(responseText, inputTitle) {
  const jsonText = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let generated;
  try {
    generated = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('AI mengembalikan JSON produk yang tidak valid.', { cause: error });
  }

  const title = typeof generated.title === 'string'
    ? generated.title.trim().slice(0, 60).trim()
    : '';
  const description = typeof generated.description === 'string' ? generated.description.trim() : '';
  const spesifikasi = Array.isArray(generated.spesifikasi)
    ? [...new Set(generated.spesifikasi
      .filter(item => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean))].slice(0, 10)
    : [];

  if (!title || !description || spesifikasi.length === 0) {
    throw new Error('AI tidak mengembalikan judul, deskripsi, dan spesifikasi yang lengkap.');
  }

  const aiSlug = typeof generated.slug === 'string' ? slugify(generated.slug) : '';
  return {
    slug: aiSlug || slugify(title) || slugify(inputTitle),
    title,
    description,
    spesifikasi,
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
  const prompt = `Nama produk: ${title}\nKategori: ${category}\nInformasi tambahan: ${description || 'Tidak ada'}`;
  const result = await model.generateContent(prompt);
  return parseProduct(result.response.text(), title);
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
        content: `Nama produk: ${title}\nKategori: ${category}\nInformasi tambahan: ${description || 'Tidak ada'}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });

  const responseText = completion?.choices?.[0]?.message?.content || '';
  return parseProduct(responseText, title);
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

    try {
      return await provider.generate({ title, category, description, options: provider.options });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[product-ai] Provider "${name}" gagal: ${message}`);
      errors.push(`${name}: ${message}`);
    }
  }

  if (errors.length === 0) {
    throw new Error('Tidak ada provider AI produk yang aktif atau memiliki API key.');
  }
  throw new Error(`Semua provider AI produk gagal. ${errors.join(' | ')}`);
}