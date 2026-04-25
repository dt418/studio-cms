# CLAUDE.md — StudioCMS Blog

Project context auto-loaded by Claude Code. The ground truth for how this
repo organizes work, names things, and closes loops.

## What this repo is

StudioCMS Blog - A modern Astro-based blog with modular component architecture,
following Astro best practices with strict TypeScript type safety and centralized
utility functions.

## Project Structure

| Folder       | What | Read first |
|--------------|------|------------|
| `src/components/` | Reusable Astro and React components | `AGENTS.md` |
| `src/components/Blog/` | Blog-specific components | `AGENTS.md` |
| `src/components/icons/` | Reusable SVG icon components | `AGENTS.md` |
| `src/layouts/` | Layout components | `AGENTS.md` |
| `src/pages/` | Astro pages | `AGENTS.md` |
| `src/lib/` | Utility functions and helpers | `src/lib/utils.ts` |
| `src/content/` | Content collections | `AGENTS.md` |
| `CODING_RULES.md` | Coding standards and best practices | `CODING_RULES.md` |

## Tech Stack

- **Astro** - Static site generator with islands architecture
- **React** - For interactive components
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development with strict mode enabled

## Key Principles

### Modular Architecture
- Extract reusable UI patterns into separate components
- Each component has a single, well-defined responsibility
- Components use proper TypeScript types (no `any`)

### Type Safety
- Never use `any` types
- Use `CollectionEntry<'posts'>` from `astro:content` for content
- Mark optional props with `?` and use conditional prop passing
- Follow `exactOptionalPropertyTypes: true` TypeScript config

### Import Conventions
- Use `@` alias for imports: `import { formatDate } from '@/lib/date'`
- Never use relative paths like `../lib/utils`

### Utility Functions
Centralized across multiple files:
- `formatDate` from `@/lib/date` - Date formatting
- `readingTime` from `@/lib/reading-time` - Reading time calculation
- `getAuthorInitials`, `getAuthorAvatar`, `getImageUrl` from `@/lib/utils` - Author and image utilities

## Coding Standards

All development must follow the standards defined in `CODING_RULES.md`. This includes:
- Component architecture patterns
- TypeScript type safety rules
- Import and dependency management
- Date and time handling
- Code style and linting requirements
- Styling guidelines
- File organization
- Accessibility requirements

## See also

- `CODING_RULES.md` - Comprehensive coding standards and best practices
- `AGENTS.md` - Component architecture and project structure
- `src/lib/utils.ts` - Centralized utility functions
