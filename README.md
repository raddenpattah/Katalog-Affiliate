# Alfeto

Alfeto adalah katalog produk dekorasi dan blog inspirasi ruang aesthetic.

## Getting started

Install dependencies and start the Astro development server:

```sh
npm install
npm run dev
```

Astro serves the site at `http://localhost:4321`.

## Build

```sh
npm run build
npm run preview
```

## Pages

- `/` — product catalog with category filters
- `/blog` — blog index backed by Astro Content Collections
- `/blog/<slug>` — individual Markdown or MDX articles
- `/about` — tentang Alfeto
- `/contact` — formulir kontak yang membuka aplikasi surel pengunjung
- `/privacy-policy` — kebijakan privasi dan informasi tautan rekomendasi

Product details and Shopee URLs are in `src/data/products.ts`. Replace the sample search URLs with your product links before publishing. Product categories are `dinding`, `tanaman`, `lampu`, and `aksesoris`. Add blog entries as `.md` or `.mdx` files under `src/content/blog/`, with `title`, `description`, and `pubDate` frontmatter. Draft posts can be hidden from the public blog by setting `draft: true`.
