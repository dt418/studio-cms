import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const payload = {
    issuer: origin,
    authorization_endpoint: `${origin}/auth.md`,
    token_endpoint: `${origin}/auth.md`,
    response_types_supported: ['code'],
    scopes_supported: [],
    service_documentation: `${origin}/auth.md`,
    agent_auth: {
      supported_identity_types: ['none'],
      registration_required: false,
      register_uri: `${origin}/.well-known/agent-auth/register`,
      registration_metadata_uri: `${origin}/.well-known/agent-auth/metadata.json`,
      authorization_methods_supported: ['none'],
      capabilities_negotiation: false,
      notes:
        'No authentication is required today. The agent_auth block advertises a future contract: agents can self-declare identity at /auth.md (text/markdown) and a registration endpoint will become authoritative when write operations are added.',
    },
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
