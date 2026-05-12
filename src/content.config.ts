import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().optional(),
    categories: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    cover: z.string().optional(),
    top_img: z.string().optional(),
    thumbnail: z.string().optional(),
    banner: z.string().optional(),
    author: z.string().optional(),
    draft: z.boolean().optional().default(false),
    license: z.boolean().optional().default(true),
    reward: z.boolean().optional().default(true),
    toc: z.boolean().optional().default(true),
    published: z.boolean().optional().default(true),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    layout: z.string().optional(),
  }),
});

export const collections = { posts, pages };
