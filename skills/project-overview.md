# StudioCMS Blog Project Skill

## Project Overview

- **Name:** DanhThanh.dev Blog
- **Framework:** Astro 5 monorepo with public web app in `apps/web` and CMS/admin app in `apps/cms`
- **CMS:** StudioCMS with libSQL/Turso env vars in `apps/cms`
- **Styling:** Tailwind CSS 4 + design tokens imported through `apps/web/src/styles/app.css`
- **React:** Used only where interactive islands/components need it
- **UI Primitives:** `@base-ui/react` + `class-variance-authority`

## Design System

### Colors (shadcn/ui base-nova / neutral / oklch)

Canonical theme modules in `apps/web/src/styles/`:

- **Light defaults** on `:root`, **dark overrides** on `.dark`
- Bare token names (`--background`, `--foreground`, etc.) are source of truth
- **`@theme inline`** bridges bare vars to Tailwind v4's `--color-*` namespace
- `app.css` imports `tokens.css`, `semantic.css`, `base.css`, and `components.css`.

| Token                | Light                       | Dark                        | Role                   |
| -------------------- | --------------------------- | --------------------------- | ---------------------- |
| `--background`       | `oklch(1 0 0)`              | `oklch(0.145 0 0)`          | Page background        |
| `--foreground`       | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | Primary text           |
| `--card`             | `oklch(1 0 0)`              | `oklch(0.205 0 0)`          | Card backgrounds       |
| `--primary`          | `oklch(0.205 0 0)`          | `oklch(0.922 0 0)`          | Primary actions, links |
| `--secondary`        | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Secondary surfaces     |
| `--muted`            | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | Subtle surfaces        |
| `--muted-foreground` | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`          | De-emphasized text     |
| `--border`           | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`        | Borders                |
| `--destructive`      | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states           |

### Typography

- **Sans:** `Inter` (headings, body)
- **Mono:** `JetBrains Mono` (code)
- **Body line-height:** `1.75`
- **Heading letter-spacing:** `-0.04em`

### Background Pattern

Body has subtle dot-grid: `radial-gradient(color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)` at `24px 24px`. Uses `color-mix()` so dots adapt to both light and dark themes.

### CSS Architecture

- All colors use `oklch()` format (Tailwind CSS 4 native)
- Bare tokens on `:root`, `@theme inline` bridges to `--color-*` namespace
- Shared animations and component utilities live in the existing style modules.
- Component styles use `@apply` with Tailwind utilities
- Raw CSS only for: `background-image`, `::view-transition`, `@keyframes`, `transition-delay`, `list-style-type`

### Tailwind Usage

