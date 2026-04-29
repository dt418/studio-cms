import { describe, it, expect } from 'vitest'
import { cn, getAuthorInitials, getImageUrl, getAdjacentPosts } from './utils'
import { makePost } from '../test-helpers'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const showHidden = false as boolean
    const showVisible = true as boolean
    expect(cn('base', showHidden && 'hidden', showVisible && 'visible')).toBe('base visible')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra')
  })

  it('handles array inputs', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })
})

describe('getAuthorInitials', () => {
  it('returns initials for single name', () => {
    expect(getAuthorInitials('Danh')).toBe('D')
  })

  it('returns initials for two names', () => {
    expect(getAuthorInitials('Danh Thanh')).toBe('DT')
  })

  it('returns initials for multiple names', () => {
    expect(getAuthorInitials('Nguyen Van A')).toBe('NVA')
  })

  it('handles names with extra spaces', () => {
    expect(getAuthorInitials('Danh  Thanh')).toBe('DT')
  })
})

describe('getImageUrl', () => {
  const siteUrl = 'https://example.com'

  it('returns undefined for undefined image', () => {
    expect(getImageUrl(undefined, siteUrl)).toBeUndefined()
  })

  it('returns external URL as-is', () => {
    const externalUrl = 'https://cdn.example.com/image.png'
    expect(getImageUrl(externalUrl, siteUrl)).toBe(externalUrl)
  })

  it('prepends site URL to relative path without leading slash', () => {
    expect(getImageUrl('images/photo.jpg', siteUrl)).toBe('https://example.com/images/photo.jpg')
  })

  it('prepends site URL to relative path with leading slash', () => {
    expect(getImageUrl('/images/photo.jpg', siteUrl)).toBe('https://example.com/images/photo.jpg')
  })
})

describe('getAdjacentPosts', () => {
  const posts = [
    makePost({ slug: 'post-1', title: 'First Post' }),
    makePost({ slug: 'post-2', title: 'Second Post' }),
    makePost({ slug: 'post-3', title: 'Third Post' }),
  ]

  it('returns prev and next for middle post', () => {
    const result = getAdjacentPosts(posts, 1)
    expect(result.prev?.data.title).toBe('First Post')
    expect(result.next?.data.title).toBe('Third Post')
  })

  it('returns undefined prev for first post', () => {
    const result = getAdjacentPosts(posts, 0)
    expect(result.prev).toBeUndefined()
    expect(result.next?.data.title).toBe('Second Post')
  })

  it('returns undefined next for last post', () => {
    const result = getAdjacentPosts(posts, 2)
    expect(result.prev?.data.title).toBe('Second Post')
    expect(result.next).toBeUndefined()
  })

  it('handles single post array', () => {
    const singlePost = [makePost({ slug: 'only', title: 'Only Post' })]
    const result = getAdjacentPosts(singlePost, 0)
    expect(result.prev).toBeUndefined()
    expect(result.next).toBeUndefined()
  })

  it('handles empty array', () => {
    const result = getAdjacentPosts([], 0)
    expect(result.prev).toBeUndefined()
    expect(result.next).toBeUndefined()
  })
})
