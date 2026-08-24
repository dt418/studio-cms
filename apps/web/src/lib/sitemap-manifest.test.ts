import { describe, expect, it } from 'vitest'
import { makePost } from '../test-helpers'
import { buildSitemapManifest, serializeSitemap } from './sitemap-manifest'

const siteOrigin = 'https://example.test'

describe('sitemap manifest', () => {
  it('includes only deterministic public HTML records', () => {
    const posts = [
      makePost({
        slug: 'zeta',
        language: 'vi',
        category: 'c&d',
        tags: ['t&g'],
        publishedAt: new Date('2025-01-01T00:00:00.000Z'),
      }),
      makePost({
        slug: 'alpha',
        language: 'en',
        category: 'english',
        tags: ['tag'],
        publishedAt: new Date('2025-02-01T00:00:00.000Z'),
        updatedAt: new Date('2025-03-01T00:00:00.000Z'),
      }),
      makePost({ slug: 'draft', draft: true }),
      makePost({ slug: 'private', noindex: true }),
      makePost({ slug: 'external', canonicalUrl: 'https://other.example/external' }),
      makePost({
        slug: 'same-origin-override',
        canonicalUrl: `${siteOrigin}/articles/same-origin-override`,
        category: 'redirected',
        tags: ['same-origin'],
      }),
      makePost({
        slug: 'same-origin-query-override',
        canonicalUrl: `${siteOrigin}/vi/blog/same-origin-query-override?source=canonical`,
      }),
    ]

    const records = buildSitemapManifest(posts, siteOrigin)
    const locations = records.map((record) => record.loc)

    expect(locations).toEqual([...locations].sort())
    expect(locations).toContain('https://example.test/vi/')
    expect(locations).toContain('https://example.test/en/about')
    expect(locations).toContain('https://example.test/vi/blog')
    expect(locations).toContain('https://example.test/en/blog/alpha')
    expect(locations).toContain('https://example.test/vi/categories/c%26d')
    expect(locations).toContain('https://example.test/vi/tags/t%26g')
    expect(locations).not.toContain('https://example.test/vi/blog/draft')
    expect(locations).not.toContain('https://example.test/vi/blog/private')
    expect(locations).not.toContain('https://example.test/vi/blog/external')
    expect(locations).not.toContain('https://example.test/vi/blog/same-origin-override')
    expect(locations).not.toContain('https://example.test/vi/blog/same-origin-query-override')
    expect(locations).toContain('https://example.test/vi/categories/redirected')
    expect(locations).toContain('https://example.test/vi/tags/same-origin')
    expect(locations).not.toContain('https://example.test/search')
    expect(locations).not.toContain('https://example.test/sitemap.xml')
    expect(records.find((record) => record.loc.endsWith('/en/blog/alpha'))?.lastmod).toEqual(
      new Date('2025-03-01T00:00:00.000Z')
    )
    expect(records.find((record) => record.loc === 'https://example.test/vi/')).not.toHaveProperty(
      'lastmod'
    )
  })

  it('escapes XML-sensitive locations and uses the sitemap content type contract', () => {
    const xml = serializeSitemap([
      { loc: 'https://example.test/vi/tags/a&b', lastmod: new Date('2025-01-01T00:00:00.000Z') },
    ])

    expect(xml).toContain('<loc>https://example.test/vi/tags/a&amp;b</loc>')
    expect(xml).toContain('<lastmod>2025-01-01T00:00:00.000Z</lastmod>')
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
  })
})
