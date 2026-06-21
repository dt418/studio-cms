import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const payload = {
    issuer: origin,
    authorization_endpoint: `${origin}/auth.md`,
    jwks_uri: `${origin}/auth.md`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    service_documentation: `${origin}/auth.md`,
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
