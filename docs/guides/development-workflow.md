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

Lefthook runs lint, typecheck, and formatting checks for staged matching files before commit. Agents must run `pnpm check` and `git diff --check` before invoking `git commit`. Never bypass hooks with `--no-verify`.

Agent integrations use the same quality gate:

- Codex reads the repository `AGENTS.md` and `.codex/README.md` rule.
- Claude Code runs `.claude/settings.json`'s `PreToolUse` guard.
- OpenCode loads `.opencode/plugins/commit-quality-gate.ts` and its matching rule.

Each integration delegates to `scripts/agent-commit-guard.mjs` or `pnpm check`;
Lefthook remains the final Git-level enforcement layer for staged files.

The pre-push hook runs the test suite and full build sequentially. This avoids
Vitest worker starvation when Astro/Vite consumes the same local resources.
