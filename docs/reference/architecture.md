# Architecture Overview

This document describes the technical architecture of the danhthanh.dev monorepo. The repository contains two deployable Astro apps: a static public web app and a separate StudioCMS Node SSR app.

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
┌─────────────────────────────┐     ┌─────────────────────────┐
│ apps/web                    │     │ apps/cms                │
│ Astro 5 static public site  │     │ StudioCMS Astro SSR app │
│                             │     │                         │
│ /                           │     │ /studiocms              │
│ /blog                       │     │ /studiocms_api          │
│ /blog/:slug                 │     │ /studiocms-blog         │
│ /search                     │     │                         │
│ /rss.xml                    │     │ Node standalone server  │
└──────────────┬──────────────┘     └────────────┬────────────┘
               │                                 │
               │                                 ▼
               │                    ┌─────────────────────────┐
               │                    │ libSQL / Turso          │
               │                    │ CMS data and auth       │
               │                    └─────────────────────────┘
               ▼
┌─────────────────────────────┐
│ Pagefind static index       │
│ apps/web/dist/pagefind      │
└─────────────────────────────┘
```

## Workspace Responsibilities

| Workspace  | Purpose                                                 | Build Output                     | Runtime        |
| ---------- | ------------------------------------------------------- | -------------------------------- | -------------- |
| `apps/web` | Public portfolio/blog, content collections, RSS, search | `apps/web/dist`                  | Static hosting |
| `apps/cms` | StudioCMS dashboard, auth, CMS APIs, CMS-managed routes | `apps/cms/dist/server/entry.mjs` | Node.js SSR    |

The workspaces are coordinated by `pnpm-workspace.yaml` and `turbo.json`. Root scripts delegate to filtered workspace tasks so local commands and CI can run from the repository root.

## Web App

`apps/web` is the public static site.

- **Framework**: Astro 5 static output.
- **Content source**: `apps/web/src/content/posts/**/*.{md,mdx}` through Astro content collections.
- **Blog routes**: Custom routes under `apps/web/src/pages/blog`.
- **Route helpers**: `apps/web/src/lib/routes.ts` encodes dynamic path segments consistently.
- **Visibility rules**: `apps/web/src/lib/post-visibility.ts` keeps draft and `noindex` posts out of public listings by default.
- **RSS**: Generated at `/rss.xml` using the same route helpers as the page routes.
- **Build optimization**: `@playform/compress` with lightningcss (CSS), terser (JS), svgo multipass (SVG), and html-minifier-terser (HTML) runs as the last Astro integration to minify static output.

## CMS App

`apps/cms` is the StudioCMS admin and API app.

- **Framework**: Astro 5 with `@astrojs/node` standalone output.
- **CMS**: StudioCMS 0.4 with database-backed content management.
- **Routes**: Dashboard at `/studiocms`, APIs under `/studiocms_api`, plugin content under `/studiocms-blog`.
- **Database**: libSQL, using local `file:./libsql.db` or remote Turso.
- **Authentication**: GitHub and Google OAuth configured against the CMS origin.

StudioCMS routes are intentionally separate from the custom public `/blog` routes so the static web app owns the main blog experience.

## Search System

- **Pagefind**: Build-time static search index generated from `apps/web/dist`.
- **Fuse.js**: Client-side fuzzy search refinement for loaded search data.
- **Search code**: `apps/web/src/lib/search.ts`, with Astro wrappers kept small.

The web build generates Open Graph assets, builds Astro output, generates search HTML, and then runs Pagefind against the static output.

```text
generate-og-image.mjs → astro build → generate-search-index.mjs → pagefind --site dist
```

## UI Layer

- **Styling**: Tailwind CSS 4 through `apps/web/src/styles/app.css`.
- **Token modules**: `tokens.css`, `semantic.css`, `base.css`, and `components.css`.
- **UI components**: Astro components plus selected React/shadcn components under `apps/web/src/components`.
- **Design tokens**: CSS custom properties mapped into Tailwind utilities with `@theme inline`.

## Configuration Files

| File                            | Purpose                                |
| ------------------------------- | -------------------------------------- |
| `pnpm-workspace.yaml`           | Workspace package boundaries           |
| `turbo.json`                    | Turborepo task graph                   |
| `apps/web/astro.config.mjs`     | Public web Astro config                |
| `apps/cms/astro.config.mjs`     | CMS Astro SSR config                   |
| `apps/cms/studiocms.config.mjs` | StudioCMS plugins and database dialect |
| `eslint.config.js`              | Root ESLint flat config                |
| `playwright.config.ts`          | E2E test config                        |
| `lefthook.yml`                  | Git hooks configuration                |
| `commitlint.config.js`          | Conventional commit rules              |

## Build Pipeline

Root `pnpm build` runs the Turborepo build graph for both deployable apps.

1. `apps/web` builds static public output and Pagefind assets.
2. `apps/cms` builds the Node SSR server bundle.
3. Deployment publishes `apps/web/dist` to static hosting and runs `node apps/cms/dist/server/entry.mjs` for CMS.

## Testing And Quality

- **Unit tests**: Vitest tests in `apps/web/src/**/*.test.ts`.
- **E2E tests**: Playwright tests in `e2e/` against the web app.
- **Linting**: ESLint flat config with TypeScript, Astro, and Prettier integration.
- **Formatting**: Prettier with Astro and Tailwind plugins.
- **Hooks**: Lefthook runs commit message checks, pre-commit checks, and pre-push tests/build.

## Related Topics

- [Environment Variables Reference](./environment-variables.md)
- [Development Workflow](../guides/development-workflow.md)
- [Deployment Guide](../guides/deployment.md)
