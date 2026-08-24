# Site-wide SEO Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver consistent, typed, localized SEO metadata and discovery output for the static Astro blog, with verified public-content visibility and static-build contracts.

**Architecture:** A framework-light `src/lib/seo.ts` owns origin resolution, canonical selection, localized link maps, JSON-LD safety, and sitemap serialization. Route pages construct discriminated `SeoPage` values, `BaseLayout` renders the indexed/non-indexed head contract, and content/endpoint producers share the same public visibility, description, canonical, and route helpers. Verification is layered: Vitest for pure contracts, Playwright against a forced-localhost static preview, and a direct `dist` checker.

**Tech Stack:** Astro 7.2.4 static output, TypeScript 5.9 strict mode, Zod 4, Vitest 4, Playwright 1.59, `@astrojs/rss` 4, pnpm 10.

**Spec:** `docs/superpowers/specs/2026-08-24-site-wide-seo-design.md`

## Global Constraints

- Preserve static Astro output, manual `vi`/`en` i18n routing, and the existing `SITE_URL`, `CF_PAGES_URL`, then `http://localhost:4321` origin precedence.
- Do not add `@astrojs/sitemap`, a second sitemap endpoint, a sitemap index, a CMS, a server adapter, a new locale, or separate locale RSS feeds.
- Keep `apps/web/src/pages/sitemap.xml.ts` as the sole `/sitemap.xml` producer and keep `apps/web/src/pages/index.astro` as the static 200 refresh document for `/vi/`.
- Keep draft and noindex posts out of every public surface: static paths, lists, Pagefind, taxonomy, RSS, API JSON, localized markdown, and sitemap.
- Preserve existing API keys `slug`, `locale`, `title`, `excerpt`, `category`, `tags`, `publishedAt`, and `url`; add `description` without renaming a compatibility field. Preserve existing RSS item fields and its `content:encoded` namespace workaround.
- `canonicalUrl` is optional frontmatter but, when present, must be an absolute `http:` or `https:` URL. Invalid, relative, malformed, and non-HTTP(S) values fail content validation rather than silently falling back.
- Use the `@` alias, strict TypeScript, conditional optional Astro props, no generator meta tag, and the existing `${title} | ${SITE.name}` title convention.
- Do not rely on host-specific response headers for crawlability; static HTML, XML, text, JSON, and built artifacts are the portable contract.
- Keep UI copy in `src/lib/i18n/{en,vi}.ts`; this work must not change editorial content, translations, visual design, or navigation copy.

---

## File-impact map

| Path | Action | Responsibility |
| --- | --- | --- |
| `apps/web/src/lib/seo.ts` | Create | Typed `SeoPage` contracts; origin, canonical, description, locale-link, JSON-LD, XML, sitemap, and pure API/RSS/markdown output helpers. |
| `apps/web/src/lib/seo.test.ts` | Create | Pure SEO contract, serialization, canonical, and sitemap unit tests. |
| `apps/web/src/lib/routes.ts` and `apps/web/src/lib/routes.test.ts` | Modify | Add `getAboutPath()` and retain encoded localized path behavior. |
| `apps/web/src/content.config.ts` and `apps/web/src/content.config.test.ts` | Modify/Create | Enforce optional `canonicalUrl` as an absolute HTTP(S) URL. |
| `apps/web/src/lib/cms.ts`, `apps/web/src/lib/post-visibility.ts`, `apps/web/src/lib/cms.test.ts` | Modify | Expose public post/counterpart data consistently. |
| `apps/web/src/lib/content-graph.ts`, `apps/web/src/lib/content-graph.test.ts` | Modify | Reuse `isPublicPost()` while preserving BlogFilter graph semantics. |
| `apps/web/src/layouts/BaseLayout.astro` | Modify | Render the discriminated SEO head contract required by every BaseLayout caller. |
| `apps/web/src/components/LanguageSwitcher.astro` | Modify | Render supplied `switcherLinks` only. |
| `apps/web/src/pages/[lang]/index.astro`, `apps/web/src/pages/[lang]/blog/index.astro`, `apps/web/src/pages/[lang]/about.astro` | Modify | Build localized website schemas and local SEO page values. |
| `apps/web/src/pages/[lang]/blog/[slug].astro`, `apps/web/src/pages/[lang]/categories/[category].astro`, `apps/web/src/pages/[lang]/tags/[tag].astro` | Modify | Receive compile-preserving `SeoPage` props with Task 4, then build article/taxonomy SEO, public static paths, and counterpart-aware links in Task 5. |
| `apps/web/src/pages/index.astro`, `apps/web/src/pages/404.astro`, `apps/web/src/pages/[lang]/404.astro` | Modify | Keep root standalone; Task 4 completes the compile-preserving non-indexable 404 contracts, and Task 6 adds the root document contract while asserting the 404 result. |
| `apps/web/src/pages/sitemap.xml.ts`, `apps/web/src/pages/robots.txt.ts` | Modify | Produce custom public sitemap XML and its canonical robots directive. |
| `apps/web/src/lib/agent-metadata.ts`, `apps/web/src/lib/agent-metadata.test.ts`, `apps/web/agent-skills/read-blog/SKILL.md` | Modify | Point every agent discovery surface at `/sitemap.xml`. |
| `apps/web/src/pages/rss.xml.ts`, `apps/web/src/pages/api/posts.json.ts`, `apps/web/src/pages/[lang]/index.md.ts`, `apps/web/src/pages/[lang]/blog.md.ts`, `apps/web/src/pages/[lang]/about.md.ts` | Modify | Preserve endpoint compatibility while using authoritative canonical URLs and description fallbacks. |
| `e2e/utils/seo.ts`, `e2e/pages/seo.spec.ts` | Create | Reusable head/XML assertions and static-preview SEO coverage. |
| `e2e/pages/i18n.spec.ts`, `e2e/agent-discovery.spec.ts`, `playwright.config.ts` | Modify | Static-preview configuration and localized/discovery regression coverage. |
| `apps/web/scripts/verify-seo-dist.mjs`, `apps/web/scripts/verify-seo-dist.test.mjs`, `apps/web/package.json`, `package.json` | Create/Modify | Direct built-artifact checker, Node test, and `verify:seo:dist` command. |
| `.gitignore` | Modify | Exclude review evidence from Git before Task 11 writes it. |
| `.superpowers/sdd/2026-08-24-site-wide-seo/reports/` | Create at execution time | Store Luna Max and Tera Medium review evidence outside Git; the reports are implementation gates, not production dependencies. |

### Route coverage trace

| Route or endpoint | Primary task |
| --- | --- |
| `/:lang/`, `/:lang/blog`, `/:lang/about` | Task 4 |
| `/:lang/blog/:slug`, `/:lang/categories/:category`, `/:lang/tags/:tag` | Task 5 |
| `/`, `404.html`, `/:lang/404` | Task 6 |
| `/sitemap.xml`, `/robots.txt`, agent catalog/skill links | Task 7 |
| `/rss.xml`, `/api/posts.json`, `/:lang/index.md`, `/:lang/blog.md`, `/:lang/about.md` | Task 8 |
| Static preview metadata and response verification | Task 9 |
| Direct `apps/web/dist` verification | Task 10 |

### Review cadence

Tera Medium uses a **final-only observer cadence** for this plan: Tasks 1–10
each end with their focused tests and commit, and Task 11 is the single
mandatory observer gate after the complete verification set. Do not treat the
ignored review reports as production inputs, generated site artifacts, or
commit candidates.

Role ownership remains fixed: Tera High owns this binding spec/plan; Luna Max
performs implementation testing and Q&A; Tera Medium performs the final-only
observer review. A documented human fallback may provide equivalent evidence
only when the required multi-agent capability or requested model is unavailable;
it must identify itself as a fallback rather than claiming model execution.

## Interfaces established by Task 1

