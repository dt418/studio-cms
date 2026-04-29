import { describe, it, expect } from 'vitest'
import { groupByYear, sortedYears } from './group'
import { makePost } from '../test-helpers'

describe('groupByYear', () => {
  it('groups posts by published year', () => {
    const posts = [
      makePost({ slug: 'post-1', publishedAt: new Date('2024-01-15') }),
      makePost({ slug: 'post-2', publishedAt: new Date('2024-06-20') }),
      makePost({ slug: 'post-3', publishedAt: new Date('2025-03-10') }),
    ]

    const groups = groupByYear(posts)

    expect(Object.keys(groups)).toHaveLength(2)
    expect(groups[2024]).toHaveLength(2)
    expect(groups[2025]).toHaveLength(1)
  })

  it('handles empty posts array', () => {
    const groups = groupByYear([])
    expect(Object.keys(groups)).toHaveLength(0)
  })

  it('handles single post', () => {
    const posts = [makePost({ slug: 'only', publishedAt: new Date('2023-05-01') })]
    const groups = groupByYear(posts)

    expect(Object.keys(groups)).toEqual(['2023'])
    expect(groups[2023]).toHaveLength(1)
  })

  it('groups posts across multiple years', () => {
    const posts = [
      makePost({ slug: 'a', publishedAt: new Date('2022-01-01') }),
      makePost({ slug: 'b', publishedAt: new Date('2023-01-01') }),
      makePost({ slug: 'c', publishedAt: new Date('2024-01-01') }),
      makePost({ slug: 'd', publishedAt: new Date('2024-12-31') }),
    ]

    const groups = groupByYear(posts)

    expect(groups[2022]).toHaveLength(1)
    expect(groups[2023]).toHaveLength(1)
    expect(groups[2024]).toHaveLength(2)
  })
})

describe('sortedYears', () => {
  it('sorts years in descending order', () => {
    const groups = {
      2023: [makePost({ slug: 'a' })],
      2025: [makePost({ slug: 'b' })],
      2024: [makePost({ slug: 'c' })],
    }

    const years = sortedYears(groups)
    expect(years).toEqual([2025, 2024, 2023])
  })

  it('handles single year', () => {
    const groups = { 2024: [makePost({ slug: 'a' })] }
    expect(sortedYears(groups)).toEqual([2024])
  })

  it('handles empty groups', () => {
    expect(sortedYears({})).toEqual([])
  })
})
