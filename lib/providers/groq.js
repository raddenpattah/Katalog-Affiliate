import Groq from 'groq-sdk';

const systemPrompt = `Anda adalah penulis artikel blog berbahasa Indonesia yang ahli dalam dekorasi rumah dan interior estetik.
Gunakan bahasa yang santai, jelas, hangat, dan persuasif tanpa membuat klaim yang tidak berdasar.
Tulis dalam format Markdown, jangan gunakan heading H1 (#), dan sertakan poin-poin keunggulan atau tips yang relevan.
Susun artikel dengan pembuka yang menarik, beberapa heading H2/H3, isi yang praktis, dan penutup yang natural.
Pilih 3-7 produk hanya dari kandidat yang diberikan dan 2-3 artikel terkait hanya dari daftar artikel.
Gunakan ID produk persis seperti field id, bukan slug. Tautkan produk di isi artikel ke /produk/{slug} (gunakan id jika slug kosong); jangan pernah memakai tautan Shopee.
Selain isi artikel, buat deskripsi ringkas untuk ringkasan/SEO dan 5 tags relevan.
Kembalikan hanya JSON valid dengan bentuk {"article":"isi artikel Markdown","description":"ringkasan artikel","tags":["tag 1","tag 2"],"recommendedProductIds":["id produk"],"recommendedArticles":["id artikel"]}.
Jangan masukkan heading H1 ke dalam article, jangan menambahkan teks di luar JSON, dan jangan memilih ID yang tidak ada di kandidat.`;

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const RETRY_DELAYS_MS = [1000, 2000, 4000];

const TIME_BUDGET_MS = Number(process.env.AI_TIME_BUDGET_MS) || 45000;
const MIN_TIME_FOR_RETRY_MS = 15000;

// Timeout per request ke Groq. Kalau request menggantung lebih dari ini, SDK akan abort.
const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 20000;

function getHttpStatus(error) {
  if (typeof error?.status === 'number') return error.status;
  if (typeof error?.response?.status === 'number') return error.response.status;
  return null;
}

function isRetryableServerError(error) {
  const status = getHttpStatus(error);
  // Retry untuk 5xx dan 429 (rate limit)
  if (status !== null && ((status >= 500 && status < 600) || status === 429)) {
    return true;
  }
  // Network error
  const message = error?.message || '';
  if (status === null && (message.includes('fetch failed') || message.includes('ECONNRESET') || message.includes('ETIMEDOUT'))) {
    return true;
  }
  return false;
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function getRemainingTimeMs(startTime) {
  return TIME_BUDGET_MS - (Date.now() - startTime);
}

function canContinue(startTime) {
  return getRemainingTimeMs(startTime) > MIN_TIME_FOR_RETRY_MS;
}

function formatRemaining(startTime) {
  return `${Math.round(getRemainingTimeMs(startTime) / 1000)}s`;
}

function parseGeneratedArticle(responseText, products, blogContext) {
  let generated;
  try {
    generated = JSON.parse(responseText);
  } catch (error) {
    throw new Error('Groq returned invalid article metadata', { cause: error });
  }

  const article = typeof generated.article === 'string'
    ? generated.article.replace(/^#\s+.*$/gm, '').trim()
    : '';
  const description = typeof generated.description === 'string' ? generated.description.trim() : '';
  const tags = Array.isArray(generated.tags)
    ? [...new Set(generated.tags.filter(tag => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean))].slice(0, 10)
    : [];
  const productIds = new Set(products.map(product => product.id));
  const articleIds = new Set(blogContext.map(article => article.id));
  const recommendedProductIds = Array.isArray(generated.recommendedProductIds)
    ? [...new Set(generated.recommendedProductIds.filter(id => typeof id === 'string' && productIds.has(id)))].slice(0, 7)
    : [];
  const recommendedArticles = Array.isArray(generated.recommendedArticles)
    ? [...new Set(generated.recommendedArticles.filter(id => typeof id === 'string' && articleIds.has(id)))].slice(0, 3)
    : [];

  if (!article || !description || tags.length === 0 || recommendedProductIds.length < 3 || recommendedArticles.length < 2) {
    throw new Error('Groq returned incomplete article metadata');
  }

  return { article, description, tags, recommendedProductIds, recommendedArticles };
}

function buildPrompt({ title, category, products, blogContext }) {
  return `Buat artikel berdasarkan brief dan kandidat berikut. Isi artikel harus menyebut produk terpilih secara natural dan menautkannya ke halaman detail internal.\n\n${JSON.stringify({
    title,
    category,
    products,
    blogContext,
  })}`;
}

async function generateWithModel(client, modelName, prompt, products, blogContext) {
  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.75,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const responseText = completion?.choices?.[0]?.message?.content || '';
  return parseGeneratedArticle(responseText, products, blogContext);
}

async function generateWithRetries(client, modelName, prompt, startTime, products, blogContext) {
  for (let retry = 0; ; retry += 1) {
    const attempt = retry + 1;
    try {
      console.info(
        `Generating Groq article with ${modelName} (attempt ${attempt}/${RETRY_DELAYS_MS.length + 1}, remaining ${formatRemaining(startTime)}).`,
      );
      return await generateWithModel(client, modelName, prompt, products, blogContext);
    } catch (error) {
      if (!isRetryableServerError(error) || retry >= RETRY_DELAYS_MS.length) {
        throw error;
      }

      if (!canContinue(startTime)) {
        console.warn(
          `Groq ${modelName} attempt ${attempt} failed but time budget exhausted (remaining ${formatRemaining(startTime)}); aborting retry.`,
        );
        throw new Error(
          `AI generation time budget exhausted before retry (groq:${modelName})`,
          { cause: error },
        );
      }

      const delay = RETRY_DELAYS_MS[retry];
      console.warn(
        `Groq ${modelName} attempt ${attempt} failed with HTTP ${getHttpStatus(error) ?? 'network'}; retrying in ${delay}ms (remaining ${formatRemaining(startTime)}).`,
      );
      await wait(delay);
    }
  }
}

export async function generateWithGroq({ title, category, products = [], blogContext = [], onArticleChunk = () => {}, options = {} }) {
  const model = (options.model && String(options.model).trim()) || GROQ_MODEL;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const startTime = Date.now();
  const client = new Groq({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 0 });
  const prompt = buildPrompt({ title, category, products, blogContext });

  const generated = await generateWithRetries(client, model, prompt, startTime, products, blogContext);

  onArticleChunk(generated.article);
  return generated;
}
