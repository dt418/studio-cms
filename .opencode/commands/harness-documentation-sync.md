---
description: Synchronize Studio CMS documentation and handoff artifacts after QA and review.
---

Run `pnpm harness:orchestrate -- --role documentation-sync --runtime opencode --json`. Read the completed task, QA, and review artifacts before editing. Update only factual documentation, skills/command docs, `.harness/session-handoff.md`, context graph, and verification evidence; do not edit production code. Finish with `pnpm harness:context`, `pnpm harness:context:check`, and Markdown lint for changed Markdown files.
