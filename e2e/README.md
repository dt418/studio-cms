# E2E Tests

End-to-end tests for the StudioCMS Blog using Playwright.

## Setup

Tests are configured to run against the preview server. The project must be built before running E2E tests.

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode
pnpm test:e2e:ui

# Run in headed mode (show browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report
```

## Test Structure

```text
e2e/
├── pages/           # Page-level tests
│   ├── home.spec.ts
│   ├── blog.spec.ts
│   ├── blog-post.spec.ts
│   ├── navigation.spec.ts
│   └── accessibility.spec.ts
├── components/      # Component-specific tests
├── fixtures/        # Test fixtures
└── utils/           # Test utilities
```

## Test Coverage

### Home Page (`home.spec.ts`)
- Page loads successfully
- Hero section displays
- Metrics display correctly
- Featured post renders
- Archive section displays
- Responsive design (mobile, tablet, desktop)

### Blog Listing (`blog.spec.ts`)
- Page loads successfully
- Archive header displays
- Metrics display
- Blog filter renders
- Navigation works
- Responsive design

### Blog Post (`blog-post.spec.ts`)
- 404 for non-existent posts
- Post loads by slug
- Table of contents renders (desktop)
- Post content displays
- Tags display and are clickable
- Prev/next navigation works

### Navigation (`navigation.spec.ts`)
- Header navigation works
- Footer links work
- Header is sticky on scroll
- RSS link is accessible
- Breadcrumb navigation works

### Accessibility (`accessibility.spec.ts`)
- Keyboard navigation works
- All images have alt text
- All links have discernible text
- Headings are in correct order
- Proper heading hierarchy

## CI/CD

Tests run automatically on:
- Push to main/master branch
- Pull requests to main/master branch

See `.github/workflows/playwright.yml` for configuration.

## Best Practices

- Tests are isolated and don't depend on each other
- Tests use descriptive names
- Tests check for specific assertions
- Tests handle dynamic content appropriately
- Tests use Playwright's auto-waiting features

## Troubleshooting

**Tests timeout:**
- Increase timeout in playwright.config.ts
- Check if preview server is starting correctly

**Tests fail locally but pass in CI:**
- Ensure you're running against the built preview server
- Check environment variables are set correctly

**Browser installation issues:**
- Run `pnpm exec playwright install` to reinstall browsers
