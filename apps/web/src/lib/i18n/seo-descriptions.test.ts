import { describe, expect, it } from 'vitest'
import { getTranslations, type Language } from './index'

const locales: Language[] = ['vi', 'en']
const tags = [
  'astro',
  'web-development',
  '9router',
  'vps',
  'ai',
  'proxy',
  'cloudflare-tunnel',
  'pm2',
  'api-gateway',
  'performance',
  'tailwindcss',
  'css',
  'frontend',
  'saas',
  'studiocms',
  'typescript',
  'programming',
  'generics',
] as const
const categories = ['tutorials', 'guides'] as const

function expectSocialDescription(value: string): void {
  expect(value.length).toBeGreaterThanOrEqual(90)
  expect(value.length).toBeLessThanOrEqual(155)
}

describe.each(locales)('%s SEO descriptions', (locale) => {
  const i18n = getTranslations(locale)

  it('keeps landing-page descriptions within the social sharing range', () => {
    for (const description of [
      i18n.home.description,
      i18n.blog.description,
      i18n.about.metaDescription,
    ]) {
      expectSocialDescription(description)
    }
  })

  it('keeps every taxonomy description within the social sharing range', () => {
    for (const tag of tags) expectSocialDescription(i18n.schema.allPostsTaggedWith(tag))
    for (const category of categories) {
      expectSocialDescription(i18n.schema.allPostsInCategory(category))
    }
  })

  it('matches taxonomy descriptions to their page content', () => {
    expect(i18n.schema.allPostsTaggedWith('astro')).toMatch(/Astro 5.*StudioCMS/)
    expect(i18n.schema.allPostsTaggedWith('9router')).toMatch(/9router API [Pp]roxy.*VPS/)
    expect(i18n.schema.allPostsTaggedWith('css')).toMatch(/TailwindCSS 4/)
    expect(i18n.schema.allPostsTaggedWith('typescript')).toMatch(/TypeScript Generics/)
    expect(i18n.schema.allPostsInCategory('guides')).toMatch(/TailwindCSS 4.*SaaS.*Astro/)
  })
})
