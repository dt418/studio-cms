# Hybrid Search Skill (Astro + Pagefind + Fuse.js) — TypeScript

## Overview

This skill integrates a hybrid search system into an existing Astro project using:

- Pagefind → fast, build-time full-text search
- Fuse.js → client-side fuzzy search and ranking refinement
- TypeScript-first architecture — all logic in `src/lib/search.ts`

---

## Skill Metadata

- Name: hybrid-search-astro
- Version: 2.0.0
- Language: TypeScript

---

## Architecture

```
src/lib/search.ts          ← All search logic (typed)
src/components/Search.astro ← Minimal UI wrapper (HTML + CSS + 4-line script)
scripts/generate-search-index.mjs ← Build-time index generator
```

### Build Pipeline

```json
{
  "scripts": {
    "build": "astro build && node scripts/generate-search-index.mjs && pagefind --site dist/client"
  }
}
```

### Search Flow

1. User types → debounced (200ms)
2. Pagefind.search() returns top 20 results
3. Fuse.js refines with weighted scoring (title: 0.5, excerpt: 0.3, tags: 0.2)
4. Renders top 10 results with highlighting

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

Tests in `src/lib/filter.test.ts`, `src/lib/group.test.ts`.
