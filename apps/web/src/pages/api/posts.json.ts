import { getCollection } from 'astro:content'
import { getPostSlug, getPostLocale } from '@/lib/content-utils'

export const prerender = true

export async function GET() {
  const posts = await getCollection('posts')

  const postsData = posts
    .filter((post) => !post.data.noindex)
    .map((post) => ({
      slug: getPostSlug(post),
      locale: getPostLocale(post),
      title: post.data.title,
      excerpt: post.data.excerpt,
      category: post.data.category,
      tags: post.data.tags,
      publishedAt: post.data.publishedAt.toISOString(),
      url: `/${getPostLocale(post)}/blog/${getPostSlug(post)}`,
    }))

  return new Response(JSON.stringify(postsData), {
    headers: { 'Content-Type': 'application/json' },
  })
}
