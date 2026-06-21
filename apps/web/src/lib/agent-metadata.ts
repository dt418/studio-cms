import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { z } from 'zod'

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
  const site = import.meta.env.SITE
  if (!site) {
    throw new Error('SITE_URL is not set; build cannot derive getSiteUrl()')
  }
  return new URL(site)
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
      rel: 'search',
      href: '/search',
      type: 'text/html',
      title: 'Blog search',
    },
    {
      rel: 'alternate',
      href: '/rss.xml',
      type: 'application/rss+xml',
      title: 'RSS feed',
    },
    {
      rel: 'sitemap',
      href: '/sitemap-index.xml',
      type: 'application/xml',
      title: 'Sitemap',
    },
    {
      rel: 'documentation',
      href: '/auth.md',
      type: 'text/markdown',
      title: 'Auth policy',
    },
  ]
}

interface AgentSkillsIndexFile {
  skills: AgentSkill[]
}

export function getAgentSkills(): AgentSkill[] {
  const path = join(here, '.generated', 'agent-skills-index.json')
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return []
  }
  const parsed = JSON.parse(raw) as AgentSkillsIndexFile
  return Array.isArray(parsed.skills) ? parsed.skills : []
}
