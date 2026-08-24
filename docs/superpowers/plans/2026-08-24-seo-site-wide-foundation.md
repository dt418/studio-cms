# Site-wide SEO Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver one visibility-aware, absolute-URL SEO foundation across localized HTML pages and all public discovery routes.

**Architecture:** `apps/web/astro.config.mjs` validates the public origin before a production build. Shared `site.ts`, `seo.ts`, content queries, and sitemap manifest build normalized SEO data; `BaseLayout` renders the head once while routes choose only their content-specific schema.

**Tech Stack:** Astro 7, TypeScript strict mode, Zod/Astro Content Collections, Vitest, Playwright, Pagefind, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-24-seo-site-wide-foundation-design.md`

**Status:** Implemented and verified; Issue #14 scope complete

## Global Constraints

- Preserve existing dirty worktree changes, especially partial `src/lib/seo.ts`, `src/lib/sitemap-manifest.ts`, and tests. Reconcile them; never reset or overwrite unrelated edits.
- `astro.config.mjs` selects trimmed `SITE_URL`, then `CF_PAGES_URL`; `astro build` fails without a valid HTTP(S) root origin, while dev/Vitest explicitly use `http://localhost:4321` only when both are absent.
- Every generated SEO URL is absolute and origin-safe. Frontmatter description is trimmed/non-empty when supplied; canonical is trimmed HTTP(S), credential-free, and fragment-free.
- Drafts never render. Noindex posts render once with `noindex, nofollow`, but are absent from lists, taxonomies, RSS, API, Pagefind, alternates, and sitemap.
- A post with an off-origin canonical is crawlable but has no hreflang and no sitemap record; never insert its off-origin canonical into this sitemap.
- Keep the existing title separator, i18n copy ownership, alias imports, strict TypeScript, and Prettier format. Do not edit generated `dist` or Pagefind output.
- Root redirect and both 404 pages are noncanonical: no canonical, hreflang, Open Graph/Twitter, or JSON-LD.
- Run only focused tests and the explicit build/artifact checks in this plan.

---

## File map

