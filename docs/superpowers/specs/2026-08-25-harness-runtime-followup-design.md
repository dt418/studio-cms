# Harness Runtime Follow-up Design

## Goal

Make `harness:init` generate portable runtime adapter entrypoints for Codex, Claude,
and Pi, while closing the five findings from the latest Codex review of the merged
harness implementation.

## Scope

### Runtime adapter generation

`harness:init` creates runtime-native adapter locations when absent:

- Codex: `.codex/skills/harness-<command>/SKILL.md`
- Claude Code: `.claude/commands/harness-<command>.md`
- Pi: `.pi/prompts/harness-<command>.md`

The generated command set is:

- `context`
- `documentation-sync`
- `init`
- `orchestrate`
- `status`
- `validate`
- `verify`

Codex uses the legacy-compatible `.codex/skills` location because current Codex
supports Skills rather than a `.codex/commands` registry. Pi uses its current
prompt-template location, `.pi/prompts`. Claude's existing `.claude/commands`
format remains supported. Existing adapter files are preserved unless `--force` is
supplied. No provider-specific model launcher is added.

### Context discovery

Source discovery includes each workspace's `src/` and `scripts/` directories, so
build-producing scripts such as `apps/web/scripts/generate-agent-skills-index.mjs`
participate in the context fingerprint.

### Manifest preservation

Re-running `harness:init` refreshes only the package-derived verification command list
in an existing valid manifest. Existing policies, state paths, custom verification
fields, and other manifest fields remain unchanged. `--force` may replace the full
manifest with defaults. Invalid existing manifests are not silently overwritten.

### External skill validation

The validator rejects malformed external skill declarations. Every declaration must
have a non-empty `source`, a non-empty string `expected` list, and matching non-empty
`lockHashes` and `contentHashes` entries for every expected skill.

### Shared-state validation

The state subsystem validates that the manifest-declared `tasks`, `decisions`,
`patches`, `reviews`, and `reports` targets exist as directories. Custom manifest
paths are checked rather than replaced with hardcoded defaults.

### Commit guard control flow

The OpenCode harness guard treats a gate as sufficient only when both required checks
occur in a successful `&&` chain directly leading to `git commit`. Gates followed by
`|| true`, separated by `;`, or placed after the commit are not sufficient. Command
boundaries include newline separators.

## Non-goals

- Native Codex, Claude, or Pi process launching.
- Provider-specific authentication, model selection, or client configuration.
- Reformatting unrelated existing application files.

## Acceptance criteria

1. A fresh fixture running `harness:init` contains runtime-native Codex, Claude, and
   Pi adapter trees with runtime-specific orchestration instructions.
2. Re-running init preserves customized manifest policy and state fields while
   refreshing package-derived commands.
3. Context check fails after changing an application script.
4. Validation fails for malformed skill declarations and missing shared-state
   directories.
5. Multiline commit commands and masked-gate command chains are guarded.
6. Existing harness tests plus new fixture tests pass on Windows, macOS, and Linux.
7. `harness:context:check` passes after generated artifacts are regenerated.
