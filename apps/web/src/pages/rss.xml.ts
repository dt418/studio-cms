import rss from '@astrojs/rss'
import { getAllPosts } from '../lib/cms'
import { SITE } from '../lib/site'
import { getPostPath } from '../lib/routes'

export const prerender = true

export async function GET(context: { site: URL }) {
  const posts = await getAllPosts()

  const response = await rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: context.site,
    customData: `<language>en</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.excerpt,
      link: getPostPath(post),
      categories: post.data.tags,
      author: `${SITE.email} (${SITE.author})`,
      customData: post.data.coverImage
        ? `<content:encoded><![CDATA[<img src="${post.data.coverImage}" alt="${post.data.title}" /><p>${post.data.excerpt}</p>]]></content:encoded>`
        : undefined,
    })),
  })

  const body = await response.text()
  const fixed = body.replace(
    '<rss version="2.0"',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"'
  )

  return new Response(fixed, { headers: { 'Content-Type': 'application/xml' } })
}
