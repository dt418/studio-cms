import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DanhThanh\.dev/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('hero section displays correctly', async ({ page }) => {
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toContainText('Danh')
    await expect(page.locator('h1')).toContainText('Thanh')
  })

  test('hero has developer-focused tagline', async ({ page }) => {
    const tagline = page.locator('p:has-text("Cho developers xây dựng sản phẩm web hiện đại")').first()
    await expect(tagline).toBeVisible()
  })

  test('stats badges display in hero section', async ({ page }) => {
    const heroSection = page.locator('section').first()

    await expect(heroSection.locator('span.rounded-full:has-text("bài viết")')).toBeVisible()
    await expect(heroSection.locator('span.rounded-full:has-text("chủ đề")')).toBeVisible()
    await expect(heroSection.locator('span.rounded-full:has-text("tags")')).toBeVisible()
  })

  test('CTA buttons are visible', async ({ page }) => {
    const readBlogCTA = page.locator('a:has-text("Đọc blog")')
    await expect(readBlogCTA).toBeVisible()
    await expect(readBlogCTA).toHaveAttribute('href', '/vi/blog')

    const rssCTA = page.locator('a:has-text("RSS Feed")')
    await expect(rssCTA).toBeVisible()
    await expect(rssCTA).toHaveAttribute('href', '/rss.xml')
  })

  test('latest insights section displays', async ({ page }) => {
    await expect(page.getByText('Insights').first()).toBeVisible()
  })

  test('metric cards show posts/topics/tags', async ({ page }) => {
    await expect(page.getByText('bài viết', { exact: true })).toBeVisible()
    await expect(page.getByText('chủ đề', { exact: true })).toBeVisible()
    await expect(page.getByText('tags', { exact: true })).toBeVisible()
  })

  test('featured work section displays', async ({ page }) => {
    // Featured section has "Featured" label and "Latest from the blog" heading (i18n-aware)
    const featuredLabel = page.locator('p:has-text("Nổi bật")').first()
    await expect(featuredLabel).toBeVisible()

    const featuredHeading = page.locator('h2:has-text("Bài viết mới nhất")')
    await expect(featuredHeading).toBeVisible()
  })

  test('archive section displays', async ({ page }) => {
    const browseLabel = page.locator('p:has-text("Duyệt")')
    await expect(browseLabel).toBeVisible()

    const archiveHeading = page.locator('h2:has-text("Tất cả bài viết")')
    await expect(archiveHeading).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    const blogLink = page.locator('header a[href="/vi/blog"]')
    await expect(blogLink).toBeVisible()
    await expect(blogLink).toContainText('viết')

    await blogLink.click()
    await expect(page).toHaveURL('/vi/blog')
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
    await page.goto('/vi/')
    await page.setViewportSize({ width: 375, height: 667 })

    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })

  test('responsive design - tablet', async ({ page }) => {
    await page.goto('/vi/')
    await page.setViewportSize({ width: 768, height: 1024 })

    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })
})
