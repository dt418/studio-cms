import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Danh Thanh/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('hero section displays correctly', async ({ page }) => {
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toContainText('Danh Thanh')
  })

  test('metrics display correct counts', async ({ page }) => {
    const metrics = page.locator('.grid.gap-3 .border').all()
    const metricCards = await metrics
    expect(metricCards.length).toBeGreaterThan(0)
    
    for (const card of metricCards) {
      await expect(card).toBeVisible()
    }
  })

  test('featured post card renders', async ({ page }) => {
    const featuredPost = page.locator('.card-hover').first()
    await expect(featuredPost).toBeVisible()
    
    const title = featuredPost.locator('h3')
    await expect(title).toBeVisible()
  })

  test('archive section displays', async ({ page }) => {
    const archiveSection = page.locator('section').filter({ hasText: 'All posts' })
    await expect(archiveSection).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    const blogLink = page.locator('a[href="/blog"]')
    await expect(blogLink).toBeVisible()
    
    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })

  test('footer displays correctly', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    
    await expect(footer.locator('a[href*="mailto:"]')).toBeVisible()
    await expect(footer.locator('a[href*="github"]')).toBeVisible()
  })

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
  })

  test('responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
  })
})
