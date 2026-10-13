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
  const blogContext = Array.isArray(body.blogContext)
    ? body.blogContext
      .filter(item => item && typeof item === 'object' && !Array.isArray(item))
      .slice(0, 8)
      .map(item => ({
        title: typeof item.title === 'string' ? item.title.trim().slice(0, 160) : '',
        description: typeof item.description === 'string' ? item.description.trim().slice(0, 300) : '',
        category: typeof item.category === 'string' ? item.category.trim().slice(0, 80) : '',
        pubDate: typeof item.pubDate === 'string' ? item.pubDate.slice(0, 20) : '',
      }))
      .filter(item => item.title)
    : [];

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
    const articleContext = blogContext.length > 0
      ? `\n\nKonteks artikel terkait untuk inspirasi tema (jangan mengarang isi artikel):\n${blogContext
        .map(item => `- ${item.title}${item.category ? ` (${item.category})` : ''}: ${item.description}`)
        .join('\n')}`
      : '';
    const product = await generateProduct({
      title,
      category,
      description: `${description}${articleContext}`.trim(),
    });
    return response.status(200).json({
      slug: product.slug,
      titlePinterest: product.title,
      description: product.description,
      spesifikasi: product.spesifikasi,
    });
  } catch (error) {
    console.error('AI product generation failed:', error);
    return response.status(502).json({
      error: error instanceof Error ? error.message : 'Unable to generate the product right now',
    });
  }
}