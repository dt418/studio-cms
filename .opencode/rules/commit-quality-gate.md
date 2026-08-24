# Commit quality gate

Before creating a commit, run `pnpm check`. This validates pattern lint,
ESLint, formatting, unit tests, and TypeScript. Never use `--no-verify` or
`-n`; fix the failing check instead.

The `commit-quality-gate` plugin automatically prefixes agent-issued
`git commit` commands with `pnpm check`. Lefthook remains the final repository
hook and repeats the commit-time checks.
