import type { APIRoute } from 'astro'
import { getAllCategories, getAllTags, getLocalizedPosts } from '@/lib/content-queries'
import { getTranslations } from '@/lib/i18n'
import { getPostPath } from '@/lib/routes'
import { resolvePostDescription } from '@/lib/seo'
import { getSiteOrigin, toAbsoluteUrl } from '@/lib/site'
import { isValidLocale, type SupportedLocale } from '@/lib/content-utils'

export const prerender = true

export async function getStaticPaths() {
  const locales: SupportedLocale[] = ['vi', 'en']
  return locales.map((locale) => ({
    params: { lang: locale },
    props: { locale },
  }))
}

export const GET: APIRoute = async ({ params }) => {
  const langParam = params.lang ?? 'vi'
  const lang: SupportedLocale = isValidLocale(langParam) ? langParam : 'vi'
  const origin = getSiteOrigin()
  const i18n = getTranslations(lang)
  const posts = await getLocalizedPosts(lang)
  const categories = await getAllCategories(lang)
  const tags = await getAllTags(lang)

  const lines: string[] = []
  lines.push(`# ${i18n.home.title}`)
  lines.push('')
  lines.push(i18n.home.description)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Posts: ${posts.length}`)
  lines.push(`- Categories: ${categories.length}`)
  lines.push(`- Tags: ${tags.length}`)
  lines.push('')

  if (posts[0]) {
    const featured = posts[0]
    lines.push('## Featured')
    lines.push('')
    lines.push(`### [${featured.data.title}](${toAbsoluteUrl(getPostPath(featured), origin)})`)
    lines.push('')
    lines.push(resolvePostDescription(featured))
    lines.push('')
  }

  if (posts.length > 1) {
    lines.push('## Recent')
    lines.push('')
    for (const post of posts.slice(1, 6)) {
      lines.push(`- [${post.data.title}](${toAbsoluteUrl(getPostPath(post), origin)})`)
    }
    lines.push('')
  }

  if (categories.length > 0) {
    lines.push('## Categories')
    lines.push('')
    for (const c of categories) {
      lines.push(`- ${c}`)
    }
    lines.push('')
  }

  lines.push('## Feeds')
  lines.push('')
  lines.push(`- RSS: ${origin}/rss.xml`)
  lines.push(`- Sitemap: ${origin}/sitemap.xml`)
  lines.push(`- API: ${origin}/api/posts.json`)
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
