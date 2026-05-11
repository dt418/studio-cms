# Blog Homepage Improvements Proposal

## Summary
Improve Vietnamese blog homepage and blog listing UX/SEO by replacing placeholder/fake content with data-driven values, fixing localization mismatches, and adding high-value discovery/navigation surfaces.

## Problem
Current `/vi/` experience has quality gaps:
- Fake stats (`01/02/03`) reduce trust.
- Vietnamese SEO descriptions are still English.
- Some `locale=vi` content titles are not Vietnamese.
- Repeated card descriptions look copy-pasted.
- Marquee section adds low value and occupies prime space.
- `/vi/blog` lacks search.
- Missing About destination and weak footer CTA.

## Goals
1. Make homepage stats real and collection-driven for Vietnamese locale.
2. Make `/vi/` metadata fully Vietnamese.
3. Ensure Vietnamese post titles for `locale=vi` entries.
4. Improve homepage information scent (distinct card copy, useful tag cloud).
5. Add client-side search to `/vi/blog` (title + description).
6. Add `/vi/about` page and header navigation entry.
7. Add actionable Vietnamese footer CTA for collaboration contact.
8. Route all new/updated user-facing copy through existing i18n translation files (no hardcoded UI strings).

## Non-Goals
- No multilingual RSS work.
- No `hreflang`/international SEO architecture changes.
- No global visual redesign.
- No backend search service.
- No bypassing existing i18n pipeline with hardcoded UI literals.

## Proposed Changes

### 1) Real stats counter (`stats-counter`)
- Source data from `getCollection('blog')`.
- Filter to Vietnamese posts (`locale === 'vi'`).
- Compute:
  - Post count = number of Vietnamese posts.
  - Topic count = unique `topic` values across Vietnamese posts.
  - Tag count = unique tags across Vietnamese posts.
- Replace static/fake numeric values with computed values.

### 2) Vietnamese SEO meta (`seo-meta-vi`)
- Update `/vi` page metadata fields to Vietnamese:
  - `description`
  - `og:description`
  - `twitter:description`
- Ensure wording aligned with Vietnamese audience and homepage intent.

### 3) Vietnamese blog titles (`blog-titles-vi`)
- Audit `locale=vi` posts in content collection.
- Update non-Vietnamese titles to Vietnamese equivalents.
- Preserve slugs unless explicitly required.

### 4) Distinct card descriptions (`card-descriptions`)
- Update Topic / Tag / Archive card copy so each card has unique purpose text.
- Remove duplicated author-bio-like description reuse.

### 5) Replace marquee with data-driven tag cloud (`tag-cloud`)
- Remove scrolling marquee block from homepage.
- Add a Tag Cloud component based on real Vietnamese tag counts.
- Render tags sorted by descending post count.
- Link format: `/vi/blog?tag={tag}`.

### 6) Client-side blog search (`blog-search`)
- Add search UI to `/vi/blog` page.
- Filter in client on `title + description` fields.
- No API/backend dependency.
- Keep default state showing full list.

### 7) Footer CTA (`footer-cta`)
- Add/replace footer CTA text with: `Liên hệ hợp tác →`.
- Link to configured collaboration email (`mailto:` destination).

### 8) About page + navigation (`about-page`)
- Create `/vi/about` page with layout consistent to current homepage style system.
- Add header/nav entry `Về tôi` pointing to `/vi/about`.

## Affected Files (expected)
- `apps/web/src/pages/vi/index.astro`
  - Vietnamese meta descriptions
  - homepage stats wiring
  - marquee removal
  - tag cloud insertion
  - card description updates
  - footer CTA
- `apps/web/src/pages/vi/blog/index.astro`
  - search UI and client filtering
- `apps/web/src/pages/vi/about.astro`
  - new page
- `apps/web/src/components/StatsCounter.astro`
  - data-driven Vietnamese counts
- `apps/web/src/components/TagCloud.astro`
  - new component
- `apps/web/src/components/BlogSearch.astro`
  - new component
- `apps/web/src/content/posts/**` (Vietnamese entries)
  - title localization updates

## Risks
- Locale filtering drift if content schema fields vary across posts.
- Tag link query format may mismatch existing `/vi/blog` filter parser.
- Client search hydration/script behavior could regress static rendering if not isolated.

## Mitigations
- Reuse existing route/filter helpers if present (`@/lib/routes`, page query parsing patterns).
- Keep client script scope narrow and progressively enhanced.
- Validate links and filter behavior with representative tags and mixed-case queries.

## Acceptance Criteria
- Homepage stats display real Vietnamese counts (posts/topics/tags).
- `/vi` HTML source contains Vietnamese descriptions for description/OG/Twitter.
- Vietnamese posts on `/vi/blog` show Vietnamese titles.
- Topic/Tag/Archive card descriptions are distinct.
- Marquee removed; tag cloud visible and links to `/vi/blog?tag=...`.
- `/vi/blog` search filters by title + description client-side.
- Footer includes working `Liên hệ hợp tác →` collaboration link.
- Header includes `Về tôi` and `/vi/about` route renders correctly.
- `pnpm build` succeeds with no `/en/` regressions.

## Verification Plan
- Run app locally and verify homepage stats values are non-placeholder and plausible.
- Inspect page source for Vietnamese meta descriptions.
- Test tag links from homepage into `/vi/blog` filtered state.
- Test search with sample query (e.g. `TypeScript`) and empty-state handling.
- Validate nav path `/vi/about` and footer CTA mailto behavior.
- Run full build: `pnpm build`.

## Rollout
- Ship as single scoped content+UX improvement change for Vietnamese blog surface.
- No migration/data backfill required.

## Open Questions
- Exact collaboration email target for footer CTA (if not already canonical in project config).
- Preferred Vietnamese wording variants for meta/card copy if editorial review required.
