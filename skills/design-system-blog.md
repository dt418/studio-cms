---
name: design-system-blog
description: Creates implementation-ready design-system guidance for Blog with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

# Blog Design System

## Philosophy

- **Dark-first**: Default dark theme with near-black backgrounds
- **Minimal**: Subtle borders, no heavy shadows, clean typography
- **Consistent**: All colors use `oklch()` format (Tailwind CSS 4 native)
- **Accessible**: High contrast ratios, semantic HTML, keyboard navigable

## Color Tokens

Theme tokens live in `apps/web/src/styles/tokens.css` and are imported through `apps/web/src/styles/app.css`, following the project Tailwind v4 + shadcn token model.

- **Light defaults** on `:root`, **dark overrides** on `.dark`
- Bare token names (`--background`, `--foreground`, etc.) are the source of truth
- **`@theme inline`** bridges bare vars to Tailwind v4's `--color-*` namespace → utilities like `bg-background`, `text-muted-foreground` resolve correctly
- Toggle dark mode via `class="dark"` on `<html>` (handled by `ThemeToggle.astro`)

### Core tokens

| Token                                        | Role                                   |
| -------------------------------------------- | -------------------------------------- |
| `--background` / `--foreground`              | Page surface and primary text          |
| `--card` / `--card-foreground`               | Elevated card surface                  |
| `--popover` / `--popover-foreground`         | Floating panels                        |
| `--primary` / `--primary-foreground`         | Primary actions                        |
| `--secondary` / `--secondary-foreground`     | Secondary surfaces                     |
| `--muted` / `--muted-foreground`             | Subtle surfaces and de-emphasized text |
| `--accent` / `--accent-foreground`           | Hover surfaces and highlights          |
| `--destructive` / `--destructive-foreground` | Error states                           |
| `--border` / `--input` / `--ring`            | Lines and focus rings                  |
| `--chart-1`..`--chart-5`                     | Data visualization palette             |
| `--sidebar*`                                 | Sidebar surfaces and accents           |

### Project extensions

| Token                                | Role                 |
| ------------------------------------ | -------------------- |
| `--success` / `--success-foreground` | Success states       |
| `--warning` / `--warning-foreground` | Warning states       |
| `--info` / `--info-foreground`       | Informational states |

### Usage

```css
/* components.css */
.card {
  @apply bg-card text-card-foreground border-border rounded-md border;
}
```

```html
<div class="bg-background text-foreground">...</div>
<div class="bg-card border-border border">...</div>
```

Components and pages must consume **Tailwind utilities** (`bg-card`, `text-muted-foreground`, `bg-muted`, etc.) — never raw `var(--background)` or `oklch()` literals.

## Typography

- **Font**: `"Inter", ui-sans-serif, system-ui, -apple-system`
- **Mono**: `"JetBrains Mono", ui-monospace`

### Heading Scale

| Element | Size    | Weight | Line Height |
| ------- | ------- | ------ | ----------- |
| h1      | 3rem    | 600    | 1           |
| h2      | 2.25rem | 600    | 1.1         |
| h3      | 1.5rem  | 600    | 1.2         |

## Components

### Button Variants

| Variant       | Classes                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `btn`         | `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium leading-5 transition-all duration-150 cursor-pointer` |
| `btn-primary` | `bg-primary text-primary-foreground`                                                                                                          |
| `btn-ghost`   | `bg-transparent text-muted-foreground`                                                                                                        |
| `btn-outline` | `border border-border bg-transparent text-muted-foreground`                                                                                   |
| `btn-sm`      | `px-3 py-1.5 text-xs leading-4`                                                                                                               |

### Card

```html
<article class="card">...</article>
```

- `.card`: `@apply bg-card text-card-foreground rounded-md border border-border transition-colors duration-200`
- `.card-hover`: `@apply relative overflow-hidden rounded-md border border-border bg-card/30 p-6 transition-all duration-300`
- `.card-hover` uses a shared radial hover wash with `color-mix(in oklch, var(--foreground) 12%, transparent)`.
- `SpotlightCard` provides a separate interactive card surface with pointer/focus-tracked lighting via `apps/web/src/components/ui/spotlight-card.tsx` and the Astro wrapper `apps/web/src/components/SpotlightCard.astro`.
- Prefer `.card-hover` for CSS-only hover states; prefer `SpotlightCard` when an interactive spotlight surface is needed.
- Do not combine `.card-hover` with `SpotlightCard`; `SpotlightCard` owns the card surface classes.
- `SpotlightCard` uses Base UI-style `render` composition in React and `as="article"` / `as="a"` on the Astro wrapper.

### Badge / Input / Separator / Skeleton

| Class            | Purpose                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `.badge`         | Inline pill: `inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium` |
| `.badge-default` | Filled: `border-transparent bg-secondary text-secondary-foreground`                                         |
| `.badge-outline` | Outlined: `bg-transparent border-border text-muted-foreground`                                              |
| `.input`         | Form input: `h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm`                    |
| `.separator`     | Horizontal divider: `h-px bg-border`                                                                        |
| `.skeleton`      | Loading placeholder: `rounded-md bg-muted animate-pulse`                                                    |

### Prose (Article Content)

- Max width: `65ch`
- Paragraphs: `text-muted-foreground mb-5 leading-[1.8]`
- Links: `text-primary font-medium underline underline-offset-4`
- Code: `rounded-sm bg-muted px-1 py-0.5 font-mono`

## Animations

- Shared animations and utilities live in the existing `apps/web/src/styles/*.css` modules.
- **Custom keyframes** are defined in the style modules and consumed through Tailwind utilities.
- **View transitions**: fade-out/fade-in on `::view-transition-old/new(root)`, 300ms ease-out
- **Scroll-triggered**: `.animate-on-scroll` fades and slides up when visible, with staggered nth-child delays

### Background Pattern

`body` has a subtle dot-grid using `color-mix()` (adapts to both themes):

```css
background-image: radial-gradient(
  color-mix(in oklch, var(--foreground) 6%, transparent) 1px,
  transparent 1px
);
background-size: 24px 24px;
```

## Accessibility

- Target: WCAG 2.2 AA
- Keyboard-first interactions required
- Focus-visible: `outline-none ring-[3px] ring-ring/50` (shadcn canonical)
- Contrast: High contrast ratios in all color tokens

## Rules

- Use semantic tokens, not raw hex values
- Every component must define states: default, hover, focus-visible, active, disabled
- Use `@apply` with Tailwind utilities for all component styles
- Define tokens in `:root`, map in `@theme inline`, use via `@apply` in `@layer components`
- Never use raw `var(--background)` or `oklch()` literals in markup — use Tailwind utilities (`bg-background`, `text-muted-foreground`)

## File Reference

| File                                    | Purpose                                                |
| --------------------------------------- | ------------------------------------------------------ |
| `apps/web/src/styles/app.css`           | Tailwind v4 entrypoint and style-module imports        |
| `apps/web/src/styles/tokens.css`        | Raw design tokens                                      |
| `apps/web/src/styles/semantic.css`      | Semantic token mappings                                |
| `apps/web/src/styles/components.css`    | Shared utilities such as `.card-hover`, buttons, prose |
| `apps/web/src/layouts/BaseLayout.astro` | Page layout with header, footer                        |
