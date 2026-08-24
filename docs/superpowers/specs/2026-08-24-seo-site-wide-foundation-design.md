# Site-wide SEO Foundations Design Spec

**Date:** 2026-08-24  
**Issue:** #14  
**Status:** Implemented and verified; Issue #14 scope complete

## Summary

Issue #14 creates a single build-time SEO foundation for the Astro static site. Every public HTML page will consume a normalized SEO model for canonical, description, robots, Open Graph, Twitter, hreflang, and JSON-LD output. One public-content visibility policy will govern static routes, taxonomies, RSS/API records, Pagefind source, and the XML sitemap.

This is a design-only document. It preserves the site’s visual UI, content URLs, `vi`/ `en` locales, and file-based publishing workflow.

## Goals

1. Centralize shared HTML metadata and structured-data serialization.
2. Use post `description` before `excerpt` everywhere a summary is exposed; use valid `canonicalUrl` before the generated canonical.
3. Generate every canonical, alternate, social, schema, breadcrumb, and sitemap URL as absolute.
4. Emit hreflang only for actual public equivalent pages.
5. Generate locale taxonomy pages only for locale-local public content.
6. Make `/sitemap.xml` deterministic, XML-safe, and consistent with robots and all machine-readable docs.
7. Ensure all index/list routes get `BreadcrumbList` and/or `CollectionPage`, and posts get `Article` and `BreadcrumbList`.
8. Eliminate stale `/sitemap-index.xml`, `/search`, and Pagefind artifact references.
9. Establish focused Vitest, Playwright, and build artifact verification.

## Non-goals

- Do not introduce SSR, a database/CMS, search UI, new route families, or deployment redirect rules.
- Do not infer post translations from matching slug/title/category/tag.
- Do not translate categories or tags automatically.
- Do not change content authoring except for an explicit optional translation identity field.
- Do not change Pagefind configuration, OG-image generation, existing crawler allow/disallow policy, or page visuals.
- Do not alter the current `noindex, nofollow` policy.

## Current-state constraints

- `apps/web/src/layouts/BaseLayout.astro` already emits common tags, but it accepts overlapping primitive props and falls back to request origin; static output can therefore acquire a localhost origin.
- `apps/web/src/lib/content-utils.ts` produces alternate URLs for every locale without proving the corresponding translated page exists.
- `apps/web/src/lib/content-queries.ts` defaults to indexable public posts, while taxonomy static paths in `pages/[lang]/categories/[category].astro` and `tags/[tag].astro` first enumerate global terms, enabling empty locale-local pages.
- `apps/web/src/pages/sitemap.xml.ts` interpolates XML directly and uses `new Date()` for empty collections; both violate deterministic XML output.
- `apps/web/src/lib/agent-metadata.ts` and `pages/[lang]/index.md.ts` advertise `/sitemap-index.xml` and `/search`, but this static app publishes `/sitemap.xml` and no search route. `robots.txt` already uses the correct sitemap.
- `apps/web/src/pages/index.astro` is a meta-refresh redirect with neither `noindex` nor canonical policy. Root/localized 404 pages, API JSON, Markdown, XML, RSS, robots, and `.well-known` surfaces must not become sitemap members or indexable HTML duplicates.

## Architecture

### Responsibilities

| Module                                                       | Responsibility                                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/site.ts`                                            | Site identity and one validated public origin.                                                                               |
| New `src/lib/seo.ts`                                         | URL normalization, SEO document construction, alternate assembly, and safe JSON-LD serialization. It does not query content. |
| New `src/lib/seo-schema.ts` or a focused portion of `seo.ts` | Builders for `WebSite`/Person, `WebPage`/ProfilePage, `CollectionPage`, `Article`, and breadcrumbs.                          |
| `src/lib/post-visibility.ts`                                 | Authoritative draft/noindex classification.                                                                                  |
| `src/lib/content-queries.ts`                                 | Visibility-aware, locale-aware post and taxonomy queries.                                                                    |
| `src/lib/routes.ts`                                          | Relative, URI-encoded route paths only.                                                                                      |
| `src/layouts/BaseLayout.astro`                               | The only renderer of common HTML head output.                                                                                |
| New sitemap manifest helper                                  | Produces indexable route records; `pages/sitemap.xml.ts` serializes only.                                                    |
| RSS/API/agent/robots/Markdown routes                         | Consume shared URL, description, and visibility primitives; advertise only real routes.                                      |

This is one abstraction per concern. The implementation must not retain a second canonical/alternate or hand-rolled visibility implementation in page and machine routes.

### Public-origin invariant

`apps/web/astro.config.mjs` owns public-origin selection and validation; page/layout code never reads an origin from `Astro.url` as a fallback. The config resolves the command from the Astro CLI invocation before creating a static `defineConfig({...})` object, then selects the first non-empty, trimmed value of `SITE_URL`, followed by `CF_PAGES_URL`. It reads those two keys from the web app dotenv files because the package-filtered build runs from `apps/web`. Its validator accepts only absolute `http`/`https` URLs with no query, fragment, credentials, or path other than `/`, then stores the origin without a trailing slash.

For `astro build`, missing or invalid configured origin throws before Astro renders any route, with an error that names `SITE_URL` and `CF_PAGES_URL`. For `astro dev` and Vitest, absence of both variables explicitly selects `http://localhost:4321`; an invalid supplied value still throws. E2E/build tests must set a non-localhost `SITE_URL`. This replaces the current production build fallback while retaining zero-config local development.

