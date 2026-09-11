import { getCollection, type CollectionEntry } from 'astro:content';

export type Diary = CollectionEntry<'diary'>;

export function getDiarySlug(entry: Diary) {
  return entry.id.replace(/\.(md|mdx)$/i, '').replace(/\/index$/i, '');
}

export function getDiaryUrl(entry: Diary) {
  return `/diary/${getDiarySlug(entry)}/`;
}

export async function getPublishedDiaries() {
  const entries = await getCollection('diary', ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}
