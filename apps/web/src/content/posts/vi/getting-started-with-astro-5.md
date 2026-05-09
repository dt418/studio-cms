---
title: 'Bắt đầu với Astro 5'
slug: 'getting-started-with-astro-5'
excerpt: 'Học cách xây dựng website nhanh, tập trung vào nội dung với Astro 5 và kiến trúc islands.'
coverImage: 'https://picsum.photos/seed/astro5/1200/630'
publishedAt: 2026-04-30
updatedAt: 2026-04-30
tags: ['astro', 'web-development', 'performance']
language: 'vi'
category: 'tutorials'
---

# Bắt đầu với Astro 5

Astro 5 mang đến những cải tiến đáng kể cho framework web vốn đã rất mạnh mẽ. Trong hướng dẫn này, chúng ta sẽ khám phá các tính năng chính và cách bắt đầu xây dựng site Astro đầu tiên.

## Astro là gì?

Astro là một framework web all-in-one được thiết kế để xây dựng website nhanh, tập trung vào nội dung. Nó sử dụng cách tiếp cận **islands architecture**, mặc định không gửi JavaScript và chỉ hydrate các component tương tác khi cần.

## Tính năng chính

- **Zero JS mặc định** — Astro render pages thành static HTML
- **Islands architecture** — Component tương tác chỉ load khi cần
- **UI-agnostic** — Dùng React, Vue, Svelte, hoặc bất kỳ framework nào
- **Content collections** — Quản lý nội dung type-safe với Zod schemas

## Bắt đầu

Để tạo project Astro mới:

```bash
npm create astro@latest
```

Sau đó di chuyển vào project và khởi động dev server:

```bash
cd my-astro-site
npm run dev
```

## Content Collections

Content collections của Astro cung cấp quản lý nội dung type-safe:

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

Điều này đảm bảo nội dung được validate tại build time, ngăn lỗi trước khi lên production.

## Kết luận

Astro 5 giúp việc xây dựng website hiệu năng cao dễ dàng hơn bao giờ hết. Bắt đầu khám phá và xem bạn có thể xây dựng gì!
