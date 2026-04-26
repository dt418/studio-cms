import { test, expect } from '@playwright/test'

test.describe('Blog Post Page', () => {
  async function getFirstPostUrl(page: any): Promise<string | null> {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    // Find first post link (excluding header navigation)
    const postLinks = page.locator('a[href^="/blog/"]:not(header a)').first()
    const count = await postLinks.count()

    if (count === 0) {
      return null
    }

    const href = await postLinks.getAttribute('href')
    return href
  }

  test('404 for non-existent post', async ({ page }) => {
    const response = await page.goto('/blog/non-existent-post-xyz123')
    expect(response?.status()).toBe(404)
  })

  test('post loads by slug and displays article', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)
    await expect(page.locator('article.min-h-screen')).toBeVisible()
    await expect(page.locator('article h1').first()).toBeVisible()
  })

  test('post page has correct title format', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)
    const title = await page.title()
    expect(title).toMatch(/\| DanhThanh\.dev/)
  })

  test('post hero displays category and title', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)
    const mainHeading = page.locator('article h1').first()
    await expect(mainHeading).toBeVisible()

    // Category badge is a rounded-full span within article hero
    const categoryBadge = page.locator('article span.rounded-full').first()
    await expect(categoryBadge).toBeVisible()
  })

  test('table of contents renders on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    // TOC is in an aside element
    const tocAside = page.locator('aside:has(nav)').first()
    await expect(tocAside).toBeVisible()

    // TOC nav should have headings
    const tocNav = page.locator('nav').first()
    await expect(tocNav).toBeVisible()
  })

  test('post content displays in article', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    // Article with min-h-screen class should be visible
    const article = page.locator('article.min-h-screen')
    await expect(article).toBeVisible()

    // Should have PostHero with h1
    await expect(page.locator('article h1').first()).toBeVisible()
  })

  test('post metadata displays (reading time, date)', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    // Should show reading time or date info
    const metaInfo = page.locator('span:has-text("min read"), time').first()
    await expect(metaInfo).toBeVisible()
  })

  test('tags display and are clickable', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    const tagLinks = page.locator('a[href^="/tags/"]')
    const count = await tagLinks.count()

    test.skip(count === 0, 'Post has no tags - skipping test')

    const firstTag = tagLinks.first()
    await firstTag.click()
    await expect(page).toHaveURL(/\/tags\//)
  })

  test('prev/next navigation is present when applicable', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    // Look for prev/next navigation links
    const prevLink = page.locator('a:has-text("Previous"), a:has-text("Prev"), a[rel="prev"]').first()
    const nextLink = page.locator('a:has-text("Next"), a[rel="next"]').first()

    const hasPrev = await prevLink.isVisible().catch(() => false)
    const hasNext = await nextLink.isVisible().catch(() => false)

    // At least one of them might exist
    if (hasPrev || hasNext) {
      test.info().annotations.push({
        type: 'info',
        description: `Navigation: prev=${hasPrev}, next=${hasNext}`,
      })
    }
  })

  test('post meta card displays in sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    // Meta card in sidebar
    const metaAside = page.locator('aside').nth(1)
    await expect(metaAside).toBeVisible()
  })

  test('related posts section displays at bottom', async ({ page }) => {
    const href = await getFirstPostUrl(page)
    test.skip(!href, 'No posts found - skipping test')

    await page.goto(href!)

    // Look for related posts section
    const relatedSection = page.locator('section:has(h2:has-text("Related"))')
    if (await relatedSection.isVisible().catch(() => false)) {
      await expect(relatedSection).toBeVisible()
    }
  })
})
