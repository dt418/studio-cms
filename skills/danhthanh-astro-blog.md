# Skill: danhthanh-astro-blog

Use this skill when changing blog routes, RSS, sitemap behavior, post visibility, StudioCMS integration, or `apps/web/src/content/posts` rendering in `danhthanh.dev`.

## Project Facts

- This is a pnpm + Turborepo monorepo with public web code in `apps/web` and CMS/admin code in `apps/cms`.
- `apps/web` owns the public blog, RSS, search, sitemap, and generated OG/search artifacts.
- `apps/cms` owns StudioCMS routes under `/studiocms` and uses `@astrojs/node` standalone output.
- StudioCMS blog injection is intentionally disabled so custom public blog routes stay authoritative.
- Public posts come from `apps/web/src/content/posts/**/*.{md,mdx}` through `apps/web/src/content.config.ts` and `apps/web/src/lib/cms.ts`.
- Prefer `@/*` imports within each app over deep relative imports.

## Routing Rules

- Use `apps/web/src/lib/routes.ts` for public blog, tag, and category URLs.
- Keep dynamic path segments encoded with `encodeURIComponent`.
- Do not create data-only post route helpers unless the data type has a guaranteed non-empty slug or id fallback.
- Use full post entries for previous/next navigation so `getPostPath(post)` always has access to `post.id`.
- Public RSS is `/rss.xml`, not `/blog/rss.xml`.

## Visibility Rules

- Use `apps/web/src/lib/post-visibility.ts` for public filtering.
- Draft posts are excluded unless `includeDrafts` is explicitly requested.
- `noindex` posts are excluded from public listings unless `includeNoindex` is explicitly requested.
- If adding a public collection, feed, sitemap, or search surface, confirm it uses the same visibility semantics.

## StudioCMS Rules

- Preserve the separation between StudioCMS admin/plugin routes and custom public `/blog` pages.
- Do not enable StudioCMS route injection for the public blog unless the whole route strategy is being redesigned.
- Preserve `studiocms-layout-overrides` in `apps/cms/astro.config.mjs`; it exists to patch StudioCMS dashboard/auth CSS before downstream transforms.
- Do not patch `node_modules` directly for StudioCMS layout fixes.

## Content Schema And Inline Script Rules

- Use `z.url()` for URL fields in `apps/web/src/content.config.ts`.
- Do not use deprecated `z.string().url()`.
- Add `is:inline` to Astro `<script>` tags that use `set:html` for JSON or JSON-LD payloads.
- Treat missing `is:inline` hints from `astro check` as actionable drift, not acceptable noise.

## Tests To Update

- Update `apps/web/src/lib/routes.test.ts` when route helper behavior changes.
- Update `apps/web/src/lib/cms.test.ts` when post querying or visibility behavior changes.
- Add focused tests before broad verification when changing routing or visibility.

## Verification

- Focused route/visibility check: `pnpm test -- apps/web/src/lib/routes.test.ts apps/web/src/lib/cms.test.ts`
- Pattern guard: `pnpm lint:patterns`
- Full project check: `pnpm check`
- Run `pnpm build` when changing RSS, sitemap, search index generation, generated OG image behavior, or Astro config.

## Documentation

- Update `README.md` when public route paths change.
- Update `docs/reference/architecture.md` when routing, visibility, StudioCMS integration, or search/RSS behavior changes.
- Update `CHANGELOG.md` for user-visible route, feed, visibility, SEO, or search changes.
