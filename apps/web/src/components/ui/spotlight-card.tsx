import { useRender } from '@base-ui/react/use-render'
import { createElement } from 'react'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type SpotlightCardProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'a'
  href?: string
  render?: useRender.RenderProp
  spotlightColor?: string
}

function SpotlightCard({
  as = 'div',
  children,
  className,
  href,
  render,
  spotlightColor = 'color-mix(in oklch, var(--foreground) 12%, transparent)',
  ...props
}: SpotlightCardProps) {
  if (as === 'a' && !href && !render) {
    throw new Error('SpotlightCard with as="a" requires an href prop')
  }

  const cardRef = useRef<HTMLElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove: React.MouseEventHandler<HTMLElement> = (event) => {
    if (!cardRef.current || isFocused) {
      return
    }

    const rect = cardRef.current.getBoundingClientRect()
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  return useRender({
    defaultTagName: 'div',
    render:
      render ?? (as === 'div' ? undefined : createElement(as, as === 'a' ? { href } : undefined)),
    ref: cardRef,
    props: {
      ...props,
      'data-slot': 'spotlight-card',
      onMouseMove: handleMouseMove,
      onFocus: () => {
        setIsFocused(true)
        setOpacity(0.6)
      },
      onBlur: () => {
        setIsFocused(false)
        setOpacity(0)
      },
      onMouseEnter: () => {
        setOpacity(0.6)
      },
      onMouseLeave: () => {
        setOpacity(0)
      },
      className: cn(
        'border-border bg-card/30 relative overflow-hidden rounded-md border p-8 transition-all duration-300',
        className
      ),
      children: (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
            style={{
              opacity,
              background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
            }}
          />
          <div className="relative z-10">{children}</div>
        </>
      ),
    },
  })
}

export { SpotlightCard }
export type { SpotlightCardProps }
