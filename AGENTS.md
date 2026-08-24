# AGENTS.md

## Project Shape

- Single-app workspace: `apps/web` is an Astro 7 static build. The former StudioCMS/libSQL backend has been removed.
- Web build uses `@playform/compress` (placed last in integrations) with lightningcss CSS, terser JS, html-minifier-terser HTML, and svgo SVG to minify static output.
- Main content comes from `src/content/posts/**/*.{md,mdx}` via `src/content.config.ts`; publishing is file-based and static.
- `@` is the repo alias for `src/*` in both `tsconfig.json` and `astro.config.mjs`; prefer it over deep relative imports.
- Tailwind v4 in web enters through `src/styles/app.css`, which imports `tokens.css`, `semantic.css`, `base.css`, and `components.css`; keep token/theme changes in those modules instead of adding new global CSS entrypoints.
- The web app uses `apps/web/.env`; Astro/Vite loads it automatically. Root `.env` is a template/reference.

## Commands

- Install with `pnpm install`; `postinstall` runs `patch-package`.
- Local setup: copy `.env.example` to `apps/web/.env`. `pnpm dev` loads the app `.env` automatically.
- `pnpm build` runs `turbo run build`; each app's Astro/Vite loads `.env` from its own directory automatically.
- `pnpm check` runs `pnpm lint:patterns && pnpm lint && pnpm format:check && pnpm test && pnpm typecheck`.
- Focused unit tests: `pnpm test -- src/lib/filter.test.ts` or another `src/**/*.test.{ts,tsx}` file.
- E2E tests: `pnpm test:e2e`; Playwright config starts the dev server on port 4321 and tests Chromium, Firefox, and WebKit.
- For CI-like E2E setup, build the static web app with `SITE_URL=http://localhost:4321` before `pnpm test:e2e`.

## Verification And Hooks

- Lefthook pre-commit always runs lint, typecheck, and `format:check` in parallel, regardless of which files are staged; a11y-pattern and Markdown checks run alongside them.
- Before an agent invokes `git commit`, it must run `pnpm check` and `git diff --check`. If either command fails, fix the underlying issue and rerun the checks before retrying the commit.
- Lefthook pre-push runs `pnpm test` and `pnpm build` in parallel.
- Commit messages are checked by commitlint; use Conventional Commits style such as `fix: prevent search overflow`.
- **NEVER use `--no-verify` on `git commit` or `git push`.** Hooks exist to catch lint, type, format, and test failures before they reach the repo. Bypassing them defeats the entire quality gate. If a hook fails, fix the underlying issue — do not skip the hook.
- ESLint ignores `e2e`, `dist`, `.astro`, `tender-series`, and coverage; do not assume E2E files are covered by `pnpm lint`.
## Git Workflow

- `main` is a protected integration branch. Never push directly to `main` or force-push any shared branch.
- Start every task from an up-to-date `main` checkout on a separate branch, using a descriptive name such as `codex/fix-e2e-ci`.
- Open a pull request into `main` for every change. Do not merge a task branch without the required CI checks passing.
- The required PR gate is the `test` job in `.github/workflows/playwright.yml`; it runs Vitest, typecheck, build, and the full Chromium/Firefox/WebKit Playwright suite.
- Keep unrelated changes out of a PR. Update the PR description with the root cause, validation commands, and any known environment limitations.

## Code Conventions That Bite

- TypeScript is strict with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and unused checks; conditionally spread optional Astro props (`{...(value && { value })}`) instead of passing possibly undefined values.
- ESLint forbids `any` except in `*.test.ts`; if a test needs it, keep the loosened type usage in test files only.
- `no-param-reassign` is disabled for `.astro` and tests but enforced elsewhere.
- Prettier uses no semicolons, single quotes, 100-column width, and the Astro + Tailwind plugins; let it sort Tailwind classes.
- Do not create React-style JSX-returning helper functions in Astro frontmatter; extract a `.astro` component or render inline.
- **Images**: Every `<img>` in `.astro` or `.ts` must include `width`/`height` attributes to prevent CLS. Non-hero images add `loading="lazy"` and `decoding="async"`. Always use descriptive `alt` text (never empty on content images).
- **Fonts**: Current setup does **not** use Astro Fonts API. `apps/web/astro.config.mjs` has no `fonts` block, and `BaseLayout.astro` does not render `<Font />`. Typography is handled via CSS tokens in `src/styles/{tokens,semantic}.css`; keep `--font-inter` and `--font-jetbrains-mono` mappings aligned there. Use fontsource/local CSS flow, not Astro Google font fetching.
- **Titles**: Page titles follow the pattern `${title} | ${SITE.name}`. Do not use `-` as separator.
- **JSON-LD**: Every index/list page (blog index, categories, tags) requires `BreadcrumbList` and/or `CollectionPage` structured data. Post pages need `Article` schema.
- **No meta generator**: Do not add `<meta name="generator">` — it leaks version info to scrapers.
- **Commit types**: Use `perf` for CLS, LCP, font-loading, and image-optimization changes.
- **No hardcoded UI strings**: All user-facing text must go through `src/lib/i18n/{en,vi}.ts` translation files. Pages call `getTranslations(lang)` and pass `i18n` fragment props to components. Client-side JS reads i18n from an inline `<script id="filter-i18n">` JSON embed. Components default to English text when no `i18n` prop is provided.

## Generated And Runtime Artifacts

- `public/og-image.png` is generated by `pnpm build` / `pnpm og:generate`; manual edits can be overwritten.
- Search depends on generated `dist/client/search-index.html` plus Pagefind output under `dist/client/pagefind`; changing post metadata/search fields requires a full `pnpm build` to verify.
- `astro.config.mjs` (web) contains the public static build integrations; keep fixes in project config instead of patching `node_modules`.
- Rollup visualizer writes `dist/stats.html` during build.
- `.env.vault` contains encrypted dotenv configs for all environments; team members decrypt with `pnpm vault:pull` (pulls root `.env`, then syncs to per-app `.env` files). Use `pnpm vault:push` to merge per-app `.env` changes back and push upstream.

## OpenCode And Local Tooling

- `opencode.json` enables Astro docs and shadcn MCP servers; use current docs for Astro/shadcn/library API questions instead of relying on memory.
- `components.json` configures shadcn with TSX, `@/components/ui`, `@/lib/utils`, Tailwind CSS at `src/styles/app.css`, and no RSC.
- Existing broader guidance lives in `CODING_RULES.md`; keep this file shorter and only duplicate rules that prevent likely mistakes.
