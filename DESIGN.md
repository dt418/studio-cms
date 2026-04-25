# Blog Design System

## Philosophy

- **Dark-first**: Default dark theme with near-black backgrounds
- **Minimal**: Subtle borders, no heavy shadows, clean typography
- **Consistent**: All colors use `oklch()` format (Tailwind CSS 4 native)
- **Accessible**: High contrast ratios, semantic HTML, keyboard navigable

## Token System — shadcn/ui

Canonical shadcn theme (base-nova / neutral / oklch) in `src/styles/global.css`:

- **Light defaults** on `:root`, **dark overrides** on `.dark`. Bare token names (`--background`, `--foreground`, `--muted-foreground`, ...) are the source of truth.
- **`@theme inline`** bridges those bare vars to Tailwind v4's `--color-*` namespace, so utilities like `bg-background`, `text-muted-foreground`, `ring-ring` resolve correctly and react to runtime theme switching.
- Toggle dark mode by adding/removing `class="dark"` on `<html>` (handled by `src/components/ThemeToggle.astro`).

Components and pages must consume **Tailwind utilities** (`bg-card`, `text-muted-foreground`, `bg-muted`, etc.) — never raw `var(--background)` or `oklch()` literals. New shadcn components added via the CLI work with no extra configuration.

### Core tokens

| Token | Role |
| ------- | ------ |
| `--background` / `--foreground` | Page surface and primary text |
| `--card` / `--card-foreground` | Elevated card surface |
| `--popover` / `--popover-foreground` | Floating panels |
| `--primary` / `--primary-foreground` | Primary actions |
| `--secondary` / `--secondary-foreground` | Secondary actions / surfaces |
| `--muted` / `--muted-foreground` | Subtle surfaces (code, skeletons) and de-emphasized text |
| `--accent` / `--accent-foreground` | Hover surfaces and highlights |
| `--destructive` / `--destructive-foreground` | Error states |
| `--border` / `--input` / `--ring` | Lines and focus rings |
| `--chart-1`..`--chart-5` | Data visualization palette |
| `--sidebar*` | Sidebar surfaces, primary, accent, border, ring |

### Project extensions

Status colors not in canonical shadcn — kept as project-specific tokens:

| Token | Role |
| ------- | ------ |
| `--success` / `--success-foreground` | Success states |
| `--warning` / `--warning-foreground` | Warning states |
| `--info` / `--info-foreground` | Informational states |

### Radius

A single `--radius` base (default `0.5rem`); the Tailwind scale derives from it inside `@theme inline`:

- `--radius-sm` = `calc(var(--radius) - 4px)`
- `--radius-md` = `calc(var(--radius) - 2px)`
- `--radius-lg` = `var(--radius)`
- `--radius-xl` = `calc(var(--radius) + 4px)`

## Typography

- **Font**: `"Inter", ui-sans-serif, system-ui, -apple-system`
- **Mono**: `"JetBrains Mono", ui-monospace`

### Heading Scale

| Element | Size | Weight |
| --- | --- | --- |
| h1 | 3rem | 600 |
| h2 | 2.25rem | 600 |
| h3 | 1.5rem | 600 |

## Components

### Button

| Variant | Classes |
| --- | --- |
| `btn` | `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium leading-5 transition-all duration-150 cursor-pointer` |
| `btn-primary` | `bg-primary text-primary-foreground` |
| `btn-ghost` | `bg-transparent text-muted` |
| `btn-outline` | `border border-border bg-transparent text-muted` |
| `btn-sm` | `px-3 py-1.5 text-xs leading-4` |

### Card

- `@apply bg-card text-card-foreground rounded-md border border-border transition-colors duration-200`
- `.card-hover`: `@apply relative overflow-hidden rounded-md border border-border bg-card/30 p-6 transition-all duration-300`

### Prose

- Max width: `65ch`
- Paragraphs: `text-muted-foreground mb-5 leading-[1.8]`
- Links: `text-primary font-medium underline underline-offset-4`

## Accessibility

- Target: WCAG 2.2 AA
- Keyboard-first interactions
- Focus-visible: `outline-none ring-[3px] ring-ring/50` (shadcn canonical)

## Rules

- Use shadcn semantic utilities in components (`bg-background`, `text-muted-foreground`) — never raw `oklch()` or `var(--)` in markup
- Every component must define states: default, hover, focus-visible, active, disabled
- Use `@apply` with Tailwind utilities
- shadcn vars live in `:root`, `@theme inline` maps them to Tailwind utilities, components consume utilities via `@apply` in `@layer components`
- Light is the default (`:root`); dark is opted into by adding `class="dark"` to `<html>` — the project ships with dark forced on via `BaseLayout.astro` and toggled by `ThemeToggle.astro`

## Site Configuration

All identity strings live in `src/lib/site.ts` (`SITE` object):

| Key | Value |
| --- | --- |
| `name` | Brand name used in `<title>`, JSON-LD, RSS, footer |
| `author` | Author name for meta tags and JSON-LD |
| `description` | Default meta description, RSS description |
| `email` | Contact email (footer) |
| `social.*` | GitHub, LinkedIn, Twitter handles |

**URLs** come from `astro.config.mjs` `site` property (env-overridable via `SITE_URL`). In `.astro` files use `Astro.site`, in API routes use `context.site`. Never hardcode `https://...` in page code.

## File Reference

| File | Purpose |
| --- | --- |
| `src/lib/site.ts` | Site identity constants (single source of truth) |
| `src/styles/global.css` | Design tokens + component styles |
| `src/layouts/BaseLayout.astro` | Page layout, meta tags, footer |
| `src/lib/seo.ts` | SEO helper (consumes `SITE`) |
| `scripts/generate-og-image.mjs` | Build-time OG image generator |
| `src/components/ui/button.tsx` | React button |
