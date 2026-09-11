import { getCollection, type CollectionEntry } from 'astro:content';

export type Memory = CollectionEntry<'memories'>;

export async function getPublishedMemories() {
  const entries = await getCollection('memories', ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatMemoryDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
}
