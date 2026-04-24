# Design System

The visual language and component patterns for DanhThanh.dev.

## Philosophy

- **Dark-first**: Default dark theme with near-black backgrounds
- **Minimal**: Subtle borders, no heavy shadows, clean typography
- **Consistent**: All colors use `oklch()` format (Tailwind CSS 4 native)
- **Accessible**: High contrast ratios, semantic HTML, keyboard navigable

---

## Color Tokens

All colors are defined in `src/styles/global.css` as CSS custom properties using `oklch()` format.

### Base Palette

| Token                           | Value                                | Usage                          |
|---------------------------------|--------------------------------------|------------------------------- |
| `--color-background`            | `oklch(0.141 0.005 285.823)`         | Page background                |
| `--color-foreground`            | `oklch(0.922 0.004 286.032)`         | Primary text                   |
| `--color-card`                  | `oklch(0.168 0.005 285.823)`         | Card backgrounds               |
| `--color-card-foreground`       | `oklch(0.922 0.004 286.032)`         | Card text                      |
| `--color-popover`               | `oklch(0.168 0.005 285.823)`         | Popover/dropdown backgrounds   |
| `--color-popover-foreground`    | `oklch(0.922 0.004 286.032)`         | Popover text                   |
| `--color-primary`               | `oklch(0.922 0.004 286.032)`         | Primary actions, links         |
| `--color-primary-foreground`    | `oklch(0.141 0.005 285.823)`         | Text on primary backgrounds    |
| `--color-secondary`             | `oklch(0.238 0.005 285.823)`         | Secondary surfaces, badges     |
| `--color-secondary-foreground`  | `oklch(0.922 0.004 286.032)`         | Text on secondary backgrounds  |
| `--color-muted`                 | `oklch(0.667 0.008 286.032)`         | Secondary text (body copy)     |
| `--color-muted-foreground`      | `oklch(0.488 0.008 286.032)`         | Tertiary text (meta, hints)    |
| `--color-accent`                | `oklch(0.238 0.005 285.823)`         | Hover states                   |
| `--color-accent-foreground`     | `oklch(0.922 0.004 286.032)`         | Text on accent backgrounds     |
| `--color-destructive`           | `oklch(0.637 0.237 25.331)`          | Error states, delete actions   |
| `--color-destructive-foreground`| `oklch(0.922 0.004 286.032)`         | Text on destructive backgrounds|
| `--color-border`                | `oklch(1 0 0 / 0.08)`                | Borders, dividers              |
| `--color-input`                 | `oklch(1 0 0 / 0.12)`                | Input borders                  |
| `--color-ring`                  | `oklch(1 0 0 / 0.3)`                 | Focus rings                    |

### Semantic Colors

| Token                        | Value                            | Usage                    |
| ---------------------------- | -------------------------------- | ------------------------ |
| `--color-success`            | `oklch(0.723 0.219 149.579)`     | Success states           |
| `--color-success-foreground` | `oklch(0.141 0.005 285.823)`     | Text on success          |
| `--color-warning`            | `oklch(0.795 0.184 86.047)`      | Warning states           |
| `--color-warning-foreground` | `oklch(0.141 0.005 285.823)`     | Text on warning          |
| `--color-info`               | `oklch(0.594 0.224 263.17)`      | Info states              |
| `--color-info-foreground`    | `oklch(0.922 0.004 286.032)`     | Text on info             |

### Usage in Tailwind

All component styles use `@apply` with Tailwind utilities. Never write raw CSS for colors.

```css
/* In global.css @layer components */
.card {
  @apply bg-card text-card-foreground rounded-md border border-border;
}
```

```html
<!-- In templates -->
<div class="bg-background text-foreground">...</div>
<div class="bg-card border border-border">...</div>
<div class="text-muted-foreground">...</div>
<div class="bg-secondary text-secondary-foreground">...</div>
```

---

## Typography

### Fonts

| Token          | Value                                                          | Usage              |
| -------------- | ------------------------------------------------------------   | ------------------ |
| `--font-sans`  | `"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif` | Body, headings     |
| `--font-mono`  | `"JetBrains Mono", ui-monospace, SFMono-Regular, monospace`    | Code, inline code  |

### Heading Scale (site-wide)

| Element | Tailwind Class | Size     | Line Height | Weight | Letter Spacing |
| ------- | -------------- | -------- | ----------- | ------ | -------------- |
| `h1`    | `text-5xl`     | `3rem`   | `1`         | `600`  | `-0.04em`      |
| `h2`    | `text-4xl`     | `2.25rem`| `1.1`       | `600`  | `-0.04em`      |
| `h3`    | `text-2xl`     | `1.5rem` | `1.2`       | `600`  | `-0.04em`      |

