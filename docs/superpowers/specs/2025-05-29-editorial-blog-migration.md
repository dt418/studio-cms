# Editorial Blog Migration Design Spec

**Date:** 2025-05-29  
**Author:** Droid (AI Agent)  
**Status:** Draft

---

## Overview

Migrate the existing Astro blog to a premium bold editorial experience inspired by Linear, Vercel, Raycast, and Stripe Press. This is a presentation-layer migration only — all existing content, routing, i18n, and SEO remain intact.

## Design Direction

### Visual Language
- **Bold & Typography-First:** Huge compressed headlines, negative tracking, editorial hierarchy
- **Brutalist Structure:** Clean grid systems, visible rhythm, intentional asymmetry
- **Minimal Aggression:** Subtle borders, no heavy shadows, high contrast
- **Developer Infrastructure Aesthetic:** Monospace metadata, terminal-inspired elements

### Color Palette

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--background` | `oklch(1 0 0)` | `oklch(0.07 0 0)` | Page surface (graphite black) |
| `--foreground` | `oklch(0.15 0 0)` | `oklch(0.98 0 0)` | Primary text (warm off-white) |
| `--accent` | `oklch(0.78 0.18 115)` | `oklch(0.78 0.18 115)` | Acid lime accent |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.22 0 0)` | Subtle surfaces |
| `--border` | `oklch(0.92 0 0)` | `oklch(1 0 0 / 8%)` | Lines and dividers |

### Typography System

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Space Grotesk | 700 | Hero titles, section headers |
| Heading | Syne | 600-700 | Article titles, h2-h4 |
| Body | Inter | 400-500 | Prose content |
| Mono | JetBrains Mono | 400-500 | Metadata, code, labels |

**Vietnamese Support:** All fonts have excellent Vietnamese glyph support via variable font files.

### Spacing Rhythm
- Container max-width: `1400px`
- Base unit: `8px`
- Section padding: `80px` vertical (desktop), `48px` (mobile)
- Element gaps: `16px`, `24px`, `32px`, `48px`

---

## Component Architecture

```
src/components/editorial/
  HeroSection.astro      # Cinematic hero with stats
  MarqueeStrip.astro    # Animated tag/category marquee
  StatsGrid.astro       # Metrics section (posts, topics, tags)
  FeaturedPost.astro     # Large spotlight post card
  PostFeed.astro        # Editorial grid of posts
  ManifestoSection.astro # Personal brand section
```

---

## Page Designs

### Homepage Layout
```
┌─────────────────────────────────────────────────────────────┐
│ NAV: Logo · Writing · About · RSS · VI|EN                   │
├─────────────────────────────────────────────────────────────┤
│ HERO                                                        │
│ ┌─────────────────────────────────┬───────────────────────┐ │
│ │ LABEL: For developers...        │ [Stats Terminal]      │ │
│ │                                 │ Posts: 42             │ │
│ │ DANH                             │ Topics: 12           │ │
│ │ THANH                            │ Tags: 89             │ │
│ │ Description text...             │                       │ │
│ │ [Read Blog] [RSS]               │                       │ │
│ └─────────────────────────────────┴───────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ MARQUEE: TypeScript · Astro · Performance · Architecture...  │
├─────────────────────────────────────────────────────────────┤
│ METRICS: 42 Published · 12 Topics · 89 Tags                  │
├─────────────────────────────────────────────────────────────┤
│ FEATURED: Large card + recent posts grid                      │
├─────────────────────────────────────────────────────────────┤
│ TAG CLOUD EXPLORATION                                        │
├─────────────────────────────────────────────────────────────┤
│ MANIFESTO: Personal statement                                 │
├─────────────────────────────────────────────────────────────┤
│ FOOTER: Email · GitHub · RSS · LinkedIn                       │
└─────────────────────────────────────────────────────────────┘
```

### Article Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PROGRESS BAR (3px accent line, sticky top)                   │
├─────────────────────────────────────────────────────────────┤
│ ARTICLE HEADER                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ARCHITECTURE                                            │ │
│ │ Building Scalable Frontend Architecture                  │ │
│ │ A deep dive into structuring large-scale frontend...     │ │
│ │ Mar 15, 2024 · 12 min read · 2,840 words               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┬───────────────────────────┬─────────────────┐ │
│ │ TOC      │ ARTICLE BODY              │ META SIDEBAR    │ │
│ │ sticky   │ max-width: 72ch           │ Author          │ │
│ │          │                           │ Published       │ │
│ │          │ Prose content...           │ Reading Time    │ │
│ │          │                          │ [Copy Link]     │ │
│ └──────────┴───────────────────────────┴─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ RELATED POSTS                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Approach

### Font Strategy (Already Installed)
```css
@import '@fontsource-variable/space-grotesk';
@import '@fontsource-variable/syne';
```

### Minimal JavaScript
- **Reading Progress:** 15 lines vanilla JS for progress bar
- **Intersection Observer:** Scroll reveal animations
- **Command Palette:** React island for search (Fuse.js available)
- **Copy Code:** Inline script for code block copy buttons

### Performance Targets
- Lighthouse Performance: >95
- First Contentful Paint: <1.2s
- Cumulative Layout Shift: <0.1

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Update tokens.css with new typography + colors
- [ ] Add Space Grotesk + Syne font imports
- [ ] Update semantic.css with new Tailwind mappings
- [ ] Create editorial.css with component styles

### Phase 2: Layout Refactor
- [ ] Refactor BaseLayout.astro (minimal nav, footer)
- [ ] Create EditorialNav component
- [ ] Update LanguageSwitcher with current route support

### Phase 3: Homepage
- [ ] Build new HeroSection with terminal stats
- [ ] Create MarqueeStrip component
- [ ] Build StatsGrid component
- [ ] Redesign FeaturedPost + PostFeed
- [ ] Add ManifestoSection
- [ ] Update homepage [lang]/index.astro

### Phase 4: Article Pages
- [ ] Create ReadingProgress component
- [ ] Redesign ArticleHeader
- [ ] Update ArticleContent with new prose styles
- [ ] Enhance ArticleMeta sidebar
- [ ] Add copy-code button functionality
- [ ] Update blog [slug].astro

### Phase 5: Polish
- [ ] Add scroll reveal animations
- [ ] Implement command palette search
- [ ] Test responsive breakpoints
- [ ] Verify i18n all routes
- [ ] Lighthouse audit

---

## Key Design Decisions

1. **Keep existing i18n structure** — All strings in `src/lib/i18n/{en,vi}.ts`
2. **No hardcoded content** — All text via translation keys
3. **Preserve routes** — `/vi/`, `/en/`, `/vi/blog/`, etc. work identically
4. **Astro-first** — React only for interactive islands
5. **CSS-first animations** — Use CSS animations over JS where possible
6. **Vietnamese-optimized fonts** — Variable fonts with full Vietnamese support

---

## Success Criteria

1. Homepage loads in <1.5s on 3G
2. All existing routes and content work unchanged
3. i18n toggle preserves current page/slug
4. Lighthouse scores >95 in all categories
5. Typography renders correctly in Vietnamese
6. No layout shifts during scroll
7. Command palette search returns results <100ms
