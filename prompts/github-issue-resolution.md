# GitHub Issue Resolution Prompt

Use this prompt when asked to verify, fix, close, or triage GitHub issues for this repo.

## Prompt

Review open GitHub issues for `dt418/studio-cms` against the current local codebase.

Workflow:

1. Use `gh issue list --state open --json number,title,body,labels,updatedAt,url`.
2. Inspect the exact files mentioned in each issue.
3. Classify each issue as resolved, unresolved, partial, duplicate, or needs more information.
4. For unresolved issues, implement the smallest correct fix and sync docs if behavior or project
   guidance changes.
5. Run relevant verification. Use `pnpm lint:md` for docs-only fixes and `pnpm check` or
   `pnpm build` when code/build behavior changes.
6. Close only issues with code/docs evidence, using a short `gh issue close <n> --comment ...`.

Return:

- Issue status table.
- Files changed.
- Verification commands and results.
- Issue numbers closed and why.