### Prose Headings (within article content)

| Element      | Tailwind Class | Size      | Line Height |
| ------------ | -------------- | --------- | ----------- |
| `.prose h1`  | `text-4xl`     | `2.25rem` | `1.1`       |
| `.prose h2`  | `text-3xl`     | `1.75rem` | `1.2`       |
| `.prose h3`  | `text-2xl`     | `1.25rem` | `1.3`       |

### Body Text

- Paragraph line height: `leading-[1.75]`
- Prose paragraph line height: `leading-[1.8]`
- Paragraph color: `text-muted`

### Selection

```css
::selection {
  @apply bg-white/15 text-foreground;
}
```

---

## Spacing

### Container

```css
.container {
  @apply mx-auto max-w-7xl px-6 lg:px-8;
}
```

### Common Spacing Patterns

| Context             | Tailwind Pattern               |
| ------------------- | ------------------------------ |
| Header height       | `h-14` (56px)                  |
| Section padding     | `py-16` (64px)                 |
| Card padding        | `p-4` (16px)                   |
| Gap between items   | `gap-4` (16px)                 |
| Footer top padding  | `py-16` (64px)                 |

---

## Border Radius

| Token        | Value    | Usage                    |
| ------------ | -------- | ------------------------ |
| `--radius-sm`| `0.25rem`| Buttons, inputs, badges  |
| `--radius-md`| `0.5rem` | Cards, pre blocks        |
| `--radius-lg`| `0.75rem`| Larger containers        |
| `--radius-xl`| `1rem`   | Images, large surfaces   |

### Usage in Tailwind

```html
<div class="rounded-sm">...</div>
<div class="rounded-md">...</div>
<div class="rounded-lg">...</div>
<div class="rounded-xl">...</div>
<div class="rounded-full">...</div>
```

---

## Shadows

| Token        | Value                                      | Usage             |
| ------------ | ------------------------------------------ | ------------------|
| `--shadow-sm`| `0 1px 2px 0 rgba(0, 0, 0, 0.3)`           | Subtle depth      |
| `--shadow-md`| `0 4px 6px -1px rgba(0, 0, 0, 0.4)`        | Cards, popovers   |
| `--shadow-lg`| `0 10px 15px -3px rgba(0, 0, 0, 0.5)`      | Modals, dropdowns |

Note: Shadows are used sparingly. The design relies more on borders (`border-border`) for separation.

---

## Components

All component styles use `@apply` with Tailwind utilities.

### Button (`.btn`)

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-primary btn-sm">Small</button>
```

| Variant       | @apply Classes                                                                           |
| ---------     | -----------------------------------------------------------------------------------------|
| `btn`         | `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium leading-5 transition-all duration-150 cursor-pointer` |
| `btn-primary` | `bg-primary text-primary-foreground`                                                     |
| `btn-ghost`   | `bg-transparent text-muted`                                                              |
| `btn-outline` | `border border-border bg-transparent text-muted`                                         |
| `btn-sm`      | `px-3 py-1.5 text-xs leading-4`                                                                    |

Focus: `@apply outline-none ring-2 ring-background ring-offset-4 ring-offset-ring`

### Card (`.card`) and `.card-hover`

```html
<article class="card">
  <div class="p-4">
    <h3>Card Title</h3>
    <p>Card content...</p>
  </div>
</article>
```

- `.card`: `@apply bg-card text-card-foreground rounded-md border border-border transition-colors duration-200`
- `.card-hover`: `@apply relative overflow-hidden rounded-md border border-border bg-card/30 p-6 transition-all duration-300`

### Badge

```html
<span class="badge badge-default">Default</span>
<span class="badge badge-outline">Outline</span>
```

| Variant         | @apply Classes                                                                                 |
| ----------------| ---------------------------------------------------------------------------------------------- |
| `badge`         | `inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium` |
| `badge-default` | `border-transparent bg-secondary text-secondary-foreground`                                    |
| `badge-outline` | `bg-transparent border-border text-muted`                                                      |

### Input (`.input`)

```html
<input class="input" placeholder="Search..." />
```

- `@apply flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground`
- Placeholder: `@apply text-muted`
- Focus: `@apply outline-none ring-2 ring-background ring-offset-4 ring-offset-ring`

### Prose (`.prose`)

Used for article content rendered from Markdown.

```html
<div class="prose">
  <!-- Markdown-rendered content -->
