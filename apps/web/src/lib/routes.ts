import type { Post } from './cms'
import {
  getPostLocale,
  getPostSlug,
  getLocalizedPath,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from './content-utils'

export function getPostPath(post: Post): string {
  const locale = getPostLocale(post)
  const slug = getPostSlug(post)
  return getLocalizedPath(locale, `/blog/${encodeURIComponent(slug)}`)
}

export function getTagPath(tag: string, locale: SupportedLocale): string {
  return getLocalizedPath(locale, `/tags/${encodeURIComponent(tag)}`)
}

export function getCategoryPath(category: string, locale: SupportedLocale): string {
  return getLocalizedPath(locale, `/categories/${encodeURIComponent(category)}`)
}

export function getBlogPath(locale: SupportedLocale): string {
  return getLocalizedPath(locale, '/blog')
}

export function getHomePath(locale: SupportedLocale): string {
  return getLocalizedPath(locale, '/')
}

export { SUPPORTED_LOCALES }
export type { SupportedLocale }
