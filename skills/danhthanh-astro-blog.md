# Skill: danhthanh-astro-blog

Use this skill when changing blog routes, RSS, sitemap behavior, post visibility, StudioCMS integration, or `src/content/posts` rendering in `danhthanh.dev`.

## Project Facts

- This is an Astro 5 SSR app using `@astrojs/node` standalone output.
- StudioCMS is enabled for `/studiocms`, but public blog routes are custom.
- `studiocms.config.mjs` intentionally sets `injectRoutes: false`, `enableRSS: false`, and moves plugin content away from `/blog`.
- Public posts come from `src/content/posts/**/*.{md,mdx}` through `src/content.config.ts` and `src/lib/cms.ts`.
- Prefer `@/*` imports over deep relative imports.

## Routing Rules

- Use `src/lib/routes.ts` for public blog, tag, and category URLs.
- Keep dynamic path segments encoded with `encodeURIComponent`.
- Do not create data-only post route helpers unless the data type has a guaranteed non-empty slug or id fallback.
- Use full post entries for previous/next navigation so `getPostPath(post)` always has access to `post.id`.
- Public RSS is `/rss.xml`, not `/blog/rss.xml`.

## Visibility Rules

- Use `src/lib/post-visibility.ts` for public filtering.
- Draft posts are excluded unless `includeDrafts` is explicitly requested.
- `noindex` posts are excluded from public listings unless `includeNoindex` is explicitly requested.
- If adding a public collection, feed, sitemap, or search surface, confirm it uses the same visibility semantics.

## StudioCMS Rules

- Preserve the separation between StudioCMS admin/plugin routes and custom public `/blog` pages.
- Do not enable StudioCMS route injection for the public blog unless the whole route strategy is being redesigned.
- Preserve `studiocms-layout-overrides` in `astro.config.mjs`; it exists to patch StudioCMS dashboard/auth CSS before downstream transforms.
- Do not patch `node_modules` directly for StudioCMS layout fixes.

## Tests To Update

- Update `src/lib/routes.test.ts` when route helper behavior changes.
- Update `src/lib/cms.test.ts` when post querying or visibility behavior changes.
- Add focused tests before broad verification when changing routing or visibility.

## Verification

- Focused route/visibility check: `pnpm test -- src/lib/routes.test.ts src/lib/cms.test.ts`
- Full project check: `pnpm check`
- Run `pnpm build` when changing RSS, sitemap, search index generation, generated OG image behavior, or Astro config.

## Documentation

- Update `README.md` when public route paths change.
- Update `docs/reference/architecture.md` when routing, visibility, StudioCMS integration, or search/RSS behavior changes.
- Update `CHANGELOG.md` for user-visible route, feed, visibility, SEO, or search changes.
