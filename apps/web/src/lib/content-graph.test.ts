import { describe, expect, it } from 'vitest'
import {
  getPost,
  getPrevNext,
  getRelated,
  getSeries,
  getNavigation,
  getSlug,
} from './content-graph'
import type { ContentGraph } from './content-graph'
import { makePost } from '../test-helpers'

describe('getSlug', () => {
  it('returns data.slug when set', () => {
    const post = makePost({ slug: 'my-custom-slug' })
    expect(getSlug(post)).toBe('my-custom-slug')
  })

  it('falls back to id when slug is undefined', () => {
    const post = makePost({ slug: 'my-post' })
    const { slug: _, ...dataWithoutSlug } = post.data
    const withoutSlug = {
      ...post,
      data: dataWithoutSlug,
    }
    expect(getSlug(withoutSlug)).toBe('my-post.md')
  })
})

describe('getPost', () => {
  const post = makePost({ slug: 'hello-world', title: 'Hello World' })
  const graph: ContentGraph = {
    posts: [post],
    bySlug: new Map([['hello-world', post]]),
    byTag: new Map(),
    bySeries: new Map(),
  }

  it('returns post for known slug', () => {
    const found = getPost(graph, 'hello-world')
    expect(found?.data.title).toBe('Hello World')
  })

  it('returns null for unknown slug', () => {
    expect(getPost(graph, 'unknown')).toBeNull()
  })
})

describe('getPrevNext', () => {
  const first = makePost({ slug: 'first', title: 'First' })
  const middle = makePost({ slug: 'middle', title: 'Middle' })
  const last = makePost({ slug: 'last', title: 'Last' })
  const graph: ContentGraph = {
    posts: [first, middle, last],
    bySlug: new Map([
      ['first', first],
      ['middle', middle],
      ['last', last],
    ]),
    byTag: new Map(),
    bySeries: new Map(),
  }

  it('returns prev null and next for first post', () => {
    const result = getPrevNext(graph, 'first')
    expect(result.prev).toBeNull()
    expect(result.next?.data.title).toBe('Middle')
  })

  it('returns prev and next for middle post', () => {
    const result = getPrevNext(graph, 'middle')
    expect(result.prev?.data.title).toBe('First')
    expect(result.next?.data.title).toBe('Last')
  })

  it('returns prev and next null for last post', () => {
    const result = getPrevNext(graph, 'last')
    expect(result.prev?.data.title).toBe('Middle')
    expect(result.next).toBeNull()
  })

  it('returns null for unknown slug', () => {
    const result = getPrevNext(graph, 'unknown')
    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })

  it('returns null for single post', () => {
    const single = makePost({ slug: 'only', title: 'Only' })
    const singleGraph: ContentGraph = {
      posts: [single],
      bySlug: new Map([['only', single]]),
      byTag: new Map(),
      bySeries: new Map(),
    }
    const result = getPrevNext(singleGraph, 'only')
    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })
})

describe('getRelated', () => {
  const postA = makePost({ slug: 'post-a', title: 'Post A', tags: ['typescript', 'astro'] })
  const postB = makePost({ slug: 'post-b', title: 'Post B', tags: ['typescript', 'testing'] })
  const postC = makePost({ slug: 'post-c', title: 'Post C', tags: ['astro'] })
  const postD = makePost({
    slug: 'post-d',
    title: 'Post D',
    tags: ['typescript', 'astro', 'testing'],
  })
  const unrelated = makePost({ slug: 'unrelated', title: 'Unrelated', tags: ['python'] })

  const graph: ContentGraph = {
    posts: [postA, postB, postC, postD, unrelated],
    bySlug: new Map([
      ['post-a', postA],
      ['post-b', postB],
      ['post-c', postC],
      ['post-d', postD],
      ['unrelated', unrelated],
    ]),
    byTag: new Map([
      ['typescript', [postA, postB, postD]],
      ['astro', [postA, postC, postD]],
      ['testing', [postB, postD]],
      ['python', [unrelated]],
    ]),
    bySeries: new Map(),
  }

  it('returns posts ordered by tag overlap count', () => {
    // For postA: postD shares 2 tags, postB shares 1, postC shares 1
    const related = getRelated(graph, 'post-a')
    expect(related).toHaveLength(3)
    expect(related[0]?.data.title).toBe('Post D') // 2-tag overlap
    // postB and postC both have 1-tag overlap; order between them is insertion order
    const restTitles = [related[1]?.data.title, related[2]?.data.title].sort()
    expect(restTitles).toEqual(['Post B', 'Post C'])
  })

  it('returns at most 3 related posts', () => {
    const related = getRelated(graph, 'post-d')
    expect(related.length).toBeLessThanOrEqual(3)
  })

  it('does not include the queried post itself', () => {
    const related = getRelated(graph, 'post-b')
    expect(related.find((relatedPost) => relatedPost.data.slug === 'post-b')).toBeUndefined()
  })

  it('returns empty array for post not in graph', () => {
    expect(getRelated(graph, 'nonexistent')).toEqual([])
  })

  it('returns empty array when no other posts share tags', () => {
    const related = getRelated(graph, 'unrelated')
    expect(related).toEqual([])
  })
})

