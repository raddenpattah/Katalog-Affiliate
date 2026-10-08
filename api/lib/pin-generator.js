import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { renderMinimalis } from './pin-templates/minimalis.js';
import { renderBold } from './pin-templates/bold.js';
import { renderEditorial } from './pin-templates/editorial.js';
import { renderWarm } from './pin-templates/warm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache font agar tidak di-load berkali-kali
let fontsCache = null;

async function loadFonts() {
  if (fontsCache) return fontsCache;

  const fontsDir = join(__dirname, 'fonts');
  const [regular, bold] = await Promise.all([
    readFile(join(fontsDir, 'Inter-Regular.ttf')),
    readFile(join(fontsDir, 'Inter-Bold.ttf')),
  ]);

  fontsCache = [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: bold, weight: 700, style: 'normal' },
  ];
  return fontsCache;
}

const templateRenderers = {
  minimalis: renderMinimalis,
  bold: renderBold,
  editorial: renderEditorial,
  warm: renderWarm,
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
  style = 'minimalis',
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

  const jsx = renderer({ title, imageDataUrl, category });

  // Step 1: Satori → SVG
  const svg = await satori(jsx, {
    width: 1000,
    height: 1500,
    fonts,
  });

  // Step 2: Resvg → PNG
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1000 },
  });
  const pngBuffer = resvg.render().asPng();

  return Buffer.from(pngBuffer);
}
