import type { Post } from '../types/post'

export type SortField = 'date' | 'title' | 'readingTime'
export type SortOrder = 'asc' | 'desc'

export interface FilterOptions {
  query: string
  category: string | null
  tag: string | null
  sortField: SortField
  sortOrder: SortOrder
}

export function filterPosts(posts: Post[], options: Partial<FilterOptions>): Post[] {
  let result = [...posts]

  if (options.query) {
    const query = options.query.toLowerCase()
    result = result.filter(
      (post) =>
        post.data.title.toLowerCase().includes(query) ||
        post.data.excerpt.toLowerCase().includes(query) ||
        post.data.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        post.data.category.toLowerCase().includes(query)
    )
  }

  if (options.category) {
    result = result.filter((post) => post.data.category === options.category)
  }

  if (options.tag) {
    result = result.filter((post) => post.data.tags.includes(options.tag!))
  }

  const field = options.sortField ?? 'date'
  const order = options.sortOrder ?? 'desc'
  const multiplier = order === 'asc' ? 1 : -1

  result.sort((postA, postB) => {
    switch (field) {
      case 'date':
        return multiplier * (postA.data.publishedAt.valueOf() - postB.data.publishedAt.valueOf())
      case 'title':
        return multiplier * postA.data.title.localeCompare(postB.data.title)
      case 'readingTime': {
        const postAWords = postA.body?.split(/\s+/).length ?? 0
        const postBWords = postB.body?.split(/\s+/).length ?? 0
        return multiplier * (postAWords - postBWords)
      }
      default:
        return 0
    }
  })

  return result
}
