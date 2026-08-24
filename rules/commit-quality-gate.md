# Commit quality gate

Use this rule for every agent-driven commit in the repository.

1. Run `pnpm check`.
2. Run `git diff --check`.
3. Invoke `git commit` only when both commands pass.
4. If a hook fails, fix the reported issue and rerun the checks. Never use
   `--no-verify` on `git commit` or `git push`.

The Lefthook `pre-commit` hook independently enforces lint, format, typecheck,
accessibility-pattern, and Markdown checks for staged matching files. The agent
command rule is an additional guard; it does not replace the hook.
