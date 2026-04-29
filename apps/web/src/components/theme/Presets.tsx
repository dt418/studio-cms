import { presets, type ThemePreset } from '@/lib/presets'
import { toOklchString } from '@/lib/palette'

interface PresetsProps {
  current: string
  onSelect: (preset: ThemePreset) => void
}

export function Presets({ current, onSelect }: PresetsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {presets.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onSelect(preset)}
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
            current === preset.name
              ? 'border-primary/40 bg-primary/10 text-foreground'
              : 'border-border text-muted-foreground hover:border-primary/20 hover:bg-accent hover:text-accent-foreground bg-transparent'
          } `}
        >
          <span
            className="border-border/50 size-3 rounded-full border"
            style={{ background: toOklchString(preset.primary) }}
          />
          {preset.label}
        </button>
      ))}
    </div>
  )
}
