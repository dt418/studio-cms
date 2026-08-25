---
description: Select the correct orchestration role, model tier, and shared-state handoff before starting work.
---

Run `pnpm harness:orchestrate -- --role planning --runtime opencode --json` first. Use `spec-creator`, `planning`, `implementation`, `documentation-sync`, `reviewer`, `qa`, `tester`, or `observer` as the role. `documentation-sync` runs after QA/review and must not edit production code. For authentication, authorization, data migration, payment, or security work, add `--role reviewer --risk high` to route the reviewer to Tera High. Read `.harness/manifest.json` and `.harness/state.json`, then create or update the task artifact before delegating work.
