import type { APIRoute } from 'astro'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = `${site?.origin ?? process.env['SITE_URL'] ?? 'https://blog.danhthanh.dev'}/sitemap-index.xml`

  const body = [
    'User-agent: *',
    'Allow: /',
    'Allow: /blog/',
    '',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /_astro/',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
