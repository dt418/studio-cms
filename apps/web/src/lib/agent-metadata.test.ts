import { describe, expect, it } from 'vitest'
import {
  AgentSkillSchema,
  ContentSignalSchema,
  LocaleSchema,
  getAgentSkills,
  getApiCatalogLinks,
  getContentSignals,
  getLocales,
  getSiteUrl,
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
  it('includes search, RSS, sitemap, and /auth.md', () => {
    const rels = getApiCatalogLinks().map((l) => l.rel)
    expect(rels).toContain('search')
    expect(rels).toContain('alternate')
    expect(rels).toContain('sitemap')
    expect(rels).toContain('documentation')
    const authLink = getApiCatalogLinks().find((l) => l.rel === 'documentation')
    expect(authLink?.href).toBe('/auth.md')
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
