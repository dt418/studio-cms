import rss from '@astrojs/rss'
import { getAllPosts } from '../lib/cms'
import { SITE } from '../lib/site'

export async function GET(context: { site: URL }) {
  const posts = await getAllPosts()

  return rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.excerpt,
      link: `/blog/${post.data.slug}`,
    })),
  })
}
