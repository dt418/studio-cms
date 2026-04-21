---
title: "Getting Started with Astro 5"
slug: "getting-started-with-astro-5"
excerpt: "Learn how to build fast, content-focused websites with Astro 5 and its islands architecture."
coverImage: "https://picsum.photos/seed/astro5/1200/630"
publishedAt: 2025-01-15
updatedAt: 2025-01-20
tags: ["astro", "web-development", "performance"]
category: "tutorials"
---

# Getting Started with Astro 5

Astro 5 brings significant improvements to the already powerful web framework. In this guide, we'll explore the key features and how to get started building your first Astro site.

## What is Astro?

Astro is an all-in-one web framework designed for building fast, content-focused websites. It uses an **islands architecture** approach, shipping zero JavaScript by default and only hydrating interactive components when needed.

## Key Features

- **Zero JS by default** — Astro renders your pages to static HTML
- **Islands architecture** — Interactive components load only when needed
- **UI-agnostic** — Use React, Vue, Svelte, or any framework
- **Content collections** — Type-safe content management with Zod schemas

## Getting Started

To create a new Astro project:

```bash
npm create astro@latest
```

Then navigate to your project and start the dev server:

```bash
cd my-astro-site
npm run dev
```

## Content Collections

Astro's content collections provide type-safe content management:

```typescript
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
  }),
})

export const collections = { blog }
```

This ensures your content is validated at build time, preventing errors before they reach production.

## Conclusion

Astro 5 makes it easier than ever to build performant websites. Start exploring and see what you can build!
