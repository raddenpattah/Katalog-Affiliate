import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { productCategories } from './data/categories';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.union([
      z.string().url(),
      z.string().regex(/^\/images\/blog\/.+/),
    ]),
    category: z.enum(productCategories),
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
    category: z.enum(productCategories),
    imageUrl: z.union([z.string().url(), z.string().regex(/^\/images\/products\/.+/)]),
    shopeeUrl: z.string().url(),
    badge: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, produk };
