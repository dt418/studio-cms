# Site-wide SEO Foundations and Validation

- **Date:** 2026-08-24
- **Issue:** [#14](https://github.com/dt418/studio-cms/issues/14)
- **Branch:** `codex/seo-site-wide-foundation`
- **Status:** Draft — awaiting review

## Problem

The site already renders basic SEO metadata, localized routes, structured data,
RSS, robots.txt, and a custom sitemap. The behavior is distributed across page
templates and has drifted in several places:

- post-level `description` and `canonicalUrl` frontmatter are not used by the
  post page;
- the shared layout does not expose all useful social image and locale metadata;
- tag pages omit localized alternates;
- category and tag breadcrumb JSON-LD contains relative URLs;
- taxonomy pages are generated from global values, which can create empty
  locale-specific pages;
- the site serves `/sitemap.xml`, while agent metadata and markdown discovery
  documents refer to `/sitemap-index.xml`;
- JSON-LD serialization is not centralized or explicitly protected against
  HTML-sensitive characters;
- there is no automated contract that checks SEO output across representative
  localized routes and build artifacts.

These inconsistencies can create duplicate URLs, weak search snippets, invalid
structured data, stale discovery links, and regressions that existing visual or
accessibility tests do not detect.

## Goals

1. Establish one typed SEO contract for HTML pages and structured data.
2. Make canonical, hreflang, robots, Open Graph, Twitter, and JSON-LD output
   consistent across all indexable localized routes.
3. Respect content-level SEO overrides without making the existing frontmatter
   migration-heavy.
4. Keep the sitemap aligned with the site's public-content visibility rules.
5. Preserve the current UI, RSS feed, agent discovery endpoints, and content
   signals.
6. Add fast unit checks plus production-like Playwright/build checks so SEO
   behavior is verified in CI.

## Non-goals

- Rewriting article content, titles, translations, or information architecture.
- Adding a CMS, server rendering, or a new search product.
- Changing the visual design or navigation behavior.
- Introducing a second sitemap generator.
- Promising search-engine ranking changes that cannot be verified in the repo.

## Design decisions

### 1. Centralized SEO model and helpers

Add a small SEO module under `apps/web/src/lib/` that owns:

- normalized absolute site origins and route URLs;
- description fallback/normalization;
- locale-to-Open-Graph locale mapping;
- typed page metadata and JSON-LD nodes;
- breadcrumb and alternate URL builders;
- safe JSON-LD serialization that escapes `<`, `>`, `&`, and the line/paragraph
  separator characters before inserting JSON into an inline script;
- XML escaping and sitemap entry serialization shared by sitemap tests.

The helpers must remain framework-light so they can be unit-tested without
rendering Astro pages. Astro components remain responsible for rendering the
final tags.

Canonical precedence is:

1. an explicit valid absolute content `canonicalUrl`;
2. the route-specific localized URL;
3. the current request pathname with the configured site origin as a final
   layout fallback.

When a content canonical points outside the local site, the page must not emit
misleading local language alternates for that content. Local alternates remain
valid when the canonical is the local localized route.

### 2. Shared layout contract

Extend `BaseLayout.astro` with optional, typed inputs for:

- image alt text;
- article section and tags;
- a structured-data payload represented by the SEO module's JSON-LD type.

The layout must emit:

- one non-empty `<title>` and one description meta tag;
- an explicit robots directive (`index, follow` for indexable pages and
  `noindex, nofollow` for non-indexable pages);
- one absolute canonical URL;
- reciprocal `vi`/`en` alternates when the equivalent route exists, plus
  `x-default` pointing to the Vietnamese route;
- `og:title`, `og:description`, `og:type`, `og:url`, absolute `og:image`,
  `og:image:alt`, dimensions, MIME type, site name, current locale, and
  alternate locales where applicable;
- `twitter:card`, site, title, description, absolute image, image alt, and
  creator metadata;
- article publication/modification/author/section/tag metadata for article
  pages;
- absolute RSS and sitemap discovery links;
- `application/ld+json` using the safe serializer.

The configured Astro `site` value remains the source of truth for production
absolute URLs. Local development keeps the existing localhost fallback.

### 3. Route-specific structured data

Keep schemas truthful to the rendered page and include `inLanguage`, canonical
URLs, and absolute breadcrumb items.

| Route family | Structured data |
| --- | --- |
| localized home | `WebSite`, `Person`, and `WebPage` relationship data |
| localized blog index | `CollectionPage` + `BreadcrumbList` |
| localized post | `BlogPosting` + `BreadcrumbList`; `FAQPage` only when visible FAQ content exists |
| localized category/tag | `CollectionPage` + `BreadcrumbList` |
| localized About | `ProfilePage` + `Person` + `BreadcrumbList` |

Article data must use the content description fallback, absolute image URLs,
the author profile URL, publication and modification dates, category/tags,
language, word count when available, and the canonical page as
`mainEntityOfPage`.

The post page must use frontmatter `description` when present and honor an
explicit frontmatter `canonicalUrl`. Existing `excerpt` remains the fallback
for display and metadata.

### 4. Localized route generation and crawlability

- Generate category and tag paths from locale-specific public posts.
- Do not generate empty taxonomy pages.
- Include hreflang on every route where an equivalent localized route exists,
  including tag pages.
- Keep draft and `noindex` posts out of generated public post paths and the
  sitemap.
- Mark the root redirect and 404 pages as non-indexable while preserving their
  navigation behavior.
- Mark machine-readable markdown/JSON discovery endpoints with an appropriate
  `X-Robots-Tag` response where that does not interfere with their explicit
  discovery purpose. Keep robots.txt, RSS, and sitemap responses functional.

### 5. Sitemap and robots strategy

Keep the existing custom `/sitemap.xml` endpoint instead of adding
`@astrojs/sitemap`. The custom endpoint already knows the content collection's
`draft/noindex` rules and the locale-specific taxonomy model; using a second
generator would create two sources of truth.

The sitemap must:

- contain only public, indexable, generated URLs;
- include localized home, blog, About, post, tag, and category URLs when they
  exist;
- use absolute URLs and XML-escape every value;
- include meaningful `lastmod` values from post publication/update dates;
- include locale alternate links using the sitemap `xhtml` namespace;
- omit empty taxonomy pages and optional `changefreq`/`priority` hints;
- remain parseable as XML and free of duplicate `<loc>` values.

`robots.txt`, `<link rel="sitemap">`, agent link metadata, and machine-readable
markdown documents must all advertise `/sitemap.xml`. The stale
`/sitemap-index.xml` references must be removed.

This is consistent with Astro's static sitemap guidance: the deployed `site`
must be an absolute URL and sitemap discovery can be declared in both the HTML
head and robots.txt. See the [Astro sitemap integration
guide](https://docs.astro.build/en/guides/integrations-guide/sitemap/).

### 6. Verification contract

Add Vitest coverage for pure SEO helpers:

- origin/canonical normalization;
- description fallback and bounded metadata values;
- locale alternate generation;
- safe JSON-LD serialization;
- XML escaping and sitemap entry generation.

Add Playwright coverage against production-like output for representative `vi`
and `en` home, blog, post, About, category, and tag pages:

- HTTP status and HTML language;
- title, description, robots, canonical, hreflang, RSS, and sitemap links;
- Open Graph/Twitter absolute URLs and image metadata;
- JSON-LD parsing and expected schema types;
- no duplicate canonical or hreflang entries;
- robots.txt, sitemap.xml, and RSS XML responses;
- sitemap URLs resolve to public pages and do not include noindex/empty routes.

Add a build-artifact check that runs after Astro build and validates the same
invariants against `dist/`, so a server-only test cannot hide static output
regressions.

## Acceptance criteria

The implementation is complete when:

1. All indexable localized HTML pages have non-empty title/description,
   absolute canonical URLs, correct language, and valid reciprocal alternates.
2. Page-specific structured data parses and matches the route's rendered
   content.
3. Content SEO overrides are honored and noindex/draft content is excluded from
   public route generation and sitemap output.
4. Breadcrumb URLs are absolute and sitemap/robots/agent metadata all reference
   the same canonical sitemap endpoint.
5. The new Vitest, Playwright, and build checks pass.
6. The existing full checks pass:

   ```bash
   pnpm test
   pnpm typecheck
   pnpm build
   pnpm test:e2e
   ```

7. The change is delivered through a pull request linked to issue #14; `main`
   is not edited directly.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| A content canonical override conflicts with local hreflang | Suppress local alternates for external canonicals and test the rule explicitly |
| Sitemap output accidentally exposes non-public content | Reuse `getLocalizedPosts` and locale-specific taxonomy queries; assert every loc |
| JSON-LD changes break existing consumers | Keep schema nodes truthful, preserve existing fields, and parse every emitted block in E2E |
| Absolute URL behavior differs between localhost and deployment | Centralize origin resolution and test with both localhost and configured site URLs |
| Existing agent discovery contracts regress | Preserve endpoints/headers and extend current agent-discovery tests rather than replacing them |

