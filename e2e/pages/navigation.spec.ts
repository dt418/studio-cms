import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('header navigation works', async ({ page }) => {
    await page.goto('/')

    // Header should have DT branding
    const branding = page.locator('header a[href="/"]')
    await expect(branding).toBeVisible()
    await expect(branding).toContainText('DT')

    // Should have blog link with "writing" text
    const blogLink = page.locator('header a[href="/blog"]')
    await expect(blogLink).toBeVisible()
    await expect(blogLink).toContainText('writing')

    // Navigate to blog
    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })

  test('header has RSS link', async ({ page }) => {
    await page.goto('/')

    const rssLink = page.locator('header a[href="/rss.xml"]')
    await expect(rssLink).toBeVisible()
    await expect(rssLink).toContainText('rss')
  })

  test('footer links work', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const emailLink = footer.locator('a[href*="mailto:"]')
    await expect(emailLink).toBeVisible()

    const githubLink = footer.locator('a[href*="github"]')
    await expect(githubLink).toBeVisible()

    const rssLink = footer.locator('a[href="/rss.xml"]')
    await expect(rssLink).toBeVisible()

    const linkedinLink = footer.locator('a[href*="linkedin"]')
    await expect(linkedinLink).toBeVisible()
  })

  test('footer shows links section', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toContainText('links')
  })

  test('navigation is sticky on scroll', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('header')
    await expect(header).toHaveCSS('position', 'sticky')
  })

  test('header has backdrop blur effect', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('header')
    await expect(header).toHaveClass(/backdrop-blur/)
  })

  test('rss link is accessible and returns valid XML', async ({ page }) => {
    await page.goto('/')

    const rssLink = page.locator('a[href="/rss.xml"]').first()

    const href = await rssLink.getAttribute('href')
    expect(href).toBeTruthy()

    const response = await page.request.get(href!)
    expect(response.ok()).toBe(true)
    const content = await response.text()
    expect(content).toContain('<rss')
  })

  test('navigation from blog to home works', async ({ page }) => {
    await page.goto('/blog')

    const homeLink = page.locator('header a[href="/"]')
    await expect(homeLink).toBeVisible()

    await homeLink.click()
    await expect(page).toHaveURL('/')
  })

  test('all footer links have proper text', async ({ page }) => {
    await page.goto('/')

    const footerLinks = page.locator('footer a')
    const count = await footerLinks.count()

    for (let i = 0; i < count; i++) {
      const link = footerLinks.nth(i)
      const text = await link.textContent()
      expect(text?.trim()).toBeTruthy()
    }
  })
})
