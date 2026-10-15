import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDirectory = path.join(projectRoot, 'src/data/products');
const distProductsDirectory = path.join(projectRoot, 'dist/produk');
const vercelConfig = JSON.parse(
  await readFile(path.join(projectRoot, 'vercel.json'), 'utf8'),
);
const redirects = vercelConfig.redirects ?? [];
const failures = [];

function normalizePath(value) {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    failures.push(`Invalid percent-encoding in path: ${value}`);
    return value;
  }
  return decoded.length > 1 ? decoded.replace(/\/+$/, '') : decoded;
}

const sources = new Set();
const graph = new Map();

for (const redirect of redirects) {
  if (sources.has(redirect.source)) {
    failures.push(`Duplicate redirect source: ${redirect.source}`);
  }
  sources.add(redirect.source);
  if (redirect.statusCode !== 301) {
    failures.push(`Redirect is not an exact 301: ${redirect.source}`);
  }

  if (!redirect.source.startsWith('/produk/') || !redirect.destination.startsWith('/produk/')) {
    failures.push(`Non-product redirect found: ${redirect.source} -> ${redirect.destination}`);
    continue;
  }

  const source = normalizePath(redirect.source);
  const destination = normalizePath(redirect.destination);
  const destinations = graph.get(source) ?? new Set();
  destinations.add(destination);
  graph.set(source, destinations);
}

for (const [source, destinations] of graph) {
  if (destinations.size > 1) {
    failures.push(`Conflicting redirect destinations for ${source}: ${[...destinations].join(', ')}`);
  }
}

const visiting = new Set();
const visited = new Set();
function visit(source) {
  if (visiting.has(source)) {
    failures.push(`Redirect loop detected at ${source}`);
    return;
  }
  if (visited.has(source)) return;

  visiting.add(source);
  for (const destination of graph.get(source) ?? []) {
    if (graph.has(destination)) visit(destination);
  }
  visiting.delete(source);
  visited.add(source);
}

for (const source of graph.keys()) visit(source);

for (const redirect of redirects) {
  const destinationPath = decodeURIComponent(redirect.destination);
  const productSlug = destinationPath.slice('/produk/'.length).replace(/\/+$/, '');
  const candidates = [
    path.join(distProductsDirectory, productSlug, 'index.html'),
    path.join(distProductsDirectory, `${productSlug}.html`),
  ];
  const found = await Promise.all(candidates.map(async (candidate) => {
    try {
      return (await stat(candidate)).isFile();
    } catch {
      return false;
    }
  }));
  if (!found.some(Boolean)) {
    failures.push(`Redirect destination is missing from dist/produk: ${redirect.destination}`);
  }
}

if (failures.length > 0) {
  console.error(`FAILED: ${failures.length} redirect check(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `PASS: ${redirects.length} redirects; no loops, all destinations exist in dist/produk, no duplicate sources.`,
  );
}
