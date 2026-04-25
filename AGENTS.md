# AGENTS.md — StudioCMS Blog

This project follows modular component architecture with Astro best practices.

## Project Structure

| Folder/Directory | What |
|------------------|------|
| `src/components/` | Reusable Astro and React components |
| `src/components/Blog/` | Blog-specific components (PostHero, ArticleContent, etc.) |
| `src/components/icons/` | Reusable SVG icon components |
| `src/layouts/` | Layout components (BaseLayout, etc.) |
| `src/pages/` | Astro pages (blog, tags, categories, etc.) |
| `src/lib/` | Utility functions and helpers |
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

**Utility Components:**
- `StatsBadge.astro` - Statistics badge
- `CTAButtons.astro` - Call-to-action buttons
- `SearchFilters.astro` - Search filter dropdowns

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
- `src/lib/utils.ts` - Centralized utility functions
- `src/components/` - Component implementations
