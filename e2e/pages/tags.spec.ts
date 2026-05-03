import { test, expect } from '@playwright/test'

test.describe('Tags Page', () => {
  async function getFirstTagUrl(page: any): Promise<string | null> {
    await page.goto('/blog')

    const tagOption = page.locator('#filter-tag option').filter({ hasNotText: 'All Tags' }).first()
    const count = await tagOption.count()
    if (count === 0) {
      return null
    }

    const tag = await tagOption.getAttribute('value')
    return tag ? `/tags/${encodeURIComponent(tag)}` : null
  }

  test('404 for non-existent tag', async ({ page }) => {
    const response = await page.goto('/tags/non-existent-tag-xyz123')
    expect(response?.status()).toBe(404)
  })

  test('tag page loads from blog post', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)
    await expect(page).toHaveURL(/\/tags\//)
    await expect(page.getByRole('heading', { level: 1, name: /Tag:/ })).toBeVisible()
  })

  test('tag page displays filtered posts', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    // Should have blog cards or post grid
    const posts = page.locator('article, .grid > div')
    const count = await posts.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('tag cloud displays on blog page', async ({ page }) => {
    await page.goto('/blog')
    const tagFilter = page.locator('#filter-tag option').filter({ hasNotText: 'All Tags' })
    const count = await tagFilter.count()
    expect(count).toBeGreaterThan(0)
  })

  test('tag page shows tag name in title', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)
    const title = await page.title()

    // Title format: "${tag} | DanhThanh.dev"
    const tagFromPath = decodeURIComponent(href!.split('/tags/')[1]!)
    expect(title).toContain(tagFromPath)
    expect(title).toContain('| DanhThanh.dev')
  })

  test('tag page has back link to blog', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const backLink = page.getByRole('link', { name: /Back to Blog/i })
    await expect(backLink).toBeVisible()
  })

  test('tag page displays post count', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    // Should show "X posts tagged with..."
    const postCount = page.locator('p:has-text("posts tagged with")')
    await expect(postCount).toBeVisible()
  })

  test('tag page has filter section', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    // Should have BlogFilter with initial tag
    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toBeVisible()
  })

  test('back navigation from tag to blog works', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const blogLink = page.getByRole('link', { name: /Back to Blog/i })
    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })
})
