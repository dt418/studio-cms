import { type Page, expect } from '@playwright/test'

export const LOCALES = ['vi', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_CONFIG: Record<Locale, { lang: string; hreflang: string; label: string }> = {
  vi: { lang: 'vi', hreflang: 'vi', label: 'VI' },
  en: { lang: 'en', hreflang: 'en', label: 'EN' },
}

export const LOCALE_ROUTES: Record<Locale, { home: string; blog: string, tags: string, categories: string, search: string }> = {
  vi: { home: '/vi/', blog: '/vi/blog',tags :'/vi/tags',  categories: '/vi/categories', search: '/vi/search' },
  en: { home: '/en/', blog: '/en/blog',tags :'/en/tags', categories: '/en/categories', search: '/en/search' },
}

export async function expectLangAttribute(page: Page, locale: Locale) {
  const lang = await page.locator('html').getAttribute('lang')
  expect(lang).toBe(locale)
}

export async function expectCanonical(page: Page, expected: string) {
  const canonical = page.locator('link[rel="canonical"]')
  await expect(canonical).toHaveAttribute('href', expected)
}

export async function expectHreflangTags(page: Page) {
  const vi = page.locator('link[rel="alternate"][hreflang="vi"]')
  const en = page.locator('link[rel="alternate"][hreflang="en"]')
  const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]')
  await expect(vi).toHaveAttribute('href', /vi/)
  await expect(en).toHaveAttribute('href', /en/)
  await expect(xDefault).toHaveAttribute('href', /vi/)
}

export async function expectOgLocale(page: Page, locale: Locale) {
  const expected = locale === 'en' ? 'en_US' : 'vi_VN'
  const ogLocale = page.locator('meta[property="og:locale"]')
  await expect(ogLocale).toHaveAttribute('content', expected)
}

export async function expectLanguageSwitcher(page: Page, currentLocale: Locale) {
  const activeLink = page.locator(`header a[hreflang="${currentLocale}"]`)
  await expect(activeLink).toBeVisible()
  await expect(activeLink).toHaveClass(/bg-foreground/)
}

export async function switchLanguage(page: Page, to: Locale) {
  const switcher = page.locator(`a[hreflang="${to}"]`).first()
  await switcher.click()
  await page.waitForURL(`**/${to}/**`)
}

export async function expect200(url: string) {
  const response = await fetch(url)
  expect(response.status).toBe(200)
}
