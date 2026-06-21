import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const payload = {
    serverInfo: {
      name: 'danhthanh.dev',
      version: '0.0.1',
      vendor: 'danhthanh.dev',
    },
    transport: {
      type: 'http',
      url: `${origin}/auth.md`,
      note: 'The blog does not currently operate an MCP server. See /auth.md for the policy and future intent.',
    },
    capabilities: {},
    tools: [],
  }
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
