import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

export const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),

  schema: z.object({
    // 🧠 Core
    title: z.string(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
      .optional(),
    excerpt: z.string(),

    // 🖼️ Media
    coverImage: z.string().optional(),

    // 📅 Dates
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),

    // 🏷️ Taxonomy
    tags: z.array(z.string()).default([]),
    category: z.string(),

    // 👤 Author
    author: z.string().default('Danh Thanh'),
    authorAvatar: z.string().optional(),

    // 🚧 Publishing control
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),

    // 🔗 SEO
    description: z.string().optional(), // fallback = excerpt
    canonicalUrl: z.url().optional(),

    // 📚 Series (rất mạnh cho SEO)
    series: z.string().optional(),
    orderInSeries: z.number().int().positive().optional(),

    // ⚡ Optional nhưng hữu ích
    readingTime: z.number().optional(),
  }),
})

export const collections = { posts }
