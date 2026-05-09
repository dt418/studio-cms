# Pagefind Search Skill (Astro + Pagefind) — TypeScript

## Overview

This skill documents the search system using Pagefind for full-text search:

- Pagefind → fast, build-time indexed full-text search
- Fuse.js → client-side fuzzy refinement (optional)
- TypeScript-first architecture — all logic in `apps/web/src/lib/search.ts`

---

## Skill Metadata

- Name: pagefind-search-astro
- Version: 3.0.0
- Language: TypeScript

---

## Architecture

```
apps/web/src/lib/search.ts           ← Search types, helpers, and UI rendering
apps/web/src/components/Search.astro        ← Minimal UI wrapper
apps/web/src/components/SearchFilters.astro  ← Filter dropdowns (category, tag, sort)
```

### Blog Integration

- `data-pagefind-filter` attributes on blog posts for category/tag filtering
- `data-pagefind-sort` for date-based sorting
- Locale-aware filtering (`/${locale}/blog/`)

### Build Pipeline

```json
{
  "scripts": {
    "build": "node scripts/generate-og-image.mjs && astro build && pagefind --site dist"
  }
}
```

### Search Flow

1. User types → debounced (200ms)
2. Pagefind.search() returns results
3. Fuse.js refines with weighted scoring (title: 0.5, excerpt: 0.3, tags: 0.2) when multiple results
4. Filter by locale prefix
5. Renders top 10 results with highlighting

---

## Type Definitions

```typescript
interface SearchResult {
  title: string
  url: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  publishedAt: string
  body: string
  score?: number
}
```

---

## ESLint Rules (MUST pass)

- No `any` types
- No unused variables (except `_` prefix)
- Identifier names min 2 chars
- Always use curly braces
- Strict equality (`===` / `!==`)
- `prefer-const` enforced
- `no-console` (allow warn, error)

---

## Design Tokens

All CSS uses `oklch()` color format and `@apply` with Tailwind utilities:

- Colors: `@apply bg-primary`, `@apply text-muted-foreground`, etc.
- Radii: `@apply rounded-sm`, `@apply rounded-md`, etc.
- Fonts: `@apply font-mono`, `@apply font-sans`, etc.

---

## Testing

```bash
pnpm test        # Run all tests
pnpm test:watch  # Watch mode
```

Tests in `apps/web/src/lib/filter.test.ts`, `apps/web/src/lib/group.test.ts`.