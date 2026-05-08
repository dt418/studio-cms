import { getCollection } from 'astro:content'
import { getPostSlug, getPostLocale } from '@/lib/content-utils'

export async function GET() {
  const posts = await getCollection('posts')
  return new Response(
    JSON.stringify({
      total: posts.length,
      posts: posts.map((post) => ({
        id: post.id,
        slug: getPostSlug(post),
        locale: getPostLocale(post),
        language: post.data.language,
        title: post.data.title,
      })),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
