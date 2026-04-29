# Project Maintenance Prompt

Use this prompt when asked to clean up, synchronize, or maintain the repo.

## Prompt

Audit the current `danhthanh.dev` monorepo state and make the smallest correct maintenance changes.

Focus areas:

- Keep `AGENTS.md`, `CODING_RULES.md`, `docs/**`, `skills/**`, and agent harness guidance aligned
  with the current monorepo layout.
- Prefer `apps/web` and `apps/cms` paths over stale root `src/*` paths.
- Keep commands aligned with root `package.json` scripts.
- Preserve generated-artifact boundaries for `dist/**`, Pagefind output, and OG image generation.
- Run `pnpm lint:md` for documentation changes and `pnpm check` for broad changes.

Return:

- Files changed.
- Stale guidance removed or updated.
- Verification commands and results.
- Any remaining documentation drift.
