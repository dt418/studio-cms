import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>

export interface ContentGraph {
  posts: Post[]
  bySlug: Map<string, Post>
  byTag: Map<string, Post[]>
  bySeries: Map<string, Post[]>
}

function normalizeSlug(post: Post): string {
  return post.data?.slug ?? post.id
}

function isPublished(post: Post): boolean {
  return !post.data.draft && !post.data.noindex
}

export async function buildContentGraph(): Promise<ContentGraph> {
  const raw = await getCollection('posts')

  const posts = raw.filter(isPublished)

  const bySlug = new Map<string, Post>()
  const byTag = new Map<string, Post[]>()
  const bySeries = new Map<string, Post[]>()

  for (const post of posts) {
    const slug = normalizeSlug(post)

    bySlug.set(slug, post)

    // 🏷 tags index
    for (const tag of post.data.tags) {
      const list = byTag.get(tag) ?? []
      list.push(post)
      byTag.set(tag, list)
    }

    // 📚 series index
    const series = post.data.series
    if (series) {
      const list = bySeries.get(series) ?? []
      list.push(post)
      bySeries.set(series, list)
    }
  }

  return {
    posts,
    bySlug,
    byTag,
    bySeries,
  }
}

export function getPost(graph: ContentGraph, slug: string) {
  return graph.bySlug.get(slug) ?? null
}

export function getPrevNext(graph: ContentGraph, slug: string) {
  const posts = graph.posts

  const index = posts.findIndex((post) => (post.data.slug ?? post.id) === slug)

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
    (seriesPostA, seriesPostB) =>
      (seriesPostA.data.orderInSeries ?? 0) - (seriesPostB.data.orderInSeries ?? 0)
  )

  const index = sorted.findIndex((seriesPost) => (seriesPost.data.slug ?? seriesPost.id) === slug)

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

export function getNavigation(graph: ContentGraph, slug: string) {
  return {
    post: getPost(graph, slug),
    prevNext: getPrevNext(graph, slug),
    related: getRelated(graph, slug),
    series: getSeries(graph, slug),
  }
}

export function getSlug(post: Post): string {
  return post.data?.slug ?? post.id
}
