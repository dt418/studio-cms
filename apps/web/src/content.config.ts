import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { isHttpWithoutCredentialsOrFragment } from './lib/site'

export const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: import.meta.url.replace(/content\.config\.ts$/, 'content/posts'),
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ''),
  }),

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
    description: z.string().trim().min(1).optional(), // fallback = excerpt
    canonicalUrl: z
      .string()
      .trim()
      .pipe(z.url())
      .refine(
        isHttpWithoutCredentialsOrFragment,
        'Canonical URL must use http or https without credentials or fragments'
      )
      .optional(),

    // 📚 Series (rất mạnh cho SEO)
    series: z.string().optional(),
    orderInSeries: z.number().int().positive().optional(),

    // 🌐 Language
    language: z.enum(['vi', 'en']).default('vi'),
    translationKey: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, 'Invalid translation key')
      .optional(),

    // ⚡ Optional nhưng hữu ích
    readingTime: z.number().optional(),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .default([]),
  }),
})

export const collections = { posts }
