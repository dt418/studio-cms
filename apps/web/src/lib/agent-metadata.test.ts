import { describe, expect, it } from 'vitest'
import {
  AgentSkillSchema,
  ContentSignalSchema,
  LocaleSchema,
  buildLinkHeaderValue,
  getAgentSkills,
  getApiCatalogLinks,
  getContentSignals,
  getDnsAidRecords,
  getHomeMarkdownPath,
  getLocales,
  getSiteUrl,
  getWebMCPTools,
} from './agent-metadata'

describe('agent-metadata schemas', () => {
  it('LocaleSchema accepts vi and en only', () => {
    expect(LocaleSchema.parse('vi')).toBe('vi')
    expect(LocaleSchema.parse('en')).toBe('en')
    expect(() => LocaleSchema.parse('fr')).toThrow()
  })

  it('ContentSignalSchema requires exactly the three keys', () => {
    const ok = { 'ai-train': 'no', search: 'yes', 'ai-input': 'yes' } as const
    expect(ContentSignalSchema.parse(ok)).toEqual(ok)
    expect(() => ContentSignalSchema.parse({ 'ai-train': 'no', search: 'yes' })).toThrow()
  })

  it('AgentSkillSchema requires a 64-char hex sha256', () => {
    const skill = {
      id: 'read-blog',
      title: 'Read danhthanh.dev blog',
      description: 'Browse posts.',
      url: 'https://danhthanh.dev/.well-known/agent-skills/read-blog/SKILL.md',
      sha256: 'a'.repeat(64),
      version: '0.1.0',
    }
    expect(AgentSkillSchema.parse(skill).id).toBe('read-blog')
    expect(() => AgentSkillSchema.parse({ ...skill, sha256: 'short' })).toThrow()
  })
})

describe('getSiteUrl', () => {
  it('returns a URL whose origin matches import.meta.env.SITE', () => {
    const url = getSiteUrl()
    expect(url).toBeInstanceOf(URL)
    expect(url.origin).toBe(import.meta.env.SITE)
  })
})

describe('getLocales', () => {
  it('returns the supported locales in order', () => {
    expect(getLocales()).toEqual(['vi', 'en'])
  })
})

describe('getContentSignals', () => {
  it('returns ai-train=no, search=yes, ai-input=yes', () => {
    expect(getContentSignals()).toEqual({
      'ai-train': 'no',
      search: 'yes',
      'ai-input': 'yes',
    })
  })
})

describe('getApiCatalogLinks', () => {
  it('includes RSS, sitemap, and /auth.md without stale search routes', () => {
    const rels = getApiCatalogLinks().map((l) => l.rel)
    expect(rels).toContain('alternate')
    expect(rels).toContain('sitemap')
    expect(rels).toContain('service-doc')
    expect(getApiCatalogLinks().find((l) => l.rel === 'sitemap')?.href).toBe('/sitemap.xml')
    expect(getApiCatalogLinks().some((l) => l.href === '/search')).toBe(false)
    const authLink = getApiCatalogLinks().find((l) => l.rel === 'service-doc')
    expect(authLink?.href).toBe('/auth.md')
  })

  it('advertises agent discovery endpoints via registered rels', () => {
    const rels = getApiCatalogLinks().map((l) => l.rel)
    expect(rels).toContain('api-catalog')
    expect(rels).toContain('auth-server')
    expect(rels).toContain('oauth-protected-resource')
    expect(rels).toContain('openid-configuration')
    expect(rels).toContain('agent-skills')
  })
})

describe('buildLinkHeaderValue', () => {
  it('emits RFC 8288 Link header with rel and type per link', () => {
    const value = buildLinkHeaderValue()
    expect(value).toContain('</rss.xml>; rel="alternate"')
    expect(value).toContain('</sitemap.xml>; rel="sitemap"')
    expect(value).toContain('</auth.md>; rel="service-doc"')
    expect(value).toContain('</.well-known/agent-skills/index.json>; rel="agent-skills"')
    const parts = value.split(', ')
    expect(parts.length).toBeGreaterThanOrEqual(7)
  })
})

describe('getDnsAidRecords', () => {
  it('returns SVCB records for _a2a._agents and _index._agents', () => {
    const records = getDnsAidRecords()
    const names = records.map((record) => record.name)
    expect(names).toContain('_a2a._agents')
    expect(names).toContain('_index._agents')
    for (const record of records) {
      expect(record.type).toBe('SVCB')
      expect(record.params?.alpn).toBe('h2')
    }
  })
})

describe('getWebMCPTools', () => {
  it('returns blog tools with JSON Schema input', () => {
    const tools = getWebMCPTools()
    const names = tools.map((tool) => tool.name)
    expect(names).toContain('search_posts')
    expect(names).toContain('get_post')
    expect(names).toContain('list_categories')
    expect(names).toContain('list_tags')
    for (const tool of tools) {
      expect(tool.inputSchema.type).toBe('object')
      expect(tool.inputSchema.properties).toBeDefined()
    }
  })
})

describe('getHomeMarkdownPath', () => {
  it('returns locale-prefixed markdown path', () => {
    expect(getHomeMarkdownPath('vi')).toBe('/vi/index.md')
    expect(getHomeMarkdownPath('en')).toBe('/en/index.md')
  })
})

describe('getAgentSkills', () => {
  it('returns an array of AgentSkillSchema-valid entries', () => {
    const skills = getAgentSkills()
    expect(Array.isArray(skills)).toBe(true)
    for (const skill of skills) {
      expect(() => AgentSkillSchema.parse(skill)).not.toThrow()
    }
  })
})
