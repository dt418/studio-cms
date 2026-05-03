# Skill: seo-performance

Performance is a direct ranking signal. Google uses Core Web Vitals (LCP, INP, CLS) as part of the page experience ranking factor. Faster sites get crawled more pages per session (crawl budget), rank higher, and convert better — a triple win.

## Ranking Impact: Why Speed Matters

| Mechanism | Impact | Threshold |
|-----------|--------|-----------|
| Core Web Vitals | Direct ranking signal (page experience) | LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 |
| Crawl budget | Faster pages → more URLs crawled per session | Response time < 500ms ideal |
| User signals | Slow sites increase bounce rate (indirect ranking) | Bounce rate increases 32% when load goes from 1s → 3s |
| Mobile-first indexing | Mobile performance is the primary ranking signal | Mobile LCP ≤ 2.5s |
| HTTPS | Prerequisite for ranking | Required |

## Core Web Vitals (the SEO-critical three)

### LCP — Largest Contentful Paint (≤ 2.5s)

When the largest above-fold element renders. For most content pages, this is the hero image or heading block.

```html
<!-- The LCP element is typically: -->
<img src="hero.webp" ...>   <!-- Hero image -->
<h1>Page Title</h1>          <!-- Large text block -->
<div class="hero-bg">...</div> <!-- Background image via CSS -->
```

**LCP sub-parts (all must be fast):**
1. TTFB (Time to First Byte): server response ≤ 800ms
2. Resource load delay: time until LCP resource starts loading
3. Resource load time: time to download the LCP resource
4. Element render delay: time to render the LCP element

**SEO-optimized LCP techniques:**
```html
<!-- Preload the LCP image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">

<!-- Use fetchpriority on the LCP image itself -->
<img src="/hero.webp" fetchpriority="high" width="1200" height="630" alt="...">

<!-- Inline critical CSS to avoid render-blocking -->
<style>
  /* Critical above-fold styles inline */
  .hero { min-height: 60vh; background: var(--color-bg); }
</style>
<link rel="stylesheet" href="/app.css" media="print" onload="this.media='all'">
```

### INP — Interaction to Next Paint (≤ 200ms)

Measures responsiveness to clicks, taps, and key presses throughout the page lifecycle.

```html
<!-- Long tasks block the main thread and delay INP -->
<!-- Break up heavy JS with scheduler yielding -->
<script>
// ❌ Blocking
function processAll(items) {
  items.forEach(item => heavyTransform(item))
}

// ✅ Yielding to the browser
async function processAll(items) {
  for (const item of items) {
    heavyTransform(item)
    if (items.indexOf(item) % 5 === 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }
}
</script>
```

**INP optimization for SEO:**
- Avoid long tasks (>50ms) on the main thread
- Defer non-critical JavaScript
- Use `requestIdleCallback` or `scheduler.postTask` for low-priority work
- Avoid layout thrashing — batch DOM reads/writes

### CLS — Cumulative Layout Shift (≤ 0.1)

Unexpected visual shifts during page load. The #1 cause: missing image/video/iframe dimensions.

```html
<!-- ❌ Causes CLS — browser doesn't know image size -->
<img src="photo.jpg" alt="...">

<!-- ✅ No CLS — explicit dimensions reserve space -->
<img src="photo.jpg" alt="..." width="800" height="600">

<!-- ✅ Responsive with aspect ratio -->
<img src="photo.jpg" alt="..." width="800" height="600" style="width:100%; height:auto">

<!-- ❌ Dynamic injected content pushes layout -->
<div id="ad-container"></div>  <!-- Ad loads later, shifts content -->

<!-- ✅ Reserve space for dynamic content -->
<div id="ad-container" style="min-height: 250px"></div>
```

**CLS root causes:**
1. Images without `width`/`height`
2. Ads, embeds, iframes without reserved space
3. Web fonts causing FOIT/FOUT (font shift)
4. Dynamically injected content above existing content

```html
<!-- Font CLS fix: use font-display and size-adjust -->
<style>
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;          /* Show fallback immediately */
  size-adjust: 105%;           /* Match fallback font metrics */
}
</style>
```

## Crawl Budget Optimization

Google allocates a crawl budget per site: the number of pages it will crawl per session. Faster sites get more pages crawled.

```nginx
# Fast server response keeps crawlers efficient
# Target: < 200ms TTFB for static pages, < 500ms for dynamic

# Cache static assets aggressively
location /_astro/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML pages: short cache with stale-while-revalidate
location / {
  add_header Cache-Control "public, max-age=60, stale-while-revalidate=3600";
}
```

**Crawl budget wins:**
- Static generation (SSG) instead of SSR for content pages → instant TTFB
- `Cache-Control: public, immutable` for hashed assets
- Remove duplicate URLs (canonical tags, redirect chains)
- Block unnecessary paths in robots.txt (admin, API, search pages)
- Keep sitemaps clean — only indexable, canonical URLs

## Mobile-First Performance

Google indexes and ranks the mobile version of your site. Mobile performance IS your SEO performance.

```html
<!-- Critical mobile meta -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Responsive images with srcset -->
<img
  src="/hero-800.webp"
  srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="..."
  width="800"
  height="600"
>

<!-- Use the picture element for art direction -->
<picture>
  <source media="(max-width: 600px)" srcset="/hero-mobile.webp">
  <source media="(min-width: 601px)" srcset="/hero-desktop.webp">
  <img src="/hero-desktop.webp" alt="..." width="1200" height="630">
</picture>
```

