# Development Workflow

## Start locally

```bash
pnpm install
cp .env.example apps/web/.env
pnpm dev
```

Astro serves the web app at `http://localhost:4321`.

## Focused checks

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:e2e
```

Use focused package commands while iterating, then run `pnpm check` before opening a pull request.

## Build output

`pnpm build` runs the OG image generator, agent metadata generator, Astro static build, and Pagefind indexing. The deployable output is `apps/web/dist`.

## Content changes

Edit Markdown/MDX files under `apps/web/src/content/posts/{vi,en}`. Validate frontmatter with `pnpm typecheck` and inspect the generated route with `pnpm dev` or `pnpm preview`.

## Hooks

Lefthook runs lint, typecheck, and formatting checks for staged files. Never bypass hooks with `--no-verify`.