| Path                                                                                                                    | Responsibility                                                                           |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/web/astro.config.mjs`, `src/lib/site.ts`, `src/lib/site.test.ts`                                                  | Command-aware public-origin resolution, normalization, and tests.                        |
| `src/content.config.ts`, `src/test-helpers.ts`                                                                          | Frontmatter and test-fixture SEO identity validation.                                    |
| `src/lib/seo.ts`, `src/lib/seo.test.ts`                                                                                 | Normalized SEO document, image, canonical/description, alternates, schema, safe JSON-LD. |
| `src/lib/{post-visibility,cms}.ts` and tests                                                                            | Explicit routability/public policy, translation-key and locale-taxonomy queries.         |
| `src/layouts/BaseLayout.astro` and localized HTML routes                                                                | Render normalized SEO and route-specific schema.                                         |
| `components/BlogFilter.astro`, `lib/{blog-filter,filter}.ts`                                                            | Resolved descriptions in client filter data.                                             |
| `lib/sitemap-manifest.ts`, `pages/sitemap.xml.ts`                                                                       | Canonical-only deterministic XML sitemap.                                                |
| `pages/{robots.txt,rss.xml,auth.md}.ts`, `pages/api/posts.json.ts`, `pages/[lang]/index.md.ts`, `lib/agent-metadata.ts` | Consistent machine discovery and public summary policy.                                  |
| `playwright.seo.config.ts`, `e2e/seo-foundation.spec.ts`                                                                | Chromium served-dist artifact verification using `seo.test`.                             |

## Task 1: Make origin and frontmatter validation deterministic

**Files:**

- Modify: `apps/web/astro.config.mjs`
- Modify: `apps/web/src/lib/site.ts`
- Modify: `apps/web/src/content.config.ts`
- Create: `apps/web/src/lib/site.test.ts`
- Modify: `apps/web/src/test-helpers.ts`

**Interfaces:**

- Produces `resolveConfiguredSiteUrl(command: 'dev' | 'build', env?: NodeJS.ProcessEnv): string` from `astro.config.mjs`.
- Produces `normalizeSiteOrigin(value: string | URL): string` and `toAbsoluteUrl(path: string, siteOrigin: string): string`.
- Produces trimmed `description`, `canonicalUrl`, and `translationKey` collection fields.

- [x] **Step 1: Write the failing origin and schema tests**

Add `src/lib/site.test.ts` cases for missing build configuration, dev localhost fallback, trailing-slash normalization, and unsafe origin rejection:

```ts
expect(() => resolveConfiguredSiteUrl('build', {})).toThrow(
  'SITE_URL or CF_PAGES_URL is required for astro build'
)
expect(resolveConfiguredSiteUrl('dev', {})).toBe('http://localhost:4321')
expect(resolveConfiguredSiteUrl('build', { SITE_URL: 'https://seo.test/' })).toBe(
  'https://seo.test'
)
expect(() => resolveConfiguredSiteUrl('build', { SITE_URL: 'https://seo.test/path' })).toThrow()
```

Add collection tests for whitespace-only description, credential/fragment canonical URLs, and trimmed valid values.

- [x] **Step 2: Run the new test before implementation**

Run: `pnpm --filter web test -- src/lib/site.test.ts`  
Expected: FAIL because the config does not export command-aware resolution and build mode currently permits implicit localhost.

- [x] **Step 3: Implement config ownership and exact schema rules**

Export `resolveConfiguredSiteUrl` from `astro.config.mjs` and call it in a static `defineConfig({...})` object after deriving the command from the Astro CLI invocation. It chooses non-empty trimmed `SITE_URL`, then `CF_PAGES_URL`; only dev gets localhost. Build error text must match Step 1. The config merges the web app dotenv values with `process.env`, and expands the Tailwind Vite plugin array so Astro receives each plugin entry directly.

Set collection fields to:

```ts
description: z.string().trim().min(1).optional()
canonicalUrl: z.string().trim().url().refine(isHttpWithoutCredentialsOrFragment).optional()
translationKey: z.string()
  .trim()
  .min(1)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/)
  .optional()
```

Keep one shared origin validator in `site.ts`; no page/layout may use request origin as a fallback.

- [x] **Step 4: Verify focused behavior**

Run: `pnpm --filter web test -- src/lib/site.test.ts src/lib/seo.test.ts`  
Expected: PASS.

Run in PowerShell: `Remove-Item Env:SITE_URL,Env:CF_PAGES_URL -ErrorAction SilentlyContinue; pnpm --filter web astro build`  
Expected: non-zero with the exact missing-origin error.

- [x] **Step 5: Commit**

```bash
git add apps/web/astro.config.mjs apps/web/src/lib/site.ts apps/web/src/lib/site.test.ts apps/web/src/content.config.ts apps/web/src/test-helpers.ts
git commit -m "feat: validate the public SEO origin"
```

## Task 2: Finish the SEO document, image, and schema contracts

**Files:**

- Modify: `apps/web/src/lib/seo.ts`
- Modify: `apps/web/src/lib/seo.test.ts`

**Interfaces:**

- Produces discriminated `SeoPageInput`: `indexable`, `noindex-content`, and `noncanonical`.
- Produces `SeoImage { url, type, width, height }`, `createSeoDocument`, `resolvePostDescription`, `resolvePostCanonical`, `isExternalCanonical`, `getPostAlternateLinks`, and safe `serializeJsonLd`.
- Produces website, person, profile page, collection, article, and absolute breadcrumb schema builders.

- [x] **Step 1: Write failing SEO tests**

Extend `seo.test.ts` to assert a noncanonical document has no canonical/openGraph/schema, a noindex-content document retains canonical but no alternates, and an external-canonical post has no alternates and no sitemap eligibility.

Assert fallback image is absolute `/og-image.png`, 1200×630 PNG; a root-relative WebP is absolute; credential, fragment, and non-HTTP image inputs throw. Assert Website uses origin-based website/person IDs, ProfilePage points to that person, and every breadcrumb including final item is absolute.

- [x] **Step 2: Run the focused test**

Run: `pnpm --filter web test -- src/lib/seo.test.ts`  
Expected: FAIL until image dimensions, discriminated inputs, and complete schema fields exist.

- [x] **Step 3: Implement the normalized model**

Replace the loose boolean input with:

```ts
type SeoPageInput = IndexableSeoPageInput | NoindexContentSeoPageInput | NonCanonicalSeoPageInput
```

Only indexable input may create alternates. Noncanonical input returns robots plus empty alternates/schema and no canonical/social object. Add `resolveSeoImage`; custom images require supplied verified width, height, and PNG/WebP type, while fallback is fixed 1200×630 PNG.

Build Website with a website ID ending `/#website`, Person ID ending `/#person`, website URL ending `/vi/`, both languages, social links, and ProfilePage `mainEntity`/ `isPartOf` references. Keep one JSON array escaped for script-safe output.