Use design token utilities: `bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `bg-secondary`, etc.

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

All public pages use `BaseLayout` (`apps/web/src/layouts/BaseLayout.astro`):

- Sticky header with logo + nav
- Footer with bio + links
- SEO meta (OG, Twitter, JSON-LD)
- IntersectionObserver for scroll animations

## Data Layer

### Content Collections

Defined in `apps/web/src/content.config.ts` with Zod schema:

- `title`, `slug`, `excerpt`, `category` (required)
- `coverImage`, `updatedAt`, `authorAvatar` (optional)
- `tags` (default `[]`), `author` (default `'Danh Thanh'`)
- Loader reads `apps/web/src/content/posts/**/*.{md,mdx}`.

### CMS Functions (`apps/web/src/lib/cms.ts`)

```ts
getAllPosts() → Post[]                    // sorted desc by date
getPostBySlug(slug) → Post | undefined
getAllTags() → string[]
getAllCategories() → string[]
getPostsByTag(tag) → Post[]
getPostsByCategory(category) → Post[]
```

## Utilities

| File                               | Purpose                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `apps/web/src/lib/utils.ts`        | Centralized utilities: cn(), getAuthorInitials, getAuthorAvatar, getImageUrl |
| `apps/web/src/lib/date.ts`         | Date formatting (formatDate)                                                 |
| `apps/web/src/lib/reading-time.ts` | Reading time calculation                                                     |
| `apps/web/src/lib/search.ts`       | Search types and helpers                                                     |
| `apps/web/src/lib/filter.ts`       | Post filtering/sorting                                                       |
| `apps/web/src/lib/group.ts`        | `groupByYear()`, `sortedYears()`                                             |

## Import Conventions

- Use `@` alias for imports: `import { formatDate } from '@/lib/date'`
- Never use relative paths like `../lib/utils`
- This ensures consistent imports across the project

## Type Safety

- Never use `any` types
- Use `CollectionEntry<'posts'>` from `astro:content` for content
- Mark optional props with `?` and use conditional prop passing
- Follow `exactOptionalPropertyTypes: true` TypeScript config

## Coding Standards

All development must follow the comprehensive standards defined in `CODING_RULES.md`. This includes:

- Component architecture patterns (modular, single responsibility)
- TypeScript type safety rules
- Import and dependency management
- Date and time handling (use formatDate from utils)
- Code style and linting requirements
- Styling guidelines
- File organization
- Accessibility requirements

## Component Inventory

### Blog Components

| Component       | File                                                 | Purpose                       |
| --------------- | ---------------------------------------------------- | ----------------------------- |
| BlogHeader      | `apps/web/src/components/Blog/BlogHeader.astro`      | Blog page header with badge   |
| StatsGrid       | `apps/web/src/components/Blog/StatsGrid.astro`       | Statistics display grid       |
| PostHero        | `apps/web/src/components/Blog/PostHero.astro`        | Post hero section             |
| ArticleContent  | `apps/web/src/components/Blog/ArticleContent.astro`  | Main content area with slots  |
| PostNavigation  | `apps/web/src/components/Blog/PostNavigation.astro`  | Previous/next post navigation |
| TagsList        | `apps/web/src/components/Blog/TagsList.astro`        | Tag display component         |
| AuthorCard      | `apps/web/src/components/Blog/AuthorCard.astro`      | Author information card       |
| RelatedPosts    | `apps/web/src/components/Blog/RelatedPosts.astro`    | Related posts section         |
| BackLink        | `apps/web/src/components/Blog/BackLink.astro`        | Back navigation link          |
| TagCloud        | `apps/web/src/components/Blog/TagCloud.astro`        | Tag cloud with highlight      |
| CategoryCloud   | `apps/web/src/components/Blog/CategoryCloud.astro`   | Category cloud with highlight |
| Breadcrumb      | `apps/web/src/components/Blog/Breadcrumb.astro`      | Breadcrumb navigation         |
| PostMetadata    | `apps/web/src/components/Blog/PostMetadata.astro`    | Post metadata display         |
| CoverImage      | `apps/web/src/components/Blog/CoverImage.astro`      | Cover image display           |
| PostItem        | `apps/web/src/components/Blog/PostItem.astro`        | Post row for blog index       |
| PostHeader      | `apps/web/src/components/Blog/PostHeader.astro`      | Post detail header            |
| PostMetaCard    | `apps/web/src/components/Blog/PostMetaCard.astro`    | Sticky sidebar meta card      |
| TableOfContents | `apps/web/src/components/Blog/TableOfContents.astro` | Sticky TOC sidebar            |
| PrevNextNav     | `apps/web/src/components/Blog/PrevNextNav.astro`     | Previous/next post nav        |
| YearGroup       | `apps/web/src/components/Blog/YearGroup.astro`       | Year grouping section         |

### Homepage Components

| Component      | File                                           | Purpose                         |
| -------------- | ---------------------------------------------- | ------------------------------- |
| HeroSection    | `apps/web/src/components/HeroSection.astro`    | Hero section with terminal slot |
| FeaturedWork   | `apps/web/src/components/FeaturedWork.astro`   | Featured and recent posts       |
| ArchiveSection | `apps/web/src/components/ArchiveSection.astro` | Archive listing                 |

### Utility Components

| Component     | File                                             | Purpose                 |
| ------------- | ------------------------------------------------ | ----------------------- |
| StatsBadge    | `apps/web/src/components/StatsBadge.astro`       | Statistics badge        |
| CTAButtons    | `apps/web/src/components/CTAButtons.astro`       | Call-to-action buttons  |
| SearchFilters | `apps/web/src/components/SearchFilters.astro`    | Search filter dropdowns |
| SearchIcon    | `apps/web/src/components/icons/SearchIcon.astro` | Search SVG icon         |
| ClearIcon     | `apps/web/src/components/icons/ClearIcon.astro`  | Clear button SVG icon   |

### UI Components

| Component      | File                                           | Purpose                     |
| -------------- | ---------------------------------------------- | --------------------------- |
| BlogCard       | `apps/web/src/components/BlogCard.astro`       | Post card for homepage grid |
| Search         | `apps/web/src/components/Search.astro`         | Client-side search          |
| ThemeToggle    | `apps/web/src/components/ThemeToggle.astro`    | Dark/light toggle           |
| BlogFilter     | `apps/web/src/components/BlogFilter.astro`     | Post filter component       |
| MarqueeSection | `apps/web/src/components/MarqueeSection.astro` | Scrolling marquee section   |

## Routes

| Route                    | File                                             | Description      |
| ------------------------ | ------------------------------------------------ | ---------------- |
| `/`                      | `apps/web/src/pages/index.astro`                 | Homepage         |
| `/blog`                  | `apps/web/src/pages/blog/index.astro`            | Blog archive     |
| `/blog/[slug]`           | `apps/web/src/pages/blog/[slug].astro`           | Post detail      |
| `/search`                | `apps/web/src/pages/search.astro`                | Search page      |
| `/tags/[tag]`            | `apps/web/src/pages/tags/[tag].astro`            | Tag archive      |
| `/categories/[category]` | `apps/web/src/pages/categories/[category].astro` | Category archive |
| `/rss.xml`               | `apps/web/src/pages/rss.xml.ts`                  | RSS feed         |

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
generate-og-image.mjs → astro build → generate-search-index.mjs → pagefind --site dist/client
```

