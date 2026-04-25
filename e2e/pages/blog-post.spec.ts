import { test, expect } from '@playwright/test'

test.describe('Blog Post Page', () => {
  test('404 for non-existent post', async ({ page }) => {
    const response = await page.goto('/blog/non-existent-post')
    expect(response?.status()).toBe(404)
  })

  test('post loads by slug', async ({ page }) => {
    // First navigate to blog to get a real post slug
    await page.goto('/blog')
    const firstPostLink = page.locator('a[href^="/blog/"]').first()
    const href = await firstPostLink.getAttribute('href')
    
    if (!href) {
      test.skip()
      return
    }
    
    await page.goto(href)
    await expect(page.locator('article')).toBeVisible()
  })

  test('table of contents renders on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/blog')
    const firstPostLink = page.locator('a[href^="/blog/"]').first()
    const href = await firstPostLink.getAttribute('href')
    
    if (!href) {
      test.skip()
      return
    }
    
    await page.goto(href)
    const toc = page.locator('nav[aria-label="Table of contents"]')
    await expect(toc).toBeVisible()
  })

  test('post content displays', async ({ page }) => {
    await page.goto('/blog')
    const firstPostLink = page.locator('a[href^="/blog/"]').first()
    const href = await firstPostLink.getAttribute('href')
    
    if (!href) {
      test.skip()
      return
    }
    
    await page.goto(href)
    const content = page.locator('.prose')
    await expect(content).toBeVisible()
  })

  test('tags display and are clickable', async ({ page }) => {
    await page.goto('/blog')
    const firstPostLink = page.locator('a[href^="/blog/"]').first()
    const href = await firstPostLink.getAttribute('href')
    
    if (!href) {
      test.skip()
      return
    }
    
    await page.goto(href)
    const tags = page.locator('a[href^="/tags/"]').first()
    if (await tags.isVisible()) {
      await tags.click()
      await expect(page).toHaveURL(/\/tags\//)
    }
  })

  test('prev/next navigation works', async ({ page }) => {
    await page.goto('/blog')
    const firstPostLink = page.locator('a[href^="/blog/"]').first()
    const href = await firstPostLink.getAttribute('href')
    
    if (!href) {
      test.skip()
      return
    }
    
    await page.goto(href)
    const nextPost = page.locator('a:has-text("Next Post")').first()
    if (await nextPost.isVisible()) {
      await nextPost.click()
      await expect(page).toHaveURL(/\/blog\//)
    }
  })
})
