# Turborepo Monorepo Migration Blueprint

## 1. Analysis

Current repository shape:

- Root app is a single Astro 5 project in `/home/thanh/danhthanh.dev`.
- `package.json` contains one app package named `danhthanh-dev` with combined web, CMS, test, lint, build, and migration scripts.
- No `pnpm-workspace.yaml` exists.
- `astro.config.mjs` is configured as SSR with `output: 'server'` and `@astrojs/node` standalone adapter.
- StudioCMS is mounted in the same Astro runtime through `studioCMS()`, `studiocmsUi()`, and `studiocmsCfetch()` integrations in `astro.config.mjs`.
- `studiocms.config.mjs` uses libSQL and disables StudioCMS blog route injection with `injectRoutes: false`, `enableRSS: false`, and plugin route `/studiocms-blog`.
- Public blog content is file-based Astro content under `src/content/posts/**/*.{md,mdx}` using `src/content.config.ts`.
- Public routes already opt into prerendering with `export const prerender = true`.
- Blog detail route `src/pages/blog/[slug].astro` already uses `getStaticPaths()`.
- Tag and category routes also use `getStaticPaths()`.
- Search index generation is a root script reading `./src/content/posts` and writing `./dist/client/search-index.html`.
- OG image generation is a root script writing `public/og-image.png`.
- E2E config starts `npm run dev` on port `4321`; CI runs migrations, build, and Playwright against the current single app.
- `tender-series/` is an ignored separate Astro/StudioCMS project and should not be part of this migration unless explicitly requested.

Current public web routes:

- `src/pages/index.astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[slug].astro`
- `src/pages/categories/[category].astro`
- `src/pages/tags/[tag].astro`
- `src/pages/search.astro`
- `src/pages/rss.xml.ts`

Current public web support code:

- `src/content.config.ts`
- `src/content/posts/*`
- `src/components/**/*`
- `src/layouts/BaseLayout.astro`
- `src/lib/cms.ts`
- `src/lib/content-graph.ts`
- `src/lib/post-visibility.ts`
- `src/lib/routes.ts`
- `src/lib/site.ts`
- `src/lib/date.ts`
- `src/lib/filter.ts`
- `src/lib/group.ts`
- `src/lib/reading-time.ts`
- `src/lib/search.ts`
- `src/lib/theme-*`, `src/lib/palette.ts`, `src/lib/presets.ts`, `src/lib/useScrollSystem.ts`
- `src/styles/app.css`, `tokens.css`, `semantic.css`, `base.css`, `components.css`

Current CMS-specific code:

- `studiocms.config.mjs`
- StudioCMS integrations and layout override plugin in `astro.config.mjs`
- `src/styles/pages/[...slug].astro`, despite the path name, is a StudioCMS dynamic page route using `studiocms:renderer` and `studiocms:sdk`.
- `src/styles/components/Editor.astro` imports `studiocms/types`.
- `src/styles/components/remder.ts` imports `studiocms/types`.

Current SSR assumptions:

- Root Astro config is fully SSR because CMS and public web share one app.
- Public blog routes are prerendered inside an SSR-capable app, not inside a pure static app.
- `src/pages/blog/[slug].astro` reads `Astro.url.searchParams.get('preview') === 'true'`, but because the route is prerendered this is only a client URL metadata flag and does not fetch draft content.
- The current CMS/admin/API runtime is coupled to the same root app configuration and build command.

## 2. Concrete Issues

1. `astro.config.mjs` mixes SSG public web and SSR CMS concerns.
   - Lines 59-85 set the whole app to `output: 'server'` with Node standalone adapter.
   - Lines 91-103 register both public web integrations and StudioCMS integrations in one app.
   - Target requires `apps/web` static and `apps/cms` SSR independently.

2. StudioCMS runtime code is hidden under `src/styles/`.
   - `src/styles/pages/[...slug].astro` imports `studiocms:renderer` and `studiocms:sdk`.
   - `src/styles/components/Editor.astro` imports `studiocms/types`.
   - `src/styles/components/remder.ts` imports `studiocms/types`.
   - These files must move to `apps/cms` and should be renamed or placed under a clearer CMS path.

3. `src/lib/cms.ts` is not StudioCMS code despite its name.
   - It uses `astro:content` and should belong to the static web content layer.
   - The name will confuse the monorepo boundary because `apps/cms` will become the real CMS app.
   - Rename during the web split to `apps/web/src/lib/posts.ts` or `apps/web/src/lib/content.ts`.

