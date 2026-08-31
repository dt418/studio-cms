import { getAllPosts } from '@/lib/content-queries'
import { getPostLocale, getPostSlug } from '@/lib/content-utils'
import { getPostPath } from '@/lib/routes'
import { resolvePostCanonical, resolvePostDescription } from '@/lib/seo'
import { getSiteOrigin, toCanonicalUrl } from '@/lib/site'

export const prerender = true

export async function GET() {
  const origin = getSiteOrigin()
  const posts = await getAllPosts()
  const postsData = posts.map((post) => {
    const localUrl = toCanonicalUrl(getPostPath(post), origin)
    const canonicalUrl = resolvePostCanonical(post, origin)
    return {
      slug: getPostSlug(post),
      locale: getPostLocale(post),
      title: post.data.title,
      excerpt: post.data.excerpt,
      description: resolvePostDescription(post),
      category: post.data.category,
      tags: post.data.tags,
      publishedAt: post.data.publishedAt.toISOString(),
      url: localUrl,
      ...(canonicalUrl !== localUrl && { canonicalUrl }),
    }
  })

  return new Response(JSON.stringify(postsData), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
