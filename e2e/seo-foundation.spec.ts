import { test, expect, type APIRequestContext, type Page } from '@playwright/test'

const ORIGIN = process.env.SITE_URL ?? 'http://seo.test:4321'
const ORIGIN_PATTERN = new RegExp(`^${ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
const SEO_FIXTURE = {
  path: '/vi/blog/seo-e2e-noindex',
  description: 'Fixture description proves resolved SEO metadata reaches served HTML.',
  canonical: 'https://canonical.example.invalid/seo-e2e-noindex',
}
const PUBLIC_DESCRIPTION_FIXTURE = {
  slug: 'mastering-typescript-generics',
  locale: 'vi' as const,
  path: '/vi/blog/mastering-typescript-generics',
  description: 'Mô tả tùy chỉnh cho bài viết Generics trong TypeScript.',
  category: 'tutorials',
  tags: ['typescript', 'programming', 'generics'],
}

interface ApiPost {
  slug: string
  locale: 'vi' | 'en'
  title: string
  excerpt: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  url: string
  canonicalUrl?: string
}

interface SchemaNode {
  '@type'?: string
  description?: string
  url?: string
  headline?: string
  mainEntityOfPage?: string | { '@id'?: string }
  itemListElement?: Array<{
    position?: number
    item?: string
  }>
}

interface CatalogPayload {
  linkset?: Array<{ 'service-doc'?: Array<{ href?: string }> }>
}

function decodeXml(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
    }
    return entities[entity] ?? entity
  })
}

function parseSitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1] ?? ''))
}

async function getApiPosts(request: APIRequestContext): Promise<ApiPost[]> {
  const response = await request.get('/api/posts.json')
  expect(response.ok()).toBe(true)
  const payload = (await response.json()) as unknown
  expect(Array.isArray(payload)).toBe(true)
  return payload as ApiPost[]
}

async function readJsonLd(page: Page): Promise<SchemaNode[]> {
  const scripts = page.locator('script[type="application/ld+json"]')
  const count = await scripts.count()
  expect(count).toBe(1)
  const text = await scripts.first().textContent()
  const parsed = JSON.parse(text ?? '[]') as unknown
  expect(Array.isArray(parsed)).toBe(true)
  return parsed as SchemaNode[]
}

function expectAbsoluteSchemaUrls(nodes: SchemaNode[]): void {
  for (const node of nodes) {
    for (const value of [
      node.url,
      typeof node.mainEntityOfPage === 'string'
        ? node.mainEntityOfPage
        : node.mainEntityOfPage?.['@id'],
    ]) {
      if (value) expect(value).toMatch(/^https?:\/\//)
    }
    for (const crumb of node.itemListElement ?? []) {
      expect(crumb.item).toMatch(/^https?:\/\//)
      expect(crumb.position).toBeGreaterThan(0)
    }
  }
}

function expectBreadcrumbs(nodes: SchemaNode[]): void {
  const breadcrumb = nodes.find((node) => node['@type'] === 'BreadcrumbList')
  expect(breadcrumb).toBeDefined()
  const crumbs = breadcrumb?.itemListElement ?? []
  expect(crumbs.length).toBeGreaterThanOrEqual(2)
  expect(crumbs.map((crumb) => crumb.position)).toEqual(crumbs.map((_, index) => index + 1))
  for (const crumb of crumbs) expect(crumb.item).toMatch(/^https?:\/\//)
}

async function expectPublicSeo(page: Page, path: string, expectLocaleAlternates = true) {
  await page.goto(path)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  if (expectLocaleAlternates) {
    await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute('href', /^http/)
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /^http/)
    const defaultPath = new URL(path, ORIGIN).pathname.replace(/^\/(?:vi|en)(?=\/|$)/, '/vi')
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${ORIGIN}${defaultPath}`
    )
  } else {
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
  }
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /^http/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^http/)
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /^http/)
}

