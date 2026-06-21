import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const payload = {
    resource: origin,
    authorization_servers: [],
    bearer_methods_supported: [],
    resource_documentation: `${origin}/auth.md`,
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
