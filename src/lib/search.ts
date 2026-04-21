import Fuse from 'fuse.js'

export interface SearchablePost {
  title: string
  excerpt: string
  tags: string[]
  slug: string
  category: string
}

export function createSearchIndex(posts: SearchablePost[]) {
  return new Fuse(posts, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'tags', weight: 0.2 },
    ],
    threshold: 0.3,
    includeScore: true,
  })
}

export interface SearchResult {
  item: SearchablePost
  score: number
}

export function searchPosts(
  fuse: Fuse<SearchablePost>,
  query: string,
  limit = 10
): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const results = fuse.search(query, { limit })
  return results.map((result) => ({
    item: result.item,
    score: result.score ?? 0,
  }))
}
