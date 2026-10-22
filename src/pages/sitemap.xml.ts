import type { APIRoute } from 'astro';
import { getDiaryUrl, getPublishedDiaries } from '../lib/diary';

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://www.zhangshenghao.com';
  const diaries = await getPublishedDiaries();
  const pages = ['/', '/about/', '/memories/', '/diary/'];
  const urls: { loc: string; lastmod?: string }[] = [
    ...pages.map((path) => ({ loc: new URL(path, origin).toString() })),
    ...diaries.map((entry) => ({
      loc: new URL(getDiaryUrl(entry), origin).toString(),
      lastmod: entry.data.pubDate.toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.loc}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