4. Public web imports Astro content types across components and utilities.
   - Many components use `CollectionEntry<'posts'>` directly.
   - This is acceptable inside `apps/web`, but these files cannot move to pure `packages/*` unless their types are detached from Astro.
   - Shared packages should initially avoid post UI/types until a pure DTO is introduced.

5. Preview mode is currently unsafe as a product concept if expanded without auth.
   - `src/pages/blog/[slug].astro` marks `?preview=true` pages as noindex and displays a preview banner.
   - It does not authenticate preview access or fetch drafts.
   - Future CMS API preview/draft endpoints must require a preview token, session, or signed secret.

6. Build scripts are rooted to current paths.
   - `scripts/generate-search-index.mjs` reads `./src/content/posts` and writes `./dist/client`.
   - `scripts/generate-og-image.mjs` writes `public/og-image.png` from the root.
   - These must move to or parameterize for `apps/web`.

7. Tool configs assume one app root.
   - `tsconfig.json` maps `@/*` to `src/*`.
   - `components.json` points Tailwind CSS to `src/styles/app.css` and aliases to root `src`.
   - `vitest.config.ts` includes `src/**/*.test.ts`.
   - `playwright.config.ts` starts `npm run dev`, not workspace-specific commands.
   - `eslint.config.js` parser project is `./tsconfig.json` and ignores only root paths.
   - These need workspace-aware updates.

8. CI and hooks assume a single package.
   - `.github/workflows/playwright.yml` runs root `pnpm migrate`, `pnpm build`, and `pnpm test:e2e`.
   - `lefthook.yml` pre-push runs root `pnpm test` and `pnpm build`.
   - After migration, these should call Turbo pipelines or specific workspace commands.

## 3. Target File Tree

```text
.
├── apps/
│   ├── web/
│   │   ├── astro.config.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── components.json
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   ├── robots.txt
│   │   │   └── og-image.png
│   │   ├── scripts/
│   │   │   ├── generate-og-image.mjs
│   │   │   └── generate-search-index.mjs
│   │   └── src/
│   │       ├── components/
│   │       ├── content/
│   │       ├── content.config.ts
│   │       ├── layouts/
│   │       ├── lib/
│   │       ├── pages/
│   │       ├── styles/
│   │       ├── test-helpers.ts
│   │       └── test-setup.ts
│   └── cms/
│       ├── astro.config.mjs
│       ├── package.json
│       ├── studiocms.config.mjs
│       ├── tsconfig.json
│       └── src/
│           ├── components/
│           │   └── studio/
│           ├── lib/
│           │   ├── api/
│           │   ├── preview.ts
│           │   └── posts.ts
│           ├── pages/
│           │   ├── api/
│           │   │   └── posts/
│           │   │       ├── index.ts
│           │   │       └── draft.ts
│           │   └── [...slug].astro
│           └── styles/
├── packages/
│   ├── types/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── posts.ts
│   └── utils/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── date.ts
│           └── routes.ts
├── e2e/
├── plans/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── eslint.config.js
├── playwright.config.ts
└── vitest.config.ts
```

Do not include `tender-series/` in workspace packages during the initial migration.

## 4. Package And Config Design

Root `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

Root `turbo.json` tasks:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "format:check": {
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "migrate": {
      "cache": false
    }
  }
}
```

Root `package.json` should become private and orchestration-only:

```json
{
  "name": "danhthanh-dev-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "pnpm --filter @danhthanh/web dev",
    "dev:cms": "pnpm --filter @danhthanh/cms dev",
    "build": "turbo build",
    "build:web": "pnpm --filter @danhthanh/web build",
    "build:cms": "pnpm --filter @danhthanh/cms build",
    "lint": "turbo lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "test:e2e": "playwright test",
    "migrate": "pnpm --filter @danhthanh/cms migrate",
    "check": "pnpm lint && pnpm format:check && pnpm test && pnpm typecheck",
    "commitlint": "commitlint",
    "postinstall": "patch-package"
  }
}
```

`apps/web` config:

- `astro.config.mjs` must remove `@astrojs/node`, `studioCMS`, `studiocmsUi`, and `studiocmsCfetch`.
- Use static output by omitting `output: 'server'` and `adapter`.
- Keep `react()`, Tailwind v4 Vite plugin, Expressive Code, sitemap, markdown plugins, and visualizer if still useful.
- Alias `@` to `apps/web/src`.
- Sitemap filter no longer needs `/studiocms` filtering for web, but should still avoid `/api/` if any static API-like routes exist.

