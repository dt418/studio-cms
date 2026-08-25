import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import { getSiteOrigin } from './site'

const here = dirname(fileURLToPath(import.meta.url))

export const LocaleSchema = z.enum(['vi', 'en'])

export const ContentSignalSchema = z.object({
  'ai-train': z.enum(['yes', 'no']),
  search: z.enum(['yes', 'no']),
  'ai-input': z.enum(['yes', 'no']),
})

export const AgentSkillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  version: z.string().min(1),
})

export type Locale = z.infer<typeof LocaleSchema>
export type ContentSignal = z.infer<typeof ContentSignalSchema>
export type AgentSkill = z.infer<typeof AgentSkillSchema>

export interface ApiCatalogLink {
  rel: string
  href: string
  type: string
  title?: string
}

export function getSiteUrl(): URL {
  return new URL(getSiteOrigin())
}

export function getLocales(): Locale[] {
  return ['vi', 'en']
}

export function getContentSignals(): ContentSignal {
  return { 'ai-train': 'no', search: 'yes', 'ai-input': 'yes' }
}

export function getApiCatalogLinks(): ApiCatalogLink[] {
  return [
    {
      rel: 'alternate',
      href: '/rss.xml',
      type: 'application/rss+xml',
      title: 'RSS feed',
    },
    {
      rel: 'sitemap',
      href: '/sitemap.xml',
      type: 'application/xml',
      title: 'Sitemap',
    },
    {
      rel: 'service-doc',
      href: '/auth.md',
      type: 'text/markdown',
      title: 'Auth policy',
    },
    {
      rel: 'api-catalog',
      href: '/.well-known/api-catalog',
      type: 'application/linkset+json',
      title: 'API catalog (RFC 8288 linkset)',
    },
    {
      rel: 'auth-server',
      href: '/.well-known/oauth-authorization-server',
      type: 'application/json',
      title: 'OAuth authorization server metadata (RFC 8414)',
    },
    {
      rel: 'oauth-protected-resource',
      href: '/.well-known/oauth-protected-resource',
      type: 'application/json',
      title: 'OAuth protected resource metadata (RFC 9728)',
    },
    {
      rel: 'openid-configuration',
      href: '/.well-known/openid-configuration',
      type: 'application/json',
      title: 'OpenID Connect discovery',
    },
    {
      rel: 'agent-skills',
      href: '/.well-known/agent-skills/index.json',
      type: 'application/json',
      title: 'Agent skills discovery index',
    },
    {
      rel: 'dns-aid',
      href: '/.well-known/dns-aid.json',
      type: 'application/json',
      title: 'DNS-AID agent discovery records',
    },
  ]
}

export function buildLinkHeaderValue(): string {
  return getApiCatalogLinks()
    .map((l) => `<${l.href}>; rel="${l.rel}"; type="${l.type}"`)
    .join(', ')
}

export interface DnsAidRecord {
  name: string
  type: 'SVCB' | 'HTTPS' | 'TXT'
  priority: number
  target: string
  params?: Record<string, string>
  ttl?: number
}

export function getDnsAidRecords(): DnsAidRecord[] {
  return [
    {
      name: '_a2a._agents',
      type: 'SVCB',
      priority: 1,
      target: 'danhthanh.dev',
      params: { alpn: 'h2', port: '443' },
      ttl: 3600,
    },
    {
      name: '_index._agents',
      type: 'SVCB',
      priority: 1,
      target: 'danhthanh.dev',
      params: { alpn: 'h2', port: '443' },
      ttl: 3600,
    },
  ]
}

export interface WebMCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export function getWebMCPTools(): WebMCPTool[] {
  return [
    {
      name: 'search_posts',
      description: 'Search the blog for posts by query, category, tag, or locale.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search query.' },
          category: { type: 'string', description: 'Filter by category slug.' },
          tag: { type: 'string', description: 'Filter by tag slug.' },
          locale: { type: 'string', enum: ['vi', 'en'], description: 'Locale code.' },
        },
      },
    },
    {
      name: 'get_post',
      description: 'Fetch a single blog post by its slug and locale.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Post slug.' },
          locale: { type: 'string', enum: ['vi', 'en'], description: 'Locale code.' },
        },
        required: ['slug', 'locale'],
      },
    },
    {
      name: 'list_categories',
      description: 'List all blog categories for a locale with post counts.',
      inputSchema: {
        type: 'object',
        properties: {
          locale: { type: 'string', enum: ['vi', 'en'], description: 'Locale code.' },
        },
        required: ['locale'],
      },
    },
    {
      name: 'list_tags',
      description: 'List all blog tags for a locale with post counts.',
      inputSchema: {
        type: 'object',
        properties: {
          locale: { type: 'string', enum: ['vi', 'en'], description: 'Locale code.' },
        },
        required: ['locale'],
      },
    },
  ]
}

export function getHomeMarkdownPath(locale: string): string {
  return locale === 'en' ? '/en/index.md' : '/vi/index.md'
}

interface AgentSkillsIndexFile {
  skills: AgentSkill[]
}

function resolveGeneratedSkillsPath(): string {
  const candidates = [
    join(process.cwd(), 'src', 'lib', '.generated', 'agent-skills-index.json'),
    join(here, '.generated', 'agent-skills-index.json'),
  ]
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, 'utf8')
      return candidate
    } catch {
      continue
    }
  }
  return candidates[0] ?? ''
}

export function getAgentSkills(): AgentSkill[] {
  const path = resolveGeneratedSkillsPath()
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return []
  }
  const parsed = JSON.parse(raw) as AgentSkillsIndexFile
  return Array.isArray(parsed.skills) ? parsed.skills : []
}
