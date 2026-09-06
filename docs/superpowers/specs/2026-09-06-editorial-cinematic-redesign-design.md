# Editorial + Cinematic Redesign Design

## Goal

Redesign the complete DanhThanh.dev experience by combining the approved Editorial Field Journal direction with a restrained Cinematic Developer Portfolio treatment, while preserving the Astro 7 static architecture, bilingual routes, content collections, SEO metadata, and accessibility behavior.

## Visual system

- Warm paper light theme and charcoal dark theme.
- One orange-red accent for links, current navigation, and primary actions.
- Editorial serif display typography paired with the existing modern sans and JetBrains Mono for technical metadata.
- Large cinematic surfaces on Home and About; quieter, reading-first treatment on article pages.
- Thin rules, soft tinted shadows, subtle grain/radial texture, and asymmetrical composition instead of repetitive card grids.
- Motion limited to transform/opacity hover and entry effects; reduced-motion behavior remains respected.

## Page system

### Home

Wide two-column hero with oversized editorial headline, primary/secondary actions, a cinematic visual panel, and compact proof points. Featured writing moves immediately after the hero and uses one lead story plus supporting stories. Topic exploration stays compact and useful rather than becoming a dense tag cloud.

### Blog archive

Editorial masthead, search/filter tools, and an asymmetric article grid/list. Article titles remain readable and are not visually truncated into dashboard-like rows.

### Article detail

Quiet header, 2–3 line title target, readable content measure, large cover treatment, compact metadata, sticky TOC on large screens, and restrained side metadata. The reading experience takes priority over cinematic decoration.

### Category and tag

Category routes behave like topic landing pages. Tag routes remain lighter, chronological indexes. Both inherit the same masthead, typography, filters, and article-row language.

### About

Editorial profile composition with stronger hierarchy, monogram/portrait treatment, principles, stack, and contact groups.

### 404

Branded editorial empty state with a scenic abstract background, clear Home/Blog recovery paths, and no novelty interaction that blocks navigation.

## Accessibility and performance

- Preserve skip-link, focus rings, semantic landmarks, alt text, image dimensions, lazy loading rules, theme switcher, and VI/EN navigation.
- No new runtime design dependency.
- Avoid scroll hijacking and JS-only content.
- Keep animations transform/opacity based and disable them under prefers-reduced-motion.

## SEO and routing

Do not change canonical URL generation, trailing-slash rules, JSON-LD, localized alternates, RSS, sitemap, or content schemas.

## Deliverables

1. Astro/Tailwind implementation on `codex/editorial-cinematic-redesign`.
2. Standalone HTML design prototype under `design/editorial-cinematic/`.
3. Editable Figma design generated from the same visual system when the connected Figma surface is available.
