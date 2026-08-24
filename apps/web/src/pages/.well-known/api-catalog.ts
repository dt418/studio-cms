import type { APIRoute } from 'astro'
import { getApiCatalogLinks, getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const links = getApiCatalogLinks().map((l) => ({
    // Preserve the registered relation from the shared catalog in the linkset.
    rel: l.rel,
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
