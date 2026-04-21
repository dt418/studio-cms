# Coding Conventions

This document outlines the coding conventions for the StudioCMS Blog project.

## General Principles

- **KISS**: Keep it simple, stupid
- **DRY**: Don't repeat yourself
- **YAGNI**: You aren't gonna need it
- **Readability first**: Code is read more often than written

## Naming Conventions

| Type                | Convention                   | Example                          |
| ------------------- | ---------------------------- | -------------------------------- |
| Components          | PascalCase                   | `BlogPost.astro`, `Header.astro` |
| Utils/Hooks         | camelCase                    | `formatDate.js`, `useAuth.js`    |
| Type files          | `.types.ts` suffix           | `post.types.ts`                  |
| Variables/Functions | camelCase, verb-noun pattern | `getUserPosts()`, `formatDate()` |
| Constants           | UPPER_SNAKE_CASE             | `MAX_POSTS_PER_PAGE`             |

## TypeScript

- **No `any`**: Use proper type definitions
- **Interfaces for public APIs**: Use `interface` for exported types
- **Types for unions/intersections**: Use `type` for complex types
- **Consistent type imports**: Use `import type` for type-only imports

## React/Astro Components

- Functional components only
- Define proper prop types with TypeScript
- Use custom hooks for reusable logic
- Immutable state updates (use spread operator, never mutate directly)
- Clear conditional rendering patterns

## Code Quality Rules

| Rule                  | Description                     |
| --------------------- | ------------------------------- |
| No long functions     | Keep functions under 50 lines   |
| No deep nesting       | Max 4 levels, use early returns |
| No magic numbers      | Use named constants             |
| Comments explain WHY  | Not WHAT (code shows what)      |
| JSDoc for public APIs | Document exported functions     |

## Testing

- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive test names**: Should do X when Y
- **Test files**: Next to source files or in `__tests__/`

## Git Conventions

- Descriptive commit messages
- One logical change per commit
- Feature branches from `main`

## Related Topics

- [Development Workflow](../guides/development-workflow.md)
- [Architecture Overview](../reference/architecture.md)