All later tasks use these exact names and types from `apps/web/src/lib/seo.ts`:

```ts
export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
export type JsonLdNode = {
  '@context': 'https://schema.org'
  '@type': string | string[]
  [key: string]: JsonValue
}

export interface LocaleLinks {
  headAlternates: Partial<Record<SupportedLocale, string>>
  switcherLinks: Partial<Record<SupportedLocale, string>>
}

export interface SeoImage {
  url: string
  alt: string
  width: 1200
  height: 630
  type: 'image/png' | 'image/webp'
}

export interface SeoArticle {
  publishedTime: string
  modifiedTime: string
  author: string
  section: string
  tags: string[]
}

export interface SeoIndexablePageBase {
  title: string
  description: string
  canonicalUrl: string
  lang: SupportedLocale
  indexable: true
  headAlternates: Partial<Record<SupportedLocale, string>>
  switcherLinks: Partial<Record<SupportedLocale, string>>
  image: SeoImage
  jsonLd: JsonLdNode[]
}

export interface SeoIndexableWebsitePage extends SeoIndexablePageBase {
  kind: 'website'
  article?: never
}

export interface SeoIndexableArticlePage extends SeoIndexablePageBase {
  kind: 'article'
  article: SeoArticle
}

export interface SeoNonIndexablePage {
  title: string
  description: string
  lang: SupportedLocale
  indexable: false
  switcherLinks?: Partial<Record<SupportedLocale, string>>
}

export type SeoPage = SeoIndexableWebsitePage | SeoIndexableArticlePage | SeoNonIndexablePage

export interface ApiPostItem {
  slug: string
  locale: SupportedLocale
  title: string
  excerpt: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  url: string
}

export interface RssPostItemInput {
  title: string
  pubDate: Date
  description: string
  link: string
  categories: string[]
  author: string
  customData?: string
}

export type MarkdownPostEntryStyle = 'list' | 'featured'

export function resolveSiteOrigin(site: URL | undefined, requestUrl: URL): string
export function absoluteUrl(origin: string, path: string): string
export function createDefaultSeoImage(origin: string): SeoImage
export function getDescription(description: string | undefined, excerpt: string): string
export function resolvePostCanonical(post: Post, origin: string): string
export function createApiPostItem(post: Post, origin: string): ApiPostItem
export function createRssPostItem(input: {
  post: Post
  origin: string
  author: string
}): RssPostItemInput
export function formatMarkdownPostEntry(input: {
  post: Post
  origin: string
  style: MarkdownPostEntryStyle
}): string
export function buildLocaleLinks(input: {
  origin: string
  currentPath: string
  currentLocale: SupportedLocale
  availableLocales: SupportedLocale[]
  isLocallyCanonical: boolean
}): LocaleLinks
export function serializeJsonLd(nodes: JsonLdNode[]): string
export function escapeXml(value: string): string
```

`headAlternates` is an absolute SEO map and is empty for external or different-route canonicals. `switcherLinks` is a local navigation-path map and may still include a public translated local route for those posts. The discriminant prohibits article metadata on website pages and requires it on article pages; non-indexable documents expose only optional explicit local-home `switcherLinks`.

### Task 1: Establish typed SEO primitives, canonical validation, and route helpers

**Files:**

- Create: `apps/web/src/lib/seo.ts`
- Create: `apps/web/src/lib/seo.test.ts`
- Create: `apps/web/src/content.config.test.ts`
- Modify: `apps/web/src/lib/routes.ts`
- Modify: `apps/web/src/lib/routes.test.ts`
- Modify: `apps/web/src/content.config.ts`

**Interfaces:**

- Produces every type and helper in **Interfaces established by Task 1**.
- Produces `getAboutPath(locale: SupportedLocale): string` in `@/lib/routes`.
- Consumes `Post`, `SupportedLocale`, `SUPPORTED_LOCALES`, `SITE.description`, and existing route primitives.

- [ ] **Step 1: Write the failing pure-helper and schema tests**

  In `apps/web/src/lib/seo.test.ts`, assert origin precedence, trailing-slash normalization, fallback description, local/external canonical selection, escaped JSON-LD, link-map separation, and the three pure endpoint mappers. Use one public fixture with a whitespace `description`, stored `excerpt`, and external canonical override, then assert `createApiPostItem()` retains local `slug`/`locale`/`excerpt` while setting `description` and `url`; `createRssPostItem()` sets the same fallback description and authoritative `link`; and `formatMarkdownPostEntry()` returns the required link plus description line:

  ```ts
  expect(resolveSiteOrigin(new URL('https://danhthanh.dev/'), new URL('http://localhost:4321/x')))
    .toBe('https://danhthanh.dev')
  expect(getDescription('   ', 'Excerpt')).toBe('Excerpt')
  expect(buildLocaleLinks({
    origin: 'https://danhthanh.dev',
    currentPath: '/vi/blog/post',
    currentLocale: 'vi',
    availableLocales: ['vi', 'en'],
    isLocallyCanonical: false,
  })).toEqual({
    headAlternates: {},
    switcherLinks: { vi: '/vi/blog/post', en: '/en/blog/post' },
  })
  expect(formatMarkdownPostEntry({ post, origin: 'https://danhthanh.dev', style: 'list' }))
    .toBe('- [Test post](https://canonical.example/post)\n  - Description: Stored excerpt')
  ```

  In `apps/web/src/content.config.test.ts`, parse one minimal post frontmatter object with `https://example.com/post` and `http://localhost:4321/post`, then assert failure for `/relative`, `ftp://example.com/post`, and `not a url`. In `routes.test.ts`, add `expect(getAboutPath('en')).toBe('/en/about')`.

- [ ] **Step 2: Run the focused tests to verify they fail**

  Run: `pnpm --filter web test -- src/lib/seo.test.ts src/content.config.test.ts src/lib/routes.test.ts`

  Expected: FAIL because `seo.ts`, `getAboutPath`, and the HTTP(S) canonical schema contract do not yet exist.

- [ ] **Step 3: Implement the minimal typed SEO and route contracts**

  Create `seo.ts` with the discriminated types, helpers, and safe serializer. Add this route helper and schema refinement:

  ```ts
  export function getAboutPath(locale: SupportedLocale): string {
    return getLocalizedPath(locale, '/about')
  }

  canonicalUrl: z
    .url()
    .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
      message: 'canonicalUrl must be an absolute HTTP(S) URL',
    })
    .optional(),
  ```

  `resolvePostCanonical()` must return validated `post.data.canonicalUrl` when present; otherwise return `absoluteUrl(origin, getPostPath(post))`. `buildLocaleLinks()` must preserve `switcherLinks` for supplied public locales and emit `headAlternates` only when `isLocallyCanonical` is true. `serializeJsonLd()` must replace `<`, `>`, `&`, U+2028, and U+2029 with JSON-safe unicode escapes before the string reaches `set:html`.

  Implement the endpoint helpers exactly as declared above. `createApiPostItem(post, origin)` must use `getPostSlug(post)`, `getPostLocale(post)`, the stored `post.data.excerpt`, `getDescription(post.data.description, post.data.excerpt)`, and `resolvePostCanonical(post, origin)`. `createRssPostItem({ post, origin, author })` must preserve the existing RSS item fields, use that same description and canonical link, and keep the stored excerpt in CDATA-safe `customData` when a cover image exists. `formatMarkdownPostEntry({ post, origin, style: 'list' })` must return exactly `- [<title>](<canonical-url>)\n  - Description: <description>`; `style: 'featured'` must return exactly `### [<title>](<canonical-url>)\nDescription: <description>`.

- [ ] **Step 4: Run the focused tests to verify they pass**

  Run: `pnpm --filter web test -- src/lib/seo.test.ts src/content.config.test.ts src/lib/routes.test.ts`

  Expected: PASS; schema rejects non-HTTP(S) values and every exported helper satisfies its unit contract.

