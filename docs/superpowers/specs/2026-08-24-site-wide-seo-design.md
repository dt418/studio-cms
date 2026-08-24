# Site-wide SEO Foundations and Validation

- **Date:** 2026-08-24
- **Issue:** [#14](https://github.com/dt418/studio-cms/issues/14)
- **Branch:** `codex/seo-site-wide-foundation`
- **Status:** Draft — rewritten for review

## Scope and repository ground truth

This specification covers the static Astro site in `apps/web`. It defines the
SEO, crawlability, and discovery contracts for its existing Vietnamese (`vi`)
and English (`en`) routes. It does not change the rendered editorial UI or add
a CMS, server adapter, or sitemap integration.

`apps/web/astro.config.mjs` already configures `output: 'static'`, manual i18n
routing, and `site` from `SITE_URL`, then `CF_PAGES_URL`, then
`http://localhost:4321`. `apps/web/src/content.config.ts` already has typed
`description`, `canonicalUrl`, `draft`, and `noindex` frontmatter. The work
must consume those conventions rather than introduce a parallel configuration
or a frontmatter migration.

The public HTML route families are:

| Route family | Current owner |
| --- | --- |
| `/:lang/` | `apps/web/src/pages/[lang]/index.astro` |
| `/:lang/blog` | `apps/web/src/pages/[lang]/blog/index.astro` |
| `/:lang/blog/:slug` | `apps/web/src/pages/[lang]/blog/[slug].astro` |
| `/:lang/about` | `apps/web/src/pages/[lang]/about.astro` |
| `/:lang/categories/:category` | `apps/web/src/pages/[lang]/categories/[category].astro` |
| `/:lang/tags/:tag` | `apps/web/src/pages/[lang]/tags/[tag].astro` |

The root `apps/web/src/pages/index.astro` remains a static 200 document with a
meta refresh to `/vi/`; it is not a deploy-provider HTTP redirect. The generic
and localized 404 documents remain owned by `apps/web/src/pages/404.astro` and
`apps/web/src/pages/[lang]/404.astro`, with `apps/web/src/middleware.ts`
preserving a 404 status during development/SSR handling.

## Current gaps

| Area | Current evidence | Required correction |
| --- | --- | --- |
| SEO ownership | `BaseLayout.astro` accepts unstructured primitive props and stringifies arbitrary `jsonLd` directly at lines 22–35 and 129. `content-utils.ts` separately owns canonical and alternate helpers at lines 29–40. | Give URL resolution, metadata construction, JSON-LD serialization, and sitemap XML serialization one tested SEO module. |
| Absolute URL fallback | Several pages set `const siteUrl = Astro.site?.origin ?? ''` (for example `[lang]/index.astro:28`, `[lang]/blog/index.astro:24`, and `[lang]/tags/[tag].astro:37`). `BaseLayout.astro:54–59` then applies a different fallback. | Resolve the origin once per rendered page and never pass an empty origin into canonical, alternate, or schema builders. |
| Content overrides | The post page destructures `excerpt` but not `description` or `canonicalUrl` at `[lang]/blog/[slug].astro:63–73`; it passes `excerpt` and a route canonical at lines 179–192. | Make non-blank `post.data.description` the post metadata/schema/RSS fallback preference and honor an authoritative `post.data.canonicalUrl`. |
| Alternate correctness | `getAlternateUrls()` blindly emits both locale paths for every path in `content-utils.ts:35–40`. Post pages use it without proving a translated post exists (`[lang]/blog/[slug].astro:93–94`), and category pages do the same (`[lang]/categories/[category].astro:56–57`). | Emit an alternate only for an existing, public equivalent route. Do not advertise a synthetic cross-locale post or empty taxonomy page. |
| Tag alternates and language switching | `[lang]/tags/[tag].astro:97–104` passes no `alternateUrls`; `LanguageSwitcher.astro:15–29` derives a target by rewriting the path, regardless of whether that route exists. | Supply separate counterpart-aware `headAlternates` and `switcherLinks` maps; render only available language links. |
| Taxonomy generation | `[lang]/categories/[category].astro:15–32` and `[lang]/tags/[tag].astro:15–32` use global `getAllCategories()`/`getAllTags()` and generate every value for both locales. | Generate a taxonomy route only from that locale's public posts; no zero-result taxonomy HTML files are built. |
| Structured data | Breadcrumbs use a site root instead of the localized home (`[lang]/blog/index.astro:63–76`, `[lang]/about.astro:58–65`) and relative blog URLs (`[lang]/categories/[category].astro:82–87`, `[lang]/tags/[tag].astro:81–86`). The About page emits only a breadcrumb. | Build route-aware schemas with absolute localized URLs, `inLanguage`, and the required route-specific node set. |
| Head metadata | `BaseLayout.astro:76` has a relative RSS discovery link but no sitemap link; lines 106–125 omit `og:locale:alternate`, image alt metadata, article section/tag metadata, and Twitter image alt. `article:author` is emitted for all page types because `author` defaults at line 45. | Make the layout's typed metadata contract own exactly the tags appropriate to a website versus article page. |
| Sitemap | `sitemap.xml.ts` omits About, adds `changefreq`/`priority`, inserts unescaped XML, uses time-of-build `new Date()` fallbacks, and emits no alternate namespace or duplicate check (lines 17–76). | Retain the endpoint but make its URL set deterministic, public-only, absolute, escaped, duplicate-free, and alternate-aware. |
| Discovery drift | The authoritative catalog points at `/sitemap-index.xml` in `agent-metadata.ts:67–70`; the localized home markdown does so at `[lang]/index.md.ts:65–70`; the shipped agent skill does so at `agent-skills/read-blog/SKILL.md:17–24`. The actual route is `/sitemap.xml`. | Advertise `/sitemap.xml` in every discovery surface and verify that no generated artifact contains the stale endpoint. |
| Public-content consistency | `cms.ts` correctly filters drafts and noindex posts by default (lines 7–20), but `api/posts.json.ts:7–20` reads the collection directly and filters only `noindex`; the localized markdown pages construct post links from `post.id` (`[lang]/index.md.ts:41,51` and `[lang]/blog.md.ts:30–32`). | Make RSS, API JSON, markdown discovery, route generation, taxonomy, and sitemap all use the same public-post predicate and route builders. |
| Redirect, 404, and test coverage | Root has only a title and refresh (`index.astro:7–14`). 404 uses `noindex, nofollow` through the layout. Existing `e2e/pages/i18n.spec.ts` checks a subset of canonical/hreflang output, while `playwright.config.ts:73–79` starts the dev server rather than the built site. | Define non-indexable document behavior and verify the final static output, not only development rendering. |

## Goals

1. Provide one typed, framework-light SEO contract for every public HTML page.
2. Produce one absolute canonical URL for each indexable document, accurate
   reciprocal hreflang annotations only where localized equivalents exist, and
   consistent Open Graph, Twitter, robots, and JSON-LD output.
3. Make public-content visibility a single rule across static paths, taxonomy,
   RSS, sitemap, JSON, markdown, and machine-readable discovery surfaces.
4. Keep the existing custom sitemap authoritative and align it with
   `robots.txt`, HTML discovery links, the API catalog, generated agent skills,
   and localized markdown.
5. Verify the contracts with unit tests, static-preview Playwright tests, and
   direct `dist` inspection.

## Explicit non-goals

- No production-code implementation is part of this specification.
- No redesign, navigation rewrite, content rewrite, translation work, or URL
  migration.
- No new CMS, dynamic rendering adapter, search product, locale, or separate
  locale RSS feeds.
- No addition of `@astrojs/sitemap`, a second sitemap endpoint, or a sitemap
  index.
- No host-specific redirect or response-header configuration. The project is
  deployed as generic static `apps/web/dist` output, so HTTP-only behaviour
  that cannot survive static deployment is not a correctness dependency.
- No claims about rankings or crawler adoption outside what the built site can
  expose and test.

## Architecture and data contracts

### Canonical origin and URL rules

Create `apps/web/src/lib/seo.ts` as the sole owner of SEO URL and serialization
logic. It may import `SITE`, `SUPPORTED_LOCALES`, and the existing route helpers,
but it must not import Astro components or `Astro` globals so Vitest can run it
directly.

The module must expose typed constructors rather than let pages assemble URL
strings. The implementation may choose equivalent internal names, but the
following contracts are required:

```ts
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type JsonLdNode = {
  '@context': 'https://schema.org'
  '@type': string | string[]
  [key: string]: JsonValue
}

interface SeoImage {
  url: string // absolute URL
  alt: string
  width: 1200
  height: 630
  type: 'image/png' | 'image/webp'
}

interface SeoArticle {
  publishedTime: string // ISO 8601
  modifiedTime: string // ISO 8601
  author: string
  section: string
  tags: string[]
}

interface SeoIndexablePageBase {
  title: string // already localized and in "{page} | DanhThanh.dev" form
  description: string
  canonicalUrl: string // normalized absolute URL
  lang: SupportedLocale
  indexable: true
  headAlternates: Partial<Record<SupportedLocale, string>> // absolute hreflang URLs only
  switcherLinks: Partial<Record<SupportedLocale, string>> // local navigation paths only
  image: SeoImage
  jsonLd: JsonLdNode[]
}

interface SeoIndexableWebsitePage extends SeoIndexablePageBase {
  kind: 'website'
  article?: never
}

interface SeoIndexableArticlePage extends SeoIndexablePageBase {
  kind: 'article'
  article: SeoArticle
}

interface SeoNonIndexablePage {
  title: string
  description: string
  lang: SupportedLocale
  indexable: false
  switcherLinks?: Partial<Record<SupportedLocale, string>> // explicit local home links only
}

type SeoPage = SeoIndexableWebsitePage | SeoIndexableArticlePage | SeoNonIndexablePage
```

`resolveSiteOrigin(site, requestUrl)` must use `Astro.site.origin` when present,
otherwise the request origin, with `http://localhost:4321` only as the final
test/development fallback. It must normalize a trailing slash away and reject a
non-HTTP(S) origin. `absoluteUrl(origin, path)` must preserve the established
route shape: `/:lang/` for home and no forced trailing slash for the current
blog, About, post, tag, and category routes.

Add `getAboutPath(locale)` to `apps/web/src/lib/routes.ts`, following the
existing `getBlogPath()`/`getHomePath()` convention and returning
`getLocalizedPath(locale, '/about')`. The Article schema author profile URL is
always `absoluteUrl(origin, getAboutPath(lang))`; it is not the site root or an
invented author route.

`post.data.canonicalUrl` is valid only when it is an absolute URL with `http:`
or `https:` protocol. Update the existing optional `canonicalUrl` field in
`apps/web/src/content.config.ts` from bare `z.url()` to `z.url().refine(...)`
that parses the URL and accepts only those protocols. An invalid value is a
content-schema/build validation error; it must never silently fall back to the
local route. Vitest must cover valid HTTPS, valid localhost HTTP, and rejected
relative, malformed, and non-HTTP(S) values. This is a validation tightening of
an existing optional field, not a frontmatter rename or migration.

The only source of a post's metadata description is, in order: a trimmed,
non-empty `post.data.description`; `post.data.excerpt`; then `SITE.description`.
This description is shared by the HTML meta tags, Open Graph, Twitter, Article
schema, RSS item description, API payload, and markdown summary.

Canonical selection is ordered and must be evaluated before alternates:

1. A valid absolute `post.data.canonicalUrl`, when the rendered page is a post.
2. The absolute URL created from the current localized route path.
3. The layout's absolute request-path fallback, only for callers that failed to
   supply a finalized page contract.

An explicit override is authoritative. The design keeps two deliberately
separate locale maps:

- `headAlternates` contains only absolute hreflang URLs for the current local
  route and proven public equivalents. It is empty when the resolved canonical
  is external or differs from the generated local route URL; therefore those
  pages emit no hreflang, `x-default`, or Open Graph alternate-locale metadata.
- `switcherLinks` contains only local public navigation paths. It is independent
  of canonical policy: an external/different-route canonical post still keeps
  its current local route and any proven local translation links in the UI.
  This lets readers navigate the local site without falsely presenting those
  links as SEO alternate documents. Root and 404 pages must explicitly provide
  only the localized home links they intend to show; there is no regex fallback.

This avoids declaring translations for a document whose canonical is another
resource without making the UI strand a reader on a valid local route.

For posts, an equivalent is a public post in the other locale with the same
`getPostSlug()` value; the current content uses matching slugs in
`src/content/posts/vi` and `src/content/posts/en`. The contract intentionally
does not infer translation equivalence from title, category, or publication
date. For home, blog, and About, both locale routes are equivalents. For a tag
or category, an equivalent exists only when that term has at least one public
post in that locale. `headAlternates` includes the current locale and every
proven counterpart only for a locally canonical page; emit `x-default` only
when that map contains `vi`, pointing to that Vietnamese URL. `switcherLinks`
uses the same public-route equivalence test but has no `x-default` concept.

### JSON-LD and sitemap serialization

`JsonLdNode` and recursive `JsonValue` above must be the only JSON-LD payload
types accepted by the SEO module. The SEO module
must serialize JSON-LD once, escaping `<`, `>`, `&`, U+2028, and U+2029 before
the value reaches an inline `application/ld+json` script. Pages must not call
`JSON.stringify()` for JSON-LD themselves.

The same module must provide XML escaping and sitemap entry construction. XML
text values must escape `&`, `<`, `>`, `"`, and `'`; URL entries must be unique
by final absolute `<loc>`. All generated sitemap `lastmod` values use
`YYYY-MM-DD` from content dates. When a static page has no meaningful content
date, omit `lastmod`; never use `new Date()` as a fallback.

## Base layout metadata contract

`apps/web/src/layouts/BaseLayout.astro` becomes the only component that renders
head SEO tags, except for `apps/web/src/pages/index.astro`: the root is the
intentional standalone non-indexable refresh document and must render its own
minimal head. All localized HTML route pages build a `SeoPage` and pass it as
one prop, while the layout may keep presentation-only props such as `lang` and
`currentPath` until the language switcher receives `switcherLinks` directly.

For every indexable `SeoPage`, the layout must render exactly one each of:

- `<title>`, non-empty description, `robots` (`index, follow`), and canonical;
- absolute RSS and sitemap discovery links for `/rss.xml` and `/sitemap.xml`;
- `hreflang` entries from `headAlternates` and the conditional `x-default`;
- `og:title`, `og:description`, `og:type`, `og:url`, `og:image`,
  `og:image:alt`, `og:image:width`, `og:image:height`, `og:image:type`,
  `og:site_name`, `og:locale`, and `og:locale:alternate` for each other
  available locale;
- `twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`,
  `twitter:image`, and `twitter:image:alt`; and
- one safely serialized JSON-LD script for the page node array.

All canonical, `headAlternates`, Open Graph, Twitter image, JSON-LD URL, RSS,
and sitemap discovery URLs must be absolute. `switcherLinks` are intentionally
local navigation paths. The default image is the existing
absolute `/og-image.png`; a post cover image uses its resolved absolute URL,
its title as alt text, and the existing 1200×630 PNG/WebP metadata convention.

For `kind: 'article'`, and only that kind, emit `article:published_time`,
`article:modified_time`, `article:author`, `article:section`, one
`article:tag` per tag, `meta[name=author]`, and `twitter:creator`. Website
pages must not receive article-only tags merely because a default author exists.
Keep the existing `theme-color`, favicon, theme script, and WebMCP context; do
not add a generator meta tag.

For a non-indexable page, render `robots` as `noindex, follow` and omit
canonical, hreflang, sitemap/RSS discovery, social cards, and JSON-LD. This is
the contract for root redirect and 404 documents, not for public content.

## Route-specific behaviour

Each route page remains responsible for localized copy and route data; it uses
the SEO constructors for canonical, alternate, image, and schema values.

| Route family | Required JSON-LD | Additional behaviour |
| --- | --- | --- |
| `/:lang/` | `WebSite`, `Person`, and `WebPage` | Localized canonical/home URL, localized description, reciprocal home `headAlternates`. |
| `/:lang/blog` | `CollectionPage` and `BreadcrumbList` | Breadcrumb is localized home → localized blog. Include the route even when its locale has no posts. |
| `/:lang/blog/:slug` | `Article` and `BreadcrumbList`; `FAQPage` only when `PostFAQ.astro` renders one or more visible FAQ items | Use the content description/canonical precedence, cover image, `absoluteUrl(origin, getAboutPath(lang))` as author profile URL, dates, section, tags, `wordCount`, `inLanguage`, and `mainEntityOfPage.@id` equal to the final canonical. |
| `/:lang/categories/:category` | `CollectionPage` and `BreadcrumbList` | Build only when the category has a public post in that locale; breadcrumb is localized home → localized blog → category. |
| `/:lang/tags/:tag` | `CollectionPage` and `BreadcrumbList` | Build only when the tag has a public post in that locale; same breadcrumb rule. |
| `/:lang/about` | `ProfilePage`, `Person`, and `BreadcrumbList` | Canonical localized About URL, localized home → About breadcrumb, and reciprocal About `headAlternates`. |

Every schema node that represents a page must use its final canonical URL and
include `inLanguage: 'vi'` or `'en'`. Every breadcrumb `item` value must be an
absolute URL, including localized home and blog values. Schema must describe
only visible content: FAQ JSON-LD is omitted for an empty `faq` array, and no
schema is generated for non-indexable pages.

`apps/web/src/components/LanguageSwitcher.astro` must consume `switcherLinks`
rather than derive paths by regex. It shows only supplied local public links
and marks the current locale. On an external/different-route canonical post it
may show a proven local translation link, but it must not add SEO head
alternates. Root and 404 pages may show only their explicitly supplied localized
home links. It must not link a user from a one-locale post, tag, category, or
404 page to an ungenerated path.

## Public content and machine-readable endpoints

`isPublicPost()` in `apps/web/src/lib/post-visibility.ts` is the visibility
authority: a post is public only when neither `draft` nor `noindex` is true.
All content consumers must apply `isPublicPost()` through the existing `cms.ts`
public-query helpers or another shared helper; none may maintain a second
draft/noindex predicate. The one intentional direct collection reader,
`apps/web/src/lib/content-graph.ts`, must import and call `isPublicPost()`
instead of maintaining its local
`isPublished()` predicate. It keeps its existing locale filter, slug de-duplication,
tag/series graph, and `getSlug()` export so `apps/web/src/components/BlogFilter.astro`
continues to consume the same public post graph and slug behaviour.

- Post, tag, and category `getStaticPaths()` include only public content.
  Taxonomy paths are generated from each locale's public terms, not from
  global values.
- Draft and noindex posts are absent from public post pages, home/blog lists,
  related posts, categories, tags, Pagefind input, sitemap, RSS, API JSON, and
  localized markdown. A noindex post is not emitted as a public page merely to
  put a robots tag on it.
- `apps/web/src/pages/api/posts.json.ts` returns only public posts: both
  `draft` and `noindex` are excluded. Preserve the existing compatibility keys
  `slug`, `locale`, `title`, `excerpt`, `category`, `tags`, `publishedAt`, and
  `url`; do not rename or remove them. Add `description: string`, populated by
  the shared non-blank description fallback, while `excerpt` remains the stored
  frontmatter excerpt. `url` is the authoritative absolute `canonicalUrl` when
  present, otherwise the absolute local route canonical. `slug` and `locale`
  retain the local route identity when `url` is external or a different route.
- `apps/web/src/pages/[lang]/index.md.ts` and
  `apps/web/src/pages/[lang]/blog.md.ts` use the shared route/SEO helpers rather
  than `post.id`, so local-route identity does not duplicate the locale segment.
  Every markdown post entry uses the authoritative canonical URL as its link
  target and contains exactly these adjacent lines:

  ```md
  - [<title>](<canonical-url>)
    - Description: <description-fallback>
  ```

  The localized home featured entry follows the equivalent format with a
  `###` title link immediately followed by `Description: <description-fallback>`.
  Feed and sitemap links are absolute and name `/sitemap.xml`.
- `apps/web/src/pages/rss.xml.ts` remains one mixed-language public feed. Its
  item links use the authoritative canonical URL and its descriptions use the
  same shared fallback. Preserve the existing RSS item compatibility fields
  (`title`, `pubDate`, `description`, `link`, `categories`, `author`, and
  `customData`) and retain the stored excerpt in the existing `customData`
  paragraph. Remove the inaccurate channel `<language>vi</language>` rather
  than claiming a single language; retain the existing `content:encoded`
  namespace workaround and emit valid CDATA-safe item content.

Machine-readable responses (`/api/posts.json`, `/*.md`, `/auth.md`, and
`/.well-known/*`) remain discoverable, parseable resources but are not HTML
documents, are never included in the sitemap, and never receive HTML metadata
or hreflang. Keep `robots.txt` disallowing `/api/` and allowing the sitemap,
RSS, markdown, and `/.well-known` discovery resources. Do not make an
`X-Robots-Tag` response header an acceptance requirement: generic static
`dist` deployment does not preserve Astro endpoint response headers uniformly.
If a deployment later needs such headers, configure them at that host without
changing the endpoint body contract.

The root static refresh document must set `noindex, follow`, retain its visible
`/vi/` fallback link and zero-second refresh, and omit canonical, alternates,
social cards, and JSON-LD. Both 404 templates must render `noindex, follow`
with the same omissions. The generic 404 must continue to choose `vi` or `en`
copy from the request path and, where middleware runs, return status 404.

## Sitemap, robots, and agent discovery

### Decision: retain the custom sitemap

Keep `apps/web/src/pages/sitemap.xml.ts` as the sole `/sitemap.xml` producer;
do not add `@astrojs/sitemap`. The current application already has custom
locale-aware content queries, a public-post predicate, dynamic tags/categories,
and an endpoint at this exact path. An integration would either need a second
source of route/visibility truth or substantial exclusion glue while still not
providing the repository's counterpart-aware `xhtml:link` entries. Evolving
the existing endpoint keeps public visibility, route generation, and sitemap
serialization in one implementation path.

The custom sitemap must:

- include a localized home, blog, About, post, tag, or category URL only when
  it is a public, indexable static route whose final canonical is that same
  local absolute route URL;
- exclude `/`, 404 documents, RSS, JSON, markdown, `.well-known` resources,
  drafts, noindex posts, empty taxonomy routes, and posts with an external or
  different-route canonical override;
- use the sitemap namespace plus `xmlns:xhtml` when alternate links are
  present; emit only the same `headAlternates` proven for the HTML head;
- use one escaped, absolute `<loc>` per URL, deterministic optional `lastmod`,
  and no `changefreq` or `priority`; and
- derive all paths from the route/SEO helpers and reject duplicate locations
  before returning XML.

`apps/web/src/pages/robots.txt.ts` must emit one absolute `Sitemap:` line for
`/sitemap.xml` and retain the existing Content-Signal values. The catalog
returned by `getApiCatalogLinks()`, its HTTP `Link` header value where
middleware is active, `apps/web/agent-skills/read-blog/SKILL.md`, and the
localized home markdown all must advertise `/sitemap.xml`, never
`/sitemap-index.xml`. The generated agent-skills index is rebuilt by the
existing `apps/web/scripts/generate-agent-skills-index.mjs` during `pnpm build`;
tests must inspect that generated output as well as the source catalog.

## Verification contract

### Vitest

Add focused tests beside the SEO helpers and extend the existing CMS/agent
metadata tests. They must cover:

- origin normalization and absolute route URLs for configured and localhost
  origins;
- description precedence, explicit canonical precedence, and suppression of
  `headAlternates` when an override differs from the generated local URL while
  retaining proven `switcherLinks`;
- counterpart-aware alternates for home/blog/About, matched posts, one-locale
  posts, and locale-specific taxonomy terms, including conditional `x-default`;
- blank/whitespace-only content descriptions falling back to `excerpt`, then
  `SITE.description`, and API/markdown preservation of both `excerpt` and the
  computed `description` field/line;
- external and different-route canonical fixtures: API `url`, RSS item `link`,
  and markdown title link use the authoritative override, while API `slug`,
  `locale`, and `excerpt` retain their local compatibility values;
- safe JSON-LD serialization (the script text has no raw HTML-sensitive
  characters and parses back to the original JSON value);
- article-only versus website-only metadata input construction;
- XML escaping, duplicate rejection, deterministic `lastmod`, no empty
  taxonomy URLs, sitemap `headAlternates`, and exclusion of an external or
  different-route canonical post from the local sitemap;
- public visibility for draft/noindex posts across route and discovery helper
  inputs, including `content-graph.ts` reuse of `isPublicPost()` without a
  `BlogFilter.astro` behaviour change; and
- `/sitemap.xml` as the sitemap catalog target and absence of the stale target
  in agent metadata source values.

### Playwright against static preview

Change the root `playwright.config.ts` to start the existing build-and-preview
command (`pnpm web:e2e:server`) instead of `pnpm web:dev`. Its `webServer.env`
must set `SITE_URL: 'http://localhost:4321'` and clear `CF_PAGES_URL` (while
preserving unrelated inherited variables), so the build cannot use a deployment
origin. Extend `e2e/pages/i18n.spec.ts` or add a focused SEO spec, and extend
`e2e/agent-discovery.spec.ts`, to test built output for both
`vi` and `en` representative routes:

- `/vi/`, `/en/`, `/vi/blog`, `/en/blog`, `/vi/about`, `/en/about`;
- matching post pair `/vi/blog/getting-started-with-astro-5` and
  `/en/blog/getting-started-with-astro-5`;
- `/vi/categories/tutorials`, `/en/categories/tutorials`, `/vi/tags/astro`,
  and `/en/tags/astro` while those committed fixtures remain public.

For each representative HTML page, assert status, `html[lang]`, one title,
description, robots, canonical, absolute social/discovery URLs, no duplicate
canonical/hreflang entries, reciprocal alternates where applicable, and parsed
JSON-LD type/absolute URL requirements. Assert that every emitted alternate
returns a public 200 page and that it reciprocates.

Also assert the root response is the non-indexable refresh document and, in
static preview only, that a missing page returns status 404 with a
non-indexable 404 document; neither has canonical/hreflang/JSON-LD. Fetch and
parse `/sitemap.xml`, `/robots.txt`, `/rss.xml`,
`/api/posts.json`, `/auth.md`, localized markdown, the API catalog, and the
agent skill index. Verify their content types and public data rules; verify the
robots/catalog/markdown/skill artifacts name `/sitemap.xml`; verify every
sitemap `<loc>` is unique, locally canonical, public, and resolvable; verify
the API retains `excerpt`, adds the fallback `description`, and uses the
authoritative canonical `url`; and verify RSS contains only public posts, uses
authoritative canonical item links, and retains the content namespace.

### Direct build-artifact check

Add `apps/web/scripts/verify-seo-dist.mjs` and a package script that run after
`pnpm web:build`. The script reads `apps/web/dist` without a dev server and
fails if expected localized HTML files or endpoint artifacts are absent, an
indexable document has missing/relative/duplicate head URLs, the root document
or `404.html` is indexable, `/sitemap.xml` is absent, or any built text contains
`sitemap-index.xml`. It must also compare sitemap locations to the generated
locally canonical, indexable public route files so a passing endpoint test
cannot hide an omitted static artifact. It does not assert an HTTP status for
`404.html`; XML structure is parsed in the browser-level Playwright test, while
the artifact check validates the files actually produced by Astro.

The verification command set is:

```bash
pnpm web:test
pnpm web:typecheck
pnpm web:build
pnpm verify:seo:dist
pnpm test:e2e
pnpm check
```

## Risks and decisions

| Risk | Decision and mitigation |
| --- | --- |
| `SITE_URL` is missing or malformed in CI/deployment | Keep Astro's documented localhost fallback for local work; normalize and validate it in the SEO helper so invalid non-HTTP(S) values fail predictably rather than producing relative metadata. |
| A post exists in one locale only | Matching slug is the only translation key. Suppress the unavailable locale in metadata and the language switcher; do not invent a route. |
| An editor points `canonicalUrl` elsewhere | Treat the valid absolute override as authoritative; empty `headAlternates` and exclude the local page from the sitemap, while preserving only proven local `switcherLinks`. Unit-test external and same-origin-but-different overrides. |
| Taxonomy content changes between locales | Use locale-specific public terms for paths, `headAlternates`, sitemap, and switcher links. Empty pages cannot leak into the static build. |
| Static hosting drops route response headers | Keep crawlability correctness in static HTML, XML, text, and JSON bodies; do not rely on `X-Robots-Tag` without provider configuration. |
| Sitemap implementation diverges from route generation | Keep the custom sitemap and its static paths dependent on the same public-route/counterpart helpers; parse and resolve every generated location in tests. |
| SEO tests pass only in dev | Playwright runs against `astro preview` after a build, and the separate checker reads `apps/web/dist`. |
| Agent documentation becomes stale after build | Update the source catalog and skill, then inspect the build-generated index/artifacts in E2E and dist checks. |

## Acceptance criteria

1. Every indexable localized HTML page has one non-empty title/description,
   `index, follow`, one absolute canonical, accurate absolute social metadata,
   and only proven `headAlternates`; UI `switcherLinks` are independently
   constrained to proven local public routes.
2. A public post honors its `description` and valid `canonicalUrl` frontmatter;
   a canonical override that is not the generated route empties
   `headAlternates`, retains only proven UI switcher links, and excludes the
   local route from the sitemap. Invalid, relative, malformed, and non-HTTP(S)
   canonical values fail content validation rather than falling back.
3. JSON-LD is safely serialized, parses successfully, uses absolute URLs and
   `inLanguage`, and matches the route-specific table above. FAQ schema exists
   only for visible FAQ content.
4. Both draft and noindex content, and empty taxonomy pages, are absent from
   static paths, lists, Pagefind, RSS, API JSON, markdown discovery, and the
   sitemap. API retains its `excerpt` compatibility field and adds the shared
   fallback `description`; markdown adds the specified computed `Description:`
   line.
5. `/` and 404 pages are `noindex, follow` and have no canonical, alternates,
   social cards, or JSON-LD. The root keeps its existing `/vi/` static refresh
   behaviour; preview E2E verifies 404 status, while direct dist verification
   checks only the non-indexable `404.html` artifact.
6. `/sitemap.xml` is the only advertised sitemap and contains every and only
   locally canonical, indexable public static HTML route with valid escaped XML,
   no duplicates, deterministic dates, and counterpart-aware `xhtml:link`
   entries.
7. `robots.txt`, the API catalog and middleware link data, localized markdown,
   the source agent skill, and generated build artifacts contain
   `/sitemap.xml` and no `sitemap-index.xml`.
8. Vitest, static-preview Playwright, and the direct `dist` checker pass using
   the commands in this specification, along with the existing `pnpm check`.

## File-impact map

| Path | Intended responsibility |
| --- | --- |
| `apps/web/src/lib/seo.ts` | New framework-light SEO contracts, URL/origin resolution, alternates, JSON-LD serialization, XML/sitemap helpers. |
| `apps/web/src/lib/seo.test.ts` | New unit coverage for the SEO contracts and serializers. |
| `apps/web/src/lib/content-utils.ts` and `apps/web/src/lib/routes.ts` | Keep locale/path primitives; add `getAboutPath(locale)` and route duplicated canonical/alternate construction through the SEO contract. |
| `apps/web/src/content.config.ts` | Tighten the existing optional `canonicalUrl` schema to absolute HTTP(S) URLs; invalid content fails validation and no field is renamed. |
| `apps/web/src/lib/cms.ts` and `apps/web/src/lib/post-visibility.ts` | Expose/reuse public locale taxonomy and post-equivalence queries for all route/discovery callers. |
| `apps/web/src/lib/content-graph.ts` and `apps/web/src/lib/content-graph.test.ts` | Replace the duplicated direct-collection visibility predicate with `isPublicPost()` while preserving the locale graph, slug/tag/series outputs, and `BlogFilter.astro` consumer behaviour. |
| `apps/web/src/layouts/BaseLayout.astro` | Consume one `SeoPage`; render the exact head contract. |
| `apps/web/src/components/LanguageSwitcher.astro` | Render only counterpart-aware language links supplied by the page. |
| `apps/web/src/pages/[lang]/index.astro` | Home SEO page/schema contract. |
| `apps/web/src/pages/[lang]/blog/index.astro` | Blog collection SEO page/schema contract. |
| `apps/web/src/pages/[lang]/blog/[slug].astro` | Content override, article/FAQ schema, post counterpart, and article metadata contract. |
| `apps/web/src/pages/[lang]/about.astro` | ProfilePage/Person/About breadcrumb contract. |
| `apps/web/src/pages/[lang]/categories/[category].astro` | Locale-specific taxonomy static paths, SEO page, and absolute schema breadcrumb. |
| `apps/web/src/pages/[lang]/tags/[tag].astro` | Locale-specific taxonomy static paths, alternates, and absolute schema breadcrumb. |
| `apps/web/src/pages/index.astro`, `apps/web/src/pages/404.astro`, `apps/web/src/pages/[lang]/404.astro` | Explicit non-indexable redirect/404 head behaviour. |
| `apps/web/src/pages/sitemap.xml.ts` and `apps/web/src/pages/robots.txt.ts` | Retained custom sitemap and canonical robots sitemap directive. |
| `apps/web/src/pages/rss.xml.ts`, `apps/web/src/pages/api/posts.json.ts`, `apps/web/src/pages/[lang]/index.md.ts`, `apps/web/src/pages/[lang]/blog.md.ts`, `apps/web/src/pages/[lang]/about.md.ts` | Shared public-content URLs/descriptions and accurate machine-readable discovery text. |
| `apps/web/src/lib/agent-metadata.ts`, `apps/web/src/lib/agent-metadata.test.ts`, `apps/web/agent-skills/read-blog/SKILL.md` | Canonical sitemap discovery data and stale-reference regression coverage. |
| `apps/web/scripts/verify-seo-dist.mjs`, `apps/web/package.json`, `package.json` | Post-build artifact verifier and workspace command wiring. |
| `playwright.config.ts` (repository root), `e2e/pages/i18n.spec.ts`, new focused SEO E2E spec if needed, `e2e/agent-discovery.spec.ts` | Static-preview route, metadata, sitemap, RSS, machine-readable, and agent-discovery verification with a forced localhost `SITE_URL`. |

`apps/web/src/content.config.ts` needs only the specified protocol validation
tightening for its existing optional `canonicalUrl` field; no frontmatter field
is added, renamed, or migrated. `apps/web/astro.config.mjs` requires no sitemap
integration or routing change; its existing `site` and manual i18n configuration
remain authoritative.
