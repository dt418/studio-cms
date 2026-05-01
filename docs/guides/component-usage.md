# Component Usage Guide

How to use and extend components in the danhthanh.dev monorepo.

## Design System Rules

1. **Always use Tailwind utilities** via `@apply` in CSS, or class attributes in templates
2. **Never hardcode colors** — use `bg-background`, `text-foreground`, `border-border`, etc.
3. **All colors use `oklch()` format** in `apps/web/src/styles/tokens.css` tokens
4. **Follow existing patterns** — check similar components before creating new ones
5. **Use `cn()` for React** — import from `@/lib/utils`

## Astro Component Template

```astro
---
import type { CollectionEntry } from 'astro:content'

interface Props {
  post: CollectionEntry<'posts'>
  variant?: 'default' | 'compact'
}

const { post, variant = 'default' } = Astro.props
---

<article class="card group animate-on-scroll">
  <!-- Use design token classes -->
  <div class="bg-card border-border rounded-md border p-4">
    <h3 class="text-foreground">{post.data.title}</h3>
    <p class="text-muted">{post.data.excerpt}</p>
  </div>
</article>
```

## React Component Template

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-md border transition-colors', {
  variants: {
    variant: {
      default: 'bg-card border-border hover:border-white/15',
      outline: 'bg-transparent border-border',
      ghost: 'bg-transparent border-transparent',
    },
    size: {
      sm: 'p-3',
      default: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, size, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, size, className }))} {...props} />
}
```

## Common Patterns

### Homepage Component Inventory

| Component        | Status      | Usage                                                                     |
| ---------------- | ----------- | ------------------------------------------------------------------------- |
| `HeroSection`    | In use      | `apps/web/src/pages/index.astro` hero section                             |
| `SectionHeader`  | In use      | `apps/web/src/pages/index.astro` section intro and metric grid wrapper    |
| `MetricCard`     | In use      | `apps/web/src/pages/index.astro` homepage metric cards                    |
| `MarqueeSection` | In use      | `apps/web/src/pages/index.astro` category marquee                         |
| `FeaturedWork`   | In use      | `apps/web/src/pages/index.astro` featured and recent posts                |
| `ArchiveSection` | In use      | `apps/web/src/pages/index.astro` post archive                             |
| `SpotlightCard`  | In use      | `apps/web/src/components/SpotlightCard.astro` and `ui/spotlight-card.tsx` |
| `.card-hover`    | CSS utility | `apps/web/src/styles/components.css`; reused by card-like components      |

`CardHover.astro` does not exist. Use the `.card-hover` utility class for shared hover treatment
unless a component needs reusable Astro props or slots.

`SpotlightCard` is the reusable wrapper for the interactive spotlight effect. Prefer it when a card
needs cursor/focus-follow lighting. Do not combine it with `.card-hover`; `SpotlightCard` owns its
own card surface, border, radius, and transition classes.

### Section Header Slots

`SectionHeader` has two slot areas with different responsibilities:

| Slot     | Expected content                                            | Example                              |
| -------- | ----------------------------------------------------------- | ------------------------------------ |
| `header` | The full heading element rendered under the eyebrow `title` | `<h2 slot="header">Latest work</h2>` |
| default  | The section body rendered below the header row              | Cards, grids, lists, or rich content |

Use the named `header` slot when the caller needs control over heading level, copy, and responsive
typography. Use the default slot for the section content.

### Card with Hover Effect

```html
<article class="card group">
  <a href="/link" class="block">
    <div class="p-4">
      <h3 class="group-hover:text-muted transition-colors">Title</h3>
    </div>
  </a>
</article>
```

### Spotlight Card Wrapper

```astro
---
import SpotlightCard from '@/components/SpotlightCard.astro'
---

<SpotlightCard as="a" href="/link" class="block p-8">
  <h3 class="text-foreground transition-colors">Title</h3>
  <p class="text-muted-foreground">Interactive hover/focus spotlight.</p>
</SpotlightCard>
```

- React primitive: `apps/web/src/components/ui/spotlight-card.tsx`
- React composition API: `render={<article />}` or `render={<a href="/link" />}`
- Astro wrapper: `apps/web/src/components/SpotlightCard.astro`
- Astro composition API: `as="article"` or `as="a" href="/link"`
- Default spotlight color is synced with `.card-hover` via `color-mix(in oklch, var(--foreground) 12%, transparent)`.
- Current production use: `apps/web/src/components/FeaturedWork.astro` through `PostCard.astro`'s `spotlight` prop.

### Badge/Pill

```html
<span
  class="bg-secondary text-secondary-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold"
>
  Category
</span>
```

### Responsive Grid

```html
<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <!-- cards -->
</div>
```

### Sticky Sidebar

```html
<aside class="sticky top-20 h-fit">
  <!-- content -->
</aside>
```

### Scroll Animation

```html
<div class="animate-on-scroll">
  <!-- fades in on scroll -->
</div>
```

## CSS Class Reference

### Layout

| Class                        | Effect                    |
| ---------------------------- | ------------------------- |
| `.container`                 | Max-width 72rem, centered |
| `min-h-screen flex flex-col` | Full-height page layout   |
| `sticky top-0 z-50`          | Sticky header             |
| `sticky top-20 h-fit`        | Sticky sidebar            |

### Typography

| Class                          | Effect              |
| ------------------------------ | ------------------- |
| `text-foreground`              | Primary text color  |
| `text-muted`                   | Secondary text      |
| `text-muted-foreground`        | Tertiary text       |
| `font-semibold tracking-tight` | Heading style       |
| `line-clamp-2`                 | Truncate to 2 lines |
| `line-clamp-3`                 | Truncate to 3 lines |

### Spacing

| Class          | Effect                        |
| -------------- | ----------------------------- |
| `p-4`          | 16px padding                  |
| `px-6 lg:px-8` | Responsive horizontal padding |
| `py-16`        | 64px vertical padding         |
| `gap-4`        | 16px gap                      |
| `space-y-3`    | 12px vertical spacing         |

### Borders & Backgrounds

| Class                               | Effect                                           |
| ----------------------------------- | ------------------------------------------------ |
| `border border-border`              | Subtle border (`oklch(1 0 0 / 0.08)`)            |
| `bg-background`                     | Page background (`oklch(0.141 0.005 285.823)`)   |
| `bg-card`                           | Card background (`oklch(0.168 0.005 285.823)`)   |
| `bg-secondary`                      | Secondary surface (`oklch(0.238 0.005 285.823)`) |
| `bg-background/80 backdrop-blur-md` | Glass effect                                     |

### Interactive

| Class                                     | Effect              |
| ----------------------------------------- | ------------------- |
| `hover:text-foreground transition-colors` | Hover text change   |
| `group-hover:scale-105`                   | Image zoom on hover |
| `focus-visible:ring`                      | Focus ring          |

## When Creating New Components

1. Check `apps/web/src/components/` for similar patterns
2. Use existing design tokens (no hardcoded colors)
3. Add `animate-on-scroll` class if appropriate
4. Use `.card` wrapper for card-like components
5. Follow the Astro/React template above
6. Add to this documentation