- [x] **Step 4: Run focused verification**

Run: `pnpm --filter web test -- src/lib/seo.test.ts src/lib/site.test.ts`  
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add apps/web/src/lib/seo.ts apps/web/src/lib/seo.test.ts
git commit -m "feat: centralize SEO document generation"
```

## Task 3: Unify post visibility, translations, and locale taxonomy routes

**Files:**

- Modify: `apps/web/src/lib/post-visibility.ts`
- Modify: `apps/web/src/lib/content-queries.ts`
- Create: `apps/web/src/lib/post-visibility.test.ts`
- Modify: `apps/web/src/pages/[lang]/blog/[slug].astro`
- Modify: `apps/web/src/pages/[lang]/categories/[category].astro`
- Modify: `apps/web/src/pages/[lang]/tags/[tag].astro`

**Interfaces:**

- Produces `isPublicPost(post): boolean`, `isRoutablePost(post): boolean`, and `validateTranslationKeys(posts): void`.
- `isRoutablePost` is exactly non-draft; only a route query may include noindex.
- `getAllTags(locale)` and `getAllCategories(locale)` return sorted terms from public posts in that locale.

- [x] **Step 1: Write failing visibility fixtures**

Create fixtures for Vietnamese-only public term, English-only public term, noindex-only term, draft-only term, and duplicate key in English. Assert:

```ts
expect(isRoutablePost(makePost({ noindex: true }))).toBe(true)
expect(isRoutablePost(makePost({ draft: true }))).toBe(false)
expect(() => validateTranslationKeys(duplicatePosts)).toThrow(
  'Duplicate translationKey "hello" for locale "en"'
)
```

Assert localized tag/category queries contain only the matching public locale terms.

- [x] **Step 2: Run the focused tests**

Run: `pnpm --filter web test -- src/lib/post-visibility.test.ts`
Expected: FAIL for named routability/duplicate validation and locale-static-path behavior.

- [x] **Step 3: Implement predicates and route generation**

Keep `isPublicPost` as all discovery policy. Add `isRoutablePost`, call `validateTranslationKeys` at shared collection/query entry, and make post `getStaticPaths` fetch non-draft posts with `includeNoindex: true`. Category/tag `getStaticPaths` loops must call `getAllCategories(locale)` and `getAllTags(locale)`, never global lists.

```ts
export function isRoutablePost(post: Post): boolean {
  return !post.data.draft
}

export function validateTranslationKeys(posts: Post[]): void {
  const seen = new Set<string>()
  for (const post of posts) {
    const key = post.data.translationKey
    if (!key) continue
    const identity = `${getPostLocale(post)}:${key}`
    if (seen.has(identity))
      throw new Error(`Duplicate translationKey "${key}" for locale "${getPostLocale(post)}"`)
    seen.add(identity)
  }
}
```

- [x] **Step 4: Verify focused behavior**

Run: `pnpm --filter web test -- src/lib/post-visibility.test.ts src/lib/routes.test.ts`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add apps/web/src/lib/post-visibility.ts apps/web/src/lib/post-visibility.test.ts apps/web/src/lib/content-queries.ts apps/web/src/pages/[lang]/blog/[slug].astro apps/web/src/pages/[lang]/categories/[category].astro apps/web/src/pages/[lang]/tags/[tag].astro
git commit -m "fix: align post visibility with locale routes"
```

