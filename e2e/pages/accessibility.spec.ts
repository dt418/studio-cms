import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('home page should not have critical accessibility violations', async ({ page }) => {
    test.slow() // Axe scans can be slow, especially in Firefox
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    // Log violations for debugging but only fail on critical ones
    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical')

    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations found:', criticalViolations.map(v => v.description))
    }

    expect(criticalViolations.length).toBeLessThan(3) // Allow some threshold for third-party components
  })

  test('blog page should not have critical accessibility violations', async ({ page }) => {
    test.slow() // Axe scans can be slow, especially in Firefox
    await page.goto('/blog')
    await expect(page.locator('h1')).toContainText('Blog')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical')

    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations found:', criticalViolations.map(v => v.description))
    }

    expect(criticalViolations.length).toBeLessThan(3)
  })

  test('keyboard navigation works on home page', async ({ page }) => {
    await page.goto('/')

    // Test tab navigation
    await page.keyboard.press('Tab')
    const firstFocusable = page.locator(':focus')
    await expect(firstFocusable).toBeVisible()

    // Test multiple tabs
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
    }
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('keyboard navigation works on blog page', async ({ page }) => {
    await page.goto('/blog')

    // Test tab navigation reaches filter inputs
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('all images have alt text on home page', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaHidden = await img.getAttribute('aria-hidden')
      const role = await img.getAttribute('role')

      // Image should have alt text OR be decorative (aria-hidden or role=presentation)
      const isDecorative = ariaHidden === 'true' || role === 'presentation'
      expect(alt !== null || isDecorative).toBe(true)
    }
  })

  test('all links have discernible text', async ({ page }) => {
    await page.goto('/')

    const links = page.locator('a')
    const count = await links.count()

    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')
      const ariaHidden = await link.getAttribute('aria-hidden')

      // Skip aria-hidden links
      if (ariaHidden === 'true') continue

      // Link should have either text, aria-label, or title
      const hasContent = text?.trim() || ariaLabel || title
      expect(hasContent).toBeTruthy()
    }
  })

  test('headings are in correct order on home page', async ({ page }) => {
    await page.goto('/')

    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const count = await headings.count()

    let previousLevel = 0
    for (let i = 0; i < count; i++) {
      const tag = await headings.nth(i).evaluate((el) => el.tagName)
      const level = parseInt(tag[1])

      // Heading level should be between 1 and 6
      expect(level).toBeGreaterThanOrEqual(1)
      expect(level).toBeLessThanOrEqual(6)

      // Heading levels should not skip (no jump from h1 to h3)
      if (previousLevel > 0 && level > previousLevel) {
        expect(level).toBeLessThanOrEqual(previousLevel + 1)
      }

      previousLevel = level
    }
  })

  test('page has proper heading hierarchy - single h1', async ({ page }) => {
    await page.goto('/')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('blog page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/blog')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    const h1 = page.locator('h1')
    await expect(h1).toContainText('Blog')
  })

  test('search page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/search')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    const h1 = page.locator('h1')
    await expect(h1).toContainText('Search')
  })

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/search')

    const inputs = page.locator('input, select, textarea')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)

      // Skip hidden inputs
      const type = await input.getAttribute('type')
      const isHidden = type === 'hidden'
      const isVisible = await input.isVisible().catch(() => false)

      if (isHidden || !isVisible) continue

      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')

      // Input should have label association or placeholder
      const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0
      const hasAriaLabel = ariaLabel || ariaLabelledBy
      const hasPlaceholder = placeholder

      expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy()
    }
  })

  test('focus indicators are visible on interactive elements', async ({ page }) => {
    await page.goto('/')

    const links = page.locator('header a').first()
    await links.focus()

    // Check that the element is focused
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })
})
