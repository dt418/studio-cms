# Coding Conventions

This document outlines the coding conventions for the danhthanh.dev monorepo.

## General Principles

- **KISS**: Keep it simple, stupid
- **DRY**: Don't repeat yourself
- **YAGNI**: You aren't gonna need it
- **Readability first**: Code is read more often than written

## Naming Conventions

| Type                | Convention                   | Example                          |
| ------------------- | ---------------------------- | -------------------------------- |
| Components          | PascalCase                   | `BlogPost.astro`, `Header.astro` |
| Utils/Libs          | camelCase                    | `filter.ts`, `search.ts`         |
| Type files          | `.types.ts` suffix           | `post.types.ts`                  |
| Variables/Functions | camelCase, verb-noun pattern | `getUserPosts()`, `formatDate()` |
| Constants           | UPPER_SNAKE_CASE             | `MAX_POSTS_PER_PAGE`             |
| Test files          | `*.test.ts` suffix           | `filter.test.ts`                 |

## TypeScript

- **No `any`**: Use proper type definitions
- **Interfaces for public APIs**: Use `interface` for exported types
- **Types for unions/intersections**: Use `type` for complex types
- **Consistent type imports**: Use `import type` for type-only imports
- **No unused vars**: Allowed unused vars must match `/^_/u` pattern
- **Explicit types**: All function parameters and return types must be typed (except in `.astro` script blocks)

## React/Astro Components

- Functional components only
- Define proper prop types with TypeScript
- Extract complex logic to `.ts` files (keep `.astro` scripts minimal)
- Immutable state updates (use spread operator, never mutate directly)
- Clear conditional rendering patterns

## Code Quality Rules

| Rule                  | Description                                   |
| --------------------- | --------------------------------------------- |
| No long functions     | Keep functions under 50 lines                 |
| No deep nesting       | Max 4 levels, use early returns               |
| No magic numbers      | Use named constants                           |
| Comments explain WHY  | Not WHAT (code shows what)                    |
| JSDoc for public APIs | Document exported functions                   |
| Identifier length     | Min 2 chars (exceptions: i, j, k, e, x, y, z) |
| Curly braces          | Always required on if/else/for/while          |
| Strict equality       | Use `===` and `!==` always                    |

## Testing

- **Framework**: Vitest
- **Pattern**: AAA (Arrange, Act, Assert)
- **Descriptive test names**: Should do X when Y
- **Test files**: Next to source files (`*.test.ts`)
- **Test helpers**: `apps/web/src/test-helpers.ts` for factory functions
- **Coverage target**: 80%+ on critical paths

## Git Conventions

- **Commit format**: Conventional Commits (`type: subject`)
- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `revert`
- **Subject max length**: 72 characters
- **One logical change per commit**
- **Feature branches from `main`**

## Pre-commit / Pre-push Hooks

Managed by Lefthook:

| Hook         | Commands                    | Description                               |
| ------------ | --------------------------- | ----------------------------------------- |
| `commit-msg` | commitlint                  | Validate conventional commit format       |
| `pre-commit` | lint + typecheck (parallel) | ESLint + TypeScript check on staged files |
| `pre-push`   | test + build (parallel)     | Run tests + full build before push        |

## Related Topics

- [Development Workflow](../guides/development-workflow.md)
- [Architecture Overview](../reference/architecture.md)
