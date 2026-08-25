---
name: harness-creator
description: Use when creating, auditing, repairing, or operating the Studio CMS agent harness, including task state, verification gates, agent commands, session handoff, or cross-platform execution.
---

# Studio CMS Harness

Use `.harness/` as shared state. Keep task, decision, review, and report artifacts structured; do not use a master prompt as project memory.

## Commands

| Goal                             | Agent command          | Terminal fallback                             |
| -------------------------------- | ---------------------- | --------------------------------------------- |
| Create or update the harness     | `/harness-init`        | `pnpm harness:init`                           |
| Inspect readiness                | `/harness-status`      | `pnpm harness:status`                         |
| Check structure                  | `/harness-validate`    | `pnpm harness:validate`                       |
| Run verification                 | `/harness-verify`      | `pnpm harness:verify`                         |
| Refresh or check context graph   | `/harness-context`     | `pnpm harness:context [-- --check]`           |
| Select agent role and model tier | `/harness-orchestrate` | `pnpm harness:orchestrate -- --role planning` |

## Workflow

1. Read `AGENTS.md`, `.harness/manifest.json`, and `.harness/state.json`.
2. Record work in a task artifact before changing code.
3. Run `/harness-context` after changing source, workspace, instructions, skill locks, or harness structure; do not leave `graphify-out/` stale.
4. Run the narrowest relevant verification during implementation.
5. Run `/harness-verify` and record evidence before calling work complete.
6. Only a human or lead agent may merge.

## Runtime adapters

Use the same `.harness/` artifacts for Codex, Claude, Pi, OMP, and OpenCode. Select a role before a handoff: `spec-creator`, planning, and QA use `tera-high`; implementation and tester use `luna-max`; `documentation-sync`, reviewer, and observer use `tera-medium`. Run `documentation-sync` after QA/review to synchronize factual documentation, context graph, session handoff, and verification evidence; it must not change production code. Route reviewers with `--risk high` for authentication, authorization, data migration, payment, or security work; this escalates them to `tera-high`. Runtime-specific command files must only invoke the portable Node CLI; they must not own task state.

The runtime is Node-only. Do not introduce `init.sh`, Bash-only commands, or POSIX path assumptions.
