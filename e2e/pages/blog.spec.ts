import { test, expect } from '@playwright/test'

test.describe('Blog Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog/)
    await expect(page.locator('h1')).toContainText('Blog')
  })

  test('displays archive header', async ({ page }) => {
    const archiveBadge = page.locator('.inline-flex.items-center').filter({ hasText: 'Archive' })
    await expect(archiveBadge).toBeVisible()
  })

  test('displays metrics', async ({ page }) => {
    const metrics = page.locator('.grid.gap-3 .border')
    await expect(metrics.first()).toBeVisible()
  })

  test('blog filter component renders', async ({ page }) => {
    const filterSection = page.locator('section').nth(1)
    await expect(filterSection).toBeVisible()
  })

  test('navigation from home page works', async ({ page }) => {
    await page.goto('/')
    const blogLink = page.locator('a[href="/blog"]')
    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })

  test('back to home navigation', async ({ page }) => {
    const homeLink = page.locator('a[href="/"]')
    await expect(homeLink).toBeVisible()
    
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/blog')
    
    const header = page.locator('h1')
    await expect(header).toBeVisible()
  })
})
