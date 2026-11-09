import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(70).max(165),
    keyword: z.string(),
    secondaryKeywords: z.array(z.string()).default([]),
    category: z.enum([
      'basics',
      'candy',
      'fruit',
      'vegetables',
      'meat-eggs-dairy',
      'meals',
      'pets',
      'machines',
    ]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    type: z.enum(['howto', 'guide', 'comparison', 'faq']).default('guide'),
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
