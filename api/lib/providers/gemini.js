import { GoogleGenerativeAI } from '@google/generative-ai';

const systemPrompt = `Anda adalah penulis artikel blog berbahasa Indonesia yang ahli dalam dekorasi rumah dan interior estetik.
Gunakan bahasa yang santai, jelas, hangat, dan persuasif tanpa membuat klaim yang tidak berdasar.
Tulis dalam format Markdown, jangan gunakan heading H1 (#), dan sertakan poin-poin keunggulan atau tips yang relevan.
Susun artikel dengan pembuka yang menarik, beberapa heading H2/H3, isi yang praktis, dan penutup yang natural.
Selain isi artikel, buat deskripsi ringkas untuk ringkasan/SEO dan 5 tags relevan.
Kembalikan hanya JSON valid dengan bentuk {"article":"isi artikel Markdown","description":"ringkasan artikel","tags":["tag 1","tag 2"]}.
Jangan masukkan heading H1 ke dalam article dan jangan menambahkan teks di luar JSON.`;

export async function generateWithGemini({ title, category }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });
  const result = await model.generateContent(
    `Buat artikel blog berdasarkan informasi berikut.\n\nJudul: ${title}\nKategori: ${category}`,
  );
  let generated;
  try {
    generated = JSON.parse(result.response.text());
  } catch (error) {
    throw new Error('Gemini returned invalid article metadata', { cause: error });
  }

  const article = typeof generated.article === 'string'
    ? generated.article.replace(/^#\s+.*$/gm, '').trim()
    : '';
  const description = typeof generated.description === 'string' ? generated.description.trim() : '';
  const tags = Array.isArray(generated.tags)
    ? [...new Set(generated.tags.filter(tag => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean))].slice(0, 10)
    : [];

  if (!article || !description || tags.length === 0) {
    throw new Error('Gemini returned incomplete article metadata');
  }

  return { article, description, tags };
}
