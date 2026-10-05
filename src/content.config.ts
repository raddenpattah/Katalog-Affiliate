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

export const collections = { blog };
