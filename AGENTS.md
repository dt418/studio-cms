# AGENTS.md — StudioCMS Blog

This project includes agent definitions in the `agents/` directory.

## Where to find agents

| Folder        | What                                                        |
|---------------|-------------------------------------------------------------|
| `agents/`     | Markdown agent definitions                                  |
| `.claude/agents/` | Claude Code subagents (internal tooling)                |

## Agent shape (markdown frontmatter)

```markdown
---
name: tutor
model: anthropic/claude-haiku-4-5
channels: [telegram, discord, web]
group: education
skills:
  - name: explain
    price: 0.01
    tags: [education, explain]
sensitivity: 0.6
---

You are a patient tutor...
```

## See also

- `agents/README.md` — inventory of agents in this release
- `one/dictionary.md` — canonical names and vocabulary
- `one/lifecycle.md` — agent lifecycle patterns
- `one/patterns.md` — core patterns
