---
title: 'TailwindCSS 4 Migration Guide'
slug: 'tailwindcss-4-migration-guide'
excerpt: 'Everything you need to know about migrating to TailwindCSS 4, including breaking changes and new features.'
coverImage: 'https://picsum.photos/seed/tailwind/1200/630'
publishedAt: 2025-03-20
tags: ['tailwindcss', 'css', 'frontend']
category: 'guides'
---

# TailwindCSS 4 Migration Guide

TailwindCSS 4 introduces significant changes that improve performance and developer experience. This guide covers everything you need to migrate smoothly.

## What's New in TailwindCSS 4?

- **Vite plugin instead of PostCSS** — Simpler setup
- **CSS-first configuration** — No more `tailwind.config.js`
- **Improved performance** — Faster builds
- **Automatic content detection** — No need to specify content paths

## Installation

```bash
npm install tailwindcss @tailwindcss/vite
```

## Vite Configuration

```javascript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

## CSS Configuration

Replace your `tailwind.config.js` with CSS variables:

```css
@import 'tailwindcss';

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-sans: 'Inter', sans-serif;
}
```

## Breaking Changes

### Configuration

The old JavaScript-based configuration is replaced by CSS-based configuration:

```css
/* Old way (v3) */
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

/* New way (v4) */
@theme {
  --color-primary: #3b82f6;
}
```

### Plugin Changes

Some plugins have been renamed or restructured:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
```

## Migration Steps

1. Update dependencies
2. Remove `tailwind.config.js`
3. Add `@tailwindcss/vite` to Vite plugins
4. Update CSS imports
5. Test your build

## Conclusion

TailwindCSS 4 simplifies configuration while improving performance. Take the time to migrate and enjoy the benefits.
