import { describe, expect, it } from 'vitest'
import { resolveConfiguredSiteUrl } from '../../astro.config.mjs'
import { normalizeSiteOrigin, toAbsoluteUrl, toCanonicalUrl } from './site'

describe('resolveConfiguredSiteUrl', () => {
  it('requires an explicit production origin', () => {
    expect(() => resolveConfiguredSiteUrl('build', {})).toThrow(
      'SITE_URL or CF_PAGES_URL is required for astro build'
    )
  })

  it('uses the explicit local fallback only for dev', () => {
    expect(resolveConfiguredSiteUrl('dev', {})).toBe('http://localhost:4321')
  })

  it('normalizes SITE_URL and accepts CF_PAGES_URL as fallback', () => {
    expect(resolveConfiguredSiteUrl('build', { SITE_URL: 'https://seo.test/' })).toBe(
      'https://seo.test'
    )
    expect(resolveConfiguredSiteUrl('build', { CF_PAGES_URL: 'https://pages.test/' })).toBe(
      'https://pages.test'
    )
  })

  it('rejects unsafe configured origins', () => {
    for (const value of [
      'https://seo.test/path',
      'https://user:password@seo.test',
      'https://seo.test/#fragment',
      'ftp://seo.test',
    ]) {
      expect(() => resolveConfiguredSiteUrl('build', { SITE_URL: value })).toThrow()
    }
  })
})

describe('site URL primitives', () => {
  it('normalizes origins and builds absolute paths', () => {
    expect(normalizeSiteOrigin('https://seo.test/')).toBe('https://seo.test')
    expect(toAbsoluteUrl('/vi/', 'https://seo.test')).toBe('https://seo.test/vi/')
  })

  it('builds canonical route URLs with a trailing slash', () => {
    expect(toCanonicalUrl('/vi/', 'https://seo.test')).toBe('https://seo.test/vi/')
    expect(toCanonicalUrl('/vi/about', 'https://seo.test')).toBe('https://seo.test/vi/about/')
    expect(toCanonicalUrl('/vi/blog/post?view=full', 'https://seo.test')).toBe(
      'https://seo.test/vi/blog/post/?view=full'
    )
  })
})
