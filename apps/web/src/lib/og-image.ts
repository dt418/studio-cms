import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { getImageUrl } from './post'

export function resolveOgImage(
  img: string | undefined,
  siteUrl: string,
  defaultImage: string
): string {
  if (!img) return defaultImage
  const resolvedUrl = getImageUrl(img, siteUrl)
  if (!resolvedUrl) return defaultImage
  if (img.startsWith('http')) return resolvedUrl
  const normalizedPath = img.startsWith('/') ? img.slice(1) : img
  return existsSync(resolve('public', normalizedPath)) ? resolvedUrl : defaultImage
}