</div>
```

- Max width: `@apply max-w-[65ch]`
- Paragraphs: `@apply text-muted mb-5 leading-[1.8]`
- Links: `@apply text-primary font-medium underline underline-offset-4`
- Code: `@apply rounded-sm bg-secondary px-1 py-0.5 font-mono`
- Pre blocks: `@apply rounded-md border border-border bg-secondary p-4 my-6`
- Blockquotes: `@apply my-6 border-l-2 border-border italic text-muted pl-6`

### Separator

```html
<div class="separator"></div>
```

- `@apply h-px bg-border`

### Skeleton

```html
<div class="skeleton"></div>
```

- `@apply rounded-md bg-secondary animate-pulse`

---

## Animations

### Keyframes

| Name             | Duration | Easing       | Effect                |
| ---------------- | -------- | ------------ | --------------------- |
| `slide-up`       | 500ms    | ease-out     | Fade + translateY     |
| `slide-in-left`  | 400ms    | ease-out     | Fade + translateX     |
| `scale-in`       | 400ms    | ease-out     | Fade + scale          |
| `fade-in`        | 300ms    | ease-out     | Fade + slight Y shift |
| `fade-out`       | 300ms    | ease-out     | Fade + slight Y shift |
| `pulse`          | 2s       | cubic-bezier | Opacity oscillation   |

### Utility Classes

```html
<div class="animate-slide-up">...</div>
<div class="animate-scale-in">...</div>
<div class="animate-slide-in-left">...</div>
```

### Scroll Animations

```html
<div class="animate-on-scroll">...</div>
```

- Initial: `opacity: 0`, `translateY(24px)`
- Visible: `opacity: 1`, `translateY(0)`
- Transition: `500ms ease-out`
- Staggered delays: 60ms, 120ms, 180ms, 240ms, 300ms for nth-child(2-6)
- Triggered by IntersectionObserver in `BaseLayout.astro`

### View Transitions

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
  animation-timing-function: ease-out;
}
```

- Fade-out: slides up 8px while fading
- Fade-in: slides up from 8px below while fading

---

## Background Pattern

The body has a subtle dot-grid background (only raw CSS, not Tailwind-able):

```css
body {
  @apply bg-background text-foreground font-sans antialiased;
  background-image: radial-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

## Layout Patterns

### Header

- Sticky, `z-50`, bottom border
- Background: `bg-background/80` with `backdrop-blur-md`
- Height: `h-14` (56px)
- Logo: "DT" text, links to `/`
- Nav: Blog, RSS links, right-aligned with `ml-auto`

### Footer

- Top border, `py-16` padding
- Two-column grid on desktop
- Left: tagline + description
- Right: links (Email, GitHub, RSS, LinkedIn)
- Bottom: copyright with muted text

### Page Structure

```tree
BaseLayout
├── Header (sticky)
├── Main (flex-1)
│   └── <slot />
└── Footer
```

---

## Responsive Breakpoints

| Breakpoint | Width   | Usage              |
| ---------- | ------- | ------------------ |
| `sm`       | 640px   | Mobile landscape   |
| `md`       | 768px   | Tablet             |
| `lg`       | 1024px  | Desktop            |
| `xl`       | 1280px  | Large desktop      |
| `2xl`      | 1536px  | Extra large        |

---

## Code Blocks

Powered by Expressive Code with TwoSlash:

- Themes: `dracula` (dark), `github-light` (light)
- Border radius: `0.5rem`
- Shadow color: `#124`

---

## CSS Architecture

### Rules

1. **Use `@apply` for all component styles** — never write raw CSS properties when Tailwind utilities exist
2. **Only use raw CSS for**: `background-image` (dot-grid), `::view-transition`, `@keyframes`, `transition-delay`, `list-style-type`
3. **All colors use `oklch()` format** — Tailwind CSS 4 native color space
4. **Define tokens in `:root`**, map them in `@theme`, use via `@apply` in `@layer components`

### File Structure

```
src/styles/global.css
├── @import "tailwindcss"
├── :root { --color-*, --radius-*, --font-*, --shadow-* }
├── @theme { map tokens to Tailwind }
├── @layer base { body, headings, selection }
├── @layer components { .btn, .card, .badge, .input, .prose, etc. }
└── @layer utilities { .animate-* }
```

---

## Files

| File | Purpose |
| ---- | ------- |
| `src/styles/global.css` | All design tokens and component styles (via @apply) |
| `src/layouts/BaseLayout.astro` | Page layout with header, footer, scroll observer |
| `src/components/ui/button.tsx` | React button with CVA variants |
