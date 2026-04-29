import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'
import { getSlug } from '@/lib/content-graph'
import { isPublicPost, type PostQueryOptions } from '@/lib/post-visibility'

export type Post = CollectionEntry<'posts'>

export async function getAllPosts(options: PostQueryOptions = {}): Promise<Post[]> {
  const posts = await getCollection('posts')
  return posts
    .filter((post) => isPublicPost(post, options))
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}

export async function getPostBySlug(
  slug: string,
  options: PostQueryOptions = {}
): Promise<Post | undefined> {
  const posts = await getAllPosts(options)
  return posts.find((post) => getSlug(post) === slug)
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts()
  const tags = posts.flatMap((post) => post.data.tags)
  return [...new Set(tags)].sort()
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts()
  const categories = posts.map((post) => post.data.category)
  return [...new Set(categories)].sort()
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts
    .filter((post) => post.data.tags.includes(tag))
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts
    .filter((post) => post.data.category === category)
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}
