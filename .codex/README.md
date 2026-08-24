# Codex repository rules

Codex loads the repository `AGENTS.md` instructions automatically. Before any
agent-issued commit, run `pnpm check`; Lefthook then repeats the commit-time
lint, format, typecheck, accessibility-pattern, and Markdown checks.

Never use `git commit --no-verify`, `git commit -n`, `git push --no-verify`, or
`git push -n`.