`apps/cms` config:

- Keep `output: 'server'` and an SSR adapter.
- For VPS, use `@astrojs/node` standalone.
- For Cloudflare or Vercel, use deployment-specific adapter variants in provider branches or documented alternatives; do not force all providers into one config without an adapter strategy.
- Keep StudioCMS integrations and `studioCMSLayoutOverrides()`.
- Move `studiocms.config.mjs` into `apps/cms/studiocms.config.mjs`.
- Decide whether CMS owns a catch-all renderer route from current `src/styles/pages/[...slug].astro`; if kept, move it to `apps/cms/src/pages/[...slug].astro` or a safer route prefix to avoid public web URL collisions.

Shared packages:

- Start with `packages/types` only if the CMS API DTOs need sharing.
- Only move utilities that do not import Astro, StudioCMS, browser globals, Node filesystem, or database clients.
- Candidate pure utilities after detaching Astro `Post` type coupling:
  - date formatting from `src/lib/date.ts`
  - route string builders from `src/lib/routes.ts` after changing signatures to accept slugs/strings instead of Astro `Post`
  - public post DTO types
- Keep Astro components and Astro `CollectionEntry`-based helpers inside `apps/web` initially.

## 5. API Contract

The CMS API should be introduced after the apps are split and CMS owns the SSR runtime.

Public published posts endpoint:

```http
GET /api/posts
```

Response:

```ts
interface PublicPostDto {
  slug: string
  title: string
  excerpt: string
  coverImage?: string
  publishedAt: string
  updatedAt?: string
  tags: string[]
  category: string
  author: string
  authorAvatar?: string
  description?: string
  canonicalUrl?: string
  noindex: boolean
  series?: string
  orderInSeries?: number
  readingTime?: number
  path: string
}
```

Rules:

- Exclude drafts.
- Exclude `noindex` by default unless a query parameter is intentionally added later.
- Return JSON sorted by `publishedAt` descending.
- Add header `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`.

Draft endpoint:

```http
GET /api/posts/draft?slug=:slug
Authorization: Bearer <preview token or CMS session token>
```

Rules:

- Require authentication.
- Return `401` for missing auth.
- Return `403` for invalid auth.
- Return `404` for unknown slug.
- Never include draft bodies in public cache.
- Use `Cache-Control: private, no-store`.

Preview mode:

```http
GET /api/posts/preview?slug=:slug&token=:signedPreviewToken
```

Rules:

- `?preview=true` alone is not authorization.
- Use signed token validation or CMS session validation.
- Token should encode slug and expiry.
- Web preview page should render only when the token validates through CMS.
- Preview HTML should be `noindex, nofollow`.
- Preview responses should use `Cache-Control: private, no-store`.

Important implementation decision:

- If `apps/web` remains fully static, draft preview cannot be generated as normal static pages. Use one of these patterns:
  - CMS-hosted preview route under `apps/cms`, linked from CMS admin.
  - Client-side preview fetch in a static web route gated by signed token.
  - On-demand static rebuild for published content only, not drafts.

Recommended initial approach:

- Keep public published blog fully static in `apps/web` from file-based content.
- Host draft/preview rendering in `apps/cms` to avoid turning `apps/web` SSR.
- Use deploy hook only for published content sync/rebuild.

## 6. Phased Migration Plan

### Phase 1: Workspace Scaffolding

Objective:

- Add Turborepo and pnpm workspace scaffolding without moving app code.

Files to add:

- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`

Files to update:

- `package.json`
- `lefthook.yml`
- `.github/workflows/playwright.yml` only if needed for workspace install compatibility

Tasks:

1. Add `turbo` as a dev dependency at root.
2. Mark root package private.
3. Keep existing root scripts working during this phase.
4. Add Turbo scripts without replacing the current build path yet.
5. Ensure `tender-series/` is not picked up as a workspace.

Verification:

- `pnpm install`
- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Exit criteria:

- Current app behavior unchanged.
- Turbo config exists and can be used in later phases.

Rollback:

- Remove `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, and root script/dependency changes.

### Phase 2: Create `apps/web` Static App

Objective:

- Move public web code into `apps/web` and make it a static Astro app.

File moves:

