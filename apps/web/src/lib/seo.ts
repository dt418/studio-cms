import type { Post } from './content-queries'
import {
  getLocalizedPath,
  getPostLocale,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from './content-utils'
import { isPublicPost } from './post-visibility'
import { getPostPath } from './routes'
import { isHttpWithoutCredentialsOrFragment, normalizeSiteOrigin, toAbsoluteUrl } from './site'

export type RobotsDirective = 'index, follow' | 'noindex, nofollow'
export type SeoImageType = 'image/png' | 'image/webp'

export interface SeoImage {
  url: string
  type: SeoImageType
  width: number
  height: number
}

export interface SeoImageInput {
  url: string
  type: SeoImageType
  width: number
  height: number
}

export interface AlternateLink {
  locale: SupportedLocale
  href: string
}

export interface SeoDocument {
  title: string
  description: string
  canonical?: string
  robots: RobotsDirective
  lang: SupportedLocale
  alternates: AlternateLink[]
  defaultAlternate?: string
  openGraph?: {
    type: 'website' | 'article'
    url: string
    image: SeoImage
    publishedTime?: string
    modifiedTime?: string
  }
  jsonLd: Record<string, unknown>[]
  author?: string
}

interface SeoPageInputBase {
  title: string
  description: string
  lang: SupportedLocale
  siteOrigin: string
}

interface SeoContentPageInput extends SeoPageInputBase {
  path: string
  canonicalUrl?: string
  image?: SeoImage | SeoImageInput
  type?: 'website' | 'article'
  publishedTime?: Date
  modifiedTime?: Date
  jsonLd?: Record<string, unknown>[]
  author?: string
}

export interface IndexableSeoPageInput extends SeoContentPageInput {
  kind: 'indexable'
  alternates?: AlternateLink[]
}

export interface NoindexContentSeoPageInput extends SeoContentPageInput {
  kind: 'noindex-content'
}

export interface NonCanonicalSeoPageInput extends SeoPageInputBase {
  kind: 'noncanonical'
}

export type SeoPageInput =
  | IndexableSeoPageInput
  | NoindexContentSeoPageInput
  | NonCanonicalSeoPageInput

export function normalizeCanonicalUrl(value: string): string {
  const canonical = value.trim()
  if (!canonical || !isHttpWithoutCredentialsOrFragment(canonical)) {
    throw new Error('canonicalUrl must be an absolute http(s) URL without credentials or fragments')
  }
  return new URL(canonical).href
}

export function resolveSeoImage(
  image: SeoImage | SeoImageInput | string | undefined,
  siteOrigin: string
): SeoImage {
  const origin = normalizeSiteOrigin(siteOrigin)
  if (!image) {
    return {
      url: toAbsoluteUrl('/og-image.png', origin),
      type: 'image/png',
      width: 1200,
      height: 630,
    }
  }
  if (typeof image === 'string') {
    throw new Error('Custom SEO images require a URL, MIME type, width, and height')
  }

  const source = image.url
  if (!source.trim()) throw new Error('Custom SEO image URL is required')
  if (!Number.isInteger(image.width) || image.width <= 0) {
    throw new Error('Custom SEO image width must be a positive integer')
  }
  if (!Number.isInteger(image.height) || image.height <= 0) {
    throw new Error('Custom SEO image height must be a positive integer')
  }
  if (image.type !== 'image/png' && image.type !== 'image/webp') {
    throw new Error('Custom SEO image type must be image/png or image/webp')
  }

  const trimmed = source.trim()
  let url: string
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Custom SEO image URL must use http or https')
    }
    url = normalizeCanonicalUrl(trimmed)
  } catch (error) {
    if (error instanceof Error && error.message === 'Custom SEO image URL must use http or https') {
      throw error
    }
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
      throw new Error('Custom SEO image URL must be root-relative or absolute http(s)')
    }
    const parsed = new URL(trimmed, `${origin}/`)
    if (parsed.hash || parsed.username || parsed.password) {
      throw new Error('Custom SEO image URL must not contain credentials or fragments')
    }
    url = parsed.href
  }

  const pathname = new URL(url).pathname.toLowerCase()
  const extension = pathname.match(/\.([a-z0-9]+)$/)?.[1]
  if (extension && extension !== 'png' && extension !== 'webp') {
    throw new Error('Custom SEO image extension must be .png or .webp')
  }
  if (
    (extension === 'png' && image.type !== 'image/png') ||
    (extension === 'webp' && image.type !== 'image/webp')
  ) {
    throw new Error('Custom SEO image type must match its .png or .webp extension')
  }

  return { url, type: image.type, width: image.width, height: image.height }
}

function dedupeAlternates(alternates: AlternateLink[] = []): AlternateLink[] {
  const seen = new Set<SupportedLocale>()
  const result: AlternateLink[] = []
  for (const alternate of alternates) {
    if (seen.has(alternate.locale)) continue
    seen.add(alternate.locale)
    result.push({ locale: alternate.locale, href: normalizeCanonicalUrl(alternate.href) })
  }
  return result.sort(
    (left, right) =>
      SUPPORTED_LOCALES.indexOf(left.locale) - SUPPORTED_LOCALES.indexOf(right.locale)
  )
}

