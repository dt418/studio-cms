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
  path: '/vi/blog/mastering-typescript-generics/',
  description:
    'Khám phá TypeScript Generics từ hàm generic, constraints và interface đến Repository Pattern để viết mã tái sử dụng và an toàn kiểu.',
  category: 'tutorials',
  tags: ['typescript', 'programming', 'generics'],
}
const LOCALE_SPECIFIC_TAXONOMY_FIXTURE = {
  locale: 'vi' as const,
  category: 'e2e-locale-only',
  tag: 'e2e-locale-only',
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

function readTagAttributes(html: string, tagName: 'link' | 'meta'): Array<Record<string, string>> {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map((match) =>
    Object.fromEntries(
      [...match[0].matchAll(/\s([:\w-]+)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map((attribute) => [
        attribute[1],
        attribute[2] ?? attribute[3] ?? attribute[4] ?? '',
      ])
    )
  )
}

function readMetaContent(
  html: string,
  key: 'name' | 'property',
  value: string
): string | undefined {
  return readTagAttributes(html, 'meta').find((attributes) => attributes[key] === value)?.content
}

function readAnchorHrefs(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)].map(
    (match) => match[1] ?? match[2] ?? match[3] ?? ''
  )
}

function readPngDimensions(data: Uint8Array): { width: number; height: number } {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function readJsonLdHtml(html: string): SchemaNode[] {
  const scripts = [
    ...html.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi),
  ]
  expect(scripts).toHaveLength(1)
  const parsed = JSON.parse(scripts[0]?.[1] ?? '[]') as unknown
  expect(Array.isArray(parsed)).toBe(true)
  return parsed as SchemaNode[]
}

async function getApiPosts(request: APIRequestContext): Promise<ApiPost[]> {
  const response = await request.get('/api/posts.json')
  expect(response.ok()).toBe(true)
  const payload = (await response.json()) as unknown
  expect(Array.isArray(payload)).toBe(true)
  return payload as ApiPost[]
}

function getLocaleTermSets(posts: ApiPost[], locale: 'vi' | 'en') {
  const localePosts = posts.filter((post) => post.locale === locale)
  return {
    tags: new Set(localePosts.flatMap((post) => post.tags)),
    categories: new Set(localePosts.map((post) => post.category)),
  }
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
  for (const crumb of crumbs) {
    expect(crumb.item).toMatch(/^https?:\/\//)
    const pathname = new URL(crumb.item ?? '').pathname
    if (pathname !== '/') expect(pathname).toMatch(/\/$/)
  }
}

async function expectPublicSeo(page: Page, path: string, expectLocaleAlternates = true) {
  await page.goto(path)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  const expectedCanonical = new URL(path, ORIGIN)
  if (expectedCanonical.pathname !== '/' && !expectedCanonical.pathname.endsWith('/')) {
    expectedCanonical.pathname += '/'
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    expectedCanonical.href
  )
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  if (expectLocaleAlternates) {
    await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute('href', /^http/)
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /^http/)
    let defaultPath = new URL(path, ORIGIN).pathname.replace(/^\/(?:vi|en)(?=\/|$)/, '/vi')
    if (defaultPath !== '/' && !defaultPath.endsWith('/')) defaultPath += '/'
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
  test('documents declare the complete favicon set', async ({ request }) => {
    const html = await (await request.get('/vi/')).text()
    expect(readTagAttributes(html, 'link')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rel: 'icon',
          type: 'image/png',
          href: '/favicon-96x96.png',
          sizes: '96x96',
        }),
        expect.objectContaining({ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }),
        expect.objectContaining({ rel: 'shortcut icon', href: '/favicon.ico' }),
        expect.objectContaining({
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        }),
        expect.objectContaining({ rel: 'manifest', href: '/site.webmanifest' }),
      ])
    )
  })

  test('favicon files expose valid image sizes and manifest metadata', async ({ request }) => {
    for (const [path, size] of [
      ['/favicon-96x96.png', 96],
      ['/apple-touch-icon.png', 180],
      ['/web-app-manifest-192x192.png', 192],
      ['/web-app-manifest-512x512.png', 512],
    ] as const) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect(response.headers()['content-type'], path).toContain('image/png')
      expect(readPngDimensions(await response.body()), path).toEqual({ width: size, height: size })
    }

    const ico = await request.get('/favicon.ico')
    expect(ico.status()).toBe(200)
    expect(ico.headers()['content-type']).toContain('image/x-icon')
    const icoBody = await ico.body()
    expect([...icoBody.subarray(0, 4)]).toEqual([0, 0, 1, 0])

    const manifest = await request.get('/site.webmanifest')
    expect(manifest.status()).toBe(200)
    expect(manifest.headers()['content-type']).toContain('application/manifest+json')
    expect(await manifest.json()).toMatchObject({
      name: 'DanhThanh.dev',
      short_name: 'DanhThanh.dev',
      theme_color: '#0e0d0c',
      background_color: '#f6f5f1',
      icons: [
        {
          src: '/web-app-manifest-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/web-app-manifest-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    })
  })

  test('indexable pages expose correct author metadata for their document type', async ({
    request,
  }) => {
    const sitemap = parseSitemapLocations(await (await request.get('/sitemap.xml')).text())
    const articlePaths = new Set(
      (await getApiPosts(request)).map((post) => new URL(post.url, ORIGIN).pathname)
    )

    for (const location of sitemap) {
      const path = new URL(location).pathname
      const html = await (await request.get(path)).text()
      const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]
      expect(readMetaContent(html, 'name', 'author'), location).toBe('Danh Thanh')
      expect(readMetaContent(html, 'property', 'og:image:alt'), location).toBe(title)
      expect(readMetaContent(html, 'name', 'twitter:image:alt'), location).toBe(title)
      expect(readMetaContent(html, 'property', 'article:author'), location).toBe(
        articlePaths.has(path) ? 'Danh Thanh' : undefined
      )
    }
  })

  test('long article titles truncate content but keep the brand suffix', async ({ request }) => {
    for (const path of [
      '/vi/blog/cai-dat-9router-api-proxy-tren-vps',
      '/en/blog/cai-dat-9router-api-proxy-tren-vps',
    ]) {
      const html = await (await request.get(path)).text()
      const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? ''
      expect(title.length, path).toBeLessThanOrEqual(60)
      expect(title, path).toMatch(/\| DanhThanh\.dev$/)
      expect(title.startsWith('…'), path).toBe(false)
      expect(readMetaContent(html, 'property', 'og:title'), path).toBe(title)
      expect(readMetaContent(html, 'name', 'twitter:title'), path).toBe(title)
    }
  })

  test('indexable pages expose trailing-slash breadcrumb URLs', async ({ request }) => {
    const sitemap = parseSitemapLocations(await (await request.get('/sitemap.xml')).text())

    for (const location of sitemap) {
      const path = new URL(location).pathname
      const html = await (await request.get(path)).text()
      const breadcrumb = readJsonLdHtml(html).find((node) => node['@type'] === 'BreadcrumbList')
      if (!breadcrumb) continue

      for (const crumb of breadcrumb?.itemListElement ?? []) {
        const pathname = new URL(crumb.item ?? '').pathname
        if (pathname !== '/') expect(pathname, location).toMatch(/\/$/)
      }
    }
  })

  test('indexable pages use trailing-slash localized internal links', async ({ request }) => {
    const sitemap = parseSitemapLocations(await (await request.get('/sitemap.xml')).text())

    for (const location of sitemap) {
      const path = new URL(location).pathname
      const html = await (await request.get(path)).text()
      for (const href of readAnchorHrefs(html)) {
        if (!href.startsWith('/') || href.startsWith('//')) continue
        const pathname = new URL(href, ORIGIN).pathname
        if (!/^\/(?:vi|en)(?:\/|$)/.test(pathname)) continue
        if (pathname !== '/') expect(pathname, `${location}: ${href}`).toMatch(/\/$/)
      }
    }
  })

  test('taxonomy pages expose reciprocal hreflang links', async ({ request }) => {
    const sitemap = parseSitemapLocations(await (await request.get('/sitemap.xml')).text())
    const sitemapSet = new Set(sitemap)
    const apiPosts = await getApiPosts(request)
    const locales = ['vi', 'en'] as const
    const localeTerms = {
      vi: getLocaleTermSets(apiPosts, 'vi'),
      en: getLocaleTermSets(apiPosts, 'en'),
    }
    const fixtureLocale = LOCALE_SPECIFIC_TAXONOMY_FIXTURE.locale
    const otherLocale = locales.find((locale) => locale !== fixtureLocale)
    if (!otherLocale) throw new Error('Locale-specific taxonomy fixture needs another locale')
    expect(localeTerms[fixtureLocale].tags.has(LOCALE_SPECIFIC_TAXONOMY_FIXTURE.tag)).toBe(true)
    expect(localeTerms[otherLocale].tags.has(LOCALE_SPECIFIC_TAXONOMY_FIXTURE.tag)).toBe(false)
    expect(
      localeTerms[fixtureLocale].categories.has(LOCALE_SPECIFIC_TAXONOMY_FIXTURE.category)
    ).toBe(true)
    expect(localeTerms[otherLocale].categories.has(LOCALE_SPECIFIC_TAXONOMY_FIXTURE.category)).toBe(
      false
    )

    for (const location of sitemap.filter((entry) => /\/(?:tags|categories)\//.test(entry))) {
      const path = new URL(location).pathname
      const [, , kind, rawTerm] = path.split('/')
      if ((kind !== 'tags' && kind !== 'categories') || !rawTerm)
        throw new Error(`Unexpected taxonomy sitemap entry: ${location}`)
      const term = decodeURIComponent(rawTerm)
      const expectedLocales = locales.filter((locale) => {
        const terms = localeTerms[locale]
        return kind === 'tags' ? terms.tags.has(term) : terms.categories.has(term)
      })
      const html = await (await request.get(path)).text()
      const links = readTagAttributes(html, 'link').filter(
        (attributes) => attributes.rel === 'alternate' && attributes.hreflang
      )
      expect(
        links.map((link) => link.hreflang),
        location
      ).toEqual([...expectedLocales, ...(expectedLocales.includes('vi') ? ['x-default'] : [])])
      const xDefault = links.find((link) => link.hreflang === 'x-default')
      if (expectedLocales.includes('vi')) {
        expect(xDefault?.href, location).toBe(links.find((link) => link.hreflang === 'vi')?.href)
      } else {
        expect(xDefault, location).toBeUndefined()
      }
      for (const link of links)
        expect(sitemapSet.has(link.href), `${location}: ${link.href}`).toBe(true)
    }
  })

  test('localized index/list routes render exact schema families', async ({ page }) => {
    const cases: Array<[string, string[], boolean]> = [
      ['/vi/', ['WebSite', 'Person'], true],
      ['/en/', ['WebSite', 'Person'], true],
      ['/vi/about', ['ProfilePage', 'BreadcrumbList'], true],
      ['/en/about', ['ProfilePage', 'BreadcrumbList'], true],
      ['/vi/blog', ['CollectionPage', 'BreadcrumbList'], true],
      ['/en/blog', ['CollectionPage', 'BreadcrumbList'], true],
      ['/vi/categories/tutorials', ['CollectionPage', 'BreadcrumbList'], true],
      ['/vi/tags/typescript', ['CollectionPage', 'BreadcrumbList'], true],
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
      if (parsed.pathname !== '/') expect(parsed.pathname).toMatch(/\/$/)
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
