import { getCollection, type CollectionEntry } from 'astro:content'
import { getPostSlug, getPostLocale, type SupportedLocale } from './content-utils'
import {
  validateTranslationKeys,
  isPublicPost,
  isRoutablePost,
  type PostQueryOptions,
} from './post-visibility'

export type Post = CollectionEntry<'posts'>

export async function getAllPosts(options: PostQueryOptions = {}): Promise<Post[]> {
  const posts = await getCollection('posts')
  validateTranslationKeys(posts)
  return posts
    .filter((post) => isPublicPost(post, options))
    .sort((first, second) => {
      const dateDifference = second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf()
      return dateDifference || first.id.localeCompare(second.id)
    })
}

export async function getRoutePosts(): Promise<Post[]> {
  const posts = await getCollection('posts')
  validateTranslationKeys(posts)
  return posts.filter(isRoutablePost).sort((first, second) => {
    const dateDifference = second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf()
    return dateDifference || first.id.localeCompare(second.id)
  })
}

export async function getLocalizedPosts(
  locale: SupportedLocale,
  options: PostQueryOptions = {}
): Promise<Post[]> {
  const posts = await getAllPosts(options)
  return posts.filter((post) => getPostLocale(post) === locale)
}

export async function getPostBySlug(
  slug: string,
  locale: SupportedLocale,
  options: PostQueryOptions = {}
): Promise<Post | undefined> {
  const posts = await getLocalizedPosts(locale, options)
  return posts.find((post) => getPostSlug(post) === slug)
}

export async function getAllTags(locale?: SupportedLocale): Promise<string[]> {
  const posts = locale ? await getLocalizedPosts(locale) : await getAllPosts()
  const tags = posts.flatMap((post) => post.data.tags)
  return [...new Set(tags)].sort()
}

export function getTaxonomyTerms(
  posts: Post[],
  locale: SupportedLocale,
  field: 'tags' | 'category'
): string[] {
  const localPosts = posts.filter((post) => getPostLocale(post) === locale && isPublicPost(post))
  const terms =
    field === 'tags'
      ? localPosts.flatMap((post) => post.data.tags)
      : localPosts.map((post) => post.data.category)
  return [...new Set(terms)].sort()
}

export async function getAllCategories(locale?: SupportedLocale): Promise<string[]> {
  const posts = locale ? await getLocalizedPosts(locale) : await getAllPosts()
  const categories = posts.map((post) => post.data.category)
  return [...new Set(categories)].sort()
}

export async function getPostsByTag(tag: string, locale?: SupportedLocale): Promise<Post[]> {
  const posts = locale ? await getLocalizedPosts(locale) : await getAllPosts()
  return posts
    .filter((post) => post.data.tags.includes(tag))
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}

export async function getPostsByCategory(
  category: string,
  locale?: SupportedLocale
): Promise<Post[]> {
  const posts = locale ? await getLocalizedPosts(locale) : await getAllPosts()
  return posts
    .filter((post) => post.data.category === category)
    .sort((first, second) => second.data.publishedAt.valueOf() - first.data.publishedAt.valueOf())
}

export { getPostSlug, getPostLocale }
export type { SupportedLocale }
