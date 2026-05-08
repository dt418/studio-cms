import type { APIRoute } from 'astro'
import { getAllTags, getAllCategories, getLocalizedPosts } from '@/lib/cms'
import {
  getPostPath,
  getTagPath,
  getCategoryPath,
  getBlogPath,
  getHomePath,
  SUPPORTED_LOCALES,
} from '@/lib/routes'

export const prerender = true

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = (site ?? new URL('http://localhost:4321')).origin

  const urls: string[] = []

  for (const locale of SUPPORTED_LOCALES) {
    const posts = await getLocalizedPosts(locale)
    const tags = await getAllTags(locale)
    const categories = await getAllCategories(locale)

    const latestDate = posts[0]?.data.publishedAt ?? new Date()

    // Homepage for this locale
    urls.push(urlEntry(`${siteUrl}${getHomePath(locale)}`, latestDate, 'daily', '1.0'))

    // Blog index for this locale
    if (posts.length > 0) {
      const blogLastmod = posts.reduce((latest, post) => {
        const date = post.data.updatedAt ?? post.data.publishedAt
        return date > latest ? date : latest
      }, posts[0]!.data.publishedAt)

      urls.push(urlEntry(`${siteUrl}${getBlogPath(locale)}`, blogLastmod, 'weekly', '0.9'))
    }

    // Individual posts for this locale
    for (const post of posts) {
      const lastmod = post.data.updatedAt ?? post.data.publishedAt
      urls.push(urlEntry(`${siteUrl}${getPostPath(post)}`, lastmod))
    }

    // Tag pages for this locale
    for (const tag of tags) {
      const tagPosts = posts.filter((post) => post.data.tags.includes(tag))
      const lastmod = tagPosts[0]?.data.updatedAt ?? tagPosts[0]?.data.publishedAt ?? new Date()
      urls.push(urlEntry(`${siteUrl}${getTagPath(tag, locale)}`, lastmod))
    }

    // Category pages for this locale
    for (const category of categories) {
      const catPosts = posts.filter((post) => post.data.category === category)
      const lastmod = catPosts[0]?.data.updatedAt ?? catPosts[0]?.data.publishedAt ?? new Date()
      urls.push(urlEntry(`${siteUrl}${getCategoryPath(category, locale)}`, lastmod))
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  })
}

function urlEntry(loc: string, lastmod: Date, changefreq?: string, priority?: string): string {
  const parts = [
    `  <url>`,
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod.toISOString()}</lastmod>`,
  ]
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority) parts.push(`    <priority>${priority}</priority>`)
  parts.push('  </url>')
  return parts.join('\n')
}