describe('getSeries', () => {
  it('returns null when post is not found', () => {
    const emptyGraph: ContentGraph = {
      posts: [],
      bySlug: new Map(),
      byTag: new Map(),
      bySeries: new Map(),
    }
    expect(getSeries(emptyGraph, 'missing')).toBeNull()
  })

  it('returns null when post has no series', () => {
    const post = makePost({ slug: 'no-series', title: 'No Series' })
    const graph: ContentGraph = {
      posts: [post],
      bySlug: new Map([['no-series', post]]),
      byTag: new Map(),
      bySeries: new Map(),
    }
    expect(getSeries(graph, 'no-series')).toBeNull()
  })

  it('returns series with ordered posts and navigation', () => {
    const part1 = makePost({ slug: 'part-1', title: 'Part 1', series: 'guide', orderInSeries: 1 })
    const part2 = makePost({ slug: 'part-2', title: 'Part 2', series: 'guide', orderInSeries: 2 })
    const part3 = makePost({ slug: 'part-3', title: 'Part 3', series: 'guide', orderInSeries: 3 })
    const graph: ContentGraph = {
      posts: [part1, part2, part3],
      bySlug: new Map([
        ['part-1', part1],
        ['part-2', part2],
        ['part-3', part3],
      ]),
      byTag: new Map(),
      bySeries: new Map([['guide', [part1, part2, part3]]]),
    }

    const result = getSeries(graph, 'part-2')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('guide')
    expect(result!.total).toBe(3)
    expect(result!.index).toBe(1)
    expect(result!.prev?.data.title).toBe('Part 1')
    expect(result!.next?.data.title).toBe('Part 3')
  })

  it('sorts series posts by orderInSeries', () => {
    const part3 = makePost({ slug: 'part-3', title: 'Part 3', series: 'guide', orderInSeries: 3 })
    const part1 = makePost({ slug: 'part-1', title: 'Part 1', series: 'guide', orderInSeries: 1 })
    const part2 = makePost({ slug: 'part-2', title: 'Part 2', series: 'guide', orderInSeries: 2 })
    const graph: ContentGraph = {
      posts: [part3, part1, part2],
      bySlug: new Map([
        ['part-1', part1],
        ['part-2', part2],
        ['part-3', part3],
      ]),
      byTag: new Map(),
      bySeries: new Map([['guide', [part3, part1, part2]]]),
    }

    const result = getSeries(graph, 'part-1')
    expect(result!.posts).toHaveLength(3)
    // Should be sorted by orderInSeries
    expect(result!.posts[0]?.data.orderInSeries).toBe(1)
    expect(result!.posts[1]?.data.orderInSeries).toBe(2)
    expect(result!.posts[2]?.data.orderInSeries).toBe(3)
  })

  it('handles missing orderInSeries (defaults to 0)', () => {
    const unsorted = makePost({ slug: 'unsorted', title: 'Unsorted', series: 'guide' })
    const ordered = makePost({
      slug: 'ordered',
      title: 'Ordered',
      series: 'guide',
      orderInSeries: 1,
    })
    const graph: ContentGraph = {
      posts: [unsorted, ordered],
      bySlug: new Map([
        ['unsorted', unsorted],
        ['ordered', ordered],
      ]),
      byTag: new Map(),
      bySeries: new Map([['guide', [unsorted, ordered]]]),
    }

    const result = getSeries(graph, 'unsorted')
    // unsorted has orderInSeries=0, ordered has orderInSeries=1
    expect(result!.posts[0]?.data.slug).toBe('unsorted')
    expect(result!.posts[1]?.data.slug).toBe('ordered')
  })

  it('returns prev null for first and next null for last in series', () => {
    const part1 = makePost({ slug: 'part-1', title: 'Part 1', series: 'guide', orderInSeries: 1 })
    const part2 = makePost({ slug: 'part-2', title: 'Part 2', series: 'guide', orderInSeries: 2 })
    const graph: ContentGraph = {
      posts: [part1, part2],
      bySlug: new Map([
        ['part-1', part1],
        ['part-2', part2],
      ]),
      byTag: new Map(),
      bySeries: new Map([['guide', [part1, part2]]]),
    }

    const first = getSeries(graph, 'part-1')
    expect(first!.prev).toBeNull()
    expect(first!.next?.data.title).toBe('Part 2')

    const last = getSeries(graph, 'part-2')
    expect(last!.prev?.data.title).toBe('Part 1')
    expect(last!.next).toBeNull()
  })
})

describe('getNavigation', () => {
  it('combines post, prevNext, related, and series', () => {
    const post = makePost({ slug: 'nav-post', title: 'Nav Post', tags: ['astro'] })
    const related = makePost({ slug: 'related-post', title: 'Related', tags: ['astro'] })
    const graph: ContentGraph = {
      posts: [post, related],
      bySlug: new Map([
        ['nav-post', post],
        ['related-post', related],
      ]),
      byTag: new Map([['astro', [post, related]]]),
      bySeries: new Map(),
    }

    const nav = getNavigation(graph, 'nav-post')
    expect(nav.post).not.toBeNull()
    expect(nav.post?.data.title).toBe('Nav Post')
    expect(nav.related).toHaveLength(1)
    expect(nav.related[0]?.data.title).toBe('Related')
    expect(nav.series).toBeNull()
  })

  it('returns null post for unknown slug', () => {
    const emptyGraph: ContentGraph = {
      posts: [],
      bySlug: new Map(),
      byTag: new Map(),
      bySeries: new Map(),
    }
    const nav = getNavigation(emptyGraph, 'nonexistent')
    expect(nav.post).toBeNull()
    expect(nav.related).toEqual([])
    expect(nav.series).toBeNull()
  })
})
