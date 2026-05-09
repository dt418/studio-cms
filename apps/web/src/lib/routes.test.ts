import { describe, expect, it } from 'vitest'
import { makePost } from '../test-helpers'
import { getCategoryPath, getPostPath, getTagPath } from './routes'

describe('route helpers', () => {
  it('encodes post slugs once for detail links - Vietnamese (default)', () => {
    const post = makePost({ slug: 'hello world/part 1', language: 'vi' })

    expect(getPostPath(post)).toBe('/vi/blog/hello%20world%2Fpart%201')
  })

  it('encodes post slugs once for detail links - English (prefixed)', () => {
    const post = makePost({ slug: 'hello world/part 1', language: 'en' })

    expect(getPostPath(post)).toBe('/en/blog/hello%20world%2Fpart%201')
  })

  it('encodes taxonomy values for manual hrefs', () => {
    expect(getTagPath('web dev', 'vi')).toBe('/vi/tags/web%20dev')
    expect(getCategoryPath('tips/tools', 'vi')).toBe('/vi/categories/tips%2Ftools')
  })
})
