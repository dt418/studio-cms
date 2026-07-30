# No --no-verify

NEVER use `--no-verify` on `git commit` or `git push`. Hooks exist to catch lint, type, format, and test failures before they reach the repo. Bypassing them defeats the entire quality gate. If a hook fails, fix the underlying issue — do not skip the hook.

This is enforced at 3 layers:
1. Agent instructions (AGENTS.md)
2. Coding rules (CODING_RULES.md)
3. Runtime plugin (no-verify-guard.ts)
