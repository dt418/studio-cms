import { describe, expect, it } from 'vitest'
import { makePost } from '../test-helpers'
import {
  buildBreadcrumbList,
  buildProfilePageSchema,
  buildWebsiteSchema,
  createSeoDocument,
  getPostAlternateLinks,
  isExternalCanonical,
  isNonLocalCanonical,
  isSitemapEligiblePost,
  resolvePostCanonical,
  resolveSeoImage,
  resolveSeoTitle,
  resolvePostDescription,
  serializeJsonLd,
} from './seo'
import { normalizeSiteOrigin, toAbsoluteUrl } from './site'

const siteOrigin = 'https://example.test'

describe('site origin and absolute URLs', () => {
  it('normalizes a root origin and rejects unsafe origins', () => {
    expect(normalizeSiteOrigin('https://example.test/')).toBe(siteOrigin)
    expect(normalizeSiteOrigin('http://localhost:4321')).toBe('http://localhost:4321')

    for (const value of [
      '/relative',
      'example.test',
      'ftp://example.test',
      'https://example.test/path',
      'https://example.test/?query=1',
      'https://example.test/#fragment',
    ]) {
      expect(() => normalizeSiteOrigin(value)).toThrow()
    }
  })

  it('resolves route paths as absolute URLs', () => {
    expect(toAbsoluteUrl('/vi/blog', siteOrigin)).toBe('https://example.test/vi/blog')
    expect(toAbsoluteUrl('/vi/', siteOrigin)).toBe('https://example.test/vi/')
  })
})

describe('post SEO resolution', () => {
  it('prefers a non-empty description over excerpt', () => {
    const post = makePost({ description: '  Custom summary  ', excerpt: 'Excerpt fallback' })
    expect(resolvePostDescription(post)).toBe('Custom summary')
    expect(
      resolvePostDescription(makePost({ description: ' ', excerpt: 'Excerpt fallback' }))
    ).toBe('Excerpt fallback')
  })

  it('uses a valid frontmatter canonical before the generated post URL', () => {
    const post = makePost({
      slug: 'hello-world',
      canonicalUrl: 'https://canonical.example/articles/hello-world',
    })
    expect(resolvePostCanonical(post, siteOrigin)).toBe(
      'https://canonical.example/articles/hello-world'
    )
    expect(resolvePostCanonical(makePost({ slug: 'hello-world' }), siteOrigin)).toBe(
      'https://example.test/vi/blog/hello-world/'
    )
  })

  it('treats same-origin canonical overrides as non-local canonical declarations', () => {
    const post = makePost({
      slug: 'hello-world',
      canonicalUrl: `${siteOrigin}/articles/hello-world`,
      translationKey: 'hello-world',
    })
    expect(isNonLocalCanonical(post, siteOrigin)).toBe(true)
    expect(isExternalCanonical(post, siteOrigin)).toBe(true)
    expect(isSitemapEligiblePost(post, siteOrigin)).toBe(false)
    expect(getPostAlternateLinks(post, [post], siteOrigin)).toEqual([])
  })

  it('does not expose same-origin override siblings as post hreflang targets', () => {
    const current = makePost({
      slug: 'hello-world',
      language: 'vi',
      translationKey: 'hello-world',
    })
    const overriddenSibling = makePost({
      slug: 'hello-world-en',
      language: 'en',
      translationKey: 'hello-world',
      canonicalUrl: `${siteOrigin}/articles/hello-world-en`,
    })

    expect(
      getPostAlternateLinks(overriddenSibling, [current, overriddenSibling], siteOrigin)
    ).toEqual([])
    expect(getPostAlternateLinks(current, [current, overriddenSibling], siteOrigin)).toEqual([
      { locale: 'vi', href: `${siteOrigin}/vi/blog/hello-world/` },
    ])

    const queryOverride = makePost({
      slug: 'query-override',
      language: 'vi',
      canonicalUrl: `${siteOrigin}/vi/blog/query-override?ref=canonical`,
    })
    expect(isExternalCanonical(queryOverride, siteOrigin)).toBe(true)
    expect(isSitemapEligiblePost(queryOverride, siteOrigin)).toBe(false)
  })
})