Generated URLs use `new URL(relativePath, siteOrigin)` or one equivalent helper. Route builders return paths, never origins. Frontmatter `canonicalUrl` must be a valid absolute `http`/ `https` URL; it is normalized and used as supplied, not combined with the origin.

The content schema changes are exact:

```ts
description: z.string().trim().min(1).optional()
canonicalUrl: z.string()
  .trim()
  .url()
  .refine((value) => {
    const url = new URL(value)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.hash &&
      !url.username &&
      !url.password
    )
  }, 'canonicalUrl must be an absolute HTTP(S) URL without credentials or a fragment')
  .optional()
translationKey: z.string().trim().min(1).optional()
```

`description` containing only whitespace is invalid rather than silently becoming an empty meta description. `canonicalUrl` is stored trimmed; deliberate query strings remain allowed, but fragments, credentials, and non-HTTP(S) protocols are rejected. A collection-level validation pass enforces `translationKey` uniqueness per locale.

### SEO document interface

Exact names may differ; this behavior is mandatory.

```ts
type RobotsDirective = 'index, follow' | 'noindex, nofollow'

interface AlternateLink {
  locale: SupportedLocale
  href: string // absolute
}

interface SeoDocument {
  title: string
  description: string
  canonical?: string // absent for error/redirect HTML
  robots: RobotsDirective
  lang: SupportedLocale
  alternates: AlternateLink[]
  defaultAlternate?: string
  openGraph?: {
    type: 'website' | 'article'
    url: string
    image: string
    imageType: 'image/png' | 'image/webp'
    publishedTime?: string
    modifiedTime?: string
  }
  jsonLd: Record<string, unknown>[]
}

interface IndexableSeoPageInput {
  kind: 'indexable'
  title: string
  description: string
  path: string
  lang: SupportedLocale
  canonicalUrl?: string
  alternates?: AlternateLink[]
  image?: string
  type?: 'website' | 'article'
  publishedTime?: Date
  modifiedTime?: Date
  jsonLd?: Record<string, unknown>[]
}

interface NoindexContentSeoPageInput extends Omit<IndexableSeoPageInput, 'kind'> {
  kind: 'noindex-content'
}

interface NonCanonicalSeoPageInput {
  kind: 'noncanonical'
  title: string
  description: string
  lang: SupportedLocale
  robots: 'noindex, nofollow'
}

type SeoPageInput = IndexableSeoPageInput | NoindexContentSeoPageInput | NonCanonicalSeoPageInput
```

`BaseLayout` receives one `seo: SeoDocument` instead of independent canonical, robots, image, alternate, and schema props. Existing `lang` and `currentPath` chrome props may remain. It emits one title, description, robots, canonical, Open Graph family, Twitter family, and JSON-LD script; it emits each hreflang at most once and no empty values.

For `noncanonical`, the builder returns no canonical, alternates, Open Graph/Twitter fields, or JSON-LD. It is used only by the root redirect and 404 pages. `noindex-content` retains its canonical/content social model but never alternates or sitemap membership. The serializer escapes `<`, `>`, `&`, U+2028, and U+2029 so content cannot terminate `application/ld+json`. Multiple nodes serialize as one JSON array. Empty schema means no JSON-LD script.

## Content, identity, and visibility

### Resolution policy

For every post summary, resolve description as:

1. non-empty `post.data.description`;
2. otherwise `post.data.excerpt`.

