import type { ThemeConfig } from './theme-store'

/**
 * Compact encoding: 8-char URL-safe string
 *
 * Format: [d|l][l_hex2][c_hex2][h_hex3]
 *   theme: 'd'=dark, 'l'=light
 *   L:     l*100 → 2-char hex (00-64)
 *   C:     c*100 → 2-char hex (00-28)
 *   H:     h     → 3-char hex (000-168)
 *
 * Example: d3712120 = dark, L=0.55 (0x37=55), C=0.18 (0x12=18), H=288 (0x120)
 */

const COMPACT_RE = /^[dl][0-9a-f]{7}$/

export function encodeConfig(config: ThemeConfig): string {
  const themeChar = config.theme === 'dark' ? 'd' : 'l'
  const l = Math.round(config.primary.l * 100)
    .toString(16)
    .padStart(2, '0')
  const c = Math.round(config.primary.c * 100)
    .toString(16)
    .padStart(2, '0')
  const h = Math.round(config.primary.h).toString(16).padStart(3, '0')
  return themeChar + l + c + h
}

export function decodeConfig(encoded: string): ThemeConfig | null {
  const compact = tryCompact(encoded)
  if (compact) return compact
  return tryLegacy(encoded)
}

export function getShareUrl(config: ThemeConfig): string {
  const url = new URL(window.location.href)
  url.searchParams.set('theme', encodeConfig(config))
  return url.toString()
}

export function readFromUrl(): ThemeConfig | null {
  const url = new URL(window.location.href)
  const param = url.searchParams.get('theme')
  if (!param) return null
  return decodeConfig(param)
}

export function clearFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('theme')
  window.history.replaceState(null, '', url.toString())
}

function tryCompact(encoded: string): ThemeConfig | null {
  if (!COMPACT_RE.test(encoded)) return null
  const theme = encoded[0] === 'd' ? 'dark' : 'light'
  const l = parseInt(encoded.slice(1, 3), 16) / 100
  const c = parseInt(encoded.slice(3, 5), 16) / 100
  const h = parseInt(encoded.slice(5, 8), 16)
  return {
    theme,
    primary: { l: clamp(l, 0, 1), c: clamp(c, 0, 0.4), h: clamp(h, 0, 360) },
  }
}

function tryLegacy(encoded: string): ThemeConfig | null {
  try {
    const parsed = JSON.parse(atob(encoded))
    if (!parsed || typeof parsed !== 'object') return null
    const cfg = parsed as Record<string, unknown>
    if (typeof cfg.theme !== 'string' || !['light', 'dark'].includes(cfg.theme)) return null
    if (!cfg.primary || typeof cfg.primary !== 'object') return null
    const prim = cfg.primary as Record<string, unknown>
    if (typeof prim.l !== 'number' || typeof prim.c !== 'number' || typeof prim.h !== 'number')
      return null
    return {
      theme: cfg.theme as ThemeConfig['theme'],
      primary: { l: clamp(prim.l, 0, 1), c: clamp(prim.c, 0, 0.4), h: clamp(prim.h, 0, 360) },
    }
  } catch {
    return null
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
