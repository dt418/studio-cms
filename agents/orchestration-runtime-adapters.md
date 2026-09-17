# Harness Runtime Adapters

All runtimes share `.harness/` state and a portable Node CLI. Codex routes expose
catalogued model names; other runtimes return an abstract tier, and host clients
select and launch their own compatible model. No provider-specific model launcher is implied.

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
do not launch provider-specific models. Non-Codex routes use an abstract tier so
their output never claims that a Codex model is available in the host client.

GitHub MCP uses the hosted server from the root `.mcp.json` for Claude, OMP,
and Pi when `pi-mcp-adapter` is installed. OpenCode declares the same endpoint
in `opencode.json` with an environment-backed `GITHUB_PERSONAL_ACCESS_TOKEN`;
Codex uses its local stdio server with the same token. Credentials remain
runtime-local and are never committed.

Choose the role before work: standard routing uses Sol High for `spec-creator`/planning, Luna xhigh for implementation, Terra High for review/QA/test/advisor, Luna Medium for documentation sync/exploration, Terra Medium for docs research, and Luna Low for observation. Simple implementation may use Luna Medium; complex planning uses the catalogued Sol model at medium reasoning; complex implementation/review/QA/test/advisor and high-risk work escalate to Sol High. Run `documentation-sync` only after QA/review to synchronize factual documentation, context graph, handoff, and verification evidence; it must not edit production code. For authentication, authorization, data migration, payment, or security work, route review with `--role reviewer --risk high`. Record all handoffs in `.harness/tasks/`, `.harness/decisions/`, `.harness/reviews/`, or `.harness/reports/`.

On a fresh clone, run `pnpm harness:skills:sync`, then `pnpm harness:skills:verify`. The manifest pins Caveman through checked-in lock and installed-content hashes; a changed upstream or local skill fails verification until its hashes are deliberately reviewed and updated. Run `pnpm harness:context` after a source, workspace, instruction, skill-lock, or harness change. `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` are tracked context artifacts; `pnpm harness:context:check` must pass before commit.