The resolved value is used by HTML metadata, OG/Twitter, Article JSON-LD, RSS, API payload, client filter/Pagefind source, and any later machine summary.

Resolve post canonical as:

1. valid non-empty `post.data.canonicalUrl`;
2. generated absolute localized post URL.

An external canonical retains a crawlable local route with `index, follow`, but makes that route non-canonical. The local route is therefore excluded from the sitemap, which contains only this site's canonical indexable URLs; the off-site canonical must never be inserted into this site's sitemap. It also disables post hreflang: an external canonical cannot truthfully assert that local language URLs are equivalents. Article `url` and `mainEntityOfPage` use the resolved canonical.

### Visibility contract

| State                          | Route         | HTML robots         | Lists/taxonomy/RSS/API/Pagefind                                    | Sitemap  | Alternates                |
| ------------------------------ | ------------- | ------------------- | ------------------------------------------------------------------ | -------- | ------------------------- |
| `draft: true`                  | Not generated | N/A                 | Excluded                                                           | Excluded | Excluded                  |
| `noindex: true`, not draft     | Generated     | `noindex, nofollow` | Excluded                                                           | Excluded | Excluded                  |
| Public with local canonical    | Generated     | `index, follow`     | Included                                                           | Included | Only real public siblings |
| Public with external canonical | Generated     | `index, follow`     | Included, with local URL and resolved canonical exposed separately | Excluded | Excluded                  |

`isPublicPost()` remains the default indexable predicate. A separately named route-generation option may include noindex posts; draft posts are never generated. After implementation, no caller hand-rolls draft/noindex checks.

`getAllTags(locale)` and `getAllCategories(locale)` derive terms from public posts after locale filtering. Dynamic `getStaticPaths()` consumes those locale-specific results. A term with no public local member produces no page, alternate, card/count, or sitemap record.

### Translation identity and hreflang

Add an optional frontmatter `translationKey` validated as a stable identity. At most one public post in each locale may use a key; duplicate locale/key is a validation/build error.

- Posts without a key have no post alternates.
- A keyed post emits itself and each public locale sibling with the same key.
- Locale-neutral page kinds (`/`, `/about`, `/blog`) emit both locale alternates.
- Tags/categories emit no cross-locale alternates: their labels and membership are local, and mapping is out of scope.
- Emit `x-default` only when the alternate set has a Vietnamese URL; point it to that URL.
- External-canonical posts have no alternates.

## Route and schema matrix

All HTML titles remain `${title} | ${SITE.name}`. Canonical, hreflang, OG URL/image, Twitter image, schema URL, `mainEntityOfPage`, `isPartOf.url`, publisher/author URL, and every breadcrumb item are absolute.

| Route                                      | SEO and alternate behavior                                  | Required schema                                       | Sitemap                |
| ------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| `/vi/`, `/en/`                             | self canonical; both alternates; Vietnamese x-default       | `WebSite` + Person                                    | Yes                    |
| `/vi/about`, `/en/about`                   | self canonical; both alternates; Vietnamese x-default       | `ProfilePage` + `BreadcrumbList`                      | Yes                    |
| `/vi/blog`, `/en/blog`                     | self canonical; both alternates; Vietnamese x-default       | `CollectionPage` + `BreadcrumbList`                   | Only with public posts |
| Public post, local canonical               | self canonical; only explicit public translation alternates | `Article` + `BreadcrumbList`, conditional `FAQPage`   | Local URL only         |
| Public post, external canonical            | `index, follow`; external canonical; no alternates          | `Article` + `BreadcrumbList` using external canonical | No                     |
| Noindex post                               | noindex; no alternates                                      | content schema allowed, no index assertion            | No                     |
| Public local category/tag                  | self canonical; no alternates                               | `CollectionPage` + `BreadcrumbList`                   | Yes                    |
| `/` redirect, root/localized 404           | noindex; no canonical/social/schema output                  | None                                                  | No                     |
| API/feed/XML/Markdown/robots/`.well-known` | non-HTML, no HTML metadata                                  | N/A                                                   | No                     |

Breadcrumb rules:

- Home `item` is locale home URL, never bare origin.
- Blog `item` is locale blog URL.
- Final crumb has its own absolute canonical URL.
- Positions are contiguous from 1 and labels are localized.
- Collection `url` and `isPartOf.url` use the localized self canonical.

