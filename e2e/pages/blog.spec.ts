import { test, expect } from '@playwright/test'

test.describe('Blog Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vi/blog')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Archive/)
    await expect(page.locator('h1')).toContainText('Archive')
  })

  test('displays archive header with badge', async ({ page }) => {
    const archiveBadge = page.locator('span:has-text("Archive")')
    await expect(archiveBadge).toBeVisible()
    await expect(archiveBadge).toHaveClass(/uppercase/)
  })

  test('displays blog description', async ({ page }) => {
    const description = page.locator('p:has-text("Bài viết về lập trình")')
    await expect(description).toBeVisible()
  })

  test('displays stats grid with 4 metrics', async ({ page }) => {
    const statsGrid = page.getByTestId('blog-stats-grid')
    await expect(statsGrid).toBeVisible()

    const statCards = statsGrid.locator('> div')
    const count = await statCards.count()
    expect(count).toBe(4)

    // Check for expected labels
    await expect(statsGrid.getByText('Bài đã xuất bản')).toBeVisible()
    await expect(statsGrid.getByText('Chủ đề')).toBeVisible()
    await expect(statsGrid.getByText('Tags')).toBeVisible()
    await expect(statsGrid.getByText('Archive snapshot')).toBeVisible()
  })

  test('stats show numeric values', async ({ page }) => {
    const statValues = page.locator('.tabular-nums')
    const count = await statValues.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('blog filter component renders', async ({ page }) => {
    const filterSection = page.locator('section:has(input[type="search"])')
    await expect(filterSection).toBeVisible()
  })

  test('search input is visible in blog filter', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toBeVisible()
  })

  test('filter dropdowns are present', async ({ page }) => {
    // FilterSelect renders button-based combobox triggers, not native <select>
    const triggers = page.locator('[role="combobox"]')
    const count = await triggers.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('post list renders', async ({ page }) => {
    const postList = page.locator('article, [class*="post"], #search-results')
    await expect(postList.first()).toBeVisible()
  })

  test('navigation from home page works', async ({ page }) => {
    await page.goto('/')
    const blogLink = page.locator('header a[href="/vi/blog"]')
    await blogLink.click()
    await expect(page).toHaveURL('/vi/blog')
  })

  test('back to home navigation via header', async ({ page }) => {
    const homeLink = page.locator('header a[href="/vi"]').first()
    await expect(homeLink).toBeVisible()

    await homeLink.click()
    await expect(page).toHaveURL(/\/vi\/?$/)
  })

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    const header = page.locator('h1')
    await expect(header).toBeVisible()
    await expect(header).toContainText('Archive')

    // Stats should still be visible on mobile
    const statsGrid = page.getByTestId('blog-stats-grid')
    await expect(statsGrid).toBeVisible()
  })

  test('responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()

    const header = page.locator('h1')
    await expect(header).toBeVisible()
  })
})
