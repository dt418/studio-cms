# DanhThanh.dev design system

This file is the project-level entry point for visual decisions. The canonical,
implementation-ready reference is [docs/reference/design-system.md](docs/reference/design-system.md).
Do not duplicate token values in new docs. Update `apps/web/src/styles/tokens.css`
first, then refresh `docs/design-system.figma.json`.

## Current direction

Warm industrial editorial for Vietnamese-speaking developers: deep onyx surfaces,
paper-like light mode, Space Grotesk display rhythm, JetBrains Mono metadata, and
a vermillion action accent paired with a muted amber selected state.

The homepage uses an asymmetric editorial composition. Featured work is a split
feature with a branded marker panel; all posts use a numbered archive list with a
vermillion hover rail. The About page follows the supplied reference with a
monogram hero, two numbered principle/stack panels, and a four-item contact grid.

## Token contract

- Raw tokens live in `apps/web/src/styles/tokens.css`.
- Every color token uses Tailwind CSS v4-compatible `oklch(...)` values.
- `apps/web/src/styles/semantic.css` maps bare tokens into shadcn/Tailwind's
  `--color-*` namespace.
- Components consume semantic utilities such as `bg-accent`, `text-primary`,
  `border-border`, and `text-muted-foreground`; do not add literal colors to
  component markup.
- Light mode is `:root`; dark mode is `.dark`, toggled by the inline theme
  controller in `BaseLayout.astro`.

## Typography

- UI and display: `Space Grotesk Variable` with local Fontsource loading and full
  Vietnamese glyph coverage.
- Brand mark: `Syne Variable`.
- Metadata and code: `JetBrains Mono Variable`.
- Inter remains bundled only as a compatibility fallback; it is not the primary
  visual typeface.

## Components and motion

- `BaseLayout.astro`: single sticky header, language switcher, mobile disclosure,
  theme toggle, and footer.
- `HeroSection.astro`: left-aligned editorial hero with compact metric panel.
- `FeaturedWork.astro`: featured split card and numbered recent-post rows.
- `ArchiveSection.astro`: numbered all-posts index with focusable rows.
- `components/About/`: composable About hero, principles/stack, and contact modules.
- `base.css` provides smooth scrolling, view transitions, and reduced-motion fallback.

## Figma handoff

Use [docs/design-system.figma.json](docs/design-system.figma.json) for synced OKLCH
variables, type/radius/motion tokens, and desktop/mobile Home and About frames.