## Task 4: Render normalized metadata on all HTML routes

**Files:**

- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/pages/index.astro`, `404.astro`, `[lang]/404.astro`
- Modify: `apps/web/src/pages/[lang]/index.astro`, `about.astro`, `blog/index.astro`, `blog/[slug].astro`, `categories/[category].astro`, `tags/[tag].astro`

**Interfaces:**

- `BaseLayout` consumes exactly `seo: SeoDocument` plus layout chrome props.
- Localized routes consume `createSeoDocument` and schema builders; no route builds raw canonical/head tags.
- Each route produces the schema and alternate behavior stated in the approved spec.

- [x] **Step 1: Add render assertions to the SEO E2E file**

Create `e2e/seo-foundation.spec.ts` with these initial checks:

```ts
await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute('href', /^http/)
```

Add no-canonical/no-OG/no-schema assertions for root redirect and both 404 pages.

- [x] **Step 2: Record baseline failure**

Run: `pnpm exec playwright test --config=playwright.seo.config.ts e2e/seo-foundation.spec.ts --project=seo-chromium`  
Expected: FAIL until Task 6 supplies the served-dist configuration.

- [x] **Step 3: Migrate layout and route inputs**

Make BaseLayout render title, description, robots, canonical, hreflang, full OG/Twitter family, and one serialized JSON-LD script solely from `seo`. For route conversion: home emits Website+Person; about ProfilePage+breadcrumb; blog/category/tag CollectionPage+breadcrumb; post Article+breadcrumb and conditional FAQ. Every final crumb has absolute canonical URL.

Use noncanonical SEO for redirect/404; use noindex-content SEO for noindex posts. Remove remaining page-level `canonicalUrl`, `alternateUrls`, `jsonLd`, and head prop assembly.

```astro
<BaseLayout seo={seo} lang={lang} currentPath={currentPath}>
  <slot />
