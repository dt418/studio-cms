---
name: playwright-e2e-best-practices
description: Enforce Playwright E2E testing best practices for the StudioCMS Blog project
severity: warning
---

# Playwright E2E Testing Best Practices Rule

## Purpose

Ensure Playwright E2E tests follow established best practices for the StudioCMS Blog project, maintaining test reliability, performance, and maintainability.

## Rules

### Test Structure

- **DO** Organize tests by page/component in appropriate subdirectories
- **DO** Use `test.describe()` to group related tests
- **DO** Use `test.beforeEach()` for common setup
- **DO NOT** Create deeply nested test describes (max 2 levels)
- **DO NOT** Put multiple unrelated tests in the same file

### Selectors

- **DO** Use semantic selectors: `page.locator('h1')`, `page.locator('button')`
- **DO** Use data attributes for stability: `page.locator('[data-testid="submit"]')`
- **DO NOT** Use brittle selectors like nth-child or specific classes
- **DO NOT** Use CSS selectors that are tightly coupled to styling

### Assertions

- **DO** Use Playwright's auto-waiting assertions
- **DO** Chain related assertions for clarity
- **DO NOT** Use fixed timeouts with `page.waitFor()`
- **DO NOT** Use `expect().toBeTruthy()` when more specific assertions exist

### Test Independence

- **DO** Keep tests isolated and independent
- **DO** Clean up state in `test.afterEach()` if needed
- **DO NOT** Make tests depend on execution order
- **DO NOT** Share state between tests

### Performance

- **DO** Keep tests fast and focused
- **DO** Use `test.skip()` for slow tests when needed
- **DO NOT** Add unnecessary waits or delays
- **DO NOT** Test the same thing multiple times

### Accessibility

- **DO** Include basic accessibility checks
- **DO** Test keyboard navigation
- **DO** Verify images have alt text
- **DO NOT** Skip accessibility testing for user-facing pages

### Configuration

- **DO** Use the configured baseURL from playwright.config.ts
- **DO** Run tests against preview server, not dev server
- **DO NOT** Hardcode URLs in tests
- **DO NOT** Modify webServer configuration without team consensus

### Documentation

- **DO** Add descriptive test names
- **DO** Comment complex test logic
- **DO NOT** Leave TODO comments in committed tests
- **DO NOT** Write unclear test names like "test 1"

## Examples

### Good Test

```typescript
test.describe('Home Page', () => {
  test('featured post displays correctly', async ({ page }) => {
    await page.goto('/')
    const featuredPost = page.locator('.card-hover').first()
    await expect(featuredPost).toBeVisible()
    await expect(featuredPost.locator('h3')).not.toBeEmpty()
  })
})
```

### Bad Test

```typescript
test('test', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(1000) // Bad: fixed timeout
  expect(await page.locator('div').nth(5).isVisible()).toBeTruthy() // Bad: brittle selector, bad assertion
})
```

## Enforcement

This rule is enforced through:

- Code review feedback
- ESLint rules for test files
- CI/CD test failures

## Resources

- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Testing Library: https://testing-library.com/docs/dom-testing-library/intro
- Project skill: `skills/playwright-e2e-testing.md`
- Project agent: `agents/e2e-tester.md`
