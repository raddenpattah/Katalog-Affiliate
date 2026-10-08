// api/pinterest-generate.js
// POST batch generate pin dari banyak artikel.
// Body: { slugs: [], styles: [] }

import { batchGenerate } from '../lib/batch-generator.js';
import { readPinterestData } from '../lib/pinterest-store.js';

export const maxDuration = 60;  // 60 detik max

const MAX_ARTICLES = 10;

function checkAuth(request) {
  const expectedToken = process.env.PINTEREST_ADMIN_TOKEN;
  if (!expectedToken) return true;
  const provided = request.query?.token || request.headers['x-admin-token'];
  return provided === expectedToken;
}

export default async function handler(request, response) {
  // CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkAuth(request)) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const body = request.body;
  if (!body || !Array.isArray(body.slugs)) {
    return response.status(400).json({ error: 'Array slugs wajib' });
  }

  if (body.slugs.length === 0) {
    return response.status(400).json({ error: 'Pilih minimal 1 artikel' });
  }

  if (body.slugs.length > MAX_ARTICLES) {
    return response.status(400).json({
      error: `Maksimal ${MAX_ARTICLES} artikel per batch`,
    });
  }

  try {
    // Ambil config default kalau styles nggak dikasih
    const data = await readPinterestData();
    const styles = Array.isArray(body.styles) && body.styles.length > 0
      ? body.styles
      : data.config.defaultStyles;

    console.info(`[pinterest-generate] Batch: ${body.slugs.length} artikel × ${styles.length} style`);

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://alfeto.vercel.app';

    const result = await batchGenerate(body.slugs, styles, { baseUrl });

    console.info(`[pinterest-generate] Selesai: ${result.totalPins} pin`);

    return response.status(200).json({
      success: true,
      totalPins: result.totalPins,
      startDate: result.startDate,
      results: result.results,
      pins: result.pins,
    });
  } catch (error) {
    console.error('[pinterest-generate] Error:', error);
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Gagal batch generate',
    });
  }
}
