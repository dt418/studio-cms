import type { APIRoute } from 'astro'
import { getApiCatalogLinks, getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const links = getApiCatalogLinks().map((l) => ({
    // Keep the shared metadata relation as service-doc for Link headers while
    // exposing the standard documentation relation in this RFC 9264 linkset.
    rel: l.rel === 'service-doc' ? 'documentation' : l.rel,
    href: l.href.startsWith('http') ? l.href : `${origin}${l.href}`,
    type: l.type,
    ...(l.title ? { title: l.title } : {}),
  }))
  const payload = {
    linkset: [
      {
        anchor: origin,
        'service-doc': links,
      },
    ],
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/linkset+json' },
  })
}
