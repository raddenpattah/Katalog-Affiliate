import { generateProduct } from '../lib/product-ai.js';

const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 4000;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (process.env.ENABLE_AI_GENERATOR !== 'true') {
    return response.status(403).json({ error: 'AI product generation is disabled' });
  }

  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response.status(400).json({ error: 'A JSON object is required' });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  if (!title || !category) {
    return response.status(400).json({ error: 'Title and category are required' });
  }
  if (
    title.length > MAX_TITLE_LENGTH ||
    category.length > MAX_CATEGORY_LENGTH ||
    description.length > MAX_DESCRIPTION_LENGTH
  ) {
    return response.status(400).json({ error: 'Product input is too long' });
  }

  try {
    const product = await generateProduct({ title, category, description });
    return response.status(200).json(product);
  } catch (error) {
    console.error('AI product generation failed:', error);
    return response.status(502).json({
      error: error instanceof Error ? error.message : 'Unable to generate the product right now',
    });
  }
}