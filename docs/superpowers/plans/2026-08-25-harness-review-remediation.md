# Harness Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the harness context graph deterministic and freshness-aware, make Caveman installation verifiable and repeatable, and accurately expose runnable runtime adapters.

**Architecture:** Keep the harness dependency-free and Node-based. The context command will derive stable project identity and hash every tracked context input; its generated graph remains the single checked artifact. Skill bootstrap is declared in a small manifest and verified by the same CLI, while runtime adapters are represented by one portable command contract rather than unimplemented provider launchers.

**Tech Stack:** Node.js built-ins, `node:test`, pnpm scripts, JSON and Markdown artifacts.

**Spec:** Current-worktree review findings approved by the user on 2026-08-25; no separate specification document exists.

## Global Constraints

- Support Windows, Linux, and macOS without shell-specific implementation code.
- Keep the harness free of runtime dependencies.
- Do not auto-merge or let agents modify shared state without the existing policies.
- Keep `graphify-out/` deterministic across differently named checkout directories.
- Do not claim native model launching for a runtime unless the repository implements it.

---

### Task 1: Deterministic, freshness-aware context graph

**Files:**

- Modify: `tools/harness/scripts/harness.test.mjs`
- Modify: `tools/harness/scripts/harness.mjs`
- Regenerate: `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`

**Interfaces:**

- Consumes: project `package.json`, source files, instruction files, harness configuration, command files, and `skills-lock.json` when present.
- Produces: graph version 2 with a stable `root`, stable workspace label, and `fingerprints.context` SHA-256 value.

- [ ] **Step 1: Write failing tests**

Add a test that copies a generated graph between two fixtures with the same package name but different directory names, then runs `context --check` in the second fixture. Add a test that changes source file content without changing its path and expects `context --check` to fail.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tools/harness/scripts/harness.test.mjs`

Expected: the cross-directory check fails because the graph includes the directory basename, and the content-only change is not detected.

- [ ] **Step 3: Implement the smallest graph update**

Use `package.json.name` (falling back to `workspace`) as project identity. Discover context inputs with deterministic paths, add nodes for them, and derive a SHA-256 digest from each path and UTF-8 file content. Serialize that digest under `fingerprints.context`.

- [ ] **Step 4: Run the focused and full harness tests**

Run: `node --test tools/harness/scripts/harness.test.mjs`

Expected: all context graph tests pass.

### Task 2: Repeatable Caveman bootstrap and verification

**Files:**

- Create: `.harness/external-skills.json`
- Modify: `tools/harness/scripts/harness.test.mjs`
- Modify: `tools/harness/scripts/harness.mjs`
- Modify: `package.json`
- Modify: `AGENTS.md`, `CLAUDE.md`, `agents/orchestration-runtime-adapters.md`

**Interfaces:**

- Consumes: `.harness/external-skills.json`, `skills-lock.json`, and local `.agents/skills/<name>/SKILL.md` files.
- Produces: `harness skills --check` exit status and `harness:skills:sync` / `harness:skills:verify` package commands.

- [ ] **Step 1: Write failing test**

Add a fixture with an external-skill manifest and lock entry but no local skill directory. Assert `skills --check` exits non-zero and identifies the missing skill.

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tools/harness/scripts/harness.test.mjs`

Expected: the CLI reports usage because it has no `skills` command.

- [ ] **Step 3: Implement minimal manifest validation**

Add a manifest that records the exact Caveman source and expected skills. Implement `skills --check` to parse the manifest and lock file, require matching lock entries and local `SKILL.md` files, and print an actionable sync instruction on failure. Add portable pnpm scripts; the sync command must use the user-approved `npx skills add JuliusBrussee/caveman` source.

- [ ] **Step 4: Run harness tests and local skill verification**

Run: `pnpm harness:test && pnpm harness:skills:verify`

Expected: tests pass and the installed Caveman skills validate against the manifest and lock file.

### Task 3: Runnable, non-overclaiming runtime contract and validation

**Files:**

- Modify: `tools/harness/scripts/harness.test.mjs`
- Modify: `tools/harness/scripts/harness.mjs`
- Modify: `agents/orchestration-runtime-adapters.md`
- Modify: `.github/workflows/harness-portability.yml`

**Interfaces:**

- Consumes: `.harness/orchestration.json`.
- Produces: validated orchestration JSON and a documented portable command for Codex, Claude, Pi, OMP, and OpenCode.

- [ ] **Step 1: Write failing test**

Corrupt a required harness JSON file after initialization and assert `validate --json` returns a non-100 score with a parse failure reported.

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tools/harness/scripts/harness.test.mjs`

Expected: the current existence-only validator incorrectly returns 100.

- [ ] **Step 3: Implement JSON parsing validation and adapter documentation**

Parse every required JSON artifact during validation. In runtime documentation, distinguish repository-provided slash commands from the portable CLI contract and state that runtime model selection is performed in each host client.

- [ ] **Step 4: Verify the portability gate locally**

Run: `pnpm harness:test && pnpm harness:context && pnpm harness:context:check && pnpm harness:validate`

Expected: all commands pass with generated context artifacts current.

## Self-Review

- Spec coverage: Task 1 resolves checkout-dependent graphs and stale context detection. Task 2 resolves the ignored Caveman directory through bootstrap and verification. Task 3 removes the misleading runtime-support claim and hardens harness validation.
- Placeholder scan: no placeholder markers or deferred implementation steps remain.
- Type consistency: all commands are subcommands of `tools/harness/scripts/harness.mjs`; package scripts call the same command names described above.
