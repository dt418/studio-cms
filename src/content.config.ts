import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

export const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    coverImage: z.string().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    author: z.string().default('Danh Thanh'),
    authorAvatar: z.string().optional(),
  }),
})

export const collections = { posts }
