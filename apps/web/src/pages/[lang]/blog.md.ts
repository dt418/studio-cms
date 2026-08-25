import type { APIRoute } from 'astro'
import { getLocalizedPosts, type SupportedLocale } from '@/lib/content-queries'
import { getTranslations } from '@/lib/i18n'
import { getPostPath } from '@/lib/routes'
import { getSiteOrigin, toAbsoluteUrl } from '@/lib/site'
import { isValidLocale } from '@/lib/content-utils'

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

  const lines: string[] = []
  lines.push(`# ${i18n.blog.archive}`)
  lines.push('')
  lines.push(i18n.blog.description)
  lines.push('')
  lines.push(`Total posts: ${posts.length}`)
  lines.push('')
  for (const post of posts) {
    lines.push(`- [${post.data.title}](${toAbsoluteUrl(getPostPath(post), origin)})`)
  }
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
