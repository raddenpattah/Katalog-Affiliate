import { GoogleGenerativeAI } from '@google/generative-ai';

const systemPrompt = `Anda adalah penulis artikel blog berbahasa Indonesia yang ahli dalam dekorasi rumah dan interior estetik.
Gunakan bahasa yang santai, jelas, hangat, dan persuasif tanpa membuat klaim yang tidak berdasar.
Tulis dalam format Markdown, jangan gunakan heading H1 (#), dan sertakan poin-poin keunggulan atau tips yang relevan.
Susun artikel dengan pembuka yang menarik, beberapa heading H2/H3, isi yang praktis, dan penutup yang natural.
Hasilkan hanya isi artikel Markdown, tanpa menjelaskan proses penulisan.`;

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
    },
  });
  const result = await model.generateContent(
    `Buat artikel blog berdasarkan informasi berikut.\n\nJudul: ${title}\nKategori: ${category}`,
  );
  const article = result.response
    .text()
    .replace(/^#\s+.*$/gm, '')
    .trim();

  if (!article) {
    throw new Error('Gemini returned an empty article');
  }

  return article;
}
