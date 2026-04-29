import type { OklchColor } from './palette'

export interface ThemePreset {
  name: string
  label: string
  primary: OklchColor
}

export const presets: ThemePreset[] = [
  {
    name: 'linear',
    label: 'Linear',
    primary: { l: 0.55, c: 0.18, h: 288 },
  },
  {
    name: 'vercel',
    label: 'Vercel',
    primary: { l: 0.205, c: 0, h: 0 },
  },
  {
    name: 'github',
    label: 'GitHub',
    primary: { l: 0.5, c: 0.2, h: 250 },
  },
]

export const defaultPreset = presets.find((preset) => preset.name === 'vercel')!
