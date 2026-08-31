---
name: seo-e2e-workflow
description: studio-cms SEO contracts (branded titles, trailing-slash routes, locale-filtered hreflang), the local Playwright recipe against the static build, and CI failure triage for harness and Playwright jobs.
---

# SEO & E2E Workflow (studio-cms)

Use when a Playwright or harness CI failure touches SEO metadata, routes, hreflang, or the context check; when adding or changing pages, titles, or internal links; when updating e2e route fixtures.

## SEO contracts (non-negotiable)

- **Titles**: every page title is `${title} | ${SITE.name}` — the suffix is always kept. `resolveSeoTitle` in `apps/web/src/lib/seo.ts` truncates the content portion at a word boundary with `…` to fit the 60-char budget instead of dropping the suffix. Encoded by `src/lib/seo.test.ts` (truncation invariant), `e2e/pages/blog-post.spec.ts` (`/\| DanhThanh\.dev$/`), and the long-title test in `e2e/seo-foundation.spec.ts`.
- **Trailing slashes**: internal route helpers in `apps/web/src/lib/content-utils.ts` emit trailing-slash URLs. The e2e fixtures `e2e/utils/i18n.ts` (`LOCALE_ROUTES`) and exact-href/URL assertions in `e2e/pages/*.spec.ts` must match. Change route output and fixtures in the same commit.
- **hreflang**: alternates are emitted only for locales where the term actually exists. Taxonomy pages (`src/pages/[lang]/categories/[category].astro`, `tags/[tag].astro`) derive the locale set from content and pass it to `getLocaleNeutralAlternates(path, origin, locales)`; `alternatePaths` derives from the same set. Reciprocal-hreflang coverage: `e2e/seo-foundation.spec.ts`.
- **Social parity**: `og:title` and `twitter:title` must equal the `<title>` text.

## Local e2e recipe

1. Build once with the preview origin: `SITE_URL=http://localhost:4321 pnpm web:build`.
2. Run tests against that build: `SKIP_WEB_BUILD=true pnpm exec playwright test --project=chromium e2e/...` — the webServer (`scripts/run-seo-preview.mjs`) serves `apps/web/dist` without rebuilding.
3. Omit `SKIP_WEB_BUILD` to reproduce CI (webServer builds first, `reuseExistingServer: false`, port 4321).

Known transient: an in-runner build can fail at Pagefind ("directory ... did not contain any html files") right after heavy builds on Windows. Rebuild manually per step 1 and retry with `SKIP_WEB_BUILD=true`.

## CI triage (never from check badges alone)

- Failed jobs: `gh run view <run-id> --repo dt418/studio-cms --log-failed`.
- Passing jobs you rely on: read the full log (`gh run view --job <id> --log`) and confirm the suite actually ran — expected `N passed` count, browser names present, flaky list noted.
- Playwright CI: `workers: 1`, `retries: 2`. A "flaky" result passed on retry. Before calling a flake pre-existing, compare against recent runs on `main` (`gh run list --branch main`).
- Harness job fails with "Context graph is out of date": run `pnpm harness:context`, verify with `pnpm harness:context:check`, commit `graphify-out/`. The pre-commit hook runs the check; if it fires, regenerate before committing.

## Adding a localized page or route

1. Emit routes via `content-utils.ts` helpers (trailing slash).
2. Extend `e2e/utils/i18n.ts` fixtures and the relevant spec in the same change.
3. Derive hreflang alternates from the real content locale set (see the taxonomy pages) — never assume all locales exist for a term.
4. Verify: `pnpm check`, then the local e2e recipe, then `pnpm harness:context` if tracked files changed.
