# DanhThanh.dev design system

The visual system for the Astro 7 static blog. It translates the supplied editorial reference into reusable Tailwind CSS v4 + shadcn semantic tokens.

## Design read

Warm industrial editorial for Vietnamese-speaking developers: deep onyx surfaces, paper-like light mode, sans display rhythm, mono metadata, and a single vermillion action accent supported by a muted amber state color.

## Source files

- `apps/web/src/styles/tokens.css` — raw theme tokens and typography.
- `apps/web/src/styles/semantic.css` — shadcn/Tailwind v4 color bridge.
- `apps/web/src/styles/base.css` — element defaults, scroll behavior, reduced motion.
- `apps/web/src/styles/components.css` — shared button, card, and prose patterns.
- `apps/web/src/components/About/` — composable About hero, principles, and contact sections.
- `docs/design-system.figma.json` — Figma-ready token and frame handoff.

## Color tokens

| Token               | Light                     | Dark                      | Use                               |
| ------------------- | ------------------------- | ------------------------- | --------------------------------- |
| `background`        | `oklch(97% 0.005 95.1)`   | `oklch(16% 0.003 67.6)`   | Page surface                      |
| `foreground`        | `oklch(17.3% 0.004 84.6)` | `oklch(95.9% 0.01 87.5)`  | Primary text                      |
| `card`              | `oklch(93.1% 0.01 87.5)`  | `oklch(23.2% 0.006 78.2)` | Card and muted surface            |
| `muted-foreground`  | `oklch(46.7% 0.012 72.5)` | `oklch(69.6% 0.018 79.3)` | Secondary text                    |
| `border`            | `oklch(89.2% 0.013 86.8)` | `oklch(27.6% 0.009 72.7)` | Dividers and controls             |
| `primary`           | `oklch(64.9% 0.206 33.6)` | `oklch(64.9% 0.206 33.6)` | Links, actions, hover rails       |
| `accent`            | `oklch(88% 0.073 76.9)`   | `oklch(75.1% 0.108 72.6)` | Selected state and category badge |
| `accent-foreground` | `oklch(25.6% 0.027 73.4)` | `oklch(25.6% 0.027 73.4)` | Text on accent                    |

Use semantic utilities (`bg-background`, `text-foreground`, `bg-primary`, `bg-accent`) instead of literal colors in components.

## Typography

- UI/body: `Space Grotesk Variable`, bundled with a Vietnamese subset.
- Display: the same bundled Space Grotesk family through `font-serif` so Vietnamese diacritics do not fall back to an inconsistent system serif.
- Metadata/code: `JetBrains Mono Variable`.
- Brand mark: `Syne Variable` for the short `DanhThanh.dev` wordmark only.

| Role          | Utility                                                | Guidance                              |
| ------------- | ------------------------------------------------------ | ------------------------------------- |
| Hero display  | `font-serif text-5xl sm:text-7xl md:text-8xl`          | Tight tracking, short line length     |
| Section title | `font-serif text-3xl lg:text-4xl`                      | Sentence case, balanced wrapping      |
| Card title    | `font-serif text-xl sm:text-2xl`                       | Keep excerpts to one or two lines     |
| Metadata      | `font-mono text-[0.62rem] tracking-[0.16em] uppercase` | Dates, categories, indexes            |
| Body          | `text-sm leading-7 sm:text-base`                       | Keep copy near 65 characters per line |

## Component patterns

### Header

Sticky `h-16` header with one desktop navigation row, one language switcher, and a compact theme control. The mobile menu is a native `<details>` disclosure. Active links use vermillion text and a bottom rule.

### Featured work

`FeaturedWork.astro` uses one asymmetric split card:

- left: category, date, title, excerpt, read action;
- right: a small branded marker panel (`9R`) that provides visual weight;
- below: a numbered “recently published” list with row hover wash and arrow motion.

### Archive / all posts

`ArchiveSection.astro` uses a bordered index list. Each row has an index, date, category, title, excerpt, and arrow. Hover reveals a vermillion rail and a subtle surface wash; rows remain keyboard-focusable links.

### Tags

Tags are compact bordered chips. Selected/hover state uses the muted amber accent, never the highlighter neon used in the original reference.

### About

The About page follows the supplied reference through three composable modules:

- `AboutHero.astro` — eyebrow, author name, Vietnamese-safe intro, and DT monogram.
- `AboutPrinciples.astro` — numbered working principle and core stack panels.
- `AboutContact.astro` — responsive contact links driven by `SITE` URLs and localized labels.

Copy and labels live in `src/lib/i18n/{en,vi}.ts`; identity and external URLs live in `src/lib/site.ts`; the route composes modules and derives the monogram with `getAuthorInitials`.

## Motion

- Page transitions: 300ms fade/translate.
- Cards: 300ms border/lift transition; featured rail scales from bottom on hover.
- Marquee: 30s linear ticker, one instance per page.
- Archive rows: background wash and arrow translate on hover.
- `@media (prefers-reduced-motion: reduce)` removes non-essential animation and changes scroll behavior to `auto`.

## Layout

- Container: `max-w-6xl` with `px-4 sm:px-6`.
- Desktop content: asymmetric 12-column composition.
- Archive rows collapse to a single readable column below `sm`.
- Sticky header offset is reserved with `scroll-padding-top: 5rem`.

## Figma handoff

Create these pages/frames from `docs/design-system.figma.json`:

1. `00 Foundations / Color` — light and dark token swatches.
2. `01 Foundations / Type` — Vietnamese specimen strings and metadata scale.
3. `02 Components / Header` — desktop and mobile states.
4. `03 Components / Featured` — default, hover, keyboard focus.
5. `04 Components / Archive` — default, hover, focus, empty state.
6. `05 Components / About` — hero, principles/stack, contact links, and mobile collapse.
7. `06 Screens / Home` — 1440px desktop and 390px mobile.
8. `07 Screens / About` — 1440px desktop and 390px mobile.

Keep the Figma variables named after the semantic tokens so generated code can map directly to Tailwind classes.
