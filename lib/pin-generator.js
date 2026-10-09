import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderWarm } from './pin-templates/warm.js';
import { renderTypography } from './pin-templates/typography.js';
import { planLayout } from './ai-planner.js';
import { composeFromPlan } from './pin-templates/_shared/compose.js';
import { getPreset } from './pin-templates/_shared/presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache font agar tidak di-load berkali-kali
let fontsCache = null;

async function loadFonts() {
  if (fontsCache) return fontsCache;

  const fontsDir = join(__dirname, 'fonts');
  const [interRegular, interBold, jakartaRegular, jakartaSemiBold, jakartaBold, frauncesItalic] = await Promise.all([
    readFile(join(fontsDir, 'Inter-Regular.ttf')),
    readFile(join(fontsDir, 'Inter-Bold.ttf')),
    readFile(join(fontsDir, 'PlusJakartaSans-Regular.ttf')),
    readFile(join(fontsDir, 'PlusJakartaSans-SemiBold.ttf')),
    readFile(join(fontsDir, 'PlusJakartaSans-Bold.ttf')),
    readFile(join(fontsDir, 'Fraunces-Italic.ttf')),
  ]);

  fontsCache = [
    { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
    { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    { name: 'Plus Jakarta Sans', data: jakartaRegular, weight: 400, style: 'normal' },
    { name: 'Plus Jakarta Sans', data: jakartaSemiBold, weight: 600, style: 'normal' },
    { name: 'Plus Jakarta Sans', data: jakartaBold, weight: 700, style: 'normal' },
    { name: 'Fraunces', data: frauncesItalic, weight: 700, style: 'italic' },
  ];
  return fontsCache;
}

const templateRenderers = {
  warm: renderWarm,
  // 3 style baru (pakai AI Planner, renderer legacy cuma placeholder)
  poster: renderWarm,
  typography: renderTypography,
};

export const AVAILABLE_STYLES = Object.keys(templateRenderers);

export function isValidStyle(style) {
  return AVAILABLE_STYLES.includes(style);
}

// Fetch gambar eksternal → base64 data URL
async function fetchImageAsDataUrl(imageUrl, baseUrl) {
  let absoluteUrl = imageUrl;
  if (imageUrl.startsWith('/')) {
    absoluteUrl = `${baseUrl}${imageUrl}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(absoluteUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generatePin({
  title,
  imageUrl,
  category = 'Artikel',
  style = 'warm',
  baseUrl,
}) {
  if (!title || typeof title !== 'string') {
    throw new Error('Field "title" wajib diisi');
  }
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Field "imageUrl" wajib diisi');
  }
  if (!isValidStyle(style)) {
    throw new Error(`Style "${style}" tidak dikenal. Pilihan: ${AVAILABLE_STYLES.join(', ')}`);
  }

  const renderer = templateRenderers[style];
  const fonts = await loadFonts();

  let imageDataUrl = null;
  try {
    imageDataUrl = await fetchImageAsDataUrl(imageUrl, baseUrl);
  } catch (error) {
    console.warn(`[pin-generator] Gagal fetch gambar "${imageUrl}": ${error.message}`);
  }

  // AI Planner: minta layout dari AI (Groq -> Gemini -> null)
  let plan = null;
  try {
    plan = await planLayout({ title, category, style });
  } catch (err) {
    console.warn('[pin-generator] AI Planner error: ' + err.message);
  }

  // Fallback ke preset kalau AI gagal
  if (!plan) {
    console.log('[pin-generator] Pakai preset untuk style: ' + style);
    plan = getPreset(style);
  }

  // Compose JSX dari plan
  const jsx = composeFromPlan(plan, { title, category, imageDataUrl, style });

  // Step 1: Satori → SVG
  // Ukuran kanvas dinamis: typography pakai 1080x1920, sisanya 1000x1500
  const canvasW = style === 'typography' ? 1080 : 1000;
  const canvasH = style === 'typography' ? 1920 : 1500;

  const svg = await satori(jsx, {
    width: canvasW,
    height: canvasH,
    fonts,
  });

  // Step 2: Resvg → PNG
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: canvasW },
  });
  const pngBuffer = resvg.render().asPng();

  return Buffer.from(pngBuffer);
}
