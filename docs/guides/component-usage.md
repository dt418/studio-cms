# Component Usage Guide

How to use and extend components in the StudioCMS Blog project.

## Design System Rules

1. **Always use Tailwind utilities** via `@apply` in CSS, or class attributes in templates
2. **Never hardcode colors** — use `bg-background`, `text-foreground`, `border-border`, etc.
3. **All colors use `oklch()` format** in `src/styles/global.css` tokens
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
  <div class="p-4 bg-card border border-border rounded-md">
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
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, size, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## Common Patterns

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

### Badge/Pill

```html
<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
  Category
</span>
```

### Responsive Grid

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

| Class | Effect |
|-------|--------|
| `.container` | Max-width 72rem, centered |
| `min-h-screen flex flex-col` | Full-height page layout |
| `sticky top-0 z-50` | Sticky header |
| `sticky top-20 h-fit` | Sticky sidebar |

### Typography

| Class | Effect |
|-------|--------|
| `text-foreground` | Primary text color |
| `text-muted` | Secondary text |
| `text-muted-foreground` | Tertiary text |
| `font-semibold tracking-tight` | Heading style |
| `line-clamp-2` | Truncate to 2 lines |
| `line-clamp-3` | Truncate to 3 lines |

### Spacing

| Class | Effect |
|-------|--------|
| `p-4` | 16px padding |
| `px-6 lg:px-8` | Responsive horizontal padding |
| `py-16` | 64px vertical padding |
| `gap-4` | 16px gap |
| `space-y-3` | 12px vertical spacing |

### Borders & Backgrounds

| Class | Effect |
|-------|--------|
| `border border-border` | Subtle border (`oklch(1 0 0 / 0.08)`) |
| `bg-background` | Page background (`oklch(0.141 0.005 285.823)`) |
| `bg-card` | Card background (`oklch(0.168 0.005 285.823)`) |
| `bg-secondary` | Secondary surface (`oklch(0.238 0.005 285.823)`) |
| `bg-background/80 backdrop-blur-md` | Glass effect |

### Interactive

| Class | Effect |
|-------|--------|
| `hover:text-foreground transition-colors` | Hover text change |
| `group-hover:scale-105` | Image zoom on hover |
| `focus-visible:ring` | Focus ring |

## When Creating New Components

1. Check `src/components/` for similar patterns
2. Use existing design tokens (no hardcoded colors)
3. Add `animate-on-scroll` class if appropriate
4. Use `.card` wrapper for card-like components
5. Follow the Astro/React template above
6. Add to this documentation