test.describe('served SEO HTML', () => {
  test('localized index/list routes render exact schema families', async ({ page }) => {
    const cases: Array<[string, string[], boolean]> = [
      ['/vi/', ['WebSite', 'Person'], true],
      ['/en/', ['WebSite', 'Person'], true],
      ['/vi/about', ['ProfilePage', 'BreadcrumbList'], true],
      ['/en/about', ['ProfilePage', 'BreadcrumbList'], true],
      ['/vi/blog', ['CollectionPage', 'BreadcrumbList'], true],
      ['/en/blog', ['CollectionPage', 'BreadcrumbList'], true],
      ['/vi/categories/tutorials', ['CollectionPage', 'BreadcrumbList'], false],
      ['/vi/tags/typescript', ['CollectionPage', 'BreadcrumbList'], false],
    ]

    for (const [path, expectedTypes, hasAlternates] of cases) {
      await expectPublicSeo(page, path, hasAlternates)
      const nodes = await readJsonLd(page)
      expect(nodes.map((node) => node['@type'])).toEqual(expect.arrayContaining(expectedTypes))
      expectAbsoluteSchemaUrls(nodes)
      if (expectedTypes.includes('BreadcrumbList')) expectBreadcrumbs(nodes)
    }
  })

  test('public post schema has Article and absolute breadcrumbs', async ({ page, request }) => {
    const path = '/vi/blog/mastering-typescript-generics'
    expect((await request.get(path)).status()).toBe(200)
    await expectPublicSeo(page, path, true)
    const nodes = await readJsonLd(page)
    expect(nodes.map((node) => node['@type'])).toEqual(
      expect.arrayContaining(['Article', 'BreadcrumbList'])
    )
    expectAbsoluteSchemaUrls(nodes)
    expectBreadcrumbs(nodes)
    const article = nodes.find((node) => node['@type'] === 'Article')
    expect(article?.url).toMatch(/^https?:\/\//)
    expect(article?.mainEntityOfPage).toBeTruthy()
  })

  test('fixture custom description and canonical override reach served metadata', async ({
    page,
    request,
  }) => {
    await page.goto(SEO_FIXTURE.path)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      SEO_FIXTURE.description
    )
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      SEO_FIXTURE.description
    )
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      SEO_FIXTURE.description
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      SEO_FIXTURE.canonical
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      SEO_FIXTURE.canonical
    )
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
    const article = (await readJsonLd(page)).find((node) => node['@type'] === 'Article')
    expect(article?.description).toBe(SEO_FIXTURE.description)
    expect(article?.url).toBe(SEO_FIXTURE.canonical)

    const sitemap = parseSitemapLocations(await (await request.get('/sitemap.xml')).text())
    expect(sitemap.some((location) => location.includes('seo-e2e-noindex'))).toBe(false)
  })

  test('noindex post pages never become Pagefind bodies', async ({ page, request }) => {
    const response = await request.get(SEO_FIXTURE.path)
    expect(response.status()).toBe(200)
    await page.goto(SEO_FIXTURE.path)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    )
    await expect(page.locator('[data-pagefind-body]')).toHaveCount(0)
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
  })

  test('redirect and 404 HTML is noindex and emits no canonical/social/schema', async ({
    page,
    request,
  }) => {
    const rootHtml = await (await request.get('/')).text()
    expect(rootHtml).toContain('noindex, nofollow')
    expect(rootHtml).not.toContain('rel="canonical"')
    expect(rootHtml).not.toContain('property="og:')
    expect(rootHtml).not.toContain('application/ld+json')

    for (const path of ['/missing-page', '/vi/missing-page']) {
      await page.goto(path)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow'
      )
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
      await expect(page.locator('meta[property^="og:"]')).toHaveCount(0)
      await expect(page.locator('meta[name^="twitter:"]')).toHaveCount(0)
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0)
    }
  })
})

