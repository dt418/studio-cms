# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Add shadcn/ui components: FilterSelect, SpotlightCard, input-group, input, select, textarea
- Add `lib/post.ts` with centralized post utilities (getAuthorInitials, getImageUrl, getAdjacentPosts)
- Add FilterSelect React component with hidden input bridge for BlogFilter integration
- Add hero image `<link rel="preload" as="image">` in BaseLayout for LCP improvement
- Add SEO performance skill covering Core Web Vitals, crawl budget, and PageSpeed Insights

### Changed

- Refactor BlogFilter to use React FilterSelect components instead of native `<select>`
- Extract ~160-line blog filter inline script to `lib/blog-filter.ts` module
- Migrate robots.txt from static file to dynamic prerendered route with RFC 9309 compliance
- Switch from Google Fonts CDN to self-hosted @fontsource-variable packages (Inter, JetBrains Mono)
- Update shadcn style from base-nova to base-lyra with Phosphor icon library
- Update Button variants to rounded-none with adjusted sizing and color tokens
- Move `getAuthorInitials`, `getImageUrl`, `getAdjacentPosts` from utils.ts to post.ts
- Update font-family tokens to match @fontsource-variable naming ('Inter Variable', 'JetBrains Mono Variable')

### Fixed

- Prevent duplicate event listener accumulation in blog-filter.ts via listenersRegistered guard
- Remove redundant reset button listener from blog-filter.ts (already handled in BlogFilter.astro)
- Fix type casts: HTMLSelectElement → HTMLInputElement in blog-filter.ts (hidden inputs, not selects)
- Fix vite version override mismatch: remove direct dep, sync override to ^6.4.2
- Fix FilterSelect onValueChange type to accept `string | null`
- Add aria-label to SelectScrollUpButton/SelectScrollDownButton for accessibility
- Update E2E tests for FilterSelect combobox triggers (replaced native `<select>` queries)
- Fix 21 skipped E2E tests: helpers now parse server-rendered JSON data island instead of client-rendered DOM
- Fix E2E tag page post count test to handle singular vs plural ("1 post" vs "4 posts")

### Performance

- Self-host fonts via `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`, eliminating Google Fonts CDN dependency
- Remove unused animate-on-scroll CSS (~78 lines) and IntersectionObserver JS (~19 lines) from components.css and BaseLayout
- Add responsive `sizes` attributes to CoverImage, ImageBlock, and BlogCard images
- Add `fetchpriority="high"` to hero image in CoverImage.astro

### Removed

- Remove duplicate `:root` and `.dark` CSS blocks from app.css (silently overrode tokens.css values)
- Remove static `apps/web/public/robots.txt` (replaced with dynamic endpoint)
- Remove Google Fonts CDN preconnect, preload, and stylesheet links from BaseLayout
