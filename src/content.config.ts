import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const diary = defineCollection({
  loader: glob({ base: './src/content/diary', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const memories = defineCollection({
  loader: glob({ base: './src/content/memories', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    items: z.array(z.object({
      type: z.enum(['image', 'video']),
      src: z.string(),
      poster: z.string().optional(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { diary, memories };