test.describe('served discovery surfaces', () => {
  test('sitemap contains unique reachable canonical HTML URLs only', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.headers()['content-type']).toContain('application/xml')
    const locations = parseSitemapLocations(await response.text())
    expect(locations.length).toBeGreaterThan(0)
    expect(new Set(locations).size).toBe(locations.length)

    for (const location of locations) {
      expect(location).toMatch(ORIGIN_PATTERN)
      const parsed = new URL(location)
      expect(parsed.pathname).not.toMatch(/\/(?:api|search|pagefind|\.well-known)(?:\/|$)/)
      expect(parsed.pathname).not.toMatch(/(?:\.md|\.xml)$/)
      expect(parsed.pathname).not.toMatch(/(?:404|draft|private|noindex)/i)
      const route = await request.get(parsed.pathname)
      expect(route.status(), location).toBe(200)
      expect(route.headers()['content-type']).toMatch(/^text\/html/)
      const html = await route.text()
      expect(html).toContain('index, follow')
      expect(html).not.toContain('name="robots" content="noindex, nofollow"')
    }
  })

  test('locale taxonomy paths are reachable from locale-local API content', async ({ request }) => {
    const posts = await getApiPosts(request)
    const terms = new Map<'vi' | 'en', { categories: Set<string>; tags: Set<string> }>([
      ['vi', { categories: new Set(), tags: new Set() }],
      ['en', { categories: new Set(), tags: new Set() }],
    ])
    for (const post of posts) {
      terms.get(post.locale)?.categories.add(post.category)
      for (const tag of post.tags) terms.get(post.locale)?.tags.add(tag)
    }

    for (const locale of ['vi', 'en'] as const) {
      for (const category of terms.get(locale)?.categories ?? []) {
        const result = await request.get(`/${locale}/categories/${encodeURIComponent(category)}`)
        expect(result.status(), `${locale} category ${category}`).toBe(200)
      }
      for (const tag of terms.get(locale)?.tags ?? []) {
        const result = await request.get(`/${locale}/tags/${encodeURIComponent(tag)}`)
        expect(result.status(), `${locale} tag ${tag}`).toBe(200)
      }
    }

    for (const locale of ['vi', 'en'] as const) {
      const otherLocale = locale === 'vi' ? 'en' : 'vi'
      const localTerms = terms.get(locale)
      const otherTerms = terms.get(otherLocale)
      for (const category of localTerms?.categories ?? []) {
        if (otherTerms?.categories.has(category)) continue
        const result = await request.get(
          `/${otherLocale}/categories/${encodeURIComponent(category)}`
        )
        expect(
          result.status(),
          `${otherLocale} must not expose ${locale} category ${category}`
        ).toBe(404)
      }
      for (const tag of localTerms?.tags ?? []) {
        if (otherTerms?.tags.has(tag)) continue
        const result = await request.get(`/${otherLocale}/tags/${encodeURIComponent(tag)}`)
        expect(result.status(), `${otherLocale} must not expose ${locale} tag ${tag}`).toBe(404)
      }
    }
  })

  test('API and RSS exclude hidden posts and share resolved descriptions/local links', async ({
    request,
  }) => {
    const posts = await getApiPosts(request)
    for (const post of posts) {
      expect(post.url).toMatch(ORIGIN_PATTERN)
      expect(post.description.trim()).not.toBe('')
      expect(post).not.toHaveProperty('draft')
      expect(post).not.toHaveProperty('noindex')
    }

    const rss = await (await request.get('/rss.xml')).text()
    expect(rss).not.toContain('sitemap-index.xml')
    expect(rss).not.toContain('/search')
    for (const post of posts) {
      expect(rss).toMatch(
        new RegExp(`<link>${post.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?</link>`)
      )
      expect(rss).toContain(post.description.replace(/&/g, '&amp;'))
    }

    const fixture = posts.find(
      (post) =>
        post.slug === PUBLIC_DESCRIPTION_FIXTURE.slug &&
        post.locale === PUBLIC_DESCRIPTION_FIXTURE.locale
    )
    expect(fixture).toMatchObject({
      description: PUBLIC_DESCRIPTION_FIXTURE.description,
      category: PUBLIC_DESCRIPTION_FIXTURE.category,
      tags: PUBLIC_DESCRIPTION_FIXTURE.tags,
    })
    expect(fixture?.url).toBe(`${ORIGIN}${PUBLIC_DESCRIPTION_FIXTURE.path}`)
    expect(rss).toContain(PUBLIC_DESCRIPTION_FIXTURE.description)
  })

  test('robots, catalog, auth, and Markdown docs have no stale discovery references', async ({
    request,
  }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots.match(/^Sitemap:\s.*$/gim)).toEqual([`Sitemap: ${ORIGIN}/sitemap.xml`])
    expect(robots).not.toContain('sitemap-index.xml')
    expect(robots).not.toContain('/search')

    const catalog = (await (await request.get('/.well-known/api-catalog')).json()) as CatalogPayload
    const catalogLinks = (catalog.linkset ?? []).flatMap((entry) =>
      (entry['service-doc'] ?? []).map((link) => link.href ?? '')
    )
    expect(catalogLinks).toContain(`${ORIGIN}/sitemap.xml`)
    expect(catalogLinks.join('\n')).not.toContain('sitemap-index.xml')
    expect(catalogLinks.join('\n')).not.toContain('/search')

    for (const path of ['/auth.md', '/vi/index.md', '/en/index.md']) {
      const body = await (await request.get(path)).text()
      expect(body).not.toContain('/search')
      expect(body).not.toContain('sitemap-index.xml')
    }
  })
})
