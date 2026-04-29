import type { Post } from '../types/post'

export function groupByYear(posts: Post[]): Record<number, Post[]> {
  const groups: Record<number, Post[]> = {}

  for (const post of posts) {
    const year = post.data.publishedAt.getFullYear()
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }

  return groups
}

export function sortedYears(groups: Record<number, Post[]>): number[] {
  return Object.keys(groups)
    .map(Number)
    .sort((yearA, yearB) => yearB - yearA)
}
