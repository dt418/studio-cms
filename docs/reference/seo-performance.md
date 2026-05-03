# SEO & Performance Checklist

Maintenance guide for keeping `apps/web` performant and SEO-friendly. For the system overview, see [Architecture Overview](./architecture.md).

## Pre-Build Checklist

Run before every `pnpm build`:

- [ ] All `<img>` tags have `width`/`height` attributes — prevents Cumulative Layout Shift (CLS)
- [ ] Non-hero images have `loading="lazy"` and `decoding="async"`
- [ ] All images have descriptive `alt` text (no `alt=""` on content images)
- [ ] Google Fonts in `<head>` use standard blocking `<link rel="stylesheet">` (do NOT use `media="print"` — it breaks layout rendering)
- [ ] No `<meta name="generator">` tag present
- [ ] `<meta name="theme-color">` present for dark and light modes
- [ ] Page titles use `${title} | ${SITE.name}` format (not `-` separator)

## JSON-LD Structured Data

| Page | Required Schema | File |
|------|----------------|------|
| Homepage (`/`) | `WebSite` + `Person` author | `pages/index.astro` |
| Blog index (`/blog`) | `BreadcrumbList` + `CollectionPage` | `pages/blog/index.astro` |
| Post detail (`/blog/:slug`) | `Article` (headline, datePublished, dateModified, author, publisher) | `pages/blog/[slug].astro` |
| Category (`/categories/:cat`) | `CollectionPage` with explicit canonical URL | `pages/categories/[category].astro` |
| Tag (`/tags/:tag`) | `CollectionPage` with explicit canonical URL | `pages/tags/[tag].astro` |
| Search (`/search`) | `WebPage` | `pages/search.astro` |

**When adding a new page type**:
1. Add JSON-LD via `jsonLd` prop on `<BaseLayout>`
2. For lists, use `BreadcrumbList` + `CollectionPage` (pass as array if both needed)
3. Always set explicit `canonicalUrl` for parameterized pages

## Image Conventions

```astro
<!-- Cover image (hero): above-fold, preloaded by browser -->
<img src={coverImage} alt={title} width={1200} height={630} />

<!-- Content image (markdown): below-fold -->
<img src={src} alt={alt} loading="lazy" decoding="async" />

<!-- Card thumbnail: below-fold, lazy -->
<img src={image} alt={title} width={1200} height={630} loading="lazy" decoding="async" />

<!-- Search result thumbnail: small, lazy -->
<img src={image} alt={`${title} cover image`} width={200} height={113} loading="lazy" decoding="async" />
```

**Key files to check when adding images:**
- `CoverImage.astro` — Post cover images
- `BlogCard.astro` — Card thumbnails on index/archive pages
- `ImageBlock.astro` — Content images from markdown (no hardcoded dimensions — aspect ratio varies)
- `search.ts` (`renderResults`) — Search result thumbnails

## Font Loading

**Current pattern** (in `BaseLayout.astro`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:...family=JetBrains+Mono:...&display=swap"
  rel="stylesheet"
/>
```

> **IMPORTANT**: Do NOT use `media="print" onload="this.media='all'"` for font loading. This non-blocking pattern was tested and caused severe layout breakage — CSS utilities (flex, grid, etc.) failed to apply correctly, making the entire page render as a vertical stack. Use standard blocking `<link rel="stylesheet">` instead. The `display=swap` parameter already handles FOIT gracefully.

## RSS Feed

**File**: `pages/rss.xml.ts`

Requirements per item:
- `categories` — post tags
- `author` — `${SITE.email} (${SITE.author})`
- `customData` with `<content:encoded>` — image + excerpt in CDATA

The `xmlns:content="http://purl.org/rss/1.0/modules/content/"` namespace is injected via response post-processing (see `rss.xml.ts` for the `replace` call).

If `@astrojs/rss` adds native namespace support, remove the post-process workaround.

## Build Optimization

**File**: `apps/web/astro.config.mjs`

`@playform/compress` runs as the last integration:
- **CSS**: lightningcss (`minify: true`)
- **HTML**: html-minifier-terser (`collapseWhitespace`, `removeComments`, `removeRedundantAttributes`, `sortAttributes`, `sortClassName`)
- **JS**: terser (`drop_console: true`, `drop_debugger: true`, `ecma: 2020`)
- **SVG**: svgo (`multipass: true`)

Must always be last in the `integrations` array.

## Verification Commands

```bash
# Check for images without width/height
rg '<img' apps/web/src/ --include='*.astro' --include='*.ts' -l

# Check for meta generator tag
rg 'name="generator"' apps/web/src/ -l

# Check title format consistency
rg 'title.*-' apps/web/src/pages/ --include='*.astro' -l

# Build and verify RSS namespace
pnpm web:build && head -1 apps/web/dist/rss.xml
```

## Recent Audit History

| Date | Change | Commit |
|------|--------|--------|
| 2026-05 | Image CLS fixes, JSON-LD on category/tag, RSS xml namespace, theme-color, title format (`\|` separator) | `5329cd4` |
| 2026-05 | **REVERTED** non-blocking font loading (`media="print"`) — caused full layout breakage. Use blocking `<link>` instead. | — |
| 2026-05 | Full audit: 20 issues found across images, fonts, SEO, RSS, titles | — |

## Related Topics

- [Architecture Overview](./architecture.md)
- [Development Workflow](../guides/development-workflow.md)
- [Deployment Guide](../guides/deployment.md)
