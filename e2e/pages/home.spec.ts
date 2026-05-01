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
    await expect(page.locator('h1')).toContainText('Danh')
    await expect(page.locator('h1')).toContainText('Thanh')
  })

  test('hero has developer-focused tagline', async ({ page }) => {
    const tagline = page.locator('p:has-text("For developers shipping modern web products")')
    await expect(tagline).toBeVisible()
  })

  test('stats badges display in hero section', async ({ page }) => {
    // StatsBadge in hero section has specific class - scope search to hero
    const heroSection = page.locator('section').first()

    // StatsBadge shows "{value} {label}" in rounded-full spans within hero
    await expect(heroSection.locator('span.rounded-full:has-text("posts")')).toBeVisible()
    await expect(heroSection.locator('span.rounded-full:has-text("topics")')).toBeVisible()
    await expect(heroSection.locator('span.rounded-full:has-text("tags")')).toBeVisible()
  })

  test('CTA buttons are visible', async ({ page }) => {
    const readBlogCTA = page.locator('a:has-text("Read the blog")')
    await expect(readBlogCTA).toBeVisible()
    await expect(readBlogCTA).toHaveAttribute('href', '/blog')

    const rssCTA = page.locator('a:has-text("RSS Feed")')
    await expect(rssCTA).toBeVisible()
    await expect(rssCTA).toHaveAttribute('href', '/rss.xml')
  })

  test('latest insights section displays', async ({ page }) => {
    const sectionLabel = page.locator('p:has-text("Latest insights")')
    await expect(sectionLabel).toBeVisible()
  })

  test('metric cards show posts/topics/tags', async ({ page }) => {
    const metricsSection = page.locator('section', { hasText: 'Latest insights' })

    await expect(metricsSection.getByText('Latest', { exact: true })).toBeVisible()
    await expect(metricsSection.getByText('Topics', { exact: true })).toBeVisible()
    await expect(metricsSection.getByText('Tags', { exact: true })).toBeVisible()

    await expect(metricsSection.getByText(/\d+ posts/)).toBeVisible()
    await expect(metricsSection.getByText(/\d+ areas/)).toBeVisible()
    await expect(metricsSection.getByText(/\d+ tags/)).toBeVisible()
  })

  test('featured work section displays', async ({ page }) => {
    // Featured section has "Featured" label and "Latest from the blog" heading
    const featuredLabel = page.locator('p:has-text("Featured")').first()
    await expect(featuredLabel).toBeVisible()

    const featuredHeading = page.locator('h2:has-text("Latest from the blog")')
    await expect(featuredHeading).toBeVisible()
  })

  test('archive section displays', async ({ page }) => {
    // Archive section has "Browse" label and "All posts and writing" heading
    const browseLabel = page.locator('p:has-text("Browse")')
    await expect(browseLabel).toBeVisible()

    const archiveHeading = page.locator('h2:has-text("All posts and writing")')
    await expect(archiveHeading).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    const blogLink = page.locator('header a[href="/blog"]')
    await expect(blogLink).toBeVisible()
    await expect(blogLink).toContainText('writing')

    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })

  test('footer displays correctly', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    await expect(footer.locator('a[href*="mailto:"]')).toBeVisible()
    await expect(footer.locator('a[href*="github"]')).toBeVisible()
    await expect(footer.locator('a[href="/rss.xml"]')).toBeVisible()
    await expect(footer.locator('a[href*="linkedin"]')).toBeVisible()
  })

  test('footer shows site branding', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toContainText(/DanhThanh\.dev/)
  })

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })

  test('responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()

    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })
})