- `src/pages/index.astro` -> `apps/web/src/pages/index.astro`
- `src/pages/blog/*` -> `apps/web/src/pages/blog/*`
- `src/pages/categories/*` -> `apps/web/src/pages/categories/*`
- `src/pages/tags/*` -> `apps/web/src/pages/tags/*`
- `src/pages/search.astro` -> `apps/web/src/pages/search.astro`
- `src/pages/rss.xml.ts` -> `apps/web/src/pages/rss.xml.ts`
- `src/content.config.ts` -> `apps/web/src/content.config.ts`
- `src/content/posts/*` -> `apps/web/src/content/posts/*`
- public web components/layouts/libs/styles -> matching `apps/web/src/*`
- `public/*` -> `apps/web/public/*`
- `scripts/generate-og-image.mjs` -> `apps/web/scripts/generate-og-image.mjs`
- `scripts/generate-search-index.mjs` -> `apps/web/scripts/generate-search-index.mjs`
- `components.json` -> `apps/web/components.json`

Refactors:

- Rename `apps/web/src/lib/cms.ts` to `apps/web/src/lib/posts.ts`.
- Update imports from `@/lib/cms` to `@/lib/posts`.
- Update `apps/web/src/lib/post-visibility.ts` and `routes.ts` type imports accordingly.
- Update search/OG scripts to use paths relative to `apps/web`.
- Create `apps/web/astro.config.mjs` without SSR adapter or StudioCMS integrations.
- Create `apps/web/package.json` with web-only dependencies.
- Create `apps/web/tsconfig.json` with `@/* -> src/*`.
- Update root or web-level Vitest include paths.

Verification:

- `pnpm --filter @danhthanh/web typecheck`
- `pnpm --filter @danhthanh/web lint`
- `pnpm --filter @danhthanh/web test`
- `pnpm --filter @danhthanh/web build`
- Confirm `apps/web/dist` is static client output, not Node standalone SSR.

Exit criteria:

- Public routes build statically.
- `/blog/[slug]`, `/tags/[tag]`, and `/categories/[category]` use `getStaticPaths`.
- Web app has no `studiocms`, `@studiocms/*`, `@astrojs/node`, or libSQL dependency.

Rollback:

- Move files back to root `src`, restore root Astro config and scripts.

### Phase 3: Create `apps/cms` SSR App

Objective:

- Move StudioCMS runtime into an independent SSR app.

File moves:

- `studiocms.config.mjs` -> `apps/cms/studiocms.config.mjs`
- StudioCMS-specific parts of `astro.config.mjs` -> `apps/cms/astro.config.mjs`
- `src/styles/pages/[...slug].astro` -> `apps/cms/src/pages/[...slug].astro` or a deliberate CMS route prefix
- `src/styles/components/Editor.astro` -> `apps/cms/src/components/studio/Editor.astro`
- `src/styles/components/remder.ts` -> `apps/cms/src/components/studio/render.ts`

Refactors:

- Fix relative imports after moving CMS renderer route.
- Keep `studioCMSLayoutOverrides()` in CMS Vite plugins.
- Preserve libSQL env variable expectations: `CMS_LIBSQL_URL`, `CMS_ENCRYPTION_KEY`.
- Create `apps/cms/package.json` with CMS-only dependencies.
- Create `apps/cms/tsconfig.json`.
- Decide if CMS should run on a different local port, likely `4322`.

Verification:

- `CMS_LIBSQL_URL=file:./libsql.db CMS_ENCRYPTION_KEY=<valid dev key> pnpm --filter @danhthanh/cms migrate`
- `CMS_LIBSQL_URL=file:./libsql.db CMS_ENCRYPTION_KEY=<valid dev key> pnpm --filter @danhthanh/cms build`
- Start CMS dev server and verify `/studiocms` loads.

Exit criteria:

- CMS app builds as SSR.
- Web app remains static and independent.
- StudioCMS runtime exists only in `apps/cms`.

Rollback:

- Move CMS files back to root config and restore single-app Astro config.

### Phase 4: Tooling And Test Workspace Alignment

Objective:

- Make lint, typecheck, unit tests, E2E, hooks, and CI workspace-aware.

Files to update:

- root `eslint.config.js`
- root `vitest.config.ts` or per-app Vitest configs
- root `playwright.config.ts`
- `.github/workflows/playwright.yml`
- `lefthook.yml`
- `components.json` if it stays root or moved to `apps/web`

Tasks:

