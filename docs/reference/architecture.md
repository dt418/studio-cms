# Architecture Overview

This document describes the technical architecture of the StudioCMS Blog project.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Astro 5 (SSR Server)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Node Adapter                          │  │
│  │  (Standalone server: dist/server/entry.mjs)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              StudioCMS 0.4 Core                      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────┐    │  │
│  │  │ Blog Plugin│ │ UI Kit     │ │ Content Fetch │    │  │
│  │  └────────────┘ └────────────┘ └──────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Search Layer                            │  │
│  │  ┌────────────┐ ┌────────────┐                      │  │
│  │  │ Pagefind   │ │ Fuse.js    │                      │  │
│  │  │ (build-time│ │ (client-   │                      │  │
│  │  │  indexing) │ │  side)     │                      │  │
│  │  └────────────┘ └────────────┘                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    libSQL Database                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Local: file:./libsql.db                             │  │
│  │  Remote: Turso (libsql://your-db.turso.io)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### Astro 5

- **Mode**: SSR (`output: 'server'`)
- **Adapter**: `@astrojs/node` in standalone mode
- **Markdown Pipeline**:
  - remark: `remark-gfm` (GitHub-flavored markdown)
  - rehype: `rehype-slug` → `rehype-autolink-headings` → `rehype-pretty-code`
  - Code blocks: Expressive Code + TwoSlash

### StudioCMS 0.4

- Headful CMS with database-backed content management
- OAuth authentication (GitHub + Google)
- Multiple content formats: Markdown, HTML, MDX, Markdoc, WYSIWYG

### Search System

- **Pagefind**: Build-time static search index generation
  - Runs after `astro build` via `scripts/generate-search-index.mjs`
  - Generates `dist/client/pagefind/` with indexes and filters
- **Fuse.js**: Client-side fuzzy search refinement
  - Lazy-loaded from CDN
  - Weighted scoring: title (0.5), excerpt (0.3), tags (0.2)
  - Threshold: 0.3, min match: 2 chars
- **Architecture**: TypeScript-first (`src/lib/search.ts`) with minimal Astro wrapper

### UI Layer

- **@studiocms/ui**: Core UI components with heroicons
- **Tailwind CSS 4**: Via Vite plugin (not PostCSS)
- **Custom Icons**: `lang-flags` collection for language indicators
- **Design Tokens**: CSS custom properties in `global.css` (colors, radii, fonts, shadows)

### Database

- **Dialect**: libSQL (Turso-compatible SQLite)
- **Local**: `file:./libsql.db` (gitignored)
- **Remote**: Turso URL + auth token
- **Migrations**: Managed via `studiocms migrate`

### Testing & Quality

- **Vitest**: Unit testing framework
- **ESLint**: Flat config with TypeScript + Astro + Prettier
- **Prettier**: Code formatting with Astro plugin
- **Lefthook**: Git hooks (commit-msg, pre-commit, pre-push)
- **Commitlint**: Conventional commit validation

## Configuration Files

| File                   | Purpose                              |
| ---------------------- | ------------------------------------ |
| `astro.config.mjs`     | Astro framework + all integrations   |
| `studiocms.config.mjs` | StudioCMS plugins + database dialect |
| `eslint.config.js`     | ESLint rules (flat config)           |
| `commitlint.config.js` | Conventional commit rules            |
| `lefthook.yml`         | Git hooks configuration              |
| `vitest.config.ts`     | Vitest test configuration            |
| `.prettierrc`          | Prettier formatting rules            |
| `tsconfig.json`        | TypeScript compiler options          |

## Content Flow

1. Content created/edited via CMS dashboard (`/studiocms`)
2. Content stored in libSQL database
3. Astro fetches content at request time (SSR)
4. Markdown processed through remark/rehype pipeline
5. HTML rendered and sent to client

## Build Pipeline

```
astro build → generate-search-index.mjs → pagefind --site dist/client
```

1. **Astro build**: Compiles SSR server + static assets
2. **Search index generator**: Reads content collections, generates `search-index.html` with Pagefind data attributes
3. **Pagefind**: Indexes the HTML + generates search indexes

## Related Topics

- [Environment Variables Reference](./environment-variables.md)
- [Development Workflow](../guides/development-workflow.md)
- [Deployment Guide](../guides/deployment.md)