</BaseLayout>
```

In the post route, construct `seo` from `resolvePostDescription(post)`, `resolvePostCanonical(post, siteOrigin)`, `getPostAlternateLinks(post, localizedPosts, siteOrigin)`, and `buildArticleSchema(...)`; do not pass raw post description/canonical props to the layout.

- [x] **Step 4: Verify type and unit integrity**

Run: `pnpm --filter web test -- src/lib/seo.test.ts`
Expected: PASS.

Run: `pnpm --filter web typecheck`  
Expected: PASS with no obsolete BaseLayout prop call.

- [x] **Step 5: Commit**

```bash
git add apps/web/src/layouts/BaseLayout.astro apps/web/src/pages/index.astro apps/web/src/pages/404.astro apps/web/src/pages/[lang]/404.astro apps/web/src/pages/[lang]/index.astro apps/web/src/pages/[lang]/about.astro apps/web/src/pages/[lang]/blog/index.astro apps/web/src/pages/[lang]/blog/[slug].astro apps/web/src/pages/[lang]/categories/[category].astro apps/web/src/pages/[lang]/tags/[tag].astro e2e/seo-foundation.spec.ts
git commit -m "feat: render shared SEO metadata for page routes"
```

## Task 5: Propagate resolved descriptions to filters, Pagefind, sitemap, and machine routes

**Files:**

- Modify: `apps/web/src/components/BlogFilter.astro`, `apps/web/src/lib/blog-filter.ts`, `apps/web/src/lib/filter.ts`, `apps/web/src/lib/filter.test.ts`
- Modify: `apps/web/src/lib/sitemap-manifest.ts`, `apps/web/src/lib/sitemap-manifest.test.ts`, `apps/web/src/pages/sitemap.xml.ts`
- Modify: `apps/web/src/pages/robots.txt.ts`, `rss.xml.ts`, `api/posts.json.ts`, `auth.md.ts`, `pages/[lang]/index.md.ts`
- Modify: `apps/web/src/lib/agent-metadata.ts`, `apps/web/src/lib/agent-metadata.test.ts`
- Modify: `apps/web/src/pages/[lang]/blog/[slug].astro`

**Interfaces:**

- Blog filter payload has required `description: string` from `resolvePostDescription`.
- Public post article alone has `data-pagefind-body`.
- `buildSitemapManifest(posts, origin)` returns sorted unique locally canonical records; `serializeSitemap(records)` XML-escapes all dynamic values.
- API has local `url`, resolved description, and optional `canonicalUrl` only when it differs; RSS link always remains local.

- [x] **Step 1: Add failing focused tests**

Add a description-only query test to `filter.test.ts`, an E2E assertion that noindex article has no `data-pagefind-body`, and manifest tests that off-origin-canonical local/external URLs are both absent while an ampersand URL becomes `&amp;`.

Add route tests asserting agent catalog uses only `/sitemap.xml`, `auth.md.ts:23` no longer has `/search`, localized Markdown has no `/search` or `/sitemap-index.xml`, and API/RSS exclude draft/noindex but use custom description.

- [x] **Step 2: Run failing focused tests**

Run: `pnpm --filter web test -- src/lib/filter.test.ts src/lib/sitemap-manifest.test.ts src/lib/agent-metadata.test.ts`
Expected: FAIL until shared resolver and stale-route cleanup are complete.

- [x] **Step 3: Implement the common-consumer policy**

Serialize descriptions in BlogFilter through `resolvePostDescription`; retain `filter.ts` matching the typed field. Add `data-pagefind-body` only when `isPublicPost(post)`.

Filter sitemap posts with public visibility and no external canonical; retain home/about/non-empty archive/local taxonomy records only. Make `sitemap.xml.ts` use manifest and serializer with `application/xml; charset=utf-8`.

Change agent catalog and Markdown to `/sitemap.xml`; delete the exact `/search` bullet in `auth.md.ts:23`. API emits local route and optional resolved canonical; RSS keeps local item link, with no canonical override field.

```ts
const description = resolvePostDescription(post)
const localUrl = toAbsoluteUrl(getPostPath(post), origin)
const canonicalUrl = resolvePostCanonical(post, origin)
return {
  url: localUrl,
  ...(canonicalUrl !== localUrl && { canonicalUrl }),
  description,
}
```

- [x] **Step 4: Verify focused consumers**

Run: `pnpm --filter web test -- src/lib/filter.test.ts src/lib/sitemap-manifest.test.ts src/lib/agent-metadata.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add apps/web/src/components/BlogFilter.astro apps/web/src/lib/blog-filter.ts apps/web/src/lib/filter.ts apps/web/src/lib/filter.test.ts apps/web/src/lib/sitemap-manifest.ts apps/web/src/lib/sitemap-manifest.test.ts apps/web/src/pages/sitemap.xml.ts apps/web/src/pages/robots.txt.ts apps/web/src/pages/rss.xml.ts apps/web/src/pages/api/posts.json.ts apps/web/src/pages/auth.md.ts apps/web/src/pages/[lang]/index.md.ts apps/web/src/lib/agent-metadata.ts apps/web/src/lib/agent-metadata.test.ts apps/web/src/pages/[lang]/blog/[slug].astro
git commit -m "fix: align SEO discovery surfaces"
```

## Task 6: Run reproducible served-dist SEO verification

**Files:**

- Create: `playwright.seo.config.ts`
- Modify: `e2e/seo-foundation.spec.ts`
- Create: `scripts/run-seo-preview.mjs`

**Interfaces:**

- Produces `seo-chromium` Playwright project with base URL `http://seo.test:4321`.
- Produces a build/preview process with `SITE_URL=http://seo.test:4321`, static output served on `127.0.0.1:4321`, and Chromium host resolver `MAP seo.test 127.0.0.1`.

