import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type PostCategory = Post['data']['category'];

export const categoryLabels: Record<PostCategory, string> = {
  life: '生活',
  tech: '技术',
};

export function getPostSlug(post: Post) {
  return post.id.replace(/\.(md|mdx)$/i, '').replace(/\/index$/i, '');
}

export function getPostUrl(post: Post) {
  return `/posts/${getPostSlug(post)}/`;
}

export async function getPublishedPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPostsByCategory(category: PostCategory) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.category === category);
}

export function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
