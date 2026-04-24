# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Documentation

- docs: add code review improvements tracking document with prioritized GitHub issues (3e6bbe2)
- docs: standardize formatting in design system documentation (816b785)

### Refactors

- refactor: extract search logic to TypeScript module — `Search.astro` reduced from 652 to 280 lines, all logic in `src/lib/search.ts` with full type safety
- refactor: convert search CSS to design tokens — replaced inline utilities with BEM-like component classes using `var(--color-*)`, `var(--radius-*)` tokens
- refactor: migrate CSS to Tailwind CSS 4 oklch colors and @apply patterns (ce6a41f)
- refactor: portfolio-style homepage with PostCard components and design system sync (2b8dbe0)
- refactor: standardize formatting in design system documentation (816b785)

### Bug Fixes

- fix: BlogFilter.astro serializedPosts variable discarded during Astro compilation — changed to explicit return statement (b2)
- fix: BlogFilter.astro JSON.stringify rendered as literal text — changed to `set:html={}` directive (b2)
- fix: BlogFilter.astro layout broken with 5 elements in flex row — changed to `flex flex-wrap` with responsive `min-w` values (b2)
- fix: improve docs and fix lefthook/eslint config issues (cd471b4)
