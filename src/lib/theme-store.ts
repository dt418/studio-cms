import { toOklchString, type OklchColor } from './palette'

export interface ThemeConfig {
  theme: 'light' | 'dark'
  primary: OklchColor
}

export const STORAGE_KEY = 'theme-config'

const DEFAULT_CONFIG: ThemeConfig = {
  theme: 'dark',
  primary: { l: 0.205, c: 0, h: 0 },
}

type Listener = (config: ThemeConfig) => void
const listeners = new Set<Listener>()

function emit(config: ThemeConfig): void {
  listeners.forEach((fn) => fn(config))
}

function read(): ThemeConfig {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_CONFIG }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    const parsed = JSON.parse(raw) as Partial<ThemeConfig>
    return {
      theme:
        parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : DEFAULT_CONFIG.theme,
      primary: validateColor(parsed.primary) ?? { ...DEFAULT_CONFIG.primary },
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

function write(config: ThemeConfig): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* quota exceeded — non-critical */
  }
}

export function applyTheme(config: ThemeConfig): void {
  const root = document.documentElement
  root.classList.toggle('dark', config.theme === 'dark')
  root.style.setProperty('--primary', toOklchString(config.primary))
}

export const themeStore = {
  get(): ThemeConfig {
    return read()
  },

  set(config: ThemeConfig): void {
    write(config)
    applyTheme(config)
    emit(config)
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
}

function validateColor(value: unknown): OklchColor | null {
  if (!value || typeof value !== 'object') return null
  const cfg = value as Record<string, unknown>
  if (typeof cfg.l !== 'number' || typeof cfg.c !== 'number' || typeof cfg.h !== 'number')
    return null
  return { l: clamp(cfg.l, 0, 1), c: clamp(cfg.c, 0, 0.4), h: clamp(cfg.h, 0, 360) }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
