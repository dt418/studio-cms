# Playwright E2E Testing Skill

## Overview

This skill provides comprehensive knowledge for implementing and maintaining Playwright end-to-end tests in Astro projects, with specific guidance for the StudioCMS Blog setup.

## Playwright Configuration

### Basic Setup

Playwright config for Astro SSR projects:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : '50%',
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

### Key Configuration Options

- **testDir**: Directory containing test files
- **fullyParallel**: Run all tests in parallel
- **forbidOnly**: Only run focused tests in CI
- **retries**: Retry failed tests (2 in CI, 0 locally)
- **workers**: Parallel worker count (2 in CI, 50% locally)
- **webServer**: Automatically start preview server for tests

## Test Structure

### Directory Organization

```
e2e/
├── pages/           # Page-level tests
│   ├── home.spec.ts
│   ├── blog.spec.ts
│   ├── blog-post.spec.ts
│   └── navigation.spec.ts
├── components/      # Component-specific tests
├── fixtures/        # Test fixtures
└── utils/           # Test utilities
```

### Test File Pattern

```typescript
import { test, expect } from '@playwright/test'

test.describe('Page Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path')
  })

  test('test description', async ({ page }) => {
    // Test implementation
  })
})
```

## Testing Patterns

### Page Loading Tests

```typescript
test('page loads successfully', async ({ page }) => {
  await expect(page).toHaveTitle(/expected title/)
  await expect(page.locator('h1')).toBeVisible()
})
```

### Navigation Tests

```typescript
test('navigation works', async ({ page }) => {
  const link = page.locator('a[href="/target"]')
  await link.click()
  await expect(page).toHaveURL('/target')
})
```

### Element Visibility Tests

```typescript
test('element renders', async ({ page }) => {
  const element = page.locator('.selector')
  await expect(element).toBeVisible()
})
```

### Accessibility Tests

```typescript
test('keyboard navigation works', async ({ page }) => {
  await page.keyboard.press('Tab')
  const focused = page.locator(':focus')
  await expect(focused).toBeVisible()
})

test('all images have alt text', async ({ page }) => {
  const images = page.locator('img')
  const count = await images.count()

  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt')
    expect(alt).toBeTruthy()
  }
})
```

### Responsive Design Tests

```typescript
test('responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

## Best Practices

### Test Organization

- Group related tests with `test.describe()`
- Use `test.beforeEach()` for common setup
- Keep tests independent and isolated
- Use descriptive test names

### Selectors

- Prefer data attributes for stable selectors: `[data-testid="element"]`
- Use semantic selectors as fallback: `page.locator('h1')`
- Avoid brittle selectors like nth-child or specific classes

### Assertions

- Use Playwright's auto-waiting assertions
- Chain assertions for related checks
- Use toBeVisible(), toHaveText(), toHaveURL() appropriately

### Dynamic Content

- Handle dynamic dates/times with regex: `toHaveText(/\d{4}/)`
- Use waitFor() for async operations
- Mock API responses when needed

## Running Tests

### Commands

```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e:ui          # Run with UI mode
pnpm test:e2e:debug        # Debug tests
pnpm test:e2e:headed      # Run with visible browser
pnpm test:e2e:report      # View test report
```

### CI/CD Integration

E2E tests run automatically in GitHub Actions on:

- Push to main branch
- Pull requests to main branch

Tests are NOT in git hooks to avoid slowing down local development.

## Common Issues

### Timeout Errors

Increase timeout in playwright.config.ts:

```typescript
webServer: {
  timeout: 120000, // 2 minutes
}
```

### Flaky Tests

- Add retries in config
- Use waitFor() instead of fixed timeouts
- Ensure tests are independent

### Browser Dependencies

Install browsers locally:

```bash
pnpm exec playwright install
```

## Project-Specific Notes

### StudioCMS Blog E2E Tests

**Covered Routes:**

- `/` - Home page
- `/blog` - Blog listing
- `/blog/[slug]` - Individual posts
- `/search` - Search functionality
- `/tags/[tag]` - Tag pages
- `/categories/[category]` - Category pages

**Test Files:**

- `e2e/pages/home.spec.ts` - Home page tests
- `e2e/pages/blog.spec.ts` - Blog listing tests
- `e2e/pages/blog-post.spec.ts` - Blog post tests
- `e2e/pages/navigation.spec.ts` - Navigation tests
- `e2e/pages/accessibility.spec.ts` - Accessibility tests

**Key Considerations:**

- Tests run against preview server, not dev server
- Database content may vary between environments
- Use realistic test data or mock responses