export function createSeoDocument(input: SeoPageInput): SeoDocument {
  const origin = normalizeSiteOrigin(input.siteOrigin)
  if (input.kind === 'noncanonical') {
    return {
      title: input.title,
      description: input.description,
      robots: 'noindex, nofollow',
      lang: input.lang,
      alternates: [],
      jsonLd: [],
      // Redirect/error documents must not carry article-author metadata.
    }
  }

  const canonical = normalizeCanonicalUrl(input.canonicalUrl ?? toAbsoluteUrl(input.path, origin))
  const alternates = input.kind === 'indexable' ? dedupeAlternates(input.alternates) : []
  const image = resolveSeoImage(input.image, origin)
  const openGraph = {
    type: input.type ?? 'website',
    url: canonical,
    image,
    ...(input.publishedTime && { publishedTime: input.publishedTime.toISOString() }),
    ...(input.modifiedTime && { modifiedTime: input.modifiedTime.toISOString() }),
  }

  const defaultAlternate = alternates.find((alternate) => alternate.locale === 'vi')?.href
  return {
    title: input.title,
    description: input.description,
    canonical,
    robots: input.kind === 'indexable' ? 'index, follow' : 'noindex, nofollow',
    lang: input.lang,
    alternates,
    ...(defaultAlternate && { defaultAlternate }),
    openGraph,
    jsonLd: input.jsonLd ?? [],
    ...(input.type === 'article' && input.author ? { author: input.author } : {}),
  }
}

export function resolvePostDescription(post: Post): string {
  return post.data.description?.trim() || post.data.excerpt
}

export function resolvePostCanonical(post: Post, siteOrigin: string): string {
  const supplied = post.data.canonicalUrl?.trim()
  return supplied ? normalizeCanonicalUrl(supplied) : toAbsoluteUrl(getPostPath(post), siteOrigin)
}

export function isExternalCanonical(post: Post, siteOrigin: string): boolean {
  return isNonLocalCanonical(post, siteOrigin)
}

/**
 * A supplied canonical is local only when it exactly names this post's generated route.
 * Same-origin overrides (including a different path or query) are still non-local
 * canonical declarations for sitemap and hreflang purposes.
 */
export function isNonLocalCanonical(post: Post, siteOrigin: string): boolean {
  if (!post.data.canonicalUrl?.trim()) return false
  const origin = normalizeSiteOrigin(siteOrigin)
  const generatedUrl = toAbsoluteUrl(getPostPath(post), origin)
  return resolvePostCanonical(post, origin) !== generatedUrl
}

export function isSitemapEligiblePost(post: Post, siteOrigin: string): boolean {
  return isPublicPost(post) && !isNonLocalCanonical(post, siteOrigin)
}

export function getPostAlternateLinks(
  current: Post,
  posts: Post[],
  siteOrigin: string
): AlternateLink[] {
  if (
    !isPublicPost(current) ||
    !current.data.translationKey ||
    isNonLocalCanonical(current, siteOrigin)
  ) {
    return []
  }
  return posts
    .filter(
      (post) =>
        post.data.translationKey === current.data.translationKey &&
        isPublicPost(post) &&
        !isNonLocalCanonical(post, siteOrigin)
    )
    .map((post) => ({
      locale: getPostLocale(post),
      href: toAbsoluteUrl(getPostPath(post), siteOrigin),
    }))
    .filter(
      (link, index, links) => links.findIndex((item) => item.locale === link.locale) === index
    )
    .sort(
      (left, right) =>
        SUPPORTED_LOCALES.indexOf(left.locale) - SUPPORTED_LOCALES.indexOf(right.locale)
    )
}

export function getLocaleNeutralAlternates(path: string, siteOrigin: string): AlternateLink[] {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    href: toAbsoluteUrl(getLocalizedPath(locale, path), siteOrigin),
  }))
}

export interface BreadcrumbInput {
  homeLabel: string
  homeUrl: string
  blogLabel?: string
  blogUrl?: string
  currentLabel: string
  currentUrl: string
}

export interface BreadcrumbSchema extends Record<string, unknown> {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export function buildBreadcrumbList(input: BreadcrumbInput): BreadcrumbSchema {
  const crumbs = [
    { name: input.homeLabel, item: normalizeCanonicalUrl(input.homeUrl) },
    ...(input.blogLabel && input.blogUrl
      ? [{ name: input.blogLabel, item: normalizeCanonicalUrl(input.blogUrl) }]
      : []),
    { name: input.currentLabel, item: normalizeCanonicalUrl(input.currentUrl) },
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      ...crumb,
    })),
  }
}