1. Configure ESLint parser projects for app/package tsconfigs.
2. Configure Vitest includes for `apps/*/src/**/*.test.{ts,tsx}` and `packages/*/src/**/*.test.{ts,tsx}`.
3. Update Playwright webServer command to `pnpm --filter @danhthanh/web dev -- --host 127.0.0.1 --port 4321`.
4. Decide whether CMS E2E needs a separate Playwright project/server.
5. Update CI to build `apps/web` and `apps/cms` separately.
6. Update Lefthook to use Turbo or workspace commands.

Verification:

- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

Exit criteria:

- Root commands work through workspaces.
- CI does not rely on old root app paths.

### Phase 5: Shared Pure Packages

Objective:

- Extract only stable pure types/utilities.

Files to add:

- `packages/types/src/posts.ts`
- `packages/utils/src/date.ts`
- `packages/utils/src/routes.ts`

Refactors:

- Introduce `PublicPostDto` and API response DTOs in `packages/types`.
- Move `formatDate` only if it has no Astro/runtime coupling.
- Move route builders only after changing signatures to accept primitive values:
  - `getPostPath(slug: string): string`
  - `getTagPath(tag: string): string`
  - `getCategoryPath(category: string): string`
- Keep `CollectionEntry<'posts'>` helpers inside `apps/web`.

Verification:

- `pnpm --filter @danhthanh/types build`
- `pnpm --filter @danhthanh/utils build`
- `pnpm build`
- `pnpm typecheck`

Exit criteria:

- Shared packages have no Astro, StudioCMS, DB, Node filesystem, or browser dependencies.

### Phase 6: CMS HTTP API And Preview

Objective:

- Add CMS-owned API endpoints for published post metadata, draft post metadata/content, and preview flow.

Files to add:

- `apps/cms/src/pages/api/posts/index.ts`
- `apps/cms/src/pages/api/posts/draft.ts`
- `apps/cms/src/pages/api/posts/preview.ts` if separate from draft endpoint
- `apps/cms/src/lib/api/posts.ts`
- `apps/cms/src/lib/preview.ts`

Tasks:

1. Implement `GET /api/posts` with public cache headers.
2. Implement draft endpoint with auth and `private, no-store`.
3. Implement signed preview token validation.
4. Add tests for public filtering, draft rejection, invalid token, valid token, cache headers.
5. Document env vars:
   - `CMS_PREVIEW_SECRET`
   - `PUBLIC_CMS_API_URL` for web if needed

Verification:

- CMS unit/API tests.
- `pnpm --filter @danhthanh/cms build`
- Manual API smoke tests against dev server.

Exit criteria:

- Public API never leaks drafts.
- Preview requires auth/token.
- Public endpoint has required cache header.

### Phase 7: Deploy Hooks And Provider Plans

Objective:

- Add deploy documentation/config for Cloudflare, Vercel, and VPS without forcing a single provider.

Cloudflare:

- Recommended for `apps/web`: Cloudflare Pages static build.
- Build command: `pnpm --filter @danhthanh/web build`.
- Output directory: `apps/web/dist`.
- CMS SSR on Cloudflare requires adapter compatibility review; StudioCMS/libSQL/runtime dependencies may make Node/VPS or Vercel easier than Workers.

Vercel:

- `apps/web`: static Astro output with project root `apps/web` or monorepo root plus filtered build.
- `apps/cms`: Vercel SSR requires switching CMS adapter from Node standalone to Vercel adapter in provider-specific config.
- Use separate Vercel projects for web and CMS.

VPS / Node standalone:

- `apps/web`: build static assets and serve with Nginx/Caddy.
- `apps/cms`: build with Node standalone and run `node dist/server/entry.mjs` under systemd/PM2/Docker.
- This is the lowest-risk CMS target because current app already uses `@astrojs/node` standalone.

Deploy hook:

- CMS publish event should call a web deploy hook URL.
- Store hook secret in CMS env, never in web bundle.
- If StudioCMS does not expose a publish hook directly, add a protected CMS API route such as `POST /api/revalidate-web` that calls the provider deploy hook after CMS-side authorization.

Verification:

- Provider-specific build command succeeds locally.
- Deploy hook endpoint rejects unauthenticated requests.
- Publishing flow triggers a web rebuild in staging before production rollout.

### Phase 8: Final Integration Review

Objective:

- Verify architecture boundaries and remove migration leftovers.

