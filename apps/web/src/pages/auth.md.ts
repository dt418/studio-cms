import type { APIRoute } from 'astro'
import { getContentSignals, getLocales, getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? getSiteUrl()).origin
  const signals = getContentSignals()
  const locales = getLocales()
  const body = [
    '# Auth.md',
    '',
    '> Machine-readable authentication policy for AI agents.',
    '',
    '## Current state',
    '',
    'This blog is public. There is **no authentication required** to read any page, post, or feed. No tokens, sessions, or user accounts exist.',
    '',
    '## What you can do',
    '',
    '- Read any post or page',
    '- Subscribe to the RSS feed at /rss.xml',
    '- Search the blog at /search',
    '- Browse tags, categories, and authors',
    '',
    '## What you cannot do',
    '',
    '- There is no API access for write operations',
    '- There is no personalized content or per-user state',
    '- There is no login flow',
    '',
    '## Future intent',
    '',
    'If the blog later operates an OAuth/OIDC server, MCP server, or other role that requires discovery metadata, the following well-known endpoints will become real (today they are honest stubs that declare this absence):',
    '',
    `- [\`/.well-known/oauth-authorization-server\`](${origin}/.well-known/oauth-authorization-server) (RFC 8414 stub)`,
    `- [\`/.well-known/openid-configuration\`](${origin}/.well-known/openid-configuration) (OIDC Discovery stub)`,
    `- [\`/.well-known/oauth-protected-resource\`](${origin}/.well-known/oauth-protected-resource) (RFC 9728 stub)`,
    `- [\`/.well-known/mcp/server-card.json\`](${origin}/.well-known/mcp/server-card.json) (MCP server card stub)`,
    '',
    '## Content signals',
    '',
    '```',
    `Content-Signal: ai-train=${signals['ai-train']}, search=${signals.search}, ai-input=${signals['ai-input']}`,
    '```',
    '',
    '## Contact',
    '',
    `Author: danhthanh.dev (locales: ${locales.join(', ')})`,
    '',
    `Source: <${origin}>`,
    '',
  ].join('\n')
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
