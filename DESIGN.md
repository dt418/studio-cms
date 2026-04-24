# Blog Design System

## Philosophy

- **Dark-first**: Default dark theme with near-black backgrounds
- **Minimal**: Subtle borders, no heavy shadows, clean typography
- **Consistent**: All colors use `oklch()` format (Tailwind CSS 4 native)
- **Accessible**: High contrast ratios, semantic HTML, keyboard navigable

## Color Tokens

Defined in `src/styles/global.css` as CSS custom properties.

### Base Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `oklch(0.141 0.005 285.823)` | Page background |
| `--color-foreground` | `oklch(0.922 0.004 286.032)` | Primary text |
| `--color-card` | `oklch(0.168 0.005 285.823)` | Card backgrounds |
| `--color-primary` | `oklch(0.922 0.004 286.032)` | Primary actions |
| `--color-secondary` | `oklch(0.238 0.005 285.823)` | Secondary surfaces |
| `--color-muted` | `oklch(0.667 0.008 286.032)` | Body copy |
| `--color-border` | `oklch(1 0 0 / 0.08)` | Borders |
| `--color-destructive` | `oklch(0.637 0.237 25.331)` | Error states |

## Typography

- **Font**: `"Inter", ui-sans-serif, system-ui, -apple-system`
- **Mono**: `"JetBrains Mono", ui-monospace`

### Heading Scale

| Element | Size | Weight |
|---------|------|--------|
| h1 | 3rem | 600 |
| h2 | 2.25rem | 600 |
| h3 | 1.5rem | 600 |

## Components

### Button

| Variant | Classes |
|---------|---------|
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
- Paragraphs: `text-muted mb-5 leading-[1.8]`
- Links: `text-primary font-medium underline underline-offset-4`

## Accessibility

- Target: WCAG 2.2 AA
- Keyboard-first interactions
- Focus-visible: `ring-2 ring-background ring-offset-4 ring-offset-ring`

## Rules

- Use semantic tokens, not raw hex values
- Every component must define states: default, hover, focus-visible, active, disabled
- Use `@apply` with Tailwind utilities
- Define tokens in `:root`, map in `@theme`, use via `@apply` in `@layer components`

## File Reference

| File | Purpose |
|------|--------|
| `src/styles/global.css` | Design tokens + component styles |
| `src/layouts/BaseLayout.astro` | Page layout |
| `src/components/ui/button.tsx` | React button | 