- [ ] **Step 5: Commit the foundation**

  ```bash
  git add apps/web/src/lib/seo.ts apps/web/src/lib/seo.test.ts apps/web/src/content.config.ts apps/web/src/content.config.test.ts apps/web/src/lib/routes.ts apps/web/src/lib/routes.test.ts
  git commit -m "feat(web): add typed SEO URL contracts"
  ```

### Task 2: Unify public visibility and public-route counterpart data

**Files:**

- Modify: `apps/web/src/lib/cms.ts`
- Modify: `apps/web/src/lib/cms.test.ts`
- Modify: `apps/web/src/lib/content-graph.ts`
- Modify: `apps/web/src/lib/content-graph.test.ts`
- Modify: `apps/web/src/lib/post-visibility.ts`

**Interfaces:**

- Consumes: `isPublicPost(post, options)`, `getPostSlug(post)`, and `getPostLocale(post)`.
- Produces: `getPostCounterpart(post: Post, posts: Post[]): Post | undefined` and locale-specific public taxonomy calls using the existing `getAllTags(locale)` / `getAllCategories(locale)` signatures.
- Preserves: `buildContentGraph(locale?)`, `ContentGraph`, and `getSlug(post)` for `BlogFilter.astro`.

- [ ] **Step 1: Write the failing visibility and counterpart tests**

  Add tests that pass public, draft, and noindex fixture posts through `getPostCounterpart()` and `buildContentGraph()`. Mock `astro:content` and `post-visibility` in `content-graph.test.ts` so the test proves `buildContentGraph()` calls `isPublicPost()` and excludes both hidden fixtures:

  ```ts
  expect(graph.posts.map(getPostSlug)).toEqual(['public-post'])
  expect(mockIsPublicPost).toHaveBeenCalledWith(draftPost)
  expect(getPostCounterpart(viPost, [viPost, enPost])?.id).toBe(enPost.id)
  expect(getPostCounterpart(viPost, [viPost])).toBeUndefined()
  ```

- [ ] **Step 2: Run the focused tests to verify they fail**

  Run: `pnpm --filter web test -- src/lib/cms.test.ts src/lib/content-graph.test.ts`

  Expected: FAIL because `getPostCounterpart()` is absent and `content-graph.ts` owns a separate `isPublished()` predicate.

- [ ] **Step 3: Implement the shared predicate use and counterpart lookup**

  In `cms.ts`, implement a pure same-slug/different-locale lookup over the supplied public post array:

  ```ts
  export function getPostCounterpart(post: Post, posts: Post[]): Post | undefined {
    const slug = getPostSlug(post)
    const locale = getPostLocale(post)
    return posts.find((candidate) =>
      getPostSlug(candidate) === slug && getPostLocale(candidate) !== locale && isPublicPost(candidate)
    )
  }
  ```

  In `content-graph.ts`, remove `isPublished()` and replace `raw.filter(isPublished)` with `raw.filter((post) => isPublicPost(post))`. Do not alter its locale filter, de-duplication, tag/series maps, ordering, or `getSlug()` implementation.

- [ ] **Step 4: Run the focused tests to verify they pass**

  Run: `pnpm --filter web test -- src/lib/cms.test.ts src/lib/content-graph.test.ts`

  Expected: PASS; draft and noindex posts are excluded by the shared predicate, counterpart lookup never returns an unpublished translation, and graph outputs retain their existing shape.

- [ ] **Step 5: Commit public visibility unification**

  ```bash
  git add apps/web/src/lib/cms.ts apps/web/src/lib/cms.test.ts apps/web/src/lib/content-graph.ts apps/web/src/lib/content-graph.test.ts apps/web/src/lib/post-visibility.ts
  git commit -m "fix(web): share public post visibility rules"
  ```

### Task 3: Configure and verify the forced-localhost static-preview harness

**Files:**

- Create: `e2e/utils/seo.ts`
- Create: `e2e/pages/seo.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**

- Consumes: static routes and final HTML from `pnpm web:e2e:server`.
- Produces: `expectIndexableHead(page, expected)` and `parseJsonLd(page)` test helpers.
- Requires: root `playwright.config.ts` `webServer.env` sets `SITE_URL: 'http://localhost:4321'` and `CF_PAGES_URL: ''` while spreading `process.env` first.

- [ ] **Step 1: Write a failing static-preview harness assertion**

  Create `e2e/pages/seo.spec.ts` with a Chromium-safe test that distinguishes the
  built preview from the current dev server:

  ```ts
  test('SEO tests run against the forced-localhost static preview', async ({ page, request }) => {
    const response = await page.goto('/vi/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/vi/'
    )
    expect((await request.get('/pagefind/pagefind.js')).status()).toBe(200)
  })
  ```

  Add `expectIndexableHead()` and `parseJsonLd()` helper exports to
  `e2e/utils/seo.ts`; their detailed assertions are added in Task 4.

- [ ] **Step 2: Run the E2E test to verify it fails**

  Run: `pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: FAIL because `playwright.config.ts` starts `pnpm web:dev`, which does
  not serve the Pagefind static artifact.

- [ ] **Step 3: Switch Playwright to the forced-localhost build-and-preview server**

  In the repository-root `playwright.config.ts`, replace the development command with this exact shape:

  ```ts
  webServer: {
    command: 'pnpm web:e2e:server',
    env: {
      ...process.env,
      SITE_URL: 'http://localhost:4321',
      CF_PAGES_URL: '',
    },
    url: 'http://localhost:4321/',
    timeout: 180 * 1000,
    reuseExistingServer: !process.env.CI,
  }
  ```

  Keep Chromium, Firefox, and WebKit projects unchanged. Do not make the new test pass by weakening the assertions.

- [ ] **Step 4: Run the E2E test to verify the harness reaches built output**

  Run: `pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: PASS; the generated canonical origin is `http://localhost:4321` and
  the Pagefind artifact is served from `apps/web/dist`.

- [ ] **Step 5: Commit the static-preview harness and failing contract test**

  ```bash
  git add playwright.config.ts e2e/utils/seo.ts e2e/pages/seo.spec.ts
  git commit -m "test(web): cover SEO against static preview"
  ```

### Task 4: Implement the BaseLayout, language switcher, and website-route SEO contracts

**Files:**

- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/components/LanguageSwitcher.astro`
- Modify: `apps/web/src/pages/[lang]/index.astro`
- Modify: `apps/web/src/pages/[lang]/blog/index.astro`
- Modify: `apps/web/src/pages/[lang]/about.astro`
- Modify: `apps/web/src/pages/[lang]/blog/[slug].astro`
- Modify: `apps/web/src/pages/[lang]/categories/[category].astro`
- Modify: `apps/web/src/pages/[lang]/tags/[tag].astro`
- Modify: `apps/web/src/pages/404.astro`
- Modify: `apps/web/src/pages/[lang]/404.astro`
- Modify: `e2e/pages/seo.spec.ts`
- Modify: `e2e/pages/i18n.spec.ts`

**Interfaces:**

- Consumes: `SeoIndexableWebsitePage`, `SeoNonIndexablePage`, `LocaleLinks`, `absoluteUrl()`, `buildLocaleLinks()`, `createDefaultSeoImage()`, `resolveSiteOrigin()`, `serializeJsonLd()`, `getHomePath()`, `getAboutPath()`, `getPostPath()`, `getCategoryPath()`, and `getTagPath()`.
- Produces: one `seo: SeoPage` prop for every localized home, blog, and About page.
- Produces: `LanguageSwitcher` prop `switcherLinks: Partial<Record<SupportedLocale, string>>`.
- Produces: a compile-preserving `seo: SeoPage` argument for **every** existing `BaseLayout` caller: the six website routes, post, category, tag, generic 404, and localized 404. `apps/web/src/pages/index.astro` remains the deliberate standalone exception and does not import `BaseLayout`.

- [ ] **Step 1: Extend E2E tests with failing website-route expectations**

  Add table-driven checks for `/vi/`, `/en/`, `/vi/blog`, `/en/blog`, `/vi/about`, and `/en/about`. Assert each page has exactly one title/description/robots/canonical, absolute RSS and sitemap links, reciprocal `vi`/`en`/`x-default` head links, parsed expected schema types, localized breadcrumb URLs, and an `og:locale:alternate` for the other locale. Add a test that only supplied switcher links render:

  ```ts
  await expect(page.locator('[data-testid="header-language-switcher"] a')).toHaveCount(2)
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  ```

- [ ] **Step 2: Run website-route E2E tests to verify they fail**

  Run: `pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts e2e/pages/i18n.spec.ts`

  Expected: FAIL because `BaseLayout` still accepts primitive props, serializes raw JSON-LD, lacks sitemap/social tags, and About emits only a breadcrumb.

- [ ] **Step 3: Implement the discriminated layout and website route values**

  Replace `BaseLayout` primitive SEO inputs with required `seo: SeoPage`. For `seo.indexable === true`, render its head fields; for `false`, render only title, description, and `robots="noindex, follow"`. Render `x-default` only when `seo.headAlternates.vi` exists. Gate article tags with `seo.kind === 'article'`. Remove each migrated caller's old `title`, `description`, `canonicalUrl`, `type`, `noindex`, `jsonLd`, and `alternateUrls` props; retain only presentation props needed for navigation/slot content.

  Use this shape in website routes:

  ```ts
  const seo: SeoIndexableWebsitePage = {
    kind: 'website',
    indexable: true,
    title: `${i18n.blog.archive} | ${SITE.name}`,
    description: i18n.blog.description,
    canonicalUrl: absoluteUrl(origin, getBlogPath(lang)),
    lang,
    ...buildLocaleLinks({
      origin,
      currentPath: getBlogPath(lang),
      currentLocale: lang,
      availableLocales: SUPPORTED_LOCALES,
      isLocallyCanonical: true,
    }),
    image: createDefaultSeoImage(origin),
    jsonLd: [collectionPageNode, breadcrumbNode],
  }
  ```

  Build home as `WebSite` + `Person` + `WebPage`; blog as `CollectionPage` + `BreadcrumbList`; About as `ProfilePage` + `Person` + `BreadcrumbList`. Use `absoluteUrl(origin, getHomePath(lang))`, `absoluteUrl(origin, getBlogPath(lang))`, and `absoluteUrl(origin, getAboutPath(lang))` in every schema breadcrumb. Update `LanguageSwitcher.astro` to accept `switcherLinks`, render only its entries in `SUPPORTED_LOCALES` order, and remove path-regex derivation.

  In the same change, mechanically migrate the remaining callers so the new required prop typechecks before Task 5/6 refine their SEO semantics. In each of `[lang]/blog/[slug].astro`, `[lang]/categories/[category].astro`, and `[lang]/tags/[tag].astro`, compute `const origin = resolveSiteOrigin(Astro.site, Astro.url)`, declare the retained node array as `const pageJsonLd: JsonLdNode[] = [...]` (or `const jsonLd: JsonLdNode[] = [...]` for taxonomy), and pass this temporary, locally canonical website contract using the route's existing title, description, JSON-LD array, and current locale only:

  ```ts
  const seo: SeoIndexableWebsitePage = {
    kind: 'website',
    indexable: true,
    title: `${title} | ${SITE.name}`,
    description: excerpt,
    canonicalUrl: absoluteUrl(origin, getPostPath(post)),
    lang,
    ...buildLocaleLinks({
      origin,
      currentPath: getPostPath(post),
      currentLocale: lang,
      availableLocales: [lang],
      isLocallyCanonical: true,
    }),
    image: createDefaultSeoImage(origin),
    jsonLd: pageJsonLd,
  }
  ```

  For category/tag, substitute `title`, `description`, `currentPath`, and existing `jsonLd` with the route's `getCategoryPath(category, lang)` or `getTagPath(tag, lang)` value. This intentionally preserves compilation and the pre-existing node array only; Task 5 replaces these temporary website values with the required article/taxonomy canonical, counterpart, image, and route-schema contracts. In both 404 files, pass `SeoNonIndexablePage` with `title`, localized description, `lang`, `indexable: false`, and this exact explicit local-home map:

  ```ts
  switcherLinks: {
    vi: getHomePath('vi'), // '/vi/'
    en: getHomePath('en'), // '/en/'
  }
  ```

  This is the final 404 switcher contract: no derived path, blog, post, taxonomy, or unavailable locale URL may be added. Task 6 asserts this completed behavior rather than changing the 404 payload again.

- [ ] **Step 4: Run website-route E2E and type checks to verify they pass**

  Run: `pnpm web:typecheck && pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts e2e/pages/i18n.spec.ts`

  Expected: PASS; all six website routes have the required schema/head contract, no route constructs a canonical from an empty origin, and all eight current BaseLayout callers compile with the required `seo` prop. Post/taxonomy/404 semantic assertions remain owned by Tasks 5 and 6.

- [ ] **Step 5: Commit website-route metadata**

  ```bash
  git add apps/web/src/layouts/BaseLayout.astro apps/web/src/components/LanguageSwitcher.astro apps/web/src/pages/[lang]/index.astro apps/web/src/pages/[lang]/blog/index.astro apps/web/src/pages/[lang]/about.astro apps/web/src/pages/[lang]/blog/[slug].astro apps/web/src/pages/[lang]/categories/[category].astro apps/web/src/pages/[lang]/tags/[tag].astro apps/web/src/pages/404.astro apps/web/src/pages/[lang]/404.astro e2e/pages/seo.spec.ts e2e/pages/i18n.spec.ts
  git commit -m "feat(web): centralize localized website metadata"
  ```

### Task 5: Implement article and locale-specific taxonomy SEO

**Files:**

- Modify: `apps/web/src/pages/[lang]/blog/[slug].astro`
- Modify: `apps/web/src/pages/[lang]/categories/[category].astro`
- Modify: `apps/web/src/pages/[lang]/tags/[tag].astro`
- Modify: `apps/web/src/lib/seo.test.ts`
- Modify: `e2e/pages/seo.spec.ts`

**Interfaces:**

- Consumes: `SeoIndexableArticlePage`, `getDescription()`, `resolvePostCanonical()`, `getPostCounterpart()`, `buildLocaleLinks()`, `getAboutPath()`, and the public locale taxonomy helpers.
- Produces: `Article`/`FAQPage`/breadcrumb nodes for posts and `CollectionPage`/breadcrumb nodes for taxonomy pages.

- [ ] **Step 1: Write failing article/taxonomy tests**

  In `seo.test.ts`, create a `vi` public post with an `en` same-slug counterpart and assert local canonical produces two head alternatives. Create external and same-origin-different-route overrides and assert `{ headAlternates: {}, switcherLinks: { vi: localViPath, en: localEnPath } }`.

  In `e2e/pages/seo.spec.ts`, assert the committed post pair has `Article`, absolute author URL `http://localhost:4321/:lang/about`, `inLanguage`, `mainEntityOfPage.@id`, article section/tags/times, and visible-FAQ-only `FAQPage`. Assert `/vi/categories/tutorials`, `/en/categories/tutorials`, `/vi/tags/astro`, and `/en/tags/astro` have absolute localized breadcrumb items and reciprocal head links.

