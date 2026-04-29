import { describe, it, expect } from 'vitest'
import { generateSEO } from './seo'

describe('generateSEO', () => {
  it('generates basic SEO meta tags', () => {
    const result = generateSEO({
      title: 'Test Post',
      description: 'A test description',
    })

    expect(result.title).toBe('Test Post | DanhThanh.dev')
    expect(result.description).toBe('A test description')
    expect(result['og:title']).toBe('Test Post | DanhThanh.dev')
    expect(result['og:description']).toBe('A test description')
    expect(result['og:type']).toBe('article')
  })

  it('includes default OG image', () => {
    const result = generateSEO({
      title: 'Test',
      description: 'Description',
    })

    expect(result['og:image']).toBe('/og-image.png')
    expect(result['twitter:image']).toBe('/og-image.png')
  })

  it('uses custom image when provided', () => {
    const result = generateSEO({
      title: 'Test',
      description: 'Description',
      image: '/custom-image.png',
    })

    expect(result['og:image']).toBe('/custom-image.png')
    expect(result['twitter:image']).toBe('/custom-image.png')
  })

  it('includes Twitter card meta tags', () => {
    const result = generateSEO({
      title: 'Test',
      description: 'Description',
    })

    expect(result['twitter:card']).toBe('summary_large_image')
    expect(result['twitter:title']).toBe('Test | DanhThanh.dev')
    expect(result['twitter:description']).toBe('Description')
    expect(result['twitter:site']).toBe('@danhthanh418')
  })

  it('includes canonical URL when provided', () => {
    const result = generateSEO({
      title: 'Test',
      description: 'Description',
      canonicalUrl: 'https://danhthanh.dev/blog/test-post',
    })

    expect(result['og:url']).toBe('https://danhthanh.dev/blog/test-post')
    expect(result.canonical).toBe('https://danhthanh.dev/blog/test-post')
  })

  it('does not include canonical when not provided', () => {
    const result = generateSEO({
      title: 'Test',
      description: 'Description',
    })

    expect(result['og:url']).toBeUndefined()
    expect(result.canonical).toBeUndefined()
  })

  it('handles special characters in title', () => {
    const result = generateSEO({
      title: 'Test & Demo: A Guide',
      description: 'Description',
    })

    expect(result.title).toBe('Test & Demo: A Guide | DanhThanh.dev')
    expect(result['og:title']).toBe('Test & Demo: A Guide | DanhThanh.dev')
  })

  it('handles long descriptions', () => {
    const longDescription = 'A'.repeat(200)
    const result = generateSEO({
      title: 'Test',
      description: longDescription,
    })

    expect(result.description).toBe(longDescription)
    expect(result['og:description']).toBe(longDescription)
  })
})
