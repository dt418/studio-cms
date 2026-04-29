import type { Post } from './cms'

export function getPostPath(post: Post): string {
  return `/blog/${encodeURIComponent(post.data.slug ?? post.id)}`
}

export function getTagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`
}

export function getCategoryPath(category: string): string {
  return `/categories/${encodeURIComponent(category)}`
}