- [ ] **Step 2: Run focused tests to verify they fail**

  Run: `pnpm --filter web test -- src/lib/seo.test.ts && pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: FAIL because posts ignore `description`/`canonicalUrl`, taxonomy static paths use global terms, tags omit alternates, and current schemas contain relative or non-localized breadcrumb items.

- [ ] **Step 3: Implement post canonical/Article data and public taxonomy paths**

  In `[slug].astro`, use `getDescription(post.data.description, post.data.excerpt)` for HTML/social/Article text, `resolvePostCanonical(post, origin)`, and `isLocallyCanonical = canonicalUrl === absoluteUrl(origin, getPostPath(post))`. Build an `SeoIndexableArticlePage` with:

  ```ts
  article: {
    publishedTime: publishedAt.toISOString(),
    modifiedTime: (updatedAt ?? publishedAt).toISOString(),
    author,
    section: category,
    tags,
  }
  ```

  Set Article `author.url` to `absoluteUrl(origin, getAboutPath(lang))`, add `wordCount` and `inLanguage`, and include `FAQPage` only when `faq.length > 0` (the same condition used by `PostFAQ.astro`). Use `getPostCounterpart()` to determine available locales.

  In category/tag `getStaticPaths()`, loop each locale and call `getAllCategories(locale)` / `getAllTags(locale)`, not global helpers. Build locale links only for locales where `getPostsByCategory()` or `getPostsByTag()` returns public posts. Ensure every breadcrumb `item` is an absolute localized URL.

- [ ] **Step 4: Run focused tests to verify they pass**

  Run: `pnpm web:typecheck && pnpm --filter web test -- src/lib/seo.test.ts && pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: PASS; locally canonical posts publish reciprocal head alternatives, override posts suppress only head alternatives, and no empty taxonomy static paths are generated.

- [ ] **Step 5: Commit article and taxonomy SEO**

  ```bash
  git add apps/web/src/pages/[lang]/blog/[slug].astro apps/web/src/pages/[lang]/categories/[category].astro apps/web/src/pages/[lang]/tags/[tag].astro apps/web/src/lib/seo.test.ts e2e/pages/seo.spec.ts
  git commit -m "feat(web): add canonical-aware article and taxonomy SEO"
  ```

### Task 6: Make the root and 404 documents explicitly non-indexable

**Files:**

- Modify: `apps/web/src/pages/index.astro`
- Modify: `e2e/pages/seo.spec.ts`

**Interfaces:**

- Consumes: the completed Task 4 `SeoNonIndexablePage` 404 contract with `switcherLinks: { vi: '/vi/', en: '/en/' }`.
- Preserves: root as a standalone `index.astro` document with meta refresh and visible `/vi/` link; the Task 4 404 layout payloads; and middleware-owned preview 404 status.

- [ ] **Step 1: Write the root red test and the 404 regression assertions**

  Add request-based tests that inspect the raw root document and missing route:

  ```ts
  const root = await request.get('/')
  expect(await root.text()).toContain('<meta name="robots" content="noindex, follow"')
  expect(await root.text()).not.toContain('rel="canonical"')

  const missing = await request.get('/en/missing-page')
  expect(missing.status()).toBe(404)
  expect(await missing.text()).toContain('noindex, follow')
  ```

  Assert both documents omit canonical, hreflang, RSS/sitemap discovery, social card, and JSON-LD tags. Assert every rendered 404 switcher has exactly the two explicit home links `/vi/` and `/en/`, with no other locale-navigation URL.

- [ ] **Step 2: Run the root/404 suite to verify only the root red test fails**

  Run: `pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: FAIL only because root lacks `noindex, follow` and/or still emits a canonical. The 404 assertions should already PASS after Task 4: both 404 layouts use `SeoNonIndexablePage`, emit `noindex, follow` with the required omissions, and supply exactly the two explicit localized-home switcher links. If any 404 assertion fails, return to Task 4; do not change the 404 payload in this task.

- [ ] **Step 3: Implement the standalone root non-indexable document**

  In root `index.astro`, add only `meta[name=robots]` with `noindex, follow` beside the existing refresh/title/visible link; do not import `BaseLayout` or add canonical/social/schema tags. Keep middleware status rewriting unchanged and leave both Task 4 404 payloads untouched.

- [ ] **Step 4: Run the root/404 tests to verify they pass**

  Run: `pnpm web:typecheck && pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: PASS; root now satisfies the standalone non-indexable contract, preview returns status 404 for missing pages, and the previously green 404 contract still has only `noindex, follow` plus its exact two-home-link switcher map.

- [ ] **Step 5: Commit non-indexable route handling**

  ```bash
  git add apps/web/src/pages/index.astro e2e/pages/seo.spec.ts
  git commit -m "fix(web): mark redirect and not-found pages non-indexable"
  ```

### Task 7: Retain and harden the custom sitemap, robots, and agent discovery

**Files:**

- Modify: `apps/web/src/pages/sitemap.xml.ts`
- Modify: `apps/web/src/pages/robots.txt.ts`
- Modify: `apps/web/src/lib/agent-metadata.ts`
- Modify: `apps/web/src/lib/agent-metadata.test.ts`
- Modify: `apps/web/agent-skills/read-blog/SKILL.md`
- Modify: `apps/web/src/lib/seo.test.ts`
- Modify: `e2e/agent-discovery.spec.ts`
- Modify: `e2e/pages/seo.spec.ts`

**Interfaces:**

- Consumes: `resolveSiteOrigin(context.site, context.url)`, `absoluteUrl()`, `escapeXml()`, `resolvePostCanonical()`, `buildLocaleLinks()`, public locale post/tag/category queries, and `getAboutPath()`.
- Produces: custom XML entries with `loc`, optional `lastmod`, and `xhtml:link` entries; no `changefreq`/`priority`.
- Preserves: `/sitemap.xml` endpoint and `Content-Signal: ai-train=no, search=yes, ai-input=yes`.

- [ ] **Step 1: Write failing XML/discovery tests**

  In `seo.test.ts`, assert XML escaping of `&<>'\"`, duplicate `<loc>` rejection, `YYYY-MM-DD` output, no date fallback, and no sitemap entry for an external/different-route canonical post. In E2E, parse sitemap XML with browser `DOMParser`, assert the `xhtml` namespace, About routes, unique locations, no `changefreq`/`priority`, and resolvable public locations. Extend agent tests to expect `/sitemap.xml` from `getApiCatalogLinks()`, the API catalog, robots, and generated agent skill content.

- [ ] **Step 2: Run sitemap/discovery tests to verify they fail**

  Run: `pnpm --filter web test -- src/lib/seo.test.ts src/lib/agent-metadata.test.ts && pnpm test:e2e --project=chromium e2e/agent-discovery.spec.ts e2e/pages/seo.spec.ts`

  Expected: FAIL because sitemap XML is unescaped and incomplete, uses transient dates/priorities, and multiple discovery surfaces still name `/sitemap-index.xml`.

- [ ] **Step 3: Implement the custom sitemap and aligned discovery target**

  Keep `sitemap.xml.ts`; do not install `@astrojs/sitemap`. Make the endpoint context explicit before any URL work:

  ```ts
  export const GET: APIRoute = async (context) => {
    const origin = resolveSiteOrigin(context.site, context.url)
    // build entries with `origin`
  }
  ```

  Build entries only for locally canonical, public indexable home/blog/About/post/tag/category routes. Compare every post's `resolvePostCanonical(post, origin)` to `absoluteUrl(origin, getPostPath(post))` and omit it when they differ. Use `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"`; emit `<xhtml:link rel="alternate" hreflang="..." href="..." />` from `headAlternates`. Use post dates as `YYYY-MM-DD`; omit static-page `lastmod` without a source date.

  Make `robots.txt.ts` an `APIRoute` whose handler also computes `const origin = resolveSiteOrigin(context.site, context.url)` and emits `Sitemap: ${absoluteUrl(origin, '/sitemap.xml')}`. Change stale non-markdown discovery sources to `/sitemap.xml`: `robots.txt.ts`,
  `getApiCatalogLinks()`, and `apps/web/agent-skills/read-blog/SKILL.md`.
  Preserve `robots.txt` allow/disallow and Content-Signal lines. Task 8 changes
  localized markdown while implementing its canonical/description output.

