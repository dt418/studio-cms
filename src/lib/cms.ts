import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts')
  return posts.sort((first, second) => {
    return second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf()
  })
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getCollection('posts')
  return posts.find((post) => post.data.slug === slug)
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getCollection('posts')
  const tags = posts.flatMap((post) => post.data.tags)
  return [...new Set(tags)].sort()
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getCollection('posts')
  const categories = posts.map((post) => post.data.category)
  return [...new Set(categories)].sort()
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getCollection('posts')
  return posts
    .filter((post) => post.data.tags.includes(tag))
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await getCollection('posts')
  return posts
    .filter((post) => post.data.category === category)
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}
