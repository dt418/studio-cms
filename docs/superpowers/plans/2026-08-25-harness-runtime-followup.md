# Harness Runtime Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Generate runtime-native Codex, Claude, and Pi harness adapters and close the five latest bot findings without adding provider launchers.

**Architecture:** Keep `.harness/` as the shared state and Node CLI contract. Add one initialization routine that creates runtime-native adapter trees: Codex Skills under `.codex/skills`, Claude legacy command files under `.claude/commands`, and Pi prompt templates under `.pi/prompts`. Harden context discovery, manifest merging, JSON validation, shared-state directory checks, and commit-gate control-flow analysis in the existing dependency-free CLI/plugin modules.

**Tech Stack:** Node.js built-ins, `node:test`, TypeScript OpenCode plugin, Markdown adapters, pnpm scripts.

## Global Constraints

- Support Windows, Linux, and macOS without shell-specific implementation code.
- Existing adapter files and customized valid manifest fields survive init unless `--force` is supplied.
- Use only documented runtime-native adapter locations.
- No native provider/model launcher implementation.
- No unrelated application formatting changes.
- Every behavior change has a fixture regression test before implementation.

---

### Task 1: Runtime-native adapter scaffolding

**Files:**

- Modify: `tools/harness/scripts/harness.mjs`
- Modify: `tools/harness/scripts/harness.test.mjs`
- Modify: `agents/orchestration-runtime-adapters.md`

**Interfaces:**

- `initialize(target, force)` creates `.codex/skills`, `.claude/commands`, and `.pi/prompts`.
- Codex files are `.codex/skills/harness-<command>/SKILL.md`.
- Claude and Pi files are `harness-<command>.md` under their command/prompt directories.
- Existing files are preserved unless `force === true`.

- [ ] **Step 1: Write failing fixture assertions**

Extend the initialized fixture test to require `harness-init` and `harness-orchestrate` adapters at each runtime-native path; assert each orchestration adapter contains its runtime name.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "init creates"`

Expected: failure because `initialize()` currently creates only `.harness/**`.

- [ ] **Step 3: Implement minimal adapter generation**

Add a runtime map and adapter template. Create each runtime directory, then write only missing adapter files unless `force` is true. Codex `SKILL.md` files include valid skill frontmatter; Claude/Pi files include supported descriptions and portable `pnpm harness:*` instructions.

- [ ] **Step 4: Run the focused test and verify success**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "init creates"`

Expected: pass with all runtime-native adapters present.

- [ ] **Step 5: Update runtime documentation**

Document the three native locations and their preservation behavior in `agents/orchestration-runtime-adapters.md`.

### Task 2: Context discovery and manifest preservation

**Files:**

- Modify: `tools/harness/scripts/harness.mjs`
- Modify: `tools/harness/scripts/harness.test.mjs`

**Interfaces:**

- Workspace source discovery includes `<workspace>/src` and `<workspace>/scripts`.
- Existing valid `manifest.json` is merged with refreshed `verification.commands` only.

- [ ] **Step 1: Write failing fixtures**

Add one fixture that changes `apps/web/scripts/generate.mjs` and expects `context --check` to fail. Add another that customizes manifest policies/state paths, changes package scripts, reruns init, and asserts custom fields survive while verification commands refresh.

- [ ] **Step 2: Run fixtures and verify failure**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "application script|custom manifest"`

Expected: failure because app scripts are not discovered and init overwrites the manifest.

- [ ] **Step 3: Implement discovery and merge behavior**

Add workspace script roots to `discoverSourceFiles()`. Replace unconditional manifest writes with a merge that preserves valid existing fields and refreshes only package-derived verification commands; preserve invalid existing manifests so validation can report them.

- [ ] **Step 4: Run fixtures and verify success**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "application script|custom manifest"`

Expected: pass.

### Task 3: Validation hardening

**Files:**

- Modify: `tools/harness/scripts/harness.mjs`
- Modify: `tools/harness/scripts/harness.test.mjs`

**Interfaces:**

- External skill declarations require source, non-empty expected names, and matching lock/content hashes.
- State validation resolves directory paths from manifest state mappings and requires each target to be a directory.

- [ ] **Step 1: Write failing fixtures**

Add fixtures for `skills: [{}]` and for deleting `.harness/tasks` after init; assert `validate --min-score 100` exits nonzero and identifies the relevant lifecycle/state failure.

- [ ] **Step 2: Run fixtures and verify failure**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "external skill declaration|shared-state directory"`

Expected: failure because current structural validation accepts empty declarations and ignores directories.

- [ ] **Step 3: Implement strict declaration and directory checks**

Extend `validJsonArtifact()` for external skills. Add directory checks using manifest-declared paths, with explicit missing/invalid reporting in the state subsystem.

- [ ] **Step 4: Run fixtures and verify success**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "external skill declaration|shared-state directory"`

Expected: pass.

### Task 4: Commit guard control flow

**Files:**

- Modify: `.opencode/plugins/harness-guard.ts`
- Modify: `tools/harness/scripts/harness.test.mjs`

**Interfaces:**

- Guard recognizes newline-separated commands.
- A gate is sufficient only when both gates occur in a safe `&&` chain before commit; `|| true`, semicolon, and post-commit gates are guarded.

- [ ] **Step 1: Write failing guard fixtures**

Add runtime-plugin tests for `echo x\ngit commit -m x` and `pnpm harness:validate || true; pnpm harness:context:check || true; git commit -m x`; assert both receive the required prefix.

- [ ] **Step 2: Run fixtures and verify failure**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "Harness guard"`

Expected: failure for newline and masked-gate commands.

- [ ] **Step 3: Implement conservative control-flow recognition**

Include `\n` in command separators. Treat gates as satisfied only when the pre-commit prefix contains both gate commands, contains `&&`, and contains no `||`, `;`, or newline control separators. Otherwise prepend both gates.

- [ ] **Step 4: Run fixtures and verify success**

Run: `node --test tools/harness/scripts/harness.test.mjs --test-name-pattern "Harness guard"`

Expected: pass.

### Task 5: Full verification and artifact refresh

**Files:**

- Regenerate: `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`

- [ ] **Step 1: Run complete harness tests**

Run: `pnpm harness:test`

Expected: all tests pass with only the platform-specific symlink test skipped on Windows.

- [ ] **Step 2: Regenerate and check context artifacts**

Run: `pnpm harness:context && pnpm harness:context:check`

Expected: current graph and report.

- [ ] **Step 3: Run harness validation**

Run: `pnpm harness:validate`

Expected: `100/100`.

- [ ] **Step 4: Review diff and changed-file formatting**

Run: `git diff --check` and Prettier on changed files only. Confirm no unrelated application files changed.
