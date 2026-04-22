import { describe, it, expect } from 'vitest'
import { filterPosts } from './filter'
import { makePost } from '../test-helpers'

describe('filterPosts', () => {
  const posts = [
    makePost({
      slug: 'astro-guide',
      title: 'Getting Started with Astro',
      excerpt: 'Learn how to build fast websites with Astro',
      category: 'tutorials',
      tags: ['astro', 'webdev'],
      publishedAt: new Date('2025-01-15'),
      body: 'astro framework tutorial content',
    }),
    makePost({
      slug: 'typescript-generics',
      title: 'Mastering TypeScript Generics',
      excerpt: 'Deep dive into TypeScript generic types',
      category: 'tutorials',
      tags: ['typescript', 'generics'],
      publishedAt: new Date('2025-02-10'),
      body: 'typescript generics explained',
    }),
    makePost({
      slug: 'saas-guide',
      title: 'Building a SaaS with Astro',
      excerpt: 'Complete guide to building SaaS products',
      category: 'guides',
      tags: ['astro', 'saas', 'business'],
      publishedAt: new Date('2025-03-05'),
      body: 'saas business model guide',
    }),
  ]

  describe('query search', () => {
    it('returns all posts when no query', () => {
      const result = filterPosts(posts, {})
      expect(result).toHaveLength(3)
    })

    it('matches posts by title', () => {
      const result = filterPosts(posts, { query: 'typescript' })
      expect(result).toHaveLength(1)
      expect(result[0].data.slug).toBe('typescript-generics')
    })

    it('matches posts by excerpt', () => {
      const result = filterPosts(posts, { query: 'generic types' })
      expect(result).toHaveLength(1)
      expect(result[0].data.slug).toBe('typescript-generics')
    })

    it('matches posts by tag', () => {
      const result = filterPosts(posts, { query: 'saas' })
      expect(result).toHaveLength(1)
      expect(result[0].data.slug).toBe('saas-guide')
    })

    it('matches posts by category', () => {
      const result = filterPosts(posts, { query: 'guides' })
      expect(result).toHaveLength(1)
      expect(result[0].data.slug).toBe('saas-guide')
    })

    it('is case insensitive', () => {
      const result1 = filterPosts(posts, { query: 'ASTRO' })
      const result2 = filterPosts(posts, { query: 'Astro' })
      expect(result1).toHaveLength(2)
      expect(result2).toHaveLength(2)
    })

    it('returns empty when no match', () => {
      const result = filterPosts(posts, { query: 'nonexistent' })
      expect(result).toHaveLength(0)
    })
  })

  describe('category filter', () => {
    it('filters by exact category match', () => {
      const result = filterPosts(posts, { category: 'tutorials' })
      expect(result).toHaveLength(2)
    })

    it('returns empty for unknown category', () => {
      const result = filterPosts(posts, { category: 'unknown' })
      expect(result).toHaveLength(0)
    })
  })

  describe('tag filter', () => {
    it('filters by tag', () => {
      const result = filterPosts(posts, { tag: 'astro' })
      expect(result).toHaveLength(2)
    })

    it('returns empty for unknown tag', () => {
      const result = filterPosts(posts, { tag: 'react' })
      expect(result).toHaveLength(0)
    })
  })

  describe('combined filters', () => {
    it('combines query and category', () => {
      const result = filterPosts(posts, { query: 'astro', category: 'guides' })
      expect(result).toHaveLength(1)
      expect(result[0].data.slug).toBe('saas-guide')
    })

    it('combines query and tag', () => {
      const result = filterPosts(posts, { query: 'saas', tag: 'typescript' })
      expect(result).toHaveLength(0)
    })
  })

  describe('sorting', () => {
    it('sorts by date descending by default', () => {
      const result = filterPosts(posts, {})
      expect(result[0].data.publishedAt).toEqual(new Date('2025-03-05'))
      expect(result[2].data.publishedAt).toEqual(new Date('2025-01-15'))
    })

    it('sorts by date ascending', () => {
      const result = filterPosts(posts, { sortField: 'date', sortOrder: 'asc' })
      expect(result[0].data.publishedAt).toEqual(new Date('2025-01-15'))
      expect(result[2].data.publishedAt).toEqual(new Date('2025-03-05'))
    })

    it('sorts by title ascending', () => {
      const result = filterPosts(posts, { sortField: 'title', sortOrder: 'asc' })
      expect(result[0].data.title).toBe('Building a SaaS with Astro')
      expect(result[1].data.title).toBe('Getting Started with Astro')
      expect(result[2].data.title).toBe('Mastering TypeScript Generics')
    })

    it('sorts by title descending', () => {
      const result = filterPosts(posts, { sortField: 'title', sortOrder: 'desc' })
      expect(result[0].data.title).toBe('Mastering TypeScript Generics')
      expect(result[2].data.title).toBe('Building a SaaS with Astro')
    })

    it('sorts by reading time', () => {
      const result = filterPosts(posts, { sortField: 'readingTime', sortOrder: 'desc' })
      expect(result).toHaveLength(3)
    })
  })

  describe('immutability', () => {
    it('does not mutate the input array', () => {
      const original = [...posts]
      filterPosts(posts, { sortField: 'title', sortOrder: 'asc' })
      expect(posts).toEqual(original)
    })
  })
})
