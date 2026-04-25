# Code Review: Homepage Refactor

## 📊 Review Metrics
- **Files Reviewed**: 6 components + index page
- **Critical Issues**: 0
- **High Priority**: 1 (resolved)
- **Medium Priority**: 3
- **Suggestions**: 2

## 🎯 Executive Summary
The refactor successfully achieved its goal of cloning chai-pin-zheng.xyz style while maintaining DRY principles through component reuse. The new components (`PostCard`, `HeroSection`, `MarqueeSection`, `MetricCard`, `SectionHeader`) are well-designed and follow the existing design system. The earlier **duplication issue** in `index.astro` has now been fixed: the page consumes the extracted components and the previously duplicated Archive section now renders the real remaining-posts list.

---

## 🟠 HIGH Priority

### 1. Duplicated Hero Section in `index.astro` — ✅ Resolved

**File**: `src/pages/index.astro`

**Status**: Fixed. The page now uses `HeroSection` (with a `terminal` slot), `SectionHeader` + `MetricCard` for the proof section, and `MarqueeSection` for the strip. The Archive section that previously rendered the same `featuredPost` and `recentPosts.slice(1, 4)` as the Featured Work section now renders `posts.slice(4)` as a real archive list.

---

## ✅ Round 2 fixes (from full project review)

The following issues identified during the broader project review have been addressed in this revision:

### Critical / High
- `src/pages/blog/[slug].astro`: replaced 302-redirect-on-missing-post with a proper `404` response.
- `src/pages/blog/[slug].astro`: prev/next navigation was inverted (list is sorted descending by date). "Previous" now correctly resolves to the older post.
- `src/pages/blog/[slug].astro`: JSON-LD `image` is now an absolute URL.
- `src/components/BlogFilter.astro`: hardened the JSON island against `</script>` breakouts and now HTML-escapes all post fields rendered via `innerHTML`. Also fixed the `textContent ?? '[]'` fallback that crashed on empty content (`textContent` returns `""`, not `null`).
- `src/lib/search.ts`: per-page state (`allCategories`, `allTags`, request lock) is reset inside `initSearch()` so SPA navigations no longer accumulate stale tags or strand `isLoading=true`. The dropped-request lock has been replaced with a "latest request wins" id pattern, fixing the bug where typing fast caused the latest query to be silently ignored.
- `src/lib/search.ts`: Fuse.js now imports from the bundled `fuse.js` package instead of a runtime CDN URL.

### Medium
- `src/components/HeroSection.astro`: fixed invalid `border-bg-[#050505]` utility (intent: `border-border bg-[#050505]`).
- `src/pages/index.astro`: fixed `max-xl` typo → `max-w-xl`.
- `src/pages/categories/[category].astro` and `src/pages/tags/[tag].astro`: now `decodeURIComponent` the route param so categories/tags containing spaces or symbols match the collection.
- `src/components/Blog/TableOfContents.astro`: `IntersectionObserver` threshold lowered from `1` to `0` so the active TOC link actually updates.
- `src/pages/rss.xml.ts`: dropped trailing slash on item links to match the rest of the site.
- `src/layouts/BaseLayout.astro`: external links (`github`, `linkedin`) now have `target="_blank"` + `rel="noopener noreferrer"`.
- `src/lib/seo.ts`: deleted (dead code; never imported).
- `src/pages/blog/[slug].astro`: word count and reading time now use shared `readingTime()` and a properly filtered word count, replacing the duplicated inline math.

### Still open / deferred
- Centralize `https://danhthanh.dev` constant across files (currently duplicated in layout, slug page, RSS, etc.).
- Filter URL-syncing for `BlogFilter` (parity with `Search.astro`).
- Cache `getCollection('posts')` to avoid 3× re-derivation per SSR request.
- Frontmatter parser in `scripts/generate-search-index.mjs` should use a real YAML parser (`gray-matter` or `js-yaml`) rather than the regex shortcut.
- Theme toggle component (`ThemeToggle.astro`) is defined but not mounted in `BaseLayout`; `class="theme-dark"` is hardcoded on `<html>`.
- StudioCMS dependencies are declared but the homepage and blog read directly from `src/content/posts` via the `glob` loader; verify if the StudioCMS integration is intended.