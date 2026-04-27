# Design System

The visual language and component patterns for DanhThanh.dev.

## Philosophy

- **Dark-first**: Default dark theme with near-black backgrounds
- **Minimal**: Subtle borders, no heavy shadows, clean typography
- **Consistent**: All colors use `oklch()` format (Tailwind CSS 4 native)
- **Accessible**: High contrast ratios, semantic HTML, keyboard navigable

---

## Color Tokens

All colors defined in `src/styles/global.css` as CSS custom properties using `oklch()` format, following the canonical shadcn/ui theme (base-nova / neutral).

**Token layers:**
1. **Bare tokens** (`--background`, `--foreground`, ...) on `:root` (light) and `.dark` — source of truth
2. **`@theme inline`** bridges them to Tailwind v4's `--color-*` namespace
3. **Tailwind utilities** (`bg-background`, `text-muted-foreground`, ...) consumed by components

Toggle dark mode with `class="dark"` on `<html>` (handled by `ThemeToggle.astro`). See `DESIGN.md` for the full token → utility pipeline.

### Core Palette

| Token | Light (`:root`) | Dark (`.dark`) | Role |
|-------|-----------------|----------------|------|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page surface |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card surface |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Card text |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Floating panels |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Popover text |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary actions, links |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Text on primary |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Subtle surfaces |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | De-emphasized text |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover surfaces |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states |
| `--destructive-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Text on destructive |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borders, dividers |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus rings |

### Semantic Colors (Project Extensions)

| Token | Value | Role |
|-------|-------|------|
| `--success` | `oklch(0.723 0.219 149.579)` | Success states |
| `--success-foreground` | `oklch(0.145 0 0)` | Text on success |
| `--warning` | `oklch(0.795 0.184 86.047)` | Warning states |
| `--warning-foreground` | `oklch(0.145 0 0)` | Text on warning |
| `--info` | `oklch(0.594 0.224 263.17)` | Info states |
| `--info-foreground` | `oklch(0.985 0 0)` | Text on info |

### Chart Palette

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` | Chart color 1 |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` | Chart color 2 |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` | Chart color 3 |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` | Chart color 4 |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` | Chart color 5 |

### Sidebar

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Sidebar surface |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Sidebar text |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)` | Sidebar primary |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Text on sidebar primary |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Sidebar accent |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on sidebar accent |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Sidebar border |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Sidebar focus ring |

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
- Paragraph color: `text-muted-foreground`

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

A single `--radius` base (default `0.5rem`); the scale is derived inside `@theme inline`:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.5rem` | Base radius |
| `--radius-sm` | `calc(var(--radius) - 4px)` | Buttons, inputs, badges |
| `--radius-md` | `calc(var(--radius) - 2px)` | Cards, pre blocks |
| `--radius-lg` | `var(--radius)` | Larger containers |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Images, large surfaces |

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

Shadows use Tailwind v4's default shadow scale (`shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`). Used sparingly — the design relies more on borders (`border-border`) for separation.

### Usage

```html
<div class="shadow-sm">...</div>
<div class="shadow-md">...</div>
<div class="shadow-lg">...</div>
```

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
| `btn-ghost`   | `bg-transparent text-muted-foreground`                                                   |
| `btn-outline` | `border border-border bg-transparent text-muted-foreground`                                         |
| `btn-sm`      | `px-3 py-1.5 text-xs leading-4`                                                                    |

Focus: `@apply outline-none ring-[3px] ring-ring/50`

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
| `badge`         | `inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium leading-5 transition-all duration-150` |
| `badge-default` | `border-transparent bg-secondary text-secondary-foreground`                                    |
| `badge-outline` | `bg-transparent border-border text-muted-foreground`                                                      |

### Input (`.input`)

```html
<input class="input" placeholder="Search..." />
```

- `@apply flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground transition-all duration-150`
- Placeholder: `@apply text-muted-foreground`
- Focus: `@apply outline-none ring-[3px] ring-ring/50`

### Prose (`.prose`)

Used for article content rendered from Markdown.

```html
<div class="prose">
  <!-- Markdown-rendered content -->
</div>
```

- Max width: `@apply max-w-[65ch]`
- Paragraphs: `@apply text-muted-foreground mb-5 leading-[1.8]`
- Links: `@apply text-primary font-medium underline underline-offset-4`
- Code: `@apply rounded-sm bg-secondary px-1 py-0.5 font-mono`
- Pre blocks: `@apply rounded-md border border-border bg-secondary p-4 my-6`
- Blockquotes: `@apply my-6 border-l-2 border-border italic text-muted-foreground pl-6`

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

`@import 'tw-animate-css'` provides shadcn-native animation utilities (`animate-fade-in`, `animate-slide-in-from-left`, etc.). Custom keyframes extend these with project-specific animations.

### Custom Keyframes (defined at top level in global.css)

| Name             | Duration | Easing       | Effect                |
| ---------------- | -------- | ------------ | --------------------- |
| `slide-up`       | 500ms    | ease-out     | Fade + translateY     |
| `slide-in-left`  | 400ms    | ease-out     | Fade + translateX     |
| `scale-in`       | 400ms    | ease-out     | Fade + scale          |
| `fade-in`        | 300ms    | ease-out     | Fade + translateY(8px → 0) |
| `fade-out`       | 300ms    | ease-out     | Fade + translateY(0 → -8px) |
| `marquee`        | 30s      | linear       | Infinite translateX   |

### @theme inline animation bindings

```css
@theme inline {
  --animate-slide-up: slide-up 500ms ease-out both;
  --animate-scale-in: scale-in 400ms ease-out both;
  --animate-slide-in-left: slide-in-left 400ms ease-out both;
  --animate-marquee: marquee 30s linear infinite;
}
```

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
  background-image: radial-gradient(
    color-mix(in oklch, var(--foreground) 6%, transparent) 1px,
    transparent 1px
  );
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
4. **Define tokens in `:root`**, map them in `@theme inline`, use via `@apply` in `@layer components`
5. **`@import 'tw-animate-css'`** provides shadcn-native animation utilities
6. Never use raw `var(--background)` or `oklch()` literals in markup — use Tailwind utilities

### File Structure

```
src/styles/global.css
├── @import 'tailwindcss'
├── @import 'tw-animate-css'
├── :root { bare tokens (--background, --foreground, ...), --radius, --font-* }
├── .dark { dark overrides for bare tokens }
├── @theme inline { --color-* bridge, --radius-*, --animate-* }
├── @layer base { *, body (dot-grid), headings, selection }
├── @layer components { .container, .btn, .card, .badge, .input, .prose, .separator, .skeleton }
└── Raw: @keyframes, ::view-transition, .animate-on-scroll
```

---

## Files

| File | Purpose |
| ---- | ------- |
| `src/styles/global.css` | Design tokens, `tw-animate-css`, component styles, animations |
| `src/layouts/BaseLayout.astro` | Page layout with header, footer, scroll observer |
| `src/components/ui/button.tsx` | React button with CVA variants |
