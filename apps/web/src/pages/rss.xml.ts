import rss from '@astrojs/rss'
import { getLocalizedPosts } from '../lib/cms'
import { SITE } from '../lib/site'
import { getPostPath, SUPPORTED_LOCALES } from '../lib/routes'

export const prerender = true

export async function GET(context: { site: URL }) {
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
      const item: (typeof items)[number] = {
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description: post.data.excerpt,
        link: getPostPath(post),
        categories: post.data.tags,
        author: `${SITE.email} (${SITE.author})`,
      }
      if (post.data.coverImage) {
        item.customData = `<content:encoded><![CDATA[<img src="${post.data.coverImage}" alt="${post.data.title}" /><p>${post.data.excerpt}</p>]]></content:encoded>`
      }
      items.push(item)
    }
  }

  items.sort((first, second) => second.pubDate.valueOf() - first.pubDate.valueOf())

  const response = await rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: context.site,
    customData: `<language>vi</language>`,
    items,
  })

  const body = await response.text()
  const fixed = body.replace(
    '<rss version="2.0"',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"'
  )

  return new Response(fixed, { headers: { 'Content-Type': 'application/xml' } })
}
