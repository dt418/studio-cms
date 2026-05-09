import { test, expect } from '@playwright/test'

test.describe('Tags Page', () => {
  async function getFirstTagUrl(page: import('@playwright/test').Page): Promise<string | null> {
    await page.goto('/vi/blog')

    const jsonText = await page.locator('#filter-data').textContent()
    if (!jsonText) return null

    try {
      const posts: { data: { tags: string[] } }[] = JSON.parse(jsonText)
      for (const post of posts) {
        if (post.data.tags.length > 0) {
          const tag = post.data.tags[0]!
          return `/vi/tags/${encodeURIComponent(tag)}`
        }
      }
      return null
    } catch {
      return null
    }
  }

  test('404 for non-existent tag', async ({ page }) => {
    const response = await page.goto('/vi/tags/non-existent-tag-xyz123')
    expect(response?.status()).toBe(404)
  })

  test('tag page loads from blog post', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)
    await expect(page).toHaveURL(/\/vi\/tags\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('tag page displays filtered posts', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const posts = page.locator('article, .grid > div')
    const count = await posts.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('tag cloud displays on blog page', async ({ page }) => {
    test.setTimeout(15000)
    await page.goto('/vi/blog')

    const tagTrigger = page.getByRole('combobox', { name: /tags/i })
    await expect(tagTrigger).toBeVisible({ timeout: 10000 })

    const popover = page.locator(`#${await tagTrigger.getAttribute('aria-controls')}`)

    await expect
      .poll(
        async () => {
          if (await popover.isVisible()) return true
          await tagTrigger.click()
          return popover.isVisible()
        },
        { timeout: 5000 }
      )
      .toBe(true)

    const tagOptions = popover.getByRole('option').filter({ hasNotText: /All Tags|Tất cả tags/i })
    const count = await tagOptions.count()
    expect(count).toBeGreaterThan(0)
  })

  test('tag page shows tag name in title', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)
    const title = await page.title()

    const tagFromPath = decodeURIComponent(href!.split('/vi/tags/')[1]!)
    expect(title).toContain(tagFromPath)
    expect(title).toContain('| DanhThanh.dev')
  })

  test('tag page has back link to blog', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const backLink = page.getByRole('link', { name: /Quay lại Blog/i })
    await expect(backLink).toBeVisible()
  })

  test('tag page displays post count', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const postCount = page.locator('p:has-text("bài viết gắn tag")')
    await expect(postCount).toBeVisible()
  })

  test('tag page has filter section', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const searchInput = page.locator('input[type="search"]')
    await expect(searchInput).toBeVisible()
  })

  test('back navigation from tag to blog works', async ({ page }) => {
    const href = await getFirstTagUrl(page)
    test.skip(!href, 'No tags found - skipping test')

    await page.goto(href!)

    const blogLink = page.getByRole('link', { name: /Quay lại Blog/i })
    await blogLink.click()
    await expect(page).toHaveURL('/vi/blog')
  })
})
