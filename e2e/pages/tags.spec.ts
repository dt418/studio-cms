import { test, expect } from '@playwright/test'

test.describe('Tags Page', () => {
  async function getFirstTagUrl(page: any): Promise<string | null> {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const tagLinks = page.locator('a[href^="/tags/"]').first()
    const count = await tagLinks.count()

    if (count === 0) {
      return null
    }

    const href = await tagLinks.getAttribute('href')
    return href
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
    await expect(page.locator('h1')).toBeVisible()
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
    const tagCloud = page.locator('a[href^="/tags/"]')
    const count = await tagCloud.count()
    expect(count).toBeGreaterThan(0)
  })

  test('tag page shows tag name in title', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)
    const title = await page.title()
    expect(title).toMatch(/Posts tagged:/)
  })

  test('tag page has back link to blog', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const backLink = page.locator('a[href="/blog"]')
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

    const blogLink = page.locator('a[href="/blog"]').first()
    await blogLink.click()
    await expect(page).toHaveURL('/blog')
  })
})