describe('SEO title resolution', () => {
  it('keeps the brand suffix when combined title fits', () => {
    expect(resolveSeoTitle('Short post', 'DanhThanh.dev')).toBe('Short post | DanhThanh.dev')
  })

  it('drops the brand suffix when combined title exceeds 60 characters', () => {
    const title = 'Set Up 9router API Proxy on VPS with PM2 and Cloudflared'
    expect(resolveSeoTitle(title, 'DanhThanh.dev')).toBe(title)
    expect(resolveSeoTitle(title, 'DanhThanh.dev')).toHaveLength(56)
  })
})

describe('hreflang and normalized SEO documents', () => {
  it('derives social image alt text from page title', () => {
    const seo = createSeoDocument({
      kind: 'indexable',
      title: 'TypeScript Generics | DanhThanh.dev',
      description: 'Description',
      path: '/vi/blog/mastering-typescript-generics',
      lang: 'vi',
      siteOrigin,
      jsonLd: [],
    })

    expect(seo.openGraph?.imageAlt).toBe('TypeScript Generics | DanhThanh.dev')
  })

  it('distinguishes noncanonical and noindex-content documents', () => {
    const noncanonical = createSeoDocument({
      kind: 'noncanonical',
      title: 'Redirect',
      description: 'Redirecting',
      lang: 'vi',
      siteOrigin,
    })
    expect(noncanonical.canonical).toBeUndefined()
    expect(noncanonical.openGraph).toBeUndefined()
    expect(noncanonical.jsonLd).toEqual([])

    const noindex = createSeoDocument({
      kind: 'noindex-content',
      title: 'Private',
      description: 'Private content',
      path: '/vi/blog/private',
      lang: 'vi',
      siteOrigin,
      jsonLd: [{ '@type': 'Article' }],
    })
    expect(noindex.canonical).toBe(`${siteOrigin}/vi/blog/private/`)
    expect(noindex.alternates).toEqual([])
    expect(noindex.jsonLd).toHaveLength(1)
  })

  it('resolves a fixed fallback image and validated custom images', () => {
    expect(resolveSeoImage(undefined, siteOrigin)).toEqual({
      url: `${siteOrigin}/og-image.png`,
      type: 'image/png',
      width: 1200,
      height: 630,
    })
    expect(
      resolveSeoImage(
        { url: '/cover.webp', type: 'image/webp', width: 1600, height: 900 },
        siteOrigin
      )
    ).toEqual({
      url: `${siteOrigin}/cover.webp`,
      type: 'image/webp',
      width: 1600,
      height: 900,
    })
    for (const url of [
      'https://user:password.example/cover.png',
      'https://example.test/cover.png#fragment',
      'ftp://example.test/cover.png',
    ]) {
      expect(() =>
        resolveSeoImage({ url, type: 'image/png', width: 1200, height: 630 }, siteOrigin)
      ).toThrow()
    }
    expect(() =>
      resolveSeoImage(
        { url: '/cover.avif', type: 'image/avif' as never, width: 1200, height: 630 },
        siteOrigin
      )
    ).toThrow('image/png or image/webp')
    expect(() =>
      resolveSeoImage(
        { url: '/cover.jpg', type: 'image/png', width: 1600, height: 900 },
        siteOrigin
      )
    ).toThrow('extension must be .png or .webp')
    expect(() =>
      resolveSeoImage({ url: '', type: 'image/webp', width: 1600, height: 900 }, siteOrigin)
    ).toThrow('image URL is required')
    expect(() =>
      resolveSeoImage(
        { url: '/cover.webp', type: 'image/webp', width: 1200, height: 0 },
        siteOrigin
      )
    ).toThrow('height must be a positive integer')
  })

  it('builds origin-based website/person/profile identities', () => {
    const [website, person] = buildWebsiteSchema({
      name: 'DanhThanh.dev',
      description: 'A blog',
      author: 'Danh Thanh',
      siteOrigin,
      sameAs: ['https://github.com/dt418'],
    })
    expect(website['@id']).toBe(`${siteOrigin}/#website`)
    expect(website.url).toBe(`${siteOrigin}/vi/`)
    expect(person['@id']).toBe(`${siteOrigin}/#person`)
    expect(person.sameAs).toEqual(['https://github.com/dt418'])
    const profile = buildProfilePageSchema({
      name: 'About',
      description: 'Author profile',
      url: `${siteOrigin}/vi/about`,
      siteName: 'DanhThanh.dev',
      siteUrl: siteOrigin,
    })
    expect(profile.mainEntity).toEqual({ '@id': `${siteOrigin}/#person` })
    expect(profile.isPartOf).toMatchObject({ '@id': `${siteOrigin}/#website` })
  })

  it('only emits public keyed translation siblings', () => {
    const current = makePost({ slug: 'bonjour', language: 'vi', translationKey: 'hello' })
    const sibling = makePost({ slug: 'hello', language: 'en', translationKey: 'hello' })
    const unpaired = makePost({ slug: 'other', language: 'en' })
    const hidden = makePost({
      slug: 'hidden',
      language: 'en',
      translationKey: 'hello',
      noindex: true,
    })

    expect(
      getPostAlternateLinks(current, [current, sibling, unpaired, hidden], siteOrigin)
    ).toEqual([
      { locale: 'vi', href: 'https://example.test/vi/blog/bonjour/' },
      { locale: 'en', href: 'https://example.test/en/blog/hello/' },
    ])
    expect(getPostAlternateLinks(unpaired, [unpaired], siteOrigin)).toEqual([])
  })

  it('omits alternates for an external canonical post', () => {
    const current = makePost({
      slug: 'bonjour',
      language: 'vi',
      translationKey: 'hello',
      canonicalUrl: 'https://canonical.example/hello',
    })
    const sibling = makePost({ slug: 'hello', language: 'en', translationKey: 'hello' })
    expect(getPostAlternateLinks(current, [current, sibling], siteOrigin)).toEqual([])
  })

  it('adds a Vietnamese x-default and serializes JSON-LD safely', () => {
    const seo = createSeoDocument({
      title: 'Test | DanhThanh.dev',
      description: 'Description',
      path: '/vi/',
      lang: 'vi',
      kind: 'indexable',
      siteOrigin,
      alternates: [
        { locale: 'en', href: 'https://example.test/en/' },
        { locale: 'vi', href: 'https://example.test/vi/' },
      ],
      jsonLd: [{ '@context': 'https://schema.org', text: '</script><tag>&\u2028\u2029' }],
    })

    expect(seo.canonical).toBe('https://example.test/vi/')
    expect(seo.defaultAlternate).toBe('https://example.test/vi/')
    expect(seo.alternates).toHaveLength(2)
    const serialized = serializeJsonLd(seo.jsonLd)
    expect(serialized).not.toContain('</script>')
    expect(serialized).toContain('\\u003C/script\\u003E')
    expect(serialized).toContain('\\u2028')
    expect(serialized).toContain('\\u2029')
  })
})

describe('breadcrumbs', () => {
  it('uses absolute localized URLs including the final crumb', () => {
    const schema = buildBreadcrumbList({
      homeLabel: 'Home',
      homeUrl: 'https://example.test/vi/',
      blogLabel: 'Blog',
      blogUrl: 'https://example.test/vi/blog',
      currentLabel: 'Category',
      currentUrl: 'https://example.test/vi/categories/category',
    })

    expect(schema.itemListElement.map((item) => item.item)).toEqual([
      'https://example.test/vi/',
      'https://example.test/vi/blog',
      'https://example.test/vi/categories/category',
    ])
    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2, 3])
  })
})
