# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Features

- feat: add hybrid search system — Pagefind (build-time indexing) + Fuse.js (client-side fuzzy ranking) with TypeScript-first architecture (`src/lib/search.ts`)
- feat: add cover images to search results — 80x80px thumbnails with responsive grid layout
- feat: add unit testing with Vitest — 26 tests covering `filterPosts`, `groupByYear`, `sortedYears`
- feat: add commitlint with Conventional Commits — validates commit message format via lefthook
- feat: add Prettier formatting with Astro plugin — consistent code style across TS/TSX/Astro files
- feat: comprehensive SEO optimization — canonical URLs, og:image, JSON-LD structured data (WebSite, CollectionPage, Article), robots.txt, sitemap integration, article meta tags (da5bc9e)
- feat: add ViewTransition page transitions and scroll-triggered animations — shared element transitions, fade/slide/scale animations, staggered reveals (941ba68)
- feat: add table of contents to blog post detail page — sticky sidebar TOC with scroll-spy highlighting and depth-based indentation (f52957f)

### Chores

- chore: add lefthook git hooks — commit-msg (commitlint), pre-commit (lint + typecheck), pre-push (test + build)
- chore: enhance ESLint config — added `no-console`, `prefer-const`, `eqeqeq`, `curly`, `no-unused-vars` with `_` prefix exception
- chore: remove one/ directory (70 files, ~29k lines) (375ffae)

### Documentation

- docs: update coding conventions — added TypeScript rules, testing standards, git conventions, pre-commit hooks docs
- docs: update development workflow — added full command reference, commit message format, project structure, testing guide
- docs: update architecture overview — added search layer diagram, build pipeline, testing & quality tools
- docs: remove one.ie references from README and AGENTS (3255488)
- docs: audit and improve documentation (961990b)

### Refactors

- refactor: extract search logic to TypeScript module — `Search.astro` reduced from 652 to 280 lines, all logic in `src/lib/search.ts` with full type safety
- refactor: convert search CSS to design tokens — replaced inline utilities with BEM-like component classes using `var(--color-*)`, `var(--radius-*)` tokens
- refactor: update TypeScript configuration to include specific source files and exclude node_modules (f0283c9)
- refactor: cyberpunk blog UI with clean architecture (6c34aff)

### Bug Fixes

- fix: BlogFilter.astro serializedPosts variable discarded during Astro compilation — changed to explicit return statement (b2)
- fix: BlogFilter.astro JSON.stringify rendered as literal text — changed to `set:html={}` directive (b2)
- fix: BlogFilter.astro layout broken with 5 elements in flex row — changed to `flex flex-wrap` with responsive `min-w` values (b2)
- fix: improve docs and fix lefthook/eslint config issues (cd471b4)
