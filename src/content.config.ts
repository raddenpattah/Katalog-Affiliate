import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { isProductCategory } from './data/categories';

const categorySchema = z.string().refine(isProductCategory, {
  message: 'Kategori harus tersedia di koleksi Kategori.',
});
const blogImageSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/images\/blog\/.+/),
]);
const galleryImageSchema = z.union([
  blogImageSchema,
  z.object({
    image: blogImageSchema,
    alt: z.string().trim().min(1),
    caption: z.string().optional(),
  }),
]);

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    tags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    heroImage: blogImageSchema,
    galleryImages: z.array(galleryImageSchema).default([]),
    category: categorySchema,
    author: z.string().default('Alfeto'),
    productIds: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const produk = defineCollection({
  loader: glob({ base: './src/data/products', pattern: '**/*.json' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    category: categorySchema,
    image: z.union([z.string().url(), z.string().regex(/^\/images\/products\/.+/)]),
    shopeeUrl: z.string().url(),
    badge: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, produk };
