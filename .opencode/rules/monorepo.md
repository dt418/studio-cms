# Monorepo Structure

## Apps
- `apps/web` — Astro 6 static build (Tailwind v4, `@playform/compress`)
- `apps/cms` — StudioCMS SSR on Astro 5 + `@astrojs/node` (production: `node dist/server/entry.mjs`)

## Commands
- `pnpm install` — postinstall runs `patch-package`
- `pnpm build` — turbo run build (each app loads own `.env`)
- `pnpm check` — lint:patterns && lint && format:check && test && typecheck
- `pnpm test -- src/path/to/file.ts` — focused unit test
- `pnpm test:e2e` — Playwright E2E (Chromium, Firefox, WebKit)

## Environment
- Each app has own `.env` at `apps/web/.env` and `apps/cms/.env`
- Root `.env` is combined template/reference
- CMS needs `CMS_LIBSQL_URL` and `CMS_ENCRYPTION_KEY`
- `.env.vault` encrypted configs — `pnpm vault:pull` / `pnpm vault:push`

## Key Files
- `astro.config.mjs` (web) — has `studiocms-layout-overrides` Vite transform (preserve!)
- `src/content.config.ts` — defines `posts` collection
- `src/styles/app.css` — Tailwind entrypoint
- `turbo.json` — task pipeline
- `lefthook.yml` — git hooks (pre-commit, commit-msg, pre-push)
