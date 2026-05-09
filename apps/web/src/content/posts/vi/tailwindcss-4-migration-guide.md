---
title: 'Hướng dẫn migrate lên TailwindCSS 4'
slug: 'tailwindcss-4-migration-guide'
excerpt: 'Tất cả những gì bạn cần biết về việc migrate lên TailwindCSS 4, bao gồm breaking changes và tính năng mới.'
coverImage: '/og/tailwindcss-4-migration-guide.webp'
publishedAt: 2026-04-20
updatedAt: 2026-04-20
tags: ['tailwindcss', 'css', 'frontend']
language: 'vi'
category: 'guides'
---

# Hướng dẫn migrate lên TailwindCSS 4

TailwindCSS 4 giới thiệu những thay đổi quan trọng giúp cải thiện performance và trải nghiệm developer. Hướng dẫn này cover tất cả những gì bạn cần để migrate mượt mà.

## Có gì mới trong TailwindCSS 4?

- **Vite plugin thay vì PostCSS** — Cấu hình đơn giản hơn
- **CSS-first configuration** — Không còn `tailwind.config.js`
- **Cải thiện performance** — Build nhanh hơn
- **Tự động detect content** — Không cần chỉ định content paths

## Cài đặt

```bash
npm install tailwindcss @tailwindcss/vite
```

## Cấu hình Vite

```javascript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

## Cấu hình CSS

Thay thế `tailwind.config.js` bằng CSS variables:

```css
@import 'tailwindcss';

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-sans: 'Inter', sans-serif;
}
```

## Breaking Changes

### Cấu hình

Cấu hình dựa trên JavaScript cũ được thay bằng cấu hình dựa trên CSS:

```css
/* Cách cũ (v3) */
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
    },
  },
}

/* Cách mới (v4) */
@theme {
  --color-primary: #3b82f6;
}
```

### Thay đổi về Plugin

Một số plugin đã được đổi tên hoặc tái cấu trúc:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
```

## Các bước Migration

1. Update dependencies
2. Xóa `tailwind.config.js`
3. Thêm `@tailwindcss/vite` vào Vite plugins
4. Update CSS imports
5. Test build

## Kết luận

TailwindCSS 4 đơn giản hóa cấu hình trong khi cải thiện performance. Hãy dành thời gian migrate và tận hưởng những lợi ích mới.