- [ ] **Step 4: Run sitemap/discovery tests to verify they pass**

  Run: `pnpm --filter web test -- src/lib/seo.test.ts src/lib/agent-metadata.test.ts && pnpm test:e2e --project=chromium e2e/agent-discovery.spec.ts e2e/pages/seo.spec.ts`

  Expected: PASS; robots, API catalog, HTTP Link data, and the agent skill agree on
  `/sitemap.xml`; sitemap URLs are unique/public/locally canonical; and XML
  parses with alternate links where available. Task 8 verifies localized
  markdown discovery text.

- [ ] **Step 5: Commit sitemap and discovery alignment**

  ```bash
  git add apps/web/src/pages/sitemap.xml.ts apps/web/src/pages/robots.txt.ts apps/web/src/lib/agent-metadata.ts apps/web/src/lib/agent-metadata.test.ts apps/web/agent-skills/read-blog/SKILL.md apps/web/src/lib/seo.test.ts e2e/agent-discovery.spec.ts e2e/pages/seo.spec.ts
  git commit -m "feat(web): align custom sitemap and discovery metadata"
  ```

### Task 8: Make RSS, API JSON, and localized markdown authoritative and compatible

**Files:**

- Modify: `apps/web/src/pages/rss.xml.ts`
- Modify: `apps/web/src/pages/api/posts.json.ts`
- Modify: `apps/web/src/pages/[lang]/index.md.ts`
- Modify: `apps/web/src/pages/[lang]/blog.md.ts`
- Modify: `apps/web/src/pages/[lang]/about.md.ts`
- Modify: `apps/web/src/lib/seo.test.ts`
- Modify: `e2e/pages/seo.spec.ts`

**Interfaces:**

- Consumes: `resolveSiteOrigin(context.site, context.url)`, `createApiPostItem()`, `createRssPostItem()`, `formatMarkdownPostEntry()`, and public post query helpers.
- Produces: API objects with existing fields plus `description: string`; RSS items retaining existing fields; markdown entries in the exact title-link/Description-line format.

- [ ] **Step 1: Write failing endpoint compatibility tests**

  Add callable pure tests in `seo.test.ts` using `createApiPostItem()`, `createRssPostItem()`, and `formatMarkdownPostEntry()` with a public post with whitespace `description`, an external canonical override, and a different same-origin canonical override. Assert:

  ```ts
  expect(apiPost).toMatchObject({
    slug: 'test-post',
    locale: 'vi',
    excerpt: 'Stored excerpt',
    description: 'Stored excerpt',
    url: 'https://canonical.example/post',
  })
  expect(markdown).toContain('- [Test post](https://canonical.example/post)')
  expect(markdown).toContain('  - Description: Stored excerpt')
  ```

  Assert the API fixture still exposes local `slug`, `locale`, and stored `excerpt`; the RSS input still exposes `title`, `pubDate`, `description`, `link`, `categories`, `author`, and `customData`; and the featured markdown helper returns `### [Test post](https://canonical.example/post)\nDescription: Stored excerpt`. In E2E, fetch `/api/posts.json`, `/rss.xml`, `/vi/index.md`, `/en/blog.md`, and `/vi/about.md`. Assert API excludes both draft/noindex posts, RSS item links are authoritative canonicals and retain `content:encoded`, markdown uses `/sitemap.xml`, and RSS omits the inaccurate `<language>vi</language>` channel data.

- [ ] **Step 2: Run endpoint tests to verify they fail**

  Run: `pnpm --filter web test -- src/lib/seo.test.ts && pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: the pure helper assertions PASS because Task 1 established the reusable contract; the E2E command FAILS because API reads all posts and returns relative paths, RSS uses local paths/excerpts and declares `vi`, and markdown links concatenate `post.id` without the required description line.

- [ ] **Step 3: Implement compatible authoritative endpoint output**

  Convert every endpoint handler to an `APIRoute` whose first action is origin resolution. In `api/posts.json.ts`, use:

  ```ts
  export const GET: APIRoute = async (context) => {
    const origin = resolveSiteOrigin(context.site, context.url)
    const posts = await getAllPosts()
    return Response.json(posts.map((post) => createApiPostItem(post, origin)))
  }
  ```

  This replaces the direct `getCollection` reader; `getAllPosts()` retains the shared draft-and-noindex predicate. Keep all existing output names through `createApiPostItem()` and add only `description`.

  In `rss.xml.ts`, replace the ad hoc `{ site: URL }` context with `export const GET: APIRoute = async (context) => { const origin = resolveSiteOrigin(context.site, context.url) }`, pass `site: new URL(origin)` to `rss()`, and map every public post through `createRssPostItem({ post, origin, author: `${SITE.email} (${SITE.author})` })`. This retains `title`, `pubDate`, `description`, `link`, `categories`, `author`, and `customData`, uses the canonical link/description fallback, and preserves the stored excerpt in CDATA-safe custom data. Remove the channel `<language>vi</language>` custom data while retaining the namespace post-processing.

  In each localized markdown `GET: APIRoute`, destructure `params` from `context` only after `const origin = resolveSiteOrigin(context.site, context.url)`. In `index.md.ts` and `blog.md.ts`, map posts through the helper with these exact calls and emit exactly:

  ```ts
  formatMarkdownPostEntry({ post: featured, origin, style: 'featured' })
  formatMarkdownPostEntry({ post, origin, style: 'list' })
  ```

  ```md
  - [Title](https://canonical.example/post)
    - Description: Fallback description
  ```

  `index.md.ts` uses `style: 'featured'` for its featured post and `style: 'list'` for every recent post; `blog.md.ts` uses `style: 'list'`. In `about.md.ts`, use the same resolved `origin` for the absolute source URL. Keep About content fields and update any sitemap mention to `${absoluteUrl(origin, '/sitemap.xml')}`.

- [ ] **Step 4: Run endpoint tests to verify they pass**

  Run: `pnpm web:typecheck && pnpm --filter web test -- src/lib/seo.test.ts && pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts`

  Expected: PASS; canonical overrides drive endpoint links while API `slug`/`locale`/`excerpt` and RSS compatibility fields remain intact.

- [ ] **Step 5: Commit machine-readable endpoint compatibility**

  ```bash
  git add apps/web/src/pages/rss.xml.ts apps/web/src/pages/api/posts.json.ts apps/web/src/pages/[lang]/index.md.ts apps/web/src/pages/[lang]/blog.md.ts apps/web/src/pages/[lang]/about.md.ts apps/web/src/lib/seo.test.ts e2e/pages/seo.spec.ts
  git commit -m "feat(web): align machine-readable SEO outputs"
  ```

### Task 9: Complete static-preview coverage across browsers

**Files:**

- Modify: `e2e/pages/seo.spec.ts`
- Modify: `e2e/pages/i18n.spec.ts`
- Modify: `e2e/agent-discovery.spec.ts`
- Modify: `e2e/utils/seo.ts`

**Interfaces:**

- Consumes: finalized `SeoPage` output, sitemap XML, endpoint bodies, and forced-localhost Playwright config.
- Produces: cross-browser assertions for every public route family and discovery endpoint.

- [ ] **Step 1: Add failing full-contract assertions**

  Expand `seo.spec.ts` to test all representative committed routes: `/vi/`, `/en/`, `/vi/blog`, `/en/blog`, `/vi/about`, `/en/about`, the `getting-started-with-astro-5` post pair, category `tutorials` pair, and tag `astro` pair. For each indexable page assert exactly one canonical/title/description/robots, absolute social/discovery values, no duplicate hreflang, reciprocal available head links, and valid JSON-LD route types. Add request checks that every sitemap location resolves to a public 200 response.

- [ ] **Step 2: Run Chromium full-contract E2E**

  Run: `pnpm test:e2e --project=chromium e2e/pages/seo.spec.ts e2e/pages/i18n.spec.ts e2e/agent-discovery.spec.ts`

  Expected: PASS. If it fails, stop this task and return to exactly one owning
  task: Task 4 for website head/schema output, Task 5 for article/taxonomy
  output, Task 6 for root/404, Task 7 for sitemap/discovery, or Task 8 for
  RSS/API/markdown. Do not weaken an assertion or change a URL/visibility rule.

- [ ] **Step 3: Run all browser projects to verify static-preview behavior**

  Run: `pnpm test:e2e`

  Expected: PASS in Chromium, Firefox, and WebKit with `SITE_URL=http://localhost:4321` and an empty `CF_PAGES_URL` for the preview build.

- [ ] **Step 4: Commit complete E2E coverage**

  ```bash
  git add e2e/pages/seo.spec.ts e2e/pages/i18n.spec.ts e2e/agent-discovery.spec.ts e2e/utils/seo.ts
  git commit -m "test(web): verify localized SEO contracts"
  ```

### Task 10: Add and validate the direct dist artifact checker

**Files:**

- Create: `apps/web/scripts/verify-seo-dist.mjs`
- Create: `apps/web/scripts/verify-seo-dist.test.mjs`
- Modify: `apps/web/package.json`
- Modify: `package.json`

**Interfaces:**

- Consumes: built `apps/web/dist`, `sitemap.xml`, and the route-to-file mapping established by Astro static output.
- Produces: `pnpm verify:seo:dist`, which exits non-zero for missing artifacts, relative/duplicate indexable head URLs, indexable root/404 artifacts, stale sitemap target text, or sitemap/file mismatch.


- [ ] **Step 1: Write the failing Node checker test**

  Create `apps/web/scripts/verify-seo-dist.test.mjs` using `node:test` and a
  temporary directory. Import the future `verifySeoDist(distDir)` export and
  assert it rejects an indexed page with a relative canonical:

  ```js
  await assert.rejects(
    verifySeoDist(fixtureDir),
    /absolute canonical URL/
  )
  ```

  Build a complete otherwise-valid baseline fixture before mutating the target
  canonical. Write all six required indexable artifacts—`vi/index.html`,
  `en/index.html`, `vi/blog/index.html`, `en/blog/index.html`,
  `vi/about/index.html`, and `en/about/index.html`—with one absolute canonical,
  title, description, and `index, follow` robots tag each. Write `index.html`
  and `404.html` with only `noindex, follow`, and write `sitemap.xml` with one
  absolute `<loc>` for every baseline localized route. Then change only
  `vi/index.html` to `href="/vi/"` so the assertion reaches the intended
  relative-canonical failure instead of failing for a missing required file:

  ```js
  const baselinePaths = ['/vi/', '/en/', '/vi/blog', '/en/blog', '/vi/about', '/en/about']
  async function writeOutputHtml(distDir, pathname, html) {
    const relative = pathname.replace(/^\/+|\/+$/g, '')
    const output = relative === '' ? join(distDir, 'index.html') : join(distDir, relative, 'index.html')
    await mkdir(dirname(output), { recursive: true })
    await writeFile(output, html)
  }
  const sitemapForBaselineRoutes = `<?xml version="1.0"?><urlset>${baselinePaths
    .map((pathname) => `<url><loc>https://example.test${pathname}</loc></url>`)
    .join('')}</urlset>`
  const indexable = (url) => `<!doctype html><head>
    <title>Page</title><meta name="description" content="Description">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
  </head>`
  for (const pathname of baselinePaths) {
    await writeOutputHtml(fixtureDir, pathname, indexable(`https://example.test${pathname}`))
  }
  await writeFile(join(fixtureDir, 'index.html'), '<meta name="robots" content="noindex, follow">')
  await writeFile(join(fixtureDir, '404.html'), '<meta name="robots" content="noindex, follow">')
  await writeFile(join(fixtureDir, 'sitemap.xml'), sitemapForBaselineRoutes)
  await writeOutputHtml(fixtureDir, '/vi/', indexable('/vi/'))
  ```

- [ ] **Step 2: Run the Node test to verify it fails**

  Run: `node --test apps/web/scripts/verify-seo-dist.test.mjs`

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` because
  `apps/web/scripts/verify-seo-dist.mjs` does not exist.

