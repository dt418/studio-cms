import type { Post } from './content-queries'
import { getPostPath, getBlogPath, getCategoryPath, getHomePath, getTagPath } from './routes'
import { getPostLocale } from './content-utils'
import { isSitemapEligiblePost } from './seo'
import { isPublicPost } from './post-visibility'
import { normalizeSiteOrigin, toAbsoluteUrl, toCanonicalUrl } from './site'

export interface SitemapRecord {
  loc: string
  lastmod?: Date
  changefreq?: 'daily' | 'weekly'
  priority?: '0.9' | '1.0'
}

export function buildSitemapManifest(posts: Post[], siteOrigin: string): SitemapRecord[] {
  const origin = normalizeSiteOrigin(siteOrigin)
  const publicPosts = posts.filter((post) => isPublicPost(post))
  const canonicalPosts = publicPosts.filter((post) => isSitemapEligiblePost(post, siteOrigin))
  const records: SitemapRecord[] = []

  for (const locale of ['vi', 'en'] as const) {
    const localePosts = publicPosts
      .filter((post) => getPostLocale(post) === locale)
      .sort((left, right) =>
        toCanonicalUrl(getPostPath(left), origin).localeCompare(
          toCanonicalUrl(getPostPath(right), origin)
        )
      )
    const home = toAbsoluteUrl(getHomePath(locale), origin)
    const about = toCanonicalUrl(`/${locale}/about`, origin)
    records.push({ loc: home, changefreq: 'daily', priority: '1.0' })
    records.push({ loc: about })

    if (localePosts.length > 0) {
      records.push({
        loc: toCanonicalUrl(getBlogPath(locale), origin),
        changefreq: 'weekly',
        priority: '0.9',
      })
    }

    for (const post of canonicalPosts.filter((entry) => getPostLocale(entry) === locale)) {
      records.push({
        loc: toCanonicalUrl(getPostPath(post), origin),
        lastmod: post.data.updatedAt ?? post.data.publishedAt,
      })
    }

    const tags = [...new Set(localePosts.flatMap((post) => post.data.tags))].sort()
    for (const tag of tags) {
      const tagPosts = localePosts.filter((post) => post.data.tags.includes(tag))
      const lastmod = latestContentDate(tagPosts)
      records.push({
        loc: toCanonicalUrl(getTagPath(tag, locale), origin),
        ...(lastmod && { lastmod }),
      })
    }

    const categories = [...new Set(localePosts.map((post) => post.data.category))].sort()
    for (const category of categories) {
      const categoryPosts = localePosts.filter((post) => post.data.category === category)
      const lastmod = latestContentDate(categoryPosts)
      records.push({
        loc: toCanonicalUrl(getCategoryPath(category, locale), origin),
        ...(lastmod && { lastmod }),
      })
    }
  }

  const unique = new Map(records.map((record) => [record.loc, record]))
  return [...unique.values()].sort((left, right) => left.loc.localeCompare(right.loc))
}

function latestContentDate(posts: Post[]): Date | undefined {
  return posts.reduce<Date | undefined>((latest, post) => {
    const date = post.data.updatedAt ?? post.data.publishedAt
    return !latest || date > latest ? date : latest
  }, undefined)
}

export function serializeSitemap(records: SitemapRecord[]): string {
  const entries = records.map((record) => {
    const fields = [`    <loc>${escapeXml(record.loc)}</loc>`]
    if (record.lastmod) fields.push(`    <lastmod>${record.lastmod.toISOString()}</lastmod>`)
    if (record.changefreq) fields.push(`    <changefreq>${record.changefreq}</changefreq>`)
    if (record.priority) fields.push(`    <priority>${record.priority}</priority>`)
    return `  <url>\n${fields.join('\n')}\n  </url>`
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n')
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const escapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    }
    return escapes[character] ?? character
  })
}

export { escapeXml }