**Mobile-specific signals:**
- Tap targets ≥ 48×48px (impacts mobile usability ranking)
- Font size ≥ 16px (prevents zoom-on-tap)
- No horizontal scrollbar at 320px viewport
- Content width matches viewport (no `width=device-width` override)

## Astro-Specific Performance Wins

### Static Generation (SSG) — default in Astro

```astro
---
// Content pages ship zero JS by default
// This is the #1 SEO performance advantage of Astro
const posts = await getCollection('posts')
---

<!-- HTML-only output: instant LCP, no JS parse cost -->
<main>
  {posts.map(post => <PostCard post={post} />)}
</main>
```

### Image optimization with Astro's Image component

```astro
---
import { Image } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---

<!-- Astro generates responsive srcset + dimensions automatically -->
<Image
  src={heroImage}
  alt="Descriptive alt text for SEO"
  width={1200}
  height={630}
  loading="eager"      <!-- LCP image: eager -->
  fetchpriority="high"  <!-- LCP image: high -->
  formats={['webp', 'avif']}
/>

<!-- Below-fold: lazy -->
<Image
  src={secondaryImage}
  alt="..."
  loading="lazy"
  decoding="async"
  formats={['webp']}
/>
```

### View Transitions — zero-CLS navigation

```astro
---
// layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions'
---
<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <main transition:name="main-content">
      <slot />
    </main>
  </body>
</html>
```

### Font loading (project convention)

```html
<!-- Non-blocking Google Fonts with swap -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
  media="print"
  onload="this.media='all'"
>
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
</noscript>
```

### Island architecture — minimal JS

```astro
---
import InteractiveChart from '../components/InteractiveChart'
---

<!-- Hydrate only when visible (best for below-fold interactive elements) -->
<InteractiveChart client:visible />

<!-- Hydrate only when idle (best for non-critical interactivity) -->
<SearchWidget client:idle />

<!-- Load on any interaction (best for rarely-used features) -->
<FeedbackForm client:media="(max-width: 768px)" />
```

## PageSpeed Insights & Lighthouse Audits

### Scoring thresholds (Google's public ranking consideration)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| Performance Score | 90-100 | 50-89 | 0-49 |
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB | ≤ 800ms | ≤ 1.8s | > 1.8s |
| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |

### Lighthouse scoring weights (v11)

| Audit Category | Weight |
|---------------|--------|
| Performance | 100% (SEO impact) |
| Accessibility | Additional ranking signal |
| Best Practices | Trust signals |
| SEO | Direct ranking factors |

### Automated CI audit (for this project)

```bash
# Build, then audit performance + SEO together
pnpm build
npx lighthouse http://localhost:4321 \
  --only-categories=performance,seo \
  --output=html \
  --output-path=./lighthouse-report.html

# Or use the project's built-in verification
pnpm check
```

## SEO Performance Checklist

### Before deployment
- [ ] All images have explicit `width`/`height` (prevents CLS)
- [ ] LCP image uses `fetchpriority="high"` or is preloaded
- [ ] Critical CSS is inlined in `<head>`
- [ ] Fonts use `font-display: swap` with `size-adjust`
- [ ] No render-blocking JS in `<head>` (use `defer`/`async`)
- [ ] All pages are statically generated (no SSR for content)
- [ ] `sitemap.xml` includes only canonical, indexable URLs
- [ ] `robots.txt` blocks unnecessary paths
- [ ] HTTPS enforced with HSTS header
- [ ] `<meta name="viewport">` is present and correct

### Post-deployment
- [ ] Lighthouse Performance ≥ 90 (mobile)
- [ ] Lighthouse SEO = 100
- [ ] Core Web Vitals passing in Search Console
- [ ] CrUX data shows "good" for all three metrics
- [ ] No mobile usability issues in Search Console
- [ ] PageSpeed Insights shows no opportunities flagged

### Ongoing monitoring
- [ ] Check Search Console Core Web Vitals report weekly
- [ ] Monitor crawl stats (pages crawled/day) in Search Console
- [ ] Re-run Lighthouse after significant content/image changes
- [ ] Review PageSpeed Insights after dependency updates
- [ ] Watch for CLS regressions on new page templates

## Tools

| Tool | Use | URL |
|------|-----|-----|
| PageSpeed Insights | Field + lab data, CWV assessment | https://pagespeed.web.dev |
| Lighthouse CLI | Automated CI audits | `npx lighthouse <url>` |
| Google Search Console | CWV report, crawl stats, mobile usability | https://search.google.com/search-console |
| Chrome UX Report (CrUX) | Real-user CWV data | https://developer.chrome.com/docs/crux |
| Web Vitals extension | Debug CWV during development | Chrome Web Store |
| WebPageTest | Detailed waterfall, filmstrip, CWV | https://www.webpagetest.org |
| `pnpm check` | Project verification gate | This repo |

## References

- [Web Vitals (Google)](https://web.dev/vitals/)
- [Page Experience & Ranking (Google)](https://developers.google.com/search/docs/appearance/page-experience)
- [Crawl Budget Management (Google)](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)
- [Mobile-First Indexing (Google)](https://developers.google.com/search/mobile-sites/mobile-first-indexing)
- [Astro Performance Guide](https://docs.astro.build/en/guides/performance/)
- [Astro Image Optimization](https://docs.astro.build/en/guides/images/)
- [Project Code Conventions](../AGENTS.md)