interface WebsiteSchemaInput {
  name: string
  description: string
  author: string
  siteOrigin: string
  sameAs?: string[]
}

function websiteSchemaInput(
  inputOrName: WebsiteSchemaInput | string,
  url?: string,
  description?: string,
  author?: string,
  sameAs: string[] = []
): WebsiteSchemaInput {
  if (typeof inputOrName !== 'string') return inputOrName
  return {
    name: inputOrName,
    description: description ?? '',
    author: author ?? '',
    siteOrigin: url ?? '',
    sameAs,
  }
}

export function buildWebsiteSchema(
  input: WebsiteSchemaInput
): [Record<string, unknown>, Record<string, unknown>]
export function buildWebsiteSchema(
  name: string,
  url: string,
  description: string,
  author: string,
  sameAs?: string[]
): [Record<string, unknown>, Record<string, unknown>]
export function buildWebsiteSchema(
  inputOrName: WebsiteSchemaInput | string,
  url?: string,
  description?: string,
  author?: string,
  sameAs: string[] = []
): [Record<string, unknown>, Record<string, unknown>] {
  const input = websiteSchemaInput(inputOrName, url, description, author, sameAs)
  const origin = normalizeSiteOrigin(input.siteOrigin)
  const websiteId = `${origin}/#website`
  const personId = `${origin}/#person`
  const websiteUrl = toAbsoluteUrl('/vi/', origin)
  const personUrl = toAbsoluteUrl('/vi/about', origin)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: input.name,
      url: websiteUrl,
      description: input.description,
      inLanguage: [...SUPPORTED_LOCALES],
      publisher: { '@id': personId },
      author: { '@id': personId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name: input.author,
      url: personUrl,
      ...(input.sameAs && input.sameAs.length > 0 && { sameAs: input.sameAs }),
    },
  ]
}

// The site entity is origin-based, while its representative localized page is /vi/.
export const buildWebSiteSchema = buildWebsiteSchema

export function buildProfilePageSchema(input: {
  name: string
  description: string
  url: string
  siteName: string
  siteUrl: string
  lang?: SupportedLocale
  personId?: string
  websiteId?: string
}): Record<string, unknown> {
  const url = normalizeCanonicalUrl(input.url)
  const origin = normalizeSiteOrigin(input.siteUrl)
  const language = input.lang ?? (url.includes('/en/') ? 'en' : 'vi')
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#webpage`,
    name: input.name,
    description: input.description,
    inLanguage: language,
    url,
    mainEntity: { '@id': input.personId ?? `${origin}/#person` },
    isPartOf: {
      '@type': 'WebSite',
      '@id': input.websiteId ?? `${origin}/#website`,
      name: input.siteName,
      url: toAbsoluteUrl('/vi/', origin),
    },
  }
}

export function buildCollectionPageSchema(input: {
  name: string
  description: string
  url: string
  siteName: string
  siteUrl: string
  lang?: SupportedLocale
}): Record<string, unknown> {
  const url = normalizeCanonicalUrl(input.url)
  const origin = normalizeSiteOrigin(input.siteUrl)
  const language = input.lang ?? (url.includes('/en/') ? 'en' : 'vi')
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    inLanguage: language,
    url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: input.siteName,
      url: toAbsoluteUrl('/vi/', origin),
    },
  }
}

export function buildWebPageSchema(input: {
  name: string
  description: string
  url: string
  siteName: string
  siteUrl: string
  lang?: SupportedLocale
  type?: 'WebPage' | 'ProfilePage'
}): Record<string, unknown> {
  const url = normalizeCanonicalUrl(input.url)
  const origin = normalizeSiteOrigin(input.siteUrl)
  const language = input.lang ?? (url.includes('/en/') ? 'en' : 'vi')
  return {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'WebPage',
    name: input.name,
    description: input.description,
    inLanguage: language,
    url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: input.siteName,
      url: toAbsoluteUrl('/vi/', origin),
    },
  }
}

export function buildArticleSchema(input: {
  title: string
  description: string
  url: string
  publishedAt: Date
  updatedAt?: Date
  author: string
  siteName: string
  siteUrl: string
  image?: string
  keywords?: string[]
}): Record<string, unknown> {
  const url = normalizeCanonicalUrl(input.url)
  const origin = normalizeSiteOrigin(input.siteUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    ...(input.image && { image: normalizeCanonicalUrl(input.image) }),
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: input.author,
      url: toAbsoluteUrl('/vi/about', origin),
      '@id': `${origin}/#person`,
    },
    publisher: {
      '@type': 'Organization',
      name: input.siteName,
      url: toAbsoluteUrl('/vi/', origin),
    },
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(input.keywords && input.keywords.length > 0 && { keywords: input.keywords }),
  }
}

export function serializeJsonLd(value: Record<string, unknown>[]): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => {
    const escapes: Record<string, string> = {
      '<': '\\u003C',
      '>': '\\u003E',
      '&': '\\u0026',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    }
    return escapes[character] ?? character
  })
}
