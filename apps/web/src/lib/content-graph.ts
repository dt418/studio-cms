import { getCollection, type CollectionEntry } from 'astro:content'
import { getPostSlug, getPostLocale, type SupportedLocale } from './content-utils'

export type Post = CollectionEntry<'posts'>

export interface ContentGraph {
  posts: Post[]
  bySlug: Map<string, Post>
  byTag: Map<string, Post[]>
  bySeries: Map<string, Post[]>
}

function isPublished(post: Post): boolean {
  return !post.data.draft && !post.data.noindex
}

export async function buildContentGraph(locale?: SupportedLocale): Promise<ContentGraph> {
  const raw = await getCollection('posts')

  let posts = raw.filter(isPublished)

  if (locale) {
    posts = posts.filter((post) => getPostLocale(post) === locale)
  }

  const bySlug = new Map<string, Post>()
  const byTag = new Map<string, Post[]>()
  const bySeries = new Map<string, Post[]>()
  const seenSlugs = new Set<string>()

  for (const post of posts) {
    const slug = getPostSlug(post)

    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)
    bySlug.set(slug, post)

    for (const tag of post.data.tags) {
      const list = byTag.get(tag) ?? []
      list.push(post)
      byTag.set(tag, list)
    }

    const series = post.data.series
    if (series) {
      const list = bySeries.get(series) ?? []
      list.push(post)
      bySeries.set(series, list)
    }
  }

  return { posts, bySlug, byTag, bySeries }
}

export function getPost(graph: ContentGraph, slug: string): Post | null {
  return graph.bySlug.get(slug) ?? null
}

export function getPrevNext(graph: ContentGraph, slug: string) {
  const posts = graph.posts
  const index = posts.findIndex((post) => getPostSlug(post) === slug)
  if (index < 0) return { prev: null, next: null }

  return {
    prev: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null,
  }
}

export function getRelated(graph: ContentGraph, slug: string) {
  const post = getPost(graph, slug)
  if (!post) return []

  const scores = new Map<Post, number>()

  for (const tag of post.data.tags) {
    const relatedPosts = graph.byTag.get(tag) ?? []
    for (const relatedPost of relatedPosts) {
      if (relatedPost === post) continue
      scores.set(relatedPost, (scores.get(relatedPost) ?? 0) + 1)
    }
  }

  return [...scores.entries()]
    .sort((scoreA, scoreB) => scoreB[1] - scoreA[1])
    .slice(0, 3)
    .map(([post]) => post)
}

export function getSeries(graph: ContentGraph, slug: string) {
  const post = getPost(graph, slug)
  if (!post || !post.data.series) return null

  const seriesPosts = graph.bySeries.get(post.data.series) ?? []
  const sorted = [...seriesPosts].sort(
    (postA, postB) => (postA.data.orderInSeries ?? 0) - (postB.data.orderInSeries ?? 0)
  )
  const index = sorted.findIndex((post) => getPostSlug(post) === slug)
  if (index < 0) return null

  return {
    name: post.data.series,
    posts: sorted,
    prev: sorted[index - 1] ?? null,
    next: sorted[index + 1] ?? null,
    index,
    total: sorted.length,
  }
}

export function getSlug(post: Post): string {
  return post.data?.slug ?? post.id
}
