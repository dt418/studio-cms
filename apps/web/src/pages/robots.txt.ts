import type { APIRoute } from 'astro'
import { getContentSignals } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const signals = getContentSignals()
  const signalLine = `Content-Signal: ai-train=${signals['ai-train']}, search=${signals.search}, ai-input=${signals['ai-input']}`

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /api/',
    '',
    `Sitemap: ${new URL('sitemap.xml', site)}`,
    '',
    signalLine,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