## Key Rules

1. **Use `@apply` for component styles** — never raw CSS when Tailwind utilities exist
2. **All colors use `oklch()` format** — Tailwind CSS 4 + shadcn/ui base-nova theme
3. **Use Tailwind semantic utilities** (`bg-background`, `text-muted-foreground`) — never raw `var(--)` or `oklch()` literals in markup
4. **Follow existing component patterns** — check similar components before creating new ones
5. **Use `cn()` for React class merging** — never concatenate class strings manually
6. **Type everything** — no `any` types, strict TypeScript
7. **Test utilities** — `apps/web/src/lib/*.test.ts` for pure functions
8. **ESLint rules** — no unused vars, strict equality, prefer-const, no-console (except warn/error)
9. **Conventional commits** — enforced by commitlint + lefthook

## CSS Classes Reference

| Class                    | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `.container`             | Max-width 72rem, centered, responsive padding |
| `.card`                  | Card container with border, background, hover |
| `.btn`                   | Button base                                   |
| `.btn-primary`           | Primary button variant                        |
| `.btn-ghost`             | Ghost button variant                          |
| `.btn-outline`           | Outline button variant                        |
| `.badge`                 | Badge/pill base                               |
| `.badge-default`         | Filled badge                                  |
| `.badge-outline`         | Outlined badge                                |
| `.input`                 | Input field                                   |
| `.prose`                 | Article content styling                       |
| `.separator`             | Horizontal divider                            |
| `.skeleton`              | Loading placeholder                           |
| `.animate-on-scroll`     | Scroll-triggered animation                    |
| `.animate-slide-up`      | Slide-up animation                            |
| `.animate-scale-in`      | Scale-in animation                            |
| `.animate-slide-in-left` | Slide-in from left                            |
