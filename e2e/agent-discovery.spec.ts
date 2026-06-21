import { test, expect } from '@playwright/test'

const expected = [
  { path: '/.well-known/api-catalog', contentTypeIncludes: 'application/linkset+json' },
  { path: '/.well-known/oauth-protected-resource', contentTypeIncludes: 'application/json' },
  { path: '/.well-known/oauth-authorization-server', contentTypeIncludes: 'application/json' },
  { path: '/.well-known/openid-configuration', contentTypeIncludes: 'application/json' },
  { path: '/.well-known/mcp/server-card.json', contentTypeIncludes: 'application/json' },
  { path: '/.well-known/agent-skills/index.json', contentTypeIncludes: 'application/json' },
] as const

for (const { path, contentTypeIncludes } of expected) {
  test(`GET ${path} returns 200 with correct content-type`, async ({ request }) => {
    const res = await request.get(path)
    expect(res.status()).toBe(200)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toContain(contentTypeIncludes)
  })
}

test('GET /auth.md returns markdown with no-auth policy', async ({ request }) => {
  const res = await request.get('/auth.md')
  expect(res.status()).toBe(200)
  const ct = res.headers()['content-type'] ?? ''
  expect(ct).toContain('text/markdown')
  const body = await res.text()
  expect(body).toContain('# Authentication Policy')
  expect(body.toLowerCase()).toContain('no authentication required')
})

test('GET /robots.txt includes Content-Signal', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.status()).toBe(200)
  const body = await res.text()
  expect(body).toContain('Content-Signal: ai-train=no, search=yes, ai-input=yes')
})

test('RFC 9728 oauth-protected-resource declares empty authorization_servers', async ({ request }) => {
  const res = await request.get('/.well-known/oauth-protected-resource')
  const body = (await res.json()) as { authorization_servers: unknown[]; resource_documentation: string }
  expect(body.authorization_servers).toEqual([])
  expect(body.resource_documentation).toMatch(/\/auth\.md$/)
})

test('RFC 8414 oauth-authorization-server declares empty scopes_supported', async ({ request }) => {
  const res = await request.get('/.well-known/oauth-authorization-server')
  const body = (await res.json()) as { scopes_supported: unknown[] }
  expect(body.scopes_supported).toEqual([])
})

test('OIDC Discovery stub declares subject_types_supported', async ({ request }) => {
  const res = await request.get('/.well-known/openid-configuration')
  const body = (await res.json()) as { subject_types_supported: string[] }
  expect(body.subject_types_supported).toContain('public')
})

test('MCP server card declares empty capabilities and tools', async ({ request }) => {
  const res = await request.get('/.well-known/mcp/server-card.json')
  const body = (await res.json()) as { capabilities: Record<string, unknown>; tools: unknown[] }
  expect(body.capabilities).toEqual({})
  expect(body.tools).toEqual([])
})

test('RFC 9264 api-catalog linkset includes documentation link to /auth.md', async ({ request }) => {
  const res = await request.get('/.well-known/api-catalog')
  const body = (await res.json()) as {
    linkset: Array<{ 'service-doc': Array<{ rel: string; href: string }> }>
  }
  const all = body.linkset.flatMap((l) => l['service-doc'])
  const auth = all.find((l) => l.rel === 'documentation')
  expect(auth?.href).toMatch(/\/auth\.md$/)
})

test('Agent skills index returns valid skills array', async ({ request }) => {
  const res = await request.get('/.well-known/agent-skills/index.json')
  const body = (await res.json()) as { skills: unknown[] }
  expect(Array.isArray(body.skills)).toBe(true)
})