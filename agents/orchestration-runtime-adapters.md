# Harness Runtime Adapters

All runtimes share `.harness/` state and a portable Node CLI. The repository provides the command contract; host clients select and launch their own model. No provider-specific model launcher is implied.

| Runtime  | Generated adapter location         | Runnable project command                       |
| -------- | ---------------------------------- | ---------------------------------------------- |
| Codex    | `.codex/skills/harness-*/SKILL.md` | `pnpm harness:orchestrate -- --runtime codex`  |
| Claude   | `.claude/commands/harness-*.md`    | `pnpm harness:orchestrate -- --runtime claude` |
| Pi       | `.pi/prompts/harness-*.md`         | `pnpm harness:orchestrate -- --runtime pi`     |
| OMP      | `AGENTS.md`                        | `pnpm harness:orchestrate -- --runtime omp`    |
| OpenCode | `.opencode/commands/harness-*.md`  | `/harness-orchestrate`                         |

`pnpm harness:init` creates missing Codex, Claude, and Pi adapters. It preserves
existing adapter files unless `--force` is supplied. Codex uses its legacy-compatible
repository skill location, Claude uses its supported command files, and Pi uses its
current prompt-template location. These files all call the portable Node CLI; they
do not launch provider-specific models.

Choose the role before work: `spec-creator`, planning, and QA use `tera-high`; implementation and tester use `luna-max`; `documentation-sync`, reviewer, and observer use `tera-medium`. Run `documentation-sync` only after QA/review to synchronize factual documentation, context graph, handoff, and verification evidence; it must not edit production code. For authentication, authorization, data migration, payment, or security work, route review with `--role reviewer --risk high` to use `tera-high`. Record all handoffs in `.harness/tasks/`, `.harness/decisions/`, `.harness/reviews/`, or `.harness/reports/`.

On a fresh clone, run `pnpm harness:skills:sync`, then `pnpm harness:skills:verify`. The manifest pins Caveman through checked-in lock and installed-content hashes; a changed upstream or local skill fails verification until its hashes are deliberately reviewed and updated. Run `pnpm harness:context` after a source, workspace, instruction, skill-lock, or harness change. `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` are tracked context artifacts; `pnpm harness:context:check` must pass before commit.
