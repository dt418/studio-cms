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

### UI Layer

- **@studiocms/ui**: Core UI components with heroicons
- **Tailwind CSS 4**: Via Vite plugin (not PostCSS)
- **Custom Icons**: `lang-flags` collection for language indicators

### Database

- **Dialect**: libSQL (Turso-compatible SQLite)
- **Local**: `file:./libsql.db` (gitignored)
- **Remote**: Turso URL + auth token
- **Migrations**: Managed via `studiocms migrate`

## Configuration Files

| File                   | Purpose                              |
| ---------------------- | ------------------------------------ |
| `astro.config.mjs`     | Astro framework + all integrations   |
| `studiocms.config.mjs` | StudioCMS plugins + database dialect |
| `eslint.config.js`     | ESLint rules (flat config)           |
| `lefthook.yml`         | Pre-commit hooks                     |
| `.prettierrc`          | Prettier formatting rules            |
| `tsconfig.json`        | TypeScript compiler options          |

## Content Flow

1. Content created/edited via CMS dashboard (`/studiocms`)
2. Content stored in libSQL database
3. Astro fetches content at request time (SSR)
4. Markdown processed through remark/rehype pipeline
5. HTML rendered and sent to client

## Related Topics

- [Environment Variables Reference](./environment-variables.md)
- [Development Workflow](../guides/development-workflow.md)
- [Deployment Guide](../guides/deployment.md)
