import { generateWithGemini } from './providers/gemini.js';

const providers = {
  gemini: generateWithGemini,
};

export async function generateArticle({ title, category }) {
  const providerName = process.env.AI_PROVIDER || 'gemini';
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Unsupported AI provider: ${providerName}`);
  }

  return provider({ title, category });
}
