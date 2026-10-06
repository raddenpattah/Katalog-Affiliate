import { generateArticle } from './lib/ai-provider.js';

const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (process.env.ENABLE_AI_GENERATOR !== 'true') {
    return response.status(403).json({ error: 'AI article generation is disabled' });
  }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response.status(400).json({ error: 'A JSON object is required' });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';

  if (!title || !category) {
    return response.status(400).json({ error: 'Title and category are required' });
  }
  if (title.length > MAX_TITLE_LENGTH || category.length > MAX_CATEGORY_LENGTH) {
    return response.status(400).json({ error: 'Title or category is too long' });
  }

  try {
    const article = await generateArticle({ title, category });
    return response.status(200).json({ article });
  } catch (error) {
    console.error('AI article generation failed:', error);
    const missingApiKey = error instanceof Error && error.message === 'GEMINI_API_KEY is not configured';
    return response
      .status(missingApiKey ? 503 : 502)
      .json({ error: missingApiKey ? 'AI generation is not configured' : 'Unable to generate the article right now' });
  }
}
