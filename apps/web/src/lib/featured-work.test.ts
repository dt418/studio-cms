import { describe, expect, it } from 'vitest'
import { getFeaturedMark } from './featured-work'

describe('getFeaturedMark', () => {
  it('derives a compact mark from the first two words of a title', () => {
    expect(getFeaturedMark('Set Up 9router API Proxy')).toBe('SU')
  })

  it('supports one-word titles and empty titles', () => {
    expect(getFeaturedMark('Astro')).toBe('A')
    expect(getFeaturedMark('')).toBe('')
  })
})
