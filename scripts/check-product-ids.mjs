import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/data/products';
const seen = new Map();
let bad = 0;

for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (data.id !== data.slug) {
    console.error(`MISMATCH: ${f} | id="${data.id}" | slug="${data.slug}"`);
    bad++;
  }
  if (seen.has(data.id)) {
    console.error(`DUPLIKAT id "${data.id}": ${seen.get(data.id)} dan ${f}`);
    bad++;
  }
  seen.set(data.id, f);
}

if (bad) process.exit(1);
console.log(`Cek id produk OK (${seen.size} produk).`);
