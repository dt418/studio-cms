# Codex repository rules

Codex loads the repository `AGENTS.md` instructions automatically. Before any
agent-issued commit, run `pnpm check`; Lefthook then repeats the commit-time
lint, format, typecheck, accessibility-pattern, and Markdown checks.

Never use `git commit --no-verify`, `git commit -n`, or `git push --no-verify`.

For multi-agent work, use `pnpm harness:orchestrate -- --runtime codex`, store handoffs in `.harness/`, and run `pnpm harness:context` after source, workspace, instruction, skill-lock, or harness changes. On a fresh clone, run `pnpm harness:skills:sync` followed by `pnpm harness:skills:verify` before relying on Caveman skills.
