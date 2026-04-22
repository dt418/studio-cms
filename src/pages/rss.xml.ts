import rss from '@astrojs/rss'
import { getAllPosts } from '../lib/cms'

export async function GET(context: { site: URL }) {
  const posts = await getAllPosts()

  return rss({
    title: 'DanhThanh.dev Blog',
    description:
      'Thoughts, tutorials, and guides on web development, TypeScript, and modern tooling.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.excerpt,
      link: `/blog/${post.data.slug}/`,
    })),
  })
}
