import { describe, expect, it } from 'vitest'
import { makePost } from '../test-helpers'
import { getCategoryPath, getPostPath, getTagPath } from './routes'

describe('route helpers', () => {
  it('encodes post slugs once for detail links', () => {
    const post = makePost({ slug: 'hello world/part 1' })

    expect(getPostPath(post)).toBe('/blog/hello%20world%2Fpart%201')
  })

  it('encodes taxonomy values for manual hrefs', () => {
    expect(getTagPath('web dev')).toBe('/tags/web%20dev')
    expect(getCategoryPath('tips/tools')).toBe('/categories/tips%2Ftools')
  })
})