`WebSite` is emitted on locale homes with `@id: ${siteOrigin}/#website`, `url: ${siteOrigin}/vi/`, `name: SITE.name`, `description: SITE.description`, `inLanguage: ['vi', 'en']`, and `publisher: { '@id': '${siteOrigin}/#person' }`. The paired `Person` node has `@id: ${siteOrigin}/#person`, `name: SITE.author`, `url: ${siteOrigin}/vi/about`, and `sameAs: [SITE.social.github, SITE.social.linkedin]`. The site origin is an entity identifier; it is not an HTML canonical.

About pages emit `ProfilePage` with `@id: ${canonical}#webpage`, `url`, `name`, `description`, `inLanguage`, `isPartOf: { '@id': '${siteOrigin}/#website' }`, and `mainEntity: { '@id': '${siteOrigin}/#person' }`, plus their breadcrumb node. Collection pages use the same `isPartOf` reference, their self canonical `url`, localized name/description, and `inLanguage`.

`Article` contains headline, resolved description, `datePublished`, `dateModified` (fallback to `publishedAt`), image when available, canonical `url`/`mainEntityOfPage`, author, and publisher. FAQ remains emitted only for real FAQ data.

### Open Graph, Twitter, and image contract

Every canonical HTML content page emits: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:type`, `og:site_name`, and `og:locale`; article pages additionally emit `article:published_time`, `article:modified_time`, and `article:author`. It also emits `twitter:card=summary_large_image`, `twitter:site`, `twitter:creator`, `twitter:title`, `twitter:description`, and `twitter:image`. Noncanonical redirect/error pages emit none of these fields.

Replace an untyped `image?: string` with a normalized `SeoImage` value: `{ url, type, width, height }`. It accepts only a root-relative path or absolute HTTP(S) URL; the resolver makes the final URL absolute against site origin and rejects a fragment, credentials, or an unsupported/non-image type. The fallback is the generated `/og-image.png` at `1200 × 630` and `image/png`. A custom image must supply verified intrinsic width/height and a supported PNG/WebP MIME type; the resolver must not claim fallback dimensions for an unknown custom asset. Unit tests cover fallback, root-relative, valid absolute, and rejected image inputs.

## Sitemap, robots, and machine surfaces

### Sitemap contract

A pure manifest builder combines the valid origin with visibility-aware content/taxonomy data and returns deterministic records:

```ts
interface SitemapRecord {
  loc: string
  lastmod?: Date
  changefreq?: 'daily' | 'weekly'
  priority?: '0.9' | '1.0'
}
```

The sitemap contains locale homes, locale about pages, non-empty locale blog archives, each public post whose resolved canonical is its own local route, and non-empty locale tag/category pages. It excludes redirect/error pages; draft/noindex content; public posts with an external canonical; empty archives/taxonomies; API, RSS, robots, XML, Markdown, Pagefind/search artifacts, and `.well-known` routes.

Content `lastmod` is `updatedAt ?? publishedAt`. Static pages omit `lastmod`, rather than using build time. The serializer XML-escapes every dynamic text value (`&`, `<`, `>`, `\"`, `'`), produces one standard `urlset`, uses ISO UTC dates, and responds `application/xml; charset=utf-8`. `/sitemap.xml` is the only sitemap endpoint.

### Discovery consistency

- `robots.txt` retains allow/disallow behavior and has exactly the absolute `/sitemap.xml` directive.
- `getApiCatalogLinks()` uses `/sitemap.xml`, never `/sitemap-index.xml`.
- `apps/web/src/pages/auth.md.ts:23` is the stale `/search` occurrence; it and the localized Markdown index remove `/search` until a real public search route exists.
- API stays disallowed in robots and emits public posts only, using resolved description; it excludes drafts and noindex posts. Its `url` remains the local API/read route and a distinct `canonicalUrl` field carries the resolved canonical when it is external; API payloads do not claim that an off-site canonical is an API endpoint.
- RSS consumes the same public visibility/description layer. Each item `link` remains the local published post URL; RSS deliberately carries no canonical-override field and never replaces that item link with an off-site URL.
- Pagefind generated output is not an authored public route and is never advertised.

### Blog filter and Pagefind ownership

`apps/web/src/components/BlogFilter.astro` is the sole server-to-client serializer for blog-card records. `apps/web/src/lib/blog-filter.ts` owns the serialized record type and uses the shared post-presentation resolver for `description`; `apps/web/src/lib/filter.ts` consumes that type and remains search behavior only. The resolver result must reach the serialized `filter-data` payload so custom descriptions match both the HTML metadata and client-side filtering.

