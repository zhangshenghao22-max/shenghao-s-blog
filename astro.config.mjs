import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

const site = process.env.SITE_URL ?? 'https://zhangshenghao22-max.github.io';

export default defineConfig({
  site,
  base: process.env.BASE_PATH ?? '/shenghao-s-blog',
  integrations: [mdx()],
});

