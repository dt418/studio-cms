# Editorial + Cinematic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all public DanhThanh.dev page types with a shared editorial + cinematic visual system without changing the static Astro content/SEO architecture.

**Architecture:** Keep the existing component boundaries and Tailwind v4 pipeline. Centralize the new visual language in tokens/base styles, then update shared page-shell components and page-type hero/header components so Home, Blog, Article, Category, Tag, About, and 404 inherit the same system. Add a standalone HTML prototype that mirrors the production direction and can be imported into Figma.

**Tech Stack:** Astro 7, Tailwind CSS v4, CSS custom properties, existing Fontsource packages, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-editorial-cinematic-redesign-design.md`

## Global Constraints

- Keep Astro 7 static build and file-based content.
- Keep all public strings localized through existing i18n files unless copy already exists in component props.
- Preserve canonical URLs, JSON-LD, RSS, sitemap, and locale alternates.
- Do not add a new runtime design dependency.
- Keep visible keyboard focus and reduced-motion support.
- Every meaningful image keeps descriptive alt text and explicit dimensions.

---

### Task 1: Foundation tokens and surfaces

**Files:**
- Modify: `apps/web/src/styles/tokens.css`
- Modify: `apps/web/src/styles/base.css`
- Modify: `apps/web/src/styles/app.css`
- Create: `apps/web/src/styles/editorial-cinematic.css`

**Interfaces:**
- Produces: shared CSS variables and `.editorial-*` classes consumed by page components.

- [ ] Add editorial font stack, cinematic surface tokens, border/shadow tokens, and responsive container helpers.
- [ ] Add grain/radial paper treatment and reduced-motion-safe interaction helpers.
- [ ] Import the new stylesheet from `app.css`.
- [ ] Run formatting/type checks through repository CI.

### Task 2: Shared shell and homepage

**Files:**
- Modify: `apps/web/src/layouts/BaseLayout.astro`
- Modify: `apps/web/src/components/HeroSection.astro`
- Modify: `apps/web/src/components/FeaturedWork.astro`

**Interfaces:**
- Consumes: `.editorial-*` foundation classes.
- Produces: consistent navigation/header/footer and homepage hero/featured composition.

- [ ] Refine sticky navigation and brand treatment without changing routes or controls.
- [ ] Recompose hero into wide editorial copy + cinematic visual panel.
- [ ] Recompose featured writing into one dominant story plus supporting rows/cards.
- [ ] Preserve existing CTA, stats, and localization props.

### Task 3: Blog, category, and tag routes

**Files:**
- Modify: `apps/web/src/components/Blog/BlogHeader.astro`
- Modify: `apps/web/src/components/BlogCard.astro`
- Modify: `apps/web/src/components/BlogFilter.astro`
- Modify: `apps/web/src/pages/[lang]/categories/[category].astro`
- Modify: `apps/web/src/pages/[lang]/tags/[tag].astro`

**Interfaces:**
- Produces: topic masthead and article-list language shared across discovery pages.

- [ ] Replace badge-heavy masthead with editorial eyebrow + large heading.
- [ ] Improve article card spacing, wrapping, and hover behavior.
- [ ] Keep filter functionality intact while styling controls as a quiet utility bar.
- [ ] Make Category visually richer than Tag while retaining their existing data queries and schemas.

### Task 4: Article reading experience

**Files:**
- Modify: `apps/web/src/components/Blog/PostHero.astro`
- Modify: `apps/web/src/components/Blog/PostHeader.astro`
- Modify: `apps/web/src/components/Blog/ArticleContent.astro`
- Modify: `apps/web/src/components/Blog/TableOfContents.astro`
- Modify: `apps/web/src/pages/[lang]/blog/[slug].astro`

**Interfaces:**
- Produces: reading-first article header/content/TOC treatment.

- [ ] Keep title within a wide readable measure and reduce dashboard-like metadata density.
- [ ] Give cover images a cinematic framed treatment while preserving image optimization.
- [ ] Keep content measure around 70–75ch and TOC sticky only on large screens.
- [ ] Preserve Pagefind attributes, FAQ, related posts, and structured data.

### Task 5: About and 404

**Files:**
- Modify: `apps/web/src/components/About/AboutHero.astro`
- Modify: `apps/web/src/components/About/AboutPrinciples.astro`
- Modify: `apps/web/src/components/About/AboutContact.astro`
- Modify: `apps/web/src/components/NotFoundPage.astro`

**Interfaces:**
- Produces: editorial personal profile and branded recovery state.

- [ ] Turn monogram/profile area into a stronger asymmetric editorial composition.
- [ ] Keep principles and contact data unchanged while reducing card repetition.
- [ ] Give 404 a cinematic abstract landscape treatment with clear Home/Blog recovery actions.

### Task 6: Standalone HTML prototype and Figma source

**Files:**
- Create: `design/editorial-cinematic/index.html`
- Create: `design/editorial-cinematic/README.md`

**Interfaces:**
- Produces: a self-contained HTML design prototype suitable for browser review and Figma capture.

- [ ] Build a static overview showing Home, Blog, Article, Category, Tag, About, 404, and mobile frames.
- [ ] Use the same warm-paper, charcoal, orange, typography, grid, and cinematic surfaces as production.
- [ ] Keep the prototype dependency-free.

### Task 7: Verification and PR

**Files:**
- Verify all changed files.

- [ ] Run `pnpm check` and `git diff --check` when a runnable workspace is available.
- [ ] Run `pnpm build` and `pnpm test:e2e` or rely on the repository's required PR `test` job when local network/package installation is unavailable.
- [ ] Open a PR from `codex/editorial-cinematic-redesign` to `main` with validation notes and known environment limitations.
