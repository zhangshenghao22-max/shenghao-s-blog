import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

const site = process.env.SITE_URL ?? 'https://www.zhangshenghao.com';

export default defineConfig({
  site,
  integrations: [mdx()],
});
