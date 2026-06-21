import { defineMiddleware } from 'astro:middleware'
import { buildLinkHeaderValue } from '@/lib/agent-metadata'

const MARKDOWN_CONTENT_TYPE = 'text/markdown'

const MARKDOWN_REWRITES: Record<string, string> = {
  '/': '/vi/index.md',
  '/en/': '/en/index.md',
  '/vi/': '/vi/index.md',
  '/vi': '/vi/index.md',
  '/en': '/en/index.md',
  '/vi/about': '/vi/about.md',
  '/en/about': '/en/about.md',
  '/vi/blog': '/vi/blog.md',
  '/en/blog': '/en/blog.md',
}

function prefersMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) return false
  const entries = acceptHeader
    .split(',')
    .map((entry) => {
      const parts = entry.trim().split(';')
      const typePart = parts[0] ?? ''
      const params = parts.slice(1)
      const qParam = params.map((param) => param.trim()).find((param) => param.startsWith('q='))
      const qvalue = qParam ? Number.parseFloat(qParam.slice(2)) : 1
      return {
        type: typePart.trim().toLowerCase(),
        quality: Number.isNaN(qvalue) ? 1 : qvalue,
      }
    })
    .filter((entry) => entry.type.length > 0)

  const markdown = entries.find((entry) => entry.type === MARKDOWN_CONTENT_TYPE)
  if (!markdown) return false
  if (markdown.quality <= 0) return false

  const html = entries.find((entry) => entry.type === 'text/html')
  if (!html) return markdown.quality > 0

  return markdown.quality > html.quality
}

function resolveMarkdownRewrite(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (MARKDOWN_REWRITES[normalized]) return MARKDOWN_REWRITES[normalized]
  if (MARKDOWN_REWRITES[pathname]) return MARKDOWN_REWRITES[pathname]
  return null
}

function appendLinkHeader(headers: Headers, value: string): void {
  const existing = headers.get('Link')
  headers.set('Link', existing ? `${existing}, ${value}` : value)
}

export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request
  const url = context.url

  const wantsMarkdown =
    url.pathname.endsWith('.md') === false && prefersMarkdown(request.headers.get('accept'))

  if (wantsMarkdown) {
    const rewriteTarget = resolveMarkdownRewrite(url.pathname)
    if (rewriteTarget) {
      return context.rewrite(rewriteTarget)
    }
    return new Response('# Not available\n\nThis page does not have a Markdown representation.\n', {
      status: 406,
      headers: { 'Content-Type': `${MARKDOWN_CONTENT_TYPE}; charset=utf-8` },
    })
  }

  const response = await next()
  const headers = response.headers
  const contentType = headers.get('Content-Type') ?? ''
  const isHtml = contentType.includes('text/html')

  if (isHtml && response.status !== 404) {
    const existingLink = headers.get('Link')
    const linkValue = existingLink
      ? `${existingLink}, ${buildLinkHeaderValue()}`
      : buildLinkHeaderValue()
    headers.set('Link', linkValue)
  }

  if (response.status === 404) {
    const pathname = url.pathname.replace(/\/$/, '')
    if (!pathname.endsWith('/404')) {
      const locale = context.currentLocale ?? 'vi'
      const notFoundResponse = await context.rewrite(`/${locale}/404`)
      const nextHeaders = new Headers(notFoundResponse.headers)
      appendLinkHeader(nextHeaders, buildLinkHeaderValue())
      return new Response(notFoundResponse.body, {
        headers: nextHeaders,
        status: 404,
        statusText: 'Not Found',
      })
    }
  }

  return response
})
