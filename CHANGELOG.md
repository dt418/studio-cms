# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Refactors

- refactor: migrate to canonical shadcn/ui theme system (base-nova / neutral / oklch) — replaced custom two-tier token system with bare shadcn vars on `:root` / `.dark`, bridged via `@theme inline` to Tailwind v4
- refactor: centralize hardcoded site URLs — created `src/lib/site.ts` as single source of truth for brand identity; all pages now use `Astro.site` for URLs and `SITE.*` for strings
- refactor: extract search logic to TypeScript module — `Search.astro` reduced from 652 to 280 lines, all logic in `src/lib/search.ts` with full type safety
- refactor: convert search CSS to design tokens — replaced inline utilities with BEM-like component classes using `var(--color-*)`, `var(--radius-*)` tokens
- refactor: migrate CSS to Tailwind CSS 4 oklch colors and @apply patterns (ce6a41f)
- refactor: portfolio-style homepage with PostCard components and design system sync (2b8dbe0)
- refactor: standardize formatting in design system documentation (816b785)

### Features

- feat: add Playwright E2E testing setup with multi-browser support
  (Chromium, Firefox, WebKit, Mobile)
- feat: configure E2E tests for Astro SSR with preview server
- feat: implement core E2E tests for home, blog, blog posts, navigation,
  and accessibility
- feat: add GitHub Actions workflow for CI/CD E2E testing
- feat: create Playwright E2E testing skill, agent, and best practices rule
- feat: generate OG image at build time via `scripts/generate-og-image.mjs`
  using `sharp`

### Documentation

- docs: add site configuration section to DESIGN.md with file reference table
- docs: update DESIGN.md to reflect shadcn token system, accessibility, and rules
- docs: add code review improvements tracking document with prioritized GitHub issues (3e6bbe2)
- docs: standardize formatting in design system documentation (816b785)

### Bug Fixes

- fix: PostNavigation.astro removed React-style component function from frontmatter (not supported in Astro) — inlined navigation links directly in template
- fix: BlogFilter.astro removed ES module import from inline script (inline scripts don't support imports) — formatted dates on server for consistency
- fix: Tailwind v4 syntax — `hover:bg-white/[0.05]` → `hover:bg-white/5` in BlogFilter
- fix: remove `.ts` extension from import path in Search.astro
- fix: rename dark mode class from `theme-dark` to `dark` (shadcn canonical)
- fix: `seo.ts` default image path corrected from `/og-default.jpg` to `/og-image.png`
- fix: BlogFilter.astro serializedPosts variable discarded during Astro compilation — changed to explicit return statement (b2)
- fix: BlogFilter.astro JSON.stringify rendered as literal text — changed to `set:html={}` directive (b2)
- fix: BlogFilter.astro layout broken with 5 elements in flex row — changed to `flex flex-wrap` with responsive `min-w` values (b2)
- fix: improve docs and fix lefthook/eslint config issues (cd471b4)

### Enhancements

- feat: RelatedPosts.astro improved heading UI with count badge and flex layout
- feat: RelatedPosts.astro removed max-width constraint for full-width alignment
