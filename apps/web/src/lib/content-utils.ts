import type { CollectionEntry } from 'astro:content'

export const SUPPORTED_LOCALES = ['vi', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

export function getPostLocale(post: CollectionEntry<'posts'>): SupportedLocale {
  const firstSegment = post.id.split('/')[0]
  if (firstSegment && isValidLocale(firstSegment)) return firstSegment
  return post.data.language ?? 'vi'
}

export function getPostSlug(post: CollectionEntry<'posts'>): string {
  const segments = post.id.split('/')
  if (segments[0] && isValidLocale(segments[0])) {
    return segments.slice(1).join('/')
  }
  return post.data.slug ?? post.id
}

export function getLocalizedPath(locale: SupportedLocale, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${cleanPath}`
}

export function getCanonicalUrl(locale: SupportedLocale, path: string, siteUrl: string): string {
  const localizedPath = getLocalizedPath(locale, path)
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
  return `${base}${localizedPath}`
}

export function getAlternateUrls(path: string, siteUrl: string): Record<SupportedLocale, string> {
  const result = {} as Record<SupportedLocale, string>
  for (const locale of SUPPORTED_LOCALES) {
    result[locale] = getCanonicalUrl(locale, path, siteUrl)
  }
  return result
}