Checks:

- No `studiocms` import under `apps/web`.
- No `@astrojs/node` dependency under `apps/web`.
- No database clients under `apps/web` or `packages/*`.
- No Astro or StudioCMS imports under `packages/*`.
- `apps/web` build output is static.
- `apps/cms` build output is SSR.
- Public URLs remain stable.
- E2E tests pass against web.
- CMS smoke test passes against `/studiocms` and `/api/posts`.

Verification:

- `pnpm install`
- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

Exit criteria:

- Monorepo migration is complete and independently deployable.

## 7. Deployment Plan

Use separate deployments for `apps/web` and `apps/cms`.

`apps/web`:

- Static output only.
- Cloudflare Pages, Vercel static, or VPS static hosting are all valid.
- Build command: `pnpm --filter @danhthanh/web build`.
- Output directory: `apps/web/dist`.
- Environment:
  - `SITE_URL`
  - Optional `PUBLIC_CMS_API_URL` only if public web fetches CMS metadata at build time.

`apps/cms`:

- SSR output.
- VPS/Node standalone is the safest first production target.
- Vercel requires adapter switch/testing.
- Cloudflare requires adapter/runtime compatibility review for StudioCMS dependencies.
- Environment:
  - `CMS_LIBSQL_URL`
  - `CMS_ENCRYPTION_KEY`
  - `CMS_PREVIEW_SECRET`
  - `WEB_DEPLOY_HOOK_URL`
  - Optional provider-specific tokens.

Provider recommendation order:

1. First migrate with `apps/web` static and `apps/cms` VPS/Node standalone to minimize adapter churn.
2. Add Vercel CMS deployment after the monorepo split is stable.
3. Evaluate Cloudflare CMS SSR last because StudioCMS + Node-ish dependencies may require compatibility work.

## 8. Verification Gates

Every phase must pass its own gate before continuing.

Baseline before migration:

- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

After workspace scaffolding:

- Root commands still pass.
- Turbo commands can run no-op or current package tasks.

After web split:

- `pnpm --filter @danhthanh/web build`
- Confirm static output.
- Confirm no StudioCMS dependencies in `apps/web/package.json`.

After CMS split:

- `pnpm --filter @danhthanh/cms build`
- `pnpm --filter @danhthanh/cms migrate` with local libSQL env.
- `/studiocms` smoke test.

After shared packages:

- `pnpm --filter './packages/*' build`
- `pnpm typecheck`
- Boundary grep checks.

After API/preview:

- API tests for auth, filtering, cache headers.
- Manual smoke requests.

Final:

- `pnpm check`
- `pnpm build`
- `pnpm test:e2e`
- Boundary grep:
  - no `studiocms` in `apps/web`
  - no `@astrojs/node` in `apps/web`
  - no `astro:` or `studiocms` in `packages/*`

## 9. Risks And Questions

Risks:

- StudioCMS adapter compatibility may differ across Cloudflare, Vercel, and VPS.
- Moving Astro content collections can break generated type paths if `.astro` metadata is stale.
- `components.json` and shadcn aliases need careful relocation to avoid broken UI imports.
- Existing E2E tests assume a single dev server on port `4321`.
- Search and OG scripts currently use root-relative paths and will fail after moves unless updated.
- Preview mode can leak draft metadata if implemented as a simple query flag.
- `src/styles/pages/[...slug].astro` may currently expose CMS-rendered pages at root paths; moving or prefixing it may be a behavior change.
- Root `eslint.config.js` with typed linting can become brittle across multiple tsconfigs.

Open questions before implementation:

1. Should CMS-rendered StudioCMS pages remain available at root catch-all paths, or should they move under a CMS-specific prefix to avoid public web collisions?
2. Which deployment target should be implemented first for `apps/cms`: VPS/Node standalone, Vercel, or Cloudflare?
3. Should public blog content remain file-based in `apps/web` initially, or should `apps/web` fetch published posts from `apps/cms` during build?
4. Should `tender-series/` remain ignored, or should it eventually become another workspace app?

Recommended answers:

1. Move CMS-rendered catch-all pages behind a CMS-specific prefix unless there is a shipped URL requirement.
2. Use VPS/Node standalone first for CMS because the current app already uses `@astrojs/node` standalone.
3. Keep public blog content file-based in `apps/web` for the first migration; add CMS build-time fetch later if needed.
4. Keep `tender-series/` out of the workspace for this migration.