- [ ] **Step 3: Implement the direct checker and wire package scripts**

  Create `verify-seo-dist.mjs` using only `node:assert/strict`,
  `node:fs/promises`, and `node:path`; add no dependency. Export
  `async function verifySeoDist(distDir)` and execute it
  with `apps/web/dist` when the module is the entry point. It must read expected
  `vi`/`en` home/blog/About files plus every locally canonical URL from sitemap,
  inspect each indexed `<head>` for one absolute canonical and no duplicate
  canonical/hreflang, inspect root and `404.html` only for `noindex, follow`,
  reject `sitemap-index.xml` anywhere in `dist`, and compare escaped sitemap
  `<loc>` values to generated route files. It must not assert an HTTP status for
  `404.html`.

  Convert sitemap paths to static files with this helper:

  ```js
  function outputFileForPathname(distDir, pathname) {
    const relative = pathname.replace(/^\/+|\/+$/g, '')
    return relative === '' ? join(distDir, 'index.html') : join(distDir, relative, 'index.html')
  }
  ```

  Add `"verify:seo:dist": "node scripts/verify-seo-dist.mjs"` to
  `apps/web/package.json` and `"verify:seo:dist": "pnpm --filter web
  verify:seo:dist"` to the root `package.json`.

- [ ] **Step 4: Run the Node test and built-artifact check to verify they pass**

  Run: `node --test apps/web/scripts/verify-seo-dist.test.mjs && pnpm web:build && pnpm verify:seo:dist`

  Expected: PASS; the checker reads `apps/web/dist` without starting a server and reports the verified sitemap/location count.

- [ ] **Step 5: Commit dist verification**

  ```bash
  git add apps/web/scripts/verify-seo-dist.mjs apps/web/scripts/verify-seo-dist.test.mjs apps/web/package.json package.json
  git commit -m "test(web): validate built SEO artifacts"
  ```

### Task 11: Run full verification, Luna Max testing/Q&A, and Tera Medium observer review

**Files:**

- Modify: `.gitignore`
- Create at execution time, intentionally ignored: `.superpowers/sdd/2026-08-24-site-wide-seo/reports/luna-max.md`
- Create at execution time, intentionally ignored: `.superpowers/sdd/2026-08-24-site-wide-seo/reports/tera-medium.md`
- Modify only if a verified defect requires it: the exact owning production/test file from Tasks 1–10.
- Do not create: a pull request, new production scope, or unrelated refactor.

**Interfaces:**

- Consumes: completed implementation, the binding spec, and the verification commands below.
- Produces: recorded verification evidence plus the ignored Luna Max and Tera Medium reports. A preflight records whether each requested model actually ran; when unavailable, the same report path records a clearly labelled human fallback instead. These reports are review gates/evidence only; they are not production dependencies, generated site inputs, or Git commit candidates.

- [ ] **Step 1: Make the review-evidence directory Git-ignored**

  Add this exact repository-root entry to `.gitignore`:

  ```gitignore
  .superpowers/sdd/
  ```

  Run: `git check-ignore -q .superpowers/sdd/2026-08-24-site-wide-seo/reports/luna-max.md`

  Expected: exit 0; review reports cannot be staged accidentally.

- [ ] **Step 2: Commit the review-evidence ignore rule**

  ```bash
  git add .gitignore
  git commit -m "chore: ignore SEO review evidence"
  ```

- [ ] **Step 3: Create the exact review-evidence directory**

  Run: `mkdir -p .superpowers/sdd/2026-08-24-site-wide-seo/reports`

  Expected: the ignored directory exists and `git status --short --ignored` shows it only as an ignored path.

