import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test('keyboard navigation works on home page', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    const firstFocusable = page.locator(':focus')
    await expect(firstFocusable).toBeVisible()
    
    // Test multiple tabs
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const thirdFocusable = page.locator(':focus')
    await expect(thirdFocusable).toBeVisible()
  })

  test('all images have alt text', async ({ page }) => {
    await page.goto('/')
    
    const images = page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).toBeTruthy()
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
      
      // Link should have either text, aria-label, or title
      const hasContent = text?.trim() || ariaLabel || title
      expect(hasContent).toBeTruthy()
    }
  })

  test('headings are in correct order', async ({ page }) => {
    await page.goto('/')
    
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const count = await headings.count()
    
    for (let i = 0; i < count; i++) {
      const tag = await headings.nth(i).evaluate((el) => el.tagName)
      const level = parseInt(tag[1])
      
      // Heading level should be between 1 and 6
      expect(level).toBeGreaterThanOrEqual(1)
      expect(level).toBeLessThanOrEqual(6)
    }
  })

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })
})
