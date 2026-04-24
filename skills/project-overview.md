# StudioCMS Blog Project Skill

## Project Overview

- **Name:** DanhThanh.dev Blog
- **Framework:** Astro 5.18.1 (SSR, Node adapter standalone)
- **CMS:** StudioCMS 0.4.4 with libSQL (Turso)
- **Styling:** Tailwind CSS 4 + custom design tokens in `src/styles/global.css`
- **React:** 19.2.5 (interactive components via `@astrojs/react`)
- **UI Primitives:** `@base-ui/react` + `class-variance-authority`

## Design System

### Colors (Dark Theme Default, oklch format)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `oklch(0.141 0.005 285.823)` | Page background |
| `--color-foreground` | `oklch(0.922 0.004 286.032)` | Primary text |
| `--color-card` | `oklch(0.168 0.005 285.823)` | Card backgrounds |
| `--color-secondary` | `oklch(0.238 0.005 285.823)` | Secondary surfaces, badges |
| `--color-muted` | `oklch(0.667 0.008 286.032)` | Secondary text |
| `--color-muted-foreground` | `oklch(0.488 0.008 286.032)` | Tertiary text |
| `--color-border` | `oklch(1 0 0 / 0.08)` | Borders |
| `--color-primary` | `oklch(0.922 0.004 286.032)` | Links, primary actions |

### Typography

- **Sans:** `Inter` (headings, body)
- **Mono:** `JetBrains Mono` (code)
- **Body line-height:** `1.75`
- **Heading letter-spacing:** `-0.04em`

### Background Pattern

Body has subtle dot-grid: `radial-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px)` at `24px 24px`.

### CSS Architecture

- All colors use `oklch()` format (Tailwind CSS 4 native)
- Component styles use `@apply` with Tailwind utilities
- Raw CSS only for: `background-image`, `::view-transition`, `@keyframes`, `transition-delay`, `list-style-type`

### Tailwind Usage

Use design token utilities: `bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted`, `bg-secondary`, etc.

## Component Patterns

### Astro Components

- Use `.astro` extension
- Props defined in frontmatter with `interface Props`
- Use `class` attribute with Tailwind utilities
- Wrap cards with `.card` class for consistent styling
- Use `.animate-on-scroll` for scroll-triggered animations

### React Components

- Use `.tsx` extension
- Use `cn()` from `@/lib/utils` for class merging
- Use CVA (`class-variance-authority`) for component variants
- Use `@base-ui/react` for headless UI primitives

### Layout

All pages use `BaseLayout` (`src/layouts/BaseLayout.astro`):
- Sticky header with logo + nav
- Footer with bio + links
- SEO meta (OG, Twitter, JSON-LD)
- IntersectionObserver for scroll animations

## Data Layer

### Content Collections

Defined in `src/content.config.ts` with Zod schema:
- `title`, `slug`, `excerpt`, `category` (required)
- `coverImage`, `updatedAt`, `authorAvatar` (optional)
- `tags` (default `[]`), `author` (default `'Danh Thanh'`)
- Loader: `glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' })`

### CMS Functions (`src/lib/cms.ts`)

```ts
getAllPosts() → Post[]                    // sorted desc by date
getPostBySlug(slug) → Post | undefined
getAllTags() → string[]
getAllCategories() → string[]
getPostsByTag(tag) → Post[]
getPostsByCategory(category) → Post[]
```

### Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | `cn()` class merging |
| `src/lib/date.ts` | `formatDate()` |
| `src/lib/reading-time.ts` | Reading time (200 WPM) |
| `src/lib/search.ts` | Hybrid search (Pagefind + Fuse.js) |
| `src/lib/filter.ts` | Post filtering/sorting |
| `src/lib/group.ts` | `groupByYear()`, `sortedYears()` |

## Component Inventory

### Blog Components

| Component | File | Purpose |
|-----------|------|---------|
| BlogCard | `src/components/BlogCard.astro` | Post card for homepage grid |
| PostItem | `src/components/Blog/PostItem.astro` | Post row for blog index |
| PostHeader | `src/components/Blog/PostHeader.astro` | Post detail header |
| PostList | `src/components/Blog/PostList.astro` | Post list wrapper |
| PostMetaCard | `src/components/Blog/PostMetaCard.astro` | Sticky sidebar meta card |
| TableOfContents | `src/components/Blog/TableOfContents.astro` | Sticky TOC sidebar |
| PrevNextNav | `src/components/Blog/PrevNextNav.astro` | Previous/next post nav |
| YearGroup | `src/components/Blog/YearGroup.astro` | Year grouping section |
| Callout | `src/components/Blog/Callout.astro` | Info/warning/success blocks |
| FeatureHighlightCard | `src/components/Blog/FeatureHighlightCard.astro` | Feature highlight card |
| ImageBlock | `src/components/Blog/ImageBlock.astro` | Image with caption |

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| Button | `src/components/ui/button.tsx` | React button with CVA variants |
| Search | `src/components/Search.astro` | Client-side search |
| ThemeToggle | `src/components/ThemeToggle.astro` | Dark/light toggle |
| BlogFilter | `src/components/BlogFilter.astro` | Post filter component |

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/index.astro` | Homepage |
| `/blog` | `src/pages/blog/index.astro` | Blog archive |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | Post detail |
| `/search` | `src/pages/search.astro` | Search page |
| `/tags/[tag]` | `src/pages/tags/[tag].astro` | Tag archive |
| `/categories/[category]` | `src/pages/categories/[category].astro` | Category archive |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS feed |

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier
pnpm test         # Vitest
pnpm test:watch   # Vitest watch mode
```

## Build Pipeline

```
astro build → generate-search-index.mjs → pagefind --site dist/client
```

## Key Rules

1. **Use `@apply` for component styles** — never raw CSS when Tailwind utilities exist
2. **All colors use `oklch()` format** — Tailwind CSS 4 native color space
3. **Follow existing component patterns** — check similar components before creating new ones
4. **Use `cn()` for React class merging** — never concatenate class strings manually
5. **Type everything** — no `any` types, strict TypeScript
6. **Test utilities** — `src/lib/*.test.ts` for pure functions
7. **ESLint rules** — no unused vars, strict equality, prefer-const, no-console (except warn/error)
8. **Conventional commits** — enforced by commitlint + lefthook

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.container` | Max-width 72rem, centered, responsive padding |
| `.card` | Card container with border, background, hover |
| `.btn` | Button base |
| `.btn-primary` | Primary button variant |
| `.btn-ghost` | Ghost button variant |
| `.btn-outline` | Outline button variant |
| `.badge` | Badge/pill base |
| `.badge-default` | Filled badge |
| `.badge-outline` | Outlined badge |
| `.input` | Input field |
| `.prose` | Article content styling |
| `.separator` | Horizontal divider |
| `.skeleton` | Loading placeholder |
| `.animate-on-scroll` | Scroll-triggered animation |
| `.animate-slide-up` | Slide-up animation |
| `.animate-scale-in` | Scale-in animation |
| `.animate-slide-in-left` | Slide-in from left |
