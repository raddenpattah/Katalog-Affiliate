import { GoogleGenerativeAI } from '@google/generative-ai';

const systemPrompt = `Anda adalah penulis artikel blog berbahasa Indonesia yang ahli dalam dekorasi rumah dan interior estetik.
Gunakan bahasa yang santai, jelas, hangat, dan persuasif tanpa membuat klaim yang tidak berdasar.
Tulis dalam format Markdown, jangan gunakan heading H1 (#), dan sertakan poin-poin keunggulan atau tips yang relevan.
Susun artikel dengan pembuka yang menarik, beberapa heading H2/H3, isi yang praktis, dan penutup yang natural.
Selain isi artikel, buat deskripsi ringkas untuk ringkasan/SEO dan 5 tags relevan.
Kembalikan hanya JSON valid dengan bentuk {"article":"isi artikel Markdown","description":"ringkasan artikel","tags":["tag 1","tag 2"]}.
Jangan masukkan heading H1 ke dalam article dan jangan menambahkan teks di luar JSON.`;

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.6-flash';
const RETRY_DELAYS_MS = [1000, 2000, 4000];

function getHttpStatus(error) {
  return typeof error?.status === 'number' ? error.status : null;
}

function isRetryableServerError(error) {
  const status = getHttpStatus(error);
  return status !== null && status >= 500 && status < 600;
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function parseGeneratedArticle(responseText) {
  let generated;
  try {
    generated = JSON.parse(responseText);
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

async function generateWithModel(client, modelName, prompt) {
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });
  const result = await model.generateContentStream(prompt);
  let responseText = '';

  for await (const chunk of result.stream) {
    responseText += chunk.text();
  }

  return parseGeneratedArticle(responseText);
}

// Retry transient Gemini server errors with exponential backoff; never retry 4xx errors.
async function generateWithRetries(client, modelName, prompt) {
  for (let retry = 0; ; retry += 1) {
    const attempt = retry + 1;
    try {
      console.info(`Generating Gemini article with ${modelName} (attempt ${attempt}/${RETRY_DELAYS_MS.length + 1}).`);
      return await generateWithModel(client, modelName, prompt);
    } catch (error) {
      if (!isRetryableServerError(error) || retry >= RETRY_DELAYS_MS.length) {
        throw error;
      }

      const delay = RETRY_DELAYS_MS[retry];
      console.warn(
        `Gemini ${modelName} attempt ${attempt} failed with HTTP ${getHttpStatus(error)}; retrying in ${delay}ms.`,
      );
      await wait(delay);
    }
  }
}

export async function generateWithGemini({ title, category, onArticleChunk = () => {} }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const prompt = `Buat artikel blog berdasarkan informasi berikut.\n\nJudul: ${title}\nKategori: ${category}`;
  let generated;
  try {
    generated = await generateWithRetries(client, PRIMARY_MODEL, prompt);
  } catch (primaryError) {
    const primaryStatus = getHttpStatus(primaryError);
    if (
      primaryStatus === 400 ||
      primaryStatus === 403 ||
      (!isRetryableServerError(primaryError) && primaryStatus !== 404) ||
      FALLBACK_MODEL === PRIMARY_MODEL
    ) {
      throw primaryError;
    }

    console.warn(
      `Gemini ${PRIMARY_MODEL} failed with HTTP ${primaryStatus}; falling back to ${FALLBACK_MODEL}.`,
    );
    generated = await generateWithRetries(client, FALLBACK_MODEL, prompt);
  }

  onArticleChunk(generated.article);
  return generated;
}