`apps/web/src/pages/[lang]/blog/[slug].astro` owns Pagefind marking. Public post pages retain `data-pagefind-body`; noindex post pages must omit it (or use `data-pagefind-ignore=\"all\"` around the article) so they cannot be indexed. Pages without public post content must not introduce `data-pagefind-body`. This follows Pagefind's documented rule that, once public pages use `data-pagefind-body`, pages without it are omitted from the index.

## Data flow

```text
frontmatter
  -> content validation + translation identity
  -> visibility + resolved post presentation
  -> locale query / taxonomy / relative route paths
  -> page schema + SeoPageInput
  -> normalized SeoDocument
  -> BaseLayout head

same visibility/query contract
  -> static paths, RSS, API, Pagefind source
  -> sitemap manifest -> XML

site origin + published-route registry
  -> robots, agent catalog, auth, Markdown docs
```

Page files select page-specific copy/schema context only; they do not construct canonical URLs, robots strings, or alternate maps. Machine surfaces do not choose a different content set than sitemap/public lists.

## Failure policy

| Condition                                | Outcome                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| Invalid/missing production public origin | Fail build and name configuration value.               |
| Invalid frontmatter canonical URL        | Fail validation/build.                                 |
| Duplicate `translationKey` in one locale | Fail validation/build with conflicting IDs.            |
| Missing public translated sibling        | Omit that alternate; build succeeds.                   |
| No public taxonomy members in locale     | Generate no route or sitemap record.                   |
| Noindex static generation                | Render local noindex page only; discovery excludes it. |
| Draft/noindex leaks to public discovery  | Regression; focused test fails.                        |
| XML-sensitive dynamic sitemap value      | Escape it; do not drop record.                         |
| Unpublished route reference              | Remove reference and test actual published route.      |

## Expected implementation boundaries

The later implementation plan must check current Astro 7 APIs before coding and is expected to touch:

- `apps/web/astro.config.mjs`: command-aware site-origin validation before build.
- `apps/web/src/content.config.ts`: trimmed description/canonical validation and optional translation key validation.
- `apps/web/src/lib/site.ts`, `content-utils.ts`, `routes.ts`, `post-visibility.ts`, `content-queries.ts`: origin consumer, public visibility, locale taxonomy primitives.
- New focused SEO/schema/sitemap-manifest modules and Vitest tests under `apps/web/src/lib/`.
- `apps/web/src/layouts/BaseLayout.astro`: normalized head rendering and safe JSON-LD.
- `apps/web/src/pages/index.astro`, `404.astro`, localized HTML routes: route-specific SEO inputs/schema.
- `apps/web/src/components/BlogFilter.astro`, `lib/blog-filter.ts`, `lib/filter.ts`, and `pages/[lang]/blog/[slug].astro`: shared presentation resolver and Pagefind exclusion for noindex posts.
- `apps/web/src/pages/sitemap.xml.ts`, `robots.txt.ts`, `rss.xml.ts`, `api/posts.json.ts`, `auth.md.ts`, `pages/[lang]/index.md.ts`, and `lib/agent-metadata.ts`: shared policy and stale-route cleanup.
- Existing/new focused E2E tests. Do not modify generated `dist/` or Pagefind output.

## Test matrix

### Vitest

| Subject                    | Required cases                                                                                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro origin configuration | Import/call command-aware config with build+missing, build+invalid, dev/test+missing, and supplied invalid values. Assert build throws naming SITE_URL/CF_PAGES_URL; dev/test receives explicit localhost; valid non-localhost value is normalized. |
| Origin/URLs                | Trailing-slash normalization; reject relative/non-HTTP/query/fragment/path/credential origin; absolute locale paths; valid external canonical.                                                                                                      |
| Post resolution            | Description override/fallback reaches BaseLayout, BlogFilter payload, `filterPosts`, RSS, and API; canonical precedence; external-canonical post is excluded from sitemap; image fallback/root-relative/absolute/rejection cases.                   |
| Visibility                 | Draft excluded; noindex render exception explicit; noindex excluded from lists/taxonomy/RSS/API/Pagefind/alternates/sitemap.                                                                                                                        |
| Hreflang                   | Locale-neutral pair+x-default; no-key post none; public sibling only; duplicate key rejects; external canonical none.                                                                                                                               |
| Taxonomy                   | Locale-only term routes only locally; sorted/non-empty terms; draft/noindex-only terms absent.                                                                                                                                                      |
| Schema                     | Correct types; all breadcrumb items including final absolute; Article date fallback/description/canonical; serializer cannot create `</script>`.                                                                                                    |
| Sitemap                    | Exact allowed records; no machine/error/draft/noindex/external-canonical surfaces; stable lastmod; XML-special URL escaping/content type.                                                                                                           |
| Discovery                  | Agent catalog uses sitemap.xml; robots agrees; `auth.md.ts:23` and Markdown contain no stale search/sitemap-index; API/RSS share visibility/description and preserve local route links.                                                             |

