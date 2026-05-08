import { test, expect } from '@playwright/test'
import {
  LOCALES,
  LOCALE_CONFIG,
  LOCALE_ROUTES,
  expectLangAttribute,
  expectCanonical,
  expectHreflangTags,
  expectOgLocale,
  expectLanguageSwitcher,
  switchLanguage,
} from '../utils/i18n'

test.describe('i18n: Locale Home Pages', () => {
  for (const locale of LOCALES) {
    const { home, blog } = LOCALE_ROUTES[locale]
    const { label } = LOCALE_CONFIG[locale]

    test(`${locale} home returns 200`, async ({ page }) => {
      const response = await page.goto(home)
      expect(response?.status()).toBe(200)
    })

    test(`${locale} home has correct html lang`, async ({ page }) => {
      await page.goto(home)
      await expectLangAttribute(page, locale)
    })

    test(`${locale} home has correct og:locale`, async ({ page }) => {
      await page.goto(home)
      await expectOgLocale(page, locale)
    })

    test(`${locale} home has correct canonical`, async ({ page }) => {
      await page.goto(home)
      await expectCanonical(page, `http://localhost:4321${home}`)
    })

    test(`${locale} nav links to ${locale} blog`, async ({ page }) => {
      await page.goto(home)
      const blogLink = page.locator(`header a[href="${blog}"]`)
      await expect(blogLink).toBeVisible()
    })

    test(`${locale} language switcher highlights ${label}`, async ({ page }) => {
      await page.goto(home)
      await expectLanguageSwitcher(page, locale)
    })
  }
})

test.describe('i18n: Blog Listing Pages', () => {
  for (const locale of LOCALES) {
    const { blog } = LOCALE_ROUTES[locale]

    test(`${locale} blog listing returns 200`, async ({ page }) => {
      const response = await page.goto(blog)
      expect(response?.status()).toBe(200)
    })

    test(`${locale} blog has correct html lang`, async ({ page }) => {
      await page.goto(blog)
      await expectLangAttribute(page, locale)
    })

    test(`${locale} blog has hreflang tags`, async ({ page }) => {
      await page.goto(blog)
      await expectHreflangTags(page)
    })

    test(`${locale} blog has correct og:locale`, async ({ page }) => {
      await page.goto(blog)
      await expectOgLocale(page, locale)
    })

    test(`${locale} blog renders translated content`, async ({ page }) => {
      await page.goto(blog)
      if (locale === 'vi') {
        await expect(page.locator('body')).toContainText('Bài đã xuất bản')
      } else {
        await expect(page.locator('body')).toContainText('Published notes')
      }
    })
  }
})

test.describe('i18n: Blog Post Pages', () => {
  for (const locale of LOCALES) {
    const { blog } = LOCALE_ROUTES[locale]

    test(`${locale} blog post has correct html lang`, async ({ page }) => {
      await page.goto(blog)
      const firstPost = page.locator('a[href*="/blog/"]').first()
      const href = await firstPost.getAttribute('href')
      if (!href || !href.includes('/blog/')) return

      await firstPost.click()
      await expectLangAttribute(page, locale)
    })

    test(`${locale} blog post has canonical url with locale prefix`, async ({ page }) => {
      await page.goto(blog)
      const firstPost = page.locator('a[href*="/blog/"]').first()
      const href = await firstPost.getAttribute('href')
      if (!href || !href.includes('/blog/')) return

      await firstPost.click()
      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute('href', `http://localhost:4321${href}`)
    })

    test(`${locale} blog post has hreflang tags`, async ({ page }) => {
      await page.goto(blog)
      const firstPost = page.locator('a[href*="/blog/"]').first()
      const href = await firstPost.getAttribute('href')
      if (!href || !href.includes('/blog/')) return

      await firstPost.click()
      await expectHreflangTags(page)
    })
  }
})

test.describe('i18n: Language Switcher', () => {
  test('switcher is visible on home page', async ({ page }) => {
    await page.goto('/')
    const switcher = page.locator('a[hreflang="vi"]').first()
    await expect(switcher).toBeVisible()
  })

  test('VI button navigates to vi home', async ({ page }) => {
    await page.goto('/en/')
    await switchLanguage(page, 'en', 'vi')
    await expect(page).toHaveURL(/\/vi\//)
    await expectLangAttribute(page, 'vi')
  })

  test('EN button navigates to en home', async ({ page }) => {
    await page.goto('/vi/')
    await switchLanguage(page, 'vi', 'en')
    await expect(page).toHaveURL(/\/en\//)
    await expectLangAttribute(page, 'en')
  })

  test('switching language on blog listing preserves page type', async ({ page }) => {
    await page.goto('/vi/blog')
    await switchLanguage(page, 'vi', 'en')
    await expect(page).toHaveURL(/\/en\/blog/)
    await expectLangAttribute(page, 'en')
  })

  test('footer switcher works', async ({ page }) => {
    await page.goto('/vi/')
    const footerSwitcher = page.locator('footer a[hreflang="en"]').first()
    await footerSwitcher.click()
    await expect(page).toHaveURL(/\/en\//)
  })
})

test.describe('i18n: SEO Meta Tags', () => {
  test('vi pages have hreflang pointing to en equivalent', async ({ page }) => {
    await page.goto('/vi/')
    const enLink = page.locator('link[rel="alternate"][hreflang="en"]')
    await expect(enLink).toHaveAttribute('href', 'http://localhost:4321/en/blog')
  })

  test('en pages have hreflang pointing to vi equivalent', async ({ page }) => {
    await page.goto('/en/')
    const viLink = page.locator('link[rel="alternate"][hreflang="vi"]')
    await expect(viLink).toHaveAttribute('href', 'http://localhost:4321/vi/blog')
  })

  test('x-default points to vi blog', async ({ page }) => {
    await page.goto('/vi/')
    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]')
    await expect(xDefault).toHaveAttribute('href', 'http://localhost:4321/vi/blog')
  })
})

test.describe('i18n: Root Redirect Behavior', () => {
  test('root / loads Vietnamese home', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expectLangAttribute(page, 'vi')
  })
})
