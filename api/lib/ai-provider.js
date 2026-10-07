import { generateWithGemini } from './providers/gemini.js';
import { generateWithGroq } from './providers/groq.js';

const providers = {
  gemini: generateWithGemini,
  groq: generateWithGroq,
};

// Urutan provider yang dicoba: kiri → kanan.
// Format: "gemini,groq" atau "groq,gemini"
const DEFAULT_PROVIDER_ORDER = 'gemini,groq';

function getProviderOrder() {
  const raw = process.env.AI_PROVIDER_ORDER || process.env.AI_PROVIDER || DEFAULT_PROVIDER_ORDER;
  return raw
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
}

export async function generateArticle({ title, category, onArticleChunk }) {
  const order = getProviderOrder();
  const errors = [];

  for (let i = 0; i < order.length; i += 1) {
    const providerName = order[i];
    const provider = providers[providerName];

    if (!provider) {
      const msg = `Unknown provider "${providerName}", skipping.`;
      console.warn(msg);
      errors.push(`${providerName}: ${msg}`);
      continue;
    }

    try {
      console.info(`[ai-provider] Trying provider "${providerName}" (${i + 1}/${order.length}).`);
      return await provider({ title, category, onArticleChunk });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[ai-provider] Provider "${providerName}" failed: ${message}`);
      errors.push(`${providerName}: ${message}`);
      // Lanjut ke provider berikutnya
    }
  }

  // Semua provider gagal
  const summary = errors.length
    ? `Semua provider AI gagal. ${errors.join(' | ')}`
    : 'Tidak ada provider AI yang tersedia.';
  throw new Error(summary);
}
