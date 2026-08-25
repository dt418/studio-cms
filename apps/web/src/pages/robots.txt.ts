import type { APIRoute } from 'astro'
import { getContentSignals } from '@/lib/agent-metadata'
import { getSiteOrigin, toAbsoluteUrl } from '@/lib/site'

export const prerender = true

export const GET: APIRoute = () => {
  const signals = getContentSignals()
  const signalLine = `Content-Signal: ai-train=${signals['ai-train']}, search=${signals.search}, ai-input=${signals['ai-input']}`
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /api/',
    '',
    `Sitemap: ${toAbsoluteUrl('/sitemap.xml', getSiteOrigin())}`,
    '',
    signalLine,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
