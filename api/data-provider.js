import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { load: parseYaml } = require('js-yaml');
const projectRoot = process.cwd();

function readJsonDirectory(relativeDirectory) {
  const directory = path.join(projectRoot, relativeDirectory);
  return readdirSync(directory)
    .filter(fileName => fileName.endsWith('.json'))
    .sort()
    .map(fileName => JSON.parse(readFileSync(path.join(directory, fileName), 'utf8')));
}

function readBlogPosts() {
  const directory = path.join(projectRoot, 'src/content/blog');
  return readdirSync(directory)
    .filter(fileName => /\.mdx?$/.test(fileName))
    .sort()
    .map(fileName => {
      const source = readFileSync(path.join(directory, fileName), 'utf8');
      const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!match) throw new Error(`Frontmatter tidak ditemukan di ${fileName}`);

      const frontmatter = parseYaml(match[1]) || {};
      return {
        id: path.basename(fileName, path.extname(fileName)),
        ...frontmatter,
        category: frontmatter.advanced?.category || frontmatter.category || '',
      };
    });
}

function readData(type) {
  const data = {};
  if (type === 'products' || type === 'all') {
    data.products = readJsonDirectory('src/data/products');
  }
  if (type === 'blog' || type === 'all') {
    data.blog = readBlogPosts();
  }
  if (type === 'categories' || type === 'all') {
    data.categories = readJsonDirectory('src/data/category-options');
  }
  return data;
}

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const type = request.query?.type || requestUrl.searchParams.get('type') || 'all';
  if (!['products', 'blog', 'categories', 'all'].includes(type)) {
    return response.status(400).json({ error: 'Unsupported data type' });
  }

  try {
    return response.status(200).json(readData(type));
  } catch (error) {
    console.error('Shared data API failed:', error);
    return response.status(500).json({ error: 'Unable to read project data' });
  }
}