- [ ] **Step 4: Preflight the multi-agent capability and exact model routes**

  Before assigning either substantive review, attempt the two minimal calls below. A returned agent handle proves that `multi_agent_v1.spawn_agent` is callable and that the exact model/reasoning pair is allowed; wait for each preflight agent to finish and require it to write only the stated preflight marker. These are capability checks, not implementation testing or an observer decision.

  These TypeScript snippets are illustrative orchestration invocations, not executable project code; use this workspace's `multi_agent_v1.spawn_agent` call shape unchanged.

  ```ts
  await multi_agent_v1.spawn_agent({
    fork_context: false,
    model: 'gpt-5.6-luna',
    reasoning_effort: 'max',
    service_tier: 'priority',
    message: `Preflight only. Do not review implementation. Write exactly \"Model preflight passed: gpt-5.6-luna / max.\" to .superpowers/sdd/2026-08-24-site-wide-seo/reports/luna-max.md.`,
  })
  await multi_agent_v1.spawn_agent({
    fork_context: false,
    model: 'gpt-5.6-terra',
    reasoning_effort: 'medium',
    service_tier: 'priority',
    message: `Preflight only. Do not review implementation. Write exactly \"Model preflight passed: gpt-5.6-terra / medium.\" to .superpowers/sdd/2026-08-24-site-wide-seo/reports/tera-medium.md.`,
  })
  ```

  For either call that fails because the capability is absent or the model/effort pair is rejected, do not claim that model ran. Write this exact preamble to that role's same report path, replacing `<verbatim-error>` with the invocation error:

  ```md
  ## Review mode
  Human fallback — model execution did not occur.
  Requested route: <requested-model> / <requested-reasoning-effort>
  Reason: <verbatim-error>
  ```

  Use the human fallback only for the unavailable role; a successful role must still use its requested model. Run `test -s` for both report paths after either model or fallback has written its marker.

  Expected: each report records either the exact successful model preflight or an explicit human-fallback reason; no report represents a rejected model as executed.

- [ ] **Step 5: Run the complete required verification set**

  Run:

  ```bash
  pnpm web:test
  pnpm web:typecheck
  pnpm web:build
  pnpm verify:seo:dist
  pnpm test:e2e
  pnpm check
  ```

  Expected: every command exits 0. If a command fails, identify the exact failing assertion/type/build artifact, add a focused regression test when one is missing, fix only the owning file, commit that focused fix with its test, and rerun the failed command before continuing.

- [ ] **Step 6: Perform Luna Max implementation testing and Q&A**

  If the Luna preflight passed, invoke `multi_agent_v1.spawn_agent` with `fork_context: false`, `model: 'gpt-5.6-luna'`, `reasoning_effort: 'max'`, and `service_tier: 'priority'`. Give it the binding spec path, route coverage trace, final diff, and all Step 5 output. In its message require implementation testing/Q&A and require it to append its report to `.superpowers/sdd/2026-08-24-site-wide-seo/reports/luna-max.md` with one answer per question and a cited route, test, or artifact for each answer:

  ```ts
  await multi_agent_v1.spawn_agent({
    fork_context: false,
    model: 'gpt-5.6-luna',
    reasoning_effort: 'max',
    service_tier: 'priority',
    message: `Review the implementation against docs/superpowers/specs/2026-08-24-site-wide-seo-design.md.
Append your evidence-backed report to .superpowers/sdd/2026-08-24-site-wide-seo/reports/luna-max.md.
Answer: (1) Does every indexable route have one absolute canonical and only proven headAlternates?
(2) Do external/different-route canonical posts stay out of the local sitemap while API/RSS/markdown use the authoritative canonical and retain local compatibility fields?
(3) Are draft and noindex posts absent from every public surface?
(4) Do root/404 and machine-readable endpoints meet the static-site constraints?`,
  })
  ```

  If Luna preflight failed, a human implementation tester must instead append answers to those same four questions, using the Step 5 command output and cited route/test/artifact evidence, beneath the existing `Human fallback` preamble in `luna-max.md`. Do not call this a Luna Max result. In either mode, run: `test -s .superpowers/sdd/2026-08-24-site-wide-seo/reports/luna-max.md`

  Expected: the report answers all four questions and cites test or artifact evidence, while its preamble accurately identifies model execution or human fallback.

- [ ] **Step 7: Address verified Luna Max findings**

  For each finding backed by a failing command, reproducible route, or spec contradiction, add the smallest regression test in `seo.test.ts`, `seo.spec.ts`, or `agent-discovery.spec.ts`, make the owning fix, commit it with that test, and rerun the focused test plus `pnpm check`. Reject unsupported scope expansion in the Luna report and record why it is outside the binding spec.

  If this step changes any implementation or test file, rerun the complete Step 5 verification set successfully before proceeding:

  ```bash
  pnpm web:test
  pnpm web:typecheck
  pnpm web:build
  pnpm verify:seo:dist
  pnpm test:e2e
  pnpm check
  ```

  Expected: every command exits 0 after the Luna-supported fix. Save these post-fix outputs with the review evidence; Step 8 must not begin until they exist and pass.

- [ ] **Step 8: Perform the final-only Tera Medium observer checkpoint**

  If the Tera preflight passed, invoke `multi_agent_v1.spawn_agent` with `fork_context: false`, `model: 'gpt-5.6-terra'`, `reasoning_effort: 'medium'`, and `service_tier: 'priority'`. This is the final-only cadence declared above; do not retroactively add per-task reviews. Give the observer the final diff, binding spec, file-impact map, Luna report, and the successful post-Step-7 full verification output when Luna findings caused a fix; otherwise provide the successful Step 5 output. Tera must receive this current evidence, never stale pre-Luna output. Require a pass/fail review against discriminated types; canonical/headAlternates/switcherLinks separation; every route family; root/404; draft/noindex public visibility; the retained custom sitemap decision; agent/RSS/API/markdown compatibility; static-preview environment; and the dist checker. Require the observer to append the report to `.superpowers/sdd/2026-08-24-site-wide-seo/reports/tera-medium.md`:

  ```ts
  await multi_agent_v1.spawn_agent({
    fork_context: false,
    model: 'gpt-5.6-terra',
    reasoning_effort: 'medium',
    service_tier: 'priority',
    message: `Act as the final-only observer for docs/superpowers/plans/2026-08-24-site-wide-seo.md.
Review the final diff, binding spec, file-impact map, full verification output, and Luna report.
Append a pass/fail, evidence-backed report to .superpowers/sdd/2026-08-24-site-wide-seo/reports/tera-medium.md covering every listed acceptance area.`,
  })
  ```

  If Tera preflight failed, an independent human observer must instead append the same pass/fail review and evidence to `tera-medium.md` beneath the existing `Human fallback` preamble. Do not call this a Tera Medium model result. In either mode, run: `test -s .superpowers/sdd/2026-08-24-site-wide-seo/reports/tera-medium.md`

  Expected: the observer report has an explicit pass/fail decision and evidence for each review area, while its preamble accurately identifies model execution or human fallback.

- [ ] **Step 9: Resolve any Tera Medium failure finding**

  For each supported failure finding, write the smallest failing regression test first, run it to confirm failure, make the owning fix, rerun the focused test and `pnpm check`, commit the fix and test, then rerun all Step 5 commands. Record the resolution beneath the relevant finding in the ignored observer report. For unsupported scope expansion, record the binding-spec reason for rejection without changing production code.

- [ ] **Step 10: Record the final handoff state**

  Run: `git status --short && git log --oneline -10`

  Expected: only intended implementation/test/documentation files are modified or committed, and the two review reports remain ignored; no pull request is created by this task. Summarize the verified commands, Luna Max answers, Tera Medium decision, and any host-specific behavior intentionally left outside scope.
