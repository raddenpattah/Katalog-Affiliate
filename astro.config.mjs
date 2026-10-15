import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://alfeto.vercel.app',
  integrations: [tailwind(), mdx(), sitemap()],
  server: {
    host: true,
  },
});