Use fixtures for both locales, drafts, noindex, unpaired/duplicate translations, locale-only terms, custom description, external canonical, and XML-sensitive data. Avoid relying on editorial corpus ordering.

### Playwright

Build and preview with a non-localhost `SITE_URL` test origin. Assert:

1. Localized home/about/blog/post/category/tag each have exactly one absolute canonical matching policy.
2. Applicable pages have one robots meta, full OG/Twitter metadata, valid JSON-LD, and no duplicated head tags.
3. Locale-neutral pages have `vi`, `en`, one x-default; unpaired posts and taxonomy pages do not invent alternates.
4. Custom description appears in head, OG/Twitter, Article schema, BlogFilter data/filter result, RSS, and API. External canonical appears in canonical/OG/Article schema, produces no alternates, and excludes its local route from sitemap.
5. Root redirect and 404 pages are noindex with no canonical. XML/API/Markdown/robots have non-HTML content types.
6. robots, sitemap, RSS, API, auth, API catalog, and Markdown docs agree and omit stale strings.
7. Parsed sitemap URLs are absolute/unique/reachable indexable HTML pages and contain no redirect, error, noindex, draft, external-canonical post, API, Markdown, Pagefind, or well-known URL.

### Build gate

Run focused Vitest files, then `SITE_URL=http://seo.test:4321 pnpm build`. Serve the generated `apps/web/dist` on `127.0.0.1:4321` with a temporary `127.0.0.1 seo.test` test-runner host mapping. Run the SEO Playwright spec against `http://seo.test:4321`; the configured origin and fetched artifacts are then identical. Parse the served `/sitemap.xml`, `/robots.txt`, HTML, RSS, API, and Markdown response bodies; do not inspect source routes as a substitute. Remove the temporary host mapping after the test. Do not run project-wide checks solely for this issue.

## Acceptance criteria

1. Every public localized page derives common SEO output from one normalized document rendered once by `BaseLayout`.
2. Post description/canonical precedence applies consistently to all stated HTML and machine consumers.
3. Generated SEO/schema/breadcrumb URLs are absolute and origin-safe; only validated external canonicals are off-origin.
4. Hreflang names only public equivalent resources; x-default exists only for a Vietnamese alternate.
5. Index/list and post schema meet the route matrix, with all breadcrumb items absolute.
6. `getStaticPaths()` for posts calls the explicit route-generation query with `includeNoindex: true` and `includeDrafts: false`; drafts have no route/discovery presence, while noindex pages render exactly once with `noindex, nofollow` and are excluded from all public discovery/taxonomy/Pagefind/sitemap.
7. Locale taxonomy never creates empty cross-locale pages or sitemap records.
8. Exactly `/sitemap.xml` is advertised; it is deterministic, XML-safe, and contains only unique locally canonical indexable HTML routes. Local pages with an external canonical are intentionally excluded.
9. Robots, agent metadata, auth, localized Markdown docs, RSS, and API agree and have no stale sitemap/search/Pagefind references.
10. Redirect/error HTML is noindex/no-canonical; non-HTML artifacts are not indexable pages or sitemap members.
11. `astro.config.mjs` has command-aware origin validation with the stated dev/test/build behavior, and focused tests plus reproducible served-dist artifact inspection pass without unrelated UI or generated-file edits.

## Decisions and tradeoffs

- **External canonical sitemap membership:** exclude the local route. This sitemap represents this site's canonical indexable URLs; inserting a URL that declares another origin canonical sends contradictory discovery signals. The local page stays crawlable with `index, follow` solely so crawlers can observe its canonical.
- **Explicit translations:** slug/title matching is unsafe. `translationKey` is the only truthful hreflang basis; unpaired posts correctly remain without alternates.
- **No synthetic timestamps:** static pages omit `lastmod`, avoiding a sitemap diff on every identical build.
