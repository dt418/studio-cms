import { useId } from 'react'
import type { OklchColor } from '@/lib/palette'

interface ColorControlProps {
  color: OklchColor
  onChange: (color: OklchColor) => void
}

const SLIDERS: {
  key: keyof OklchColor
  label: string
  min: number
  max: number
  step: number
  format: (v: number) => string
}[] = [
  {
    key: 'l',
    label: 'L',
    min: 0,
    max: 1,
    step: 0.01,
    format: (val) => `${Math.round(val * 100)}%`,
  },
  {
    key: 'c',
    label: 'C',
    min: 0,
    max: 0.4,
    step: 0.01,
    format: (val) => val.toFixed(2),
  },
  {
    key: 'h',
    label: 'H',
    min: 0,
    max: 360,
    step: 1,
    format: (val) => `${Math.round(val)}°`,
  },
]

export function ColorControl({ color, onChange }: ColorControlProps) {
  const id = useId()

  return (
    <div className="space-y-3">
      {SLIDERS.map(({ key, label, min, max, step, format }) => (
        <div key={key} className="flex items-center gap-3">
          <label
            htmlFor={`${id}-${key}`}
            className="w-5 text-xs font-mono text-muted-foreground tabular-nums"
          >
            {label}
          </label>
          <input
            id={`${id}-${key}`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={color[key]}
            onChange={(e) => onChange({ ...color, [key]: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer
              bg-muted
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:size-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-background
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:active:scale-110
              [&::-moz-range-thumb]:size-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-primary
              [&::-moz-range-thumb]:shadow-sm
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-background"
          />
          <output className="w-12 text-right text-xs font-mono text-muted-foreground tabular-nums">
            {format(color[key])}
          </output>
        </div>
      ))}
      <div
        className="h-8 rounded-md border border-border transition-colors"
        style={{ background: `oklch(${color.l} ${color.c} ${color.h})` }}
      />
    </div>
  )
}
