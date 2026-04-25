import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('header navigation works', async ({ page }) => {
    await page.goto('/')
    
    const homeLink = page.locator('header a[href="/"]')
    await expect(homeLink).toBeVisible()
    
    const blogLink = page.locator('header a[href="/blog"]')
    await expect(blogLink).toBeVisible()
    
    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })

  test('footer links work', async ({ page }) => {
    await page.goto('/')
    
    const emailLink = page.locator('footer a[href*="mailto:"]')
    await expect(emailLink).toBeVisible()
    
    const githubLink = page.locator('footer a[href*="github"]')
    await expect(githubLink).toBeVisible()
    
    const rssLink = page.locator('footer a[href="/rss.xml"]')
    await expect(rssLink).toBeVisible()
  })

  test('navigation is sticky on scroll', async ({ page }) => {
    await page.goto('/')
    
    const header = page.locator('header')
    await expect(header).toHaveCSS('position', 'sticky')
  })

  test('rss link is accessible', async ({ page }) => {
    await page.goto('/')
    
    const rssLink = page.locator('a[href="/rss.xml"]')
    const responsePromise = page.waitForResponse((response) => response.url().includes('rss.xml'))
    await rssLink.click()
    const response = await responsePromise
    expect(response.status()).toBe(200)
  })

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto('/blog')
    
    const homeLink = page.locator('a[href="/"]')
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })
})
