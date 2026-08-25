import rss from '@astrojs/rss'
import { getLocalizedPosts } from '@/lib/content-queries'
import { resolvePostDescription } from '@/lib/seo'
import { getSiteOrigin, SITE } from '@/lib/site'
import { getPostPath, SUPPORTED_LOCALES } from '@/lib/routes'

export const prerender = true

export async function GET() {
  const items: {
    title: string
    pubDate: Date
    description: string
    link: string
    categories: string[]
    author: string
    customData?: string
  }[] = []

  for (const locale of SUPPORTED_LOCALES) {
    const posts = await getLocalizedPosts(locale)
    for (const post of posts) {
      const description = resolvePostDescription(post)
      const item: (typeof items)[number] = {
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description,
        link: getPostPath(post),
        categories: post.data.tags,
        author: `${SITE.email} (${SITE.author})`,
      }
      if (post.data.coverImage) {
        const image = escapeXmlAttribute(post.data.coverImage)
        const title = escapeXmlAttribute(post.data.title)
        const content = `<img src="${image}" alt="${title}" /><p>${description}</p>`
        item.customData = `<content:encoded><![CDATA[${toCdata(content)}]]></content:encoded>`
      }
      items.push(item)
    }
  }

  items.sort((first, second) => {
    const dateDifference = second.pubDate.valueOf() - first.pubDate.valueOf()
    return dateDifference || first.link.localeCompare(second.link)
  })

  const response = await rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: new URL(getSiteOrigin()),
    customData: '<language>vi</language>',
    items,
  })

  const body = await response.text()
  const fixed = body.replace(
    '<rss version="2.0"',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"'
  )

  return new Response(fixed, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}

function toCdata(value: string): string {
  return value.replaceAll(']]>', ']]]]><![CDATA[>')
}

function escapeXmlAttribute(value: string): string {
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
