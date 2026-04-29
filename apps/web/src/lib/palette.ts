export interface OklchColor {
  l: number
  c: number
  h: number
}

export function toOklchString(color: OklchColor): string {
  return `oklch(${color.l} ${color.c} ${color.h})`
}

export function fromOklchString(value: string): OklchColor | null {
  const match = value.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (!match) return null
  return {
    l: parseFloat(match[1]!),
    c: parseFloat(match[2]!),
    h: parseFloat(match[3]!),
  }
}

export function mixWithWhite(color: OklchColor, ratio: number): string {
  return `color-mix(in oklch, ${toOklchString(color)} ${Math.round(ratio * 100)}%, #fff)`
}

export function mixWithBlack(color: OklchColor, ratio: number): string {
  return `color-mix(in oklch, ${toOklchString(color)} ${Math.round(ratio * 100)}%, #000)`
}

export function foregroundFor(color: OklchColor): OklchColor {
  return color.l > 0.5
    ? { l: 0.145, c: color.c * 0.1, h: color.h }
    : { l: 0.985, c: color.c * 0.05, h: color.h }
}

export function toOklchCssString(color: OklchColor): string {
  return `${color.l} ${color.c} ${color.h}`
}
