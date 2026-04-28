# AGENTS.md — StudioCMS Blog

This project follows modular component architecture with Astro best practices.

## Project Structure

| Folder/Directory | What |
|------------------|------|
| `src/components/` | Reusable Astro and React components |
| `src/components/Blog/` | Blog-specific components (PostHero, ArticleContent, etc.) |
| `src/components/theme/` | Theme editor React island (ThemeEditor, Presets, Panel, etc.) |
| `src/components/icons/` | Reusable SVG icon components |
| `src/layouts/` | Layout components (BaseLayout, etc.) |
| `src/pages/` | Astro pages (blog, tags, categories, etc.) |
| `src/lib/` | Utility functions and helpers |
| `src/lib/palette.ts` | OKLCH color conversion utilities |
| `src/lib/theme-store.ts` | Theme state (dark/light + primary color) shared between islands |
| `src/lib/theme-url.ts` | Compact 8-char URL encoding for shareable theme links |
| `src/lib/presets.ts` | Theme presets (Linear, Vercel, GitHub) |
| `src/styles/` | Modular CSS split by concern |
| `src/content/` | Content collections (posts, etc.) |
| `CODING_RULES.md` | Project coding standards and best practices |

## Component Architecture

### Modular Components
- Extract reusable UI patterns into separate components
- Each component has a single, well-defined responsibility
- Components use proper TypeScript types (no `any`)
- Use `CollectionEntry<'posts'>` from `astro:content` for post data

### Key Components

**Blog Components:**
- `BlogHeader.astro` - Blog page header with badge
- `StatsGrid.astro` - Statistics display grid
- `PostHero.astro` - Post hero section
- `ArticleContent.astro` - Main content area with slots
- `PostNavigation.astro` - Previous/next post navigation
- `TagsList.astro` - Tag display component
- `AuthorCard.astro` - Author information card
- `RelatedPosts.astro` - Related posts section
- `BackLink.astro` - Back navigation link
- `TagCloud.astro` - Tag cloud with highlight
- `CategoryCloud.astro` - Category cloud with highlight
- `Breadcrumb.astro` - Breadcrumb navigation
- `PostMetadata.astro` - Post metadata display
- `CoverImage.astro` - Cover image display

**Homepage Components:**
- `HeroSection.astro` - Hero section with terminal slot
- `FeaturedWork.astro` - Featured and recent posts
- `ArchiveSection.astro` - Archive listing

**Theme Components:**
- `ThemeEditor` - Floating panel island for theme customization (color picker, presets, share)
- `ColorControl` - OKLCH slider controls for primary color adjustment
- `Presets` - Preset color palette selector (Linear, Vercel, GitHub)
- `Panel` - Slide-out panel container for theme editor

**Utility Components:**
- `StatsBadge.astro` - Statistics badge
- `CTAButtons.astro` - Call-to-action buttons
- `SearchFilters.astro` - Search filter dropdowns

## CSS Architecture

### Modular CSS (Tailwind v4)

CSS is split into 5 modules imported by `src/styles/app.css`:

| File | Layer | Purpose |
|------|-------|---------|
| `app.css` | — | Entry point: imports Tailwind + all modules |
| `tokens.css` | `:root` / `.dark` | Raw OKLCH design tokens (source of truth) |
| `semantic.css` | `@theme inline` | Bridges CSS variables into Tailwind `--color-*` namespace |
| `base.css` | `@layer base` | Element resets, typography, view transitions |
| `components.css` | `@layer components` | Reusable UI classes (btn, card, badge, input, prose) |

CSS variables are evaluated at computed-value time. Setting `--primary` via JS propagates to all shades (`--primary-50` through `--primary-900`) because they use `color-mix(in oklch, var(--primary), ...)`.

### Bundle Optimization

- **ThemeEditor** uses `client:idle` hydration — defers 27KB JS until browser is idle
- **Google Fonts** loaded async with `media="print" onload="this.media='all'"` — prevents render-blocking
- **Tailwind v4 JIT** purges unused utilities — CSS bundle is 33.8 KB

## Utility Functions

Located in multiple files:
- `formatDate` from `@/lib/date` - Date formatting
- `readingTime` from `@/lib/reading-time` - Reading time calculation
- `getAuthorInitials`, `getAuthorAvatar`, `getImageUrl` from `@/lib/utils` - Author and image utilities

## Import Conventions

- Use `@` alias for imports: `import { formatDate } from '@/lib/date'`
- Never use relative paths like `../lib/utils`
- This ensures consistent imports across the project

## Type Safety

- Never use `any` types
- Use `CollectionEntry<'posts'>` from `astro:content` for content
- Mark optional props with `?` and use conditional prop passing
- Follow `exactOptionalPropertyTypes: true` TypeScript config

## See also

- `CODING_RULES.md` - Comprehensive coding standards and best practices
- `src/styles/app.css` - CSS entry point and module import list
- `src/lib/theme-store.ts` - Theme state management
- `src/lib/utils.ts` - Centralized utility functions
- `src/components/` - Component implementations