- [x] **Step 1: Complete served-artifact assertions**

In the E2E file parse JSON-LD and sitemap. Assert sitemap locations are unique and begin with the configured origin, and none contain redirect/error/noindex/draft/external-canonical/API/Markdown/Pagefind/well-known surfaces. Fetch robots, sitemap, RSS, API, auth, agent catalog, and Markdown routes; assert content types and that all discovery links agree.

- [x] **Step 2: Run before config exists**

Run: `pnpm exec playwright test --config=playwright.seo.config.ts e2e/seo-foundation.spec.ts --project=seo-chromium`  
Expected: FAIL because the dedicated configuration does not exist.

- [x] **Step 3: Implement isolated static preview configuration**

Create `playwright.seo.config.ts` without changing the existing multi-browser config. It starts a Node wrapper that sets `SITE_URL`, invokes `pnpm web:build`, then previews the generated web dist at `127.0.0.1:4321`. The Chromium project sets `baseURL` to `http://seo.test:4321` and `launchOptions.args` to `['--host-resolver-rules=MAP seo.test 127.0.0.1']`.

Do not use shell-only environment assignment; the wrapper sets `process.env.SITE_URL` before spawning commands so Windows and CI use the same behavior.

```js
import { spawn, spawnSync } from 'node:child_process'

const environment = { ...process.env, SITE_URL: 'http://seo.test:4321' }
const build = spawnSync('pnpm', ['web:build'], { env: environment, stdio: 'inherit', shell: true })
if (build.status !== 0) process.exit(build.status ?? 1)
const preview = spawn(
  'pnpm',
  ['--filter', 'web', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'],
  { env: environment, stdio: 'inherit', shell: true }
)
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => preview.kill(signal))
```

- [x] **Step 4: Run final focused verification**

Run: `pnpm --filter web test -- src/lib/site.test.ts src/lib/seo.test.ts src/lib/post-visibility.test.ts src/lib/filter.test.ts src/lib/sitemap-manifest.test.ts src/lib/agent-metadata.test.ts`
Expected: PASS.

Run: `pnpm exec playwright test --config=playwright.seo.config.ts e2e/seo-foundation.spec.ts --project=seo-chromium`  
Expected: PASS against served `apps/web/dist`.

Run: `$env:SITE_URL='http://seo.test:4321'; pnpm web:build`  
Expected: PASS; inspect generated `robots.txt`, `sitemap.xml`, and representative localized HTML, not source files.

- [x] **Step 5: Commit**

```bash
git add playwright.seo.config.ts e2e/seo-foundation.spec.ts scripts/run-seo-preview.mjs
git commit -m "test: verify built SEO foundations"
```

## Plan self-review

### Spec coverage

| Requirement                                                  | Tasks   |
| ------------------------------------------------------------ | ------- |
| Config-owned origin validation and test/build behavior       | 1, 6    |
| Canonical/description schema and common SEO model            | 1, 2, 4 |
| Hreflang, absolute breadcrumbs, Website/Person/About schemas | 2, 3, 4 |
| Draft/noindex, translations, and locale taxonomy             | 3, 5    |
| OG/Twitter/image fallback and JSON-LD safety                 | 2, 4    |
| BlogFilter/Pagefind description/visibility                   | 5       |
| Canonical-only XML sitemap and all discovery surfaces        | 5       |
| Served-dist artifact verification                            | 4, 6    |

No approved-spec requirement is unmapped.

### Placeholder scan

No TODO, TBD, or “implement later” marker is present. Each task gives exact files, named interfaces, a failing test command, implementation action, passing verification command, and commit command.

### Type consistency

The plan defines SEO inputs, resolver names, visibility predicates, sitemap records, and consumer contracts before their dependent tasks. The E2E base URL, build origin, static preview port, and host resolver all use `http://seo.test:4321`.
