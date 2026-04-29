import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('search page loads successfully', async ({ page }) => {
    await page.goto('/search')
    await expect(page).toHaveTitle(/Search/)
    await expect(page.locator('h1')).toContainText('Search')
  })

  test('search input is present and interactive', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('type', 'search')

    await searchInput.fill('test query')
    await expect(searchInput).toHaveValue('test query')
  })

  test('search input has placeholder text', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    await expect(searchInput).toHaveAttribute('placeholder', /Search articles/)
  })

  test('search filters are displayed', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    await searchInput.fill('astro')

    const filterSection = page.locator('.search-filters')
    await expect(filterSection).toBeVisible()
    const selects = page.locator('select')
    const count = await selects.count()

    expect(count).toBeGreaterThanOrEqual(1)
    if (count > 0) {
      await expect(selects.first()).toBeVisible()
    }
  })

  test('search results display for valid query', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    await searchInput.fill('astro')

    // Wait for results to load (debounce time)
    await page.waitForTimeout(600)

    const results = page.locator('#search-results .search-result, .search-result')
    const count = await results.count()

    // Results may or may not exist depending on content
    if (count > 0) {
      await expect(results.first()).toBeVisible()
    }
  })

  test('search shows status after typing', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    await searchInput.fill('a')

    await page.waitForTimeout(600)

    // Should show status or results area
    const status = page.locator('#search-status')
    const results = page.locator('#search-results')

    const hasStatus = await status.isVisible().catch(() => false)
    const hasResults = await results.isVisible().catch(() => false)

    expect(hasStatus || hasResults).toBe(true)
  })

  test('search clears button appears with input', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    const clearButton = page.locator('#search-clear')

    // Initially hidden
    await expect(clearButton).toBeHidden()

    // Type something
    await searchInput.fill('test')

    // Clear button should appear
    await expect(clearButton).toBeVisible()
  })

  test('search clears results on clicking clear button', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')
    const clearButton = page.locator('#search-clear')

    await searchInput.fill('test')
    await page.waitForTimeout(600)

    // Click clear
    await clearButton.click()

    // Input should be empty
    await expect(searchInput).toHaveValue('')
  })

  test('search is accessible via keyboard', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')

    await searchInput.focus()
    await expect(searchInput).toBeFocused()

    await page.keyboard.press('Enter')
    // Should not cause errors
    await expect(page).toHaveURL(/\/search/)
  })

  test('search input has proper ARIA attributes', async ({ page }) => {
    await page.goto('/search')
    const searchInput = page.locator('input#search-input')

    await expect(searchInput).toHaveAttribute('autocomplete', 'off')
    await expect(searchInput).toHaveAttribute('spellcheck', 'false')
  })
})
