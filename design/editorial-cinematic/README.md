# Editorial + Cinematic Design Prototype

This folder contains the standalone HTML reference for the approved DanhThanh.dev redesign direction: **Editorial Field Journal + Cinematic Developer Portfolio**.

## Preview

Open `index.html` directly in a browser. The prototype is dependency-free and includes visual references for:

- Home
- Blog archive
- Article detail
- Category
- Tag
- About
- 404
- Mobile home

## Production source of truth

The production implementation lives in `apps/web`. The prototype is a design reference only and intentionally does not duplicate Astro content queries, i18n, SEO, Pagefind, or routing logic.

Shared production styling is defined in:

- `apps/web/src/styles/editorial-cinematic.css`
- `apps/web/src/styles/app.css`

## Figma handoff

The preferred Figma workflow is to capture the running production pages into one editable design file, then normalize them against shared components/tokens. Use the following frames:

- Desktop: 1440 px width
- Tablet: 1024 px width
- Mobile: 390 px width

Capture these routes for both `vi` and `en` where useful:

- `/vi/`
- `/vi/blog/`
- one representative `/vi/blog/<slug>/`
- one representative `/vi/categories/<category>/`
- one representative `/vi/tags/<tag>/`
- `/vi/about/`
- `/vi/404/`

The visual system should preserve warm-paper surfaces, charcoal ink, restrained orange-red accents, editorial display type, modern sans body text, JetBrains Mono metadata, and reduced-motion-safe interactions.
