# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is Vietnamese-speaking developers and technical builders seeking
practical, implementation-focused engineering content. English readers are a first-class
secondary audience, with equivalent navigation and predictable language switching.

## Product Purpose

DanhThanh.dev is Danh Thanh's personal engineering knowledge hub and professional portfolio.
It shares practical tutorials, experiments, architecture notes, troubleshooting, and lessons
learned from real projects. It establishes technical credibility through writing, projects,
and clear paths to contact and collaborate.

Readers learning something useful comes first. Personal-brand and portfolio value should
emerge naturally from the quality of the work. The site should not become a conventional
marketing landing page.

The product hierarchy is: **Learn → Discover → Trust → Explore work → Contact**.

## Positioning

A personal, implementation-focused engineering resource grounded in Danh Thanh's real work:
code, architecture decisions, reproducible examples, trade-offs, and debugging notes.
Project presentations should explain actual technical work and decisions rather than rely
on generic showcase cards. No exclusive market position or comparative claims are established.

## Operating Context

- Readers discover articles through search, related content, tags/topics, and language navigation.
- Long-form technical reading must work well on mobile, tablet, and desktop.
- Readers can follow writing through RSS, explore the author's work, and find contact paths.
- Current publishing uses localized Markdown/MDX in `src/content/posts/{vi,en}`, validated by
  Astro content collections and built into static pages. The current public app is Astro 7.

## Capabilities and Constraints

- Preserve bilingual content, search, RSS, and the DanhThanh.dev identity.
- Keep Vietnamese and English first-class experiences, with equivalent navigation and
  predictable switching. Do not assume every article already has a translation.
- Prioritize fast loading, minimal unnecessary client-side JavaScript, strong Core Web Vitals,
  progressive enhancement, and durable web standards.
- Preserve technical SEO: metadata, canonical URLs, hreflang, structured data, Open Graph,
  and stable shareable URLs.
- Maintain article URL stability and backward compatibility when content structure changes.
- Help readers navigate related articles, tags/topics, projects, and languages without noisy
  recommendation interfaces.
- Preserve content ownership and portability if publishing later moves to a CMS. Do not
  permanently couple articles to a proprietary editor or backend.
- CMS/backend capabilities may evolve independently; the public website should continue to
  support static or pre-rendered delivery where practical.
- No dark patterns, engagement bait, intrusive popups, or effects that interfere with reading.
- Future CMS selection, project-page scope, and quantitative performance targets remain open.

## Brand Commitments

The site is DanhThanh.dev, authored by Danh Thanh. Keep the identity personal and recognizable;
avoid the feel of a generic SaaS template or corporate publication. Use practical, clear,
technically grounded communication supported by real work.

The existing root `../../DESIGN.md` remains the visual authority. This product record does
not replace or redefine its visual system.

## Evidence on Hand

- `src/content/posts/{vi,en}` contains engineering articles and technical examples. Test-only
  SEO fixtures are not portfolio evidence.
- `src/lib/site.ts` records the existing author identity and contact/social destinations.
- `src/lib/i18n/{vi,en}.ts` contains localized site copy, author information, and navigation.
- `src/pages/[lang]/about.astro` presents the author and contact paths.
- Future project showcases must use real work and supported claims. This record establishes
  no testimonials, customer counts, performance benchmarks, or commercial outcomes.

## Product Principles

1. Make each visit useful: prioritize learning and practical engineering depth.
2. Put content and long-form readability before decoration on every device.
3. Earn trust through real examples, transparent decisions, and reproducible guidance.
4. Make discovery inclusive, predictable, and unobtrusive across both languages.
5. Preserve a fast, accessible, durable web experience and portable, author-owned content.

## Accessibility & Inclusion

Use semantic HTML, keyboard navigation, readable contrast, reduced-motion support, and
sensible focus states. Preserve excellent readability for long technical articles and
responsive behavior across mobile, tablet, and desktop. Vietnamese and English must both
receive complete navigation and usable reading experiences. A specific formal conformance
level has not been selected.
