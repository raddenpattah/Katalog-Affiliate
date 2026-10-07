export const maxDuration = 60;

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

  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({ error: 'AI generation is not configured' });
  }

  response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  const sendEvent = event => response.write(`${JSON.stringify(event)}\n`);
  response.flushHeaders?.();

  try {
    const generated = await generateArticle({
      title,
      category,
      onArticleChunk: text => sendEvent({ type: 'article', text }),
    });
    sendEvent({
      type: 'metadata',
      description: generated.description,
      tags: generated.tags,
    });
    sendEvent({ type: 'done' });
    return response.end();
  } catch (error) {
    console.error('AI article generation failed:', error);
    sendEvent({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unable to generate the article right now',
    });
    return response.end();
  }
}
