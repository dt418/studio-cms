# Development Workflow Guide

This guide covers the development workflow for the StudioCMS Blog project.

## Prerequisites

- Node.js 20+ installed
- pnpm package manager installed (`npm install -g pnpm`)
- Git installed

## Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd danhthanh.dev

# Install dependencies
pnpm install

# Set up environment variables
cp .env.demo .env

# Run database migrations
pnpm migrate

# Start the development server
pnpm dev
```

Open `http://localhost:4321` in your browser.

## Development Commands

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start development server with hot reload |
| `pnpm build`     | Build for production (includes Pagefind) |
| `pnpm preview`   | Preview production build locally         |
| `pnpm migrate`   | Run database migrations                  |
| `pnpm studiocms` | StudioCMS CLI tools                      |
| `pnpm test`      | Run unit tests (Vitest)                  |
| `pnpm test:watch`| Run tests in watch mode                  |
| `pnpm lint`      | Check for lint errors                    |
| `pnpm lint:fix`  | Auto-fix lint issues                     |
| `pnpm format`    | Format code with Prettier                |
| `pnpm format:check` | Check formatting without modifying    |
| `pnpm typecheck` | Run TypeScript type checking             |
| `pnpm check`     | Run all checks (lint + format + test + typecheck) |

## Code Quality

### Linting

ESLint flat config with TypeScript + Astro + Prettier integration.

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint issues
pnpm lint:fix
```

**Key rules:**
- No `any` types
- No unused variables (except `_` prefix)
- Identifier names min 2 chars
- Always use curly braces
- Strict equality (`===` / `!==`)
- `prefer-const` enforced

### Formatting

Prettier with Astro plugin.

```bash
# Format code with Prettier
pnpm format

# Check formatting without modifying
pnpm format:check
```

**Config:** semi: false, singleQuote: true, trailingComma: es5, printWidth: 100

### Type Checking

```bash
# Run TypeScript type checking
pnpm typecheck
```

### Full Check Pipeline

```bash
# Run all checks in sequence
pnpm check
```

Runs: lint → format:check → test → typecheck

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

Tests are in `src/**/*.test.ts`. Test helpers at `src/test-helpers.ts`.

## Git Hooks (Lefthook)

Automated checks run on git operations:

| Hook | When | Commands |
|------|------|----------|
| `commit-msg` | On commit | commitlint (validate message format) |
| `pre-commit` | On commit | ESLint (auto-fix) + TypeScript check |
| `pre-push` | On push | Tests + Full build |

### Commit Message Format

Uses [Conventional Commits](https://www.conventionalcommits.org/):

```
type: subject (max 72 chars)

[optional body]
```

**Allowed types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style (formatting, no logic change)
- `refactor` — Code refactoring
- `test` — Test additions or changes
- `chore` — Maintenance tasks
- `ci` — CI/CD changes
- `perf` — Performance improvements
- `revert` — Revert a previous commit

**Examples:**
```
feat: add hybrid search with Pagefind and Fuse.js
fix: resolve filter bug in BlogFilter
docs: update development workflow guide
refactor: extract search logic to TypeScript module
test: add unit tests for filterPosts
chore: add commitlint and lefthook integration
```

## Coding Conventions

### File Naming

- Components: `PascalCase` (e.g., `BlogPost.astro`)
- Utils/Libs: `camelCase` (e.g., `filter.ts`, `search.ts`)
- Type files: `*.types.ts` suffix
- Test files: `*.test.ts`

### TypeScript

- No `any` types — use proper type definitions
- Use `interface` for public APIs, `type` for unions/intersections
- Enable strict mode in `tsconfig.json`
- Extract complex logic from `.astro` to `.ts` files

### Astro Components

- Keep `<script>` blocks minimal — import from `.ts` files
- Use CSS component classes (not inline utilities)
- Follow design tokens from `global.css`

### Git Workflow

1. Create a feature branch from `main`
2. Make changes with descriptive conventional commits
3. Push and create a pull request
4. Ensure CI checks pass (lint, format, test, typecheck)

## Project Structure

```
├── astro.config.mjs          # Astro + integrations config
├── studiocms.config.mjs      # StudioCMS plugins config
├── eslint.config.js          # ESLint flat config
├── commitlint.config.js      # Conventional commit rules
├── lefthook.yml              # Git hooks configuration
├── vitest.config.ts          # Vitest test config
├── .prettierrc               # Prettier formatting rules
├── .prettierignore           # Prettier ignore patterns
├── scripts/
│   └── generate-search-index.mjs  # Pagefind index generator
├── src/
│   ├── lib/                  # Utility modules (filter.ts, search.ts, etc.)
│   │   ├── filter.ts         # Post filtering/sorting logic
│   │   ├── filter.test.ts    # Tests for filter
│   │   ├── group.ts          # Post grouping logic
│   │   ├── group.test.ts     # Tests for group
│   │   └── search.ts         # Hybrid search (Pagefind + Fuse.js)
│   ├── components/           # Astro components
│   │   ├── Search.astro      # Search UI (minimal, imports from lib/search.ts)
│   │   └── Blog/             # Blog-specific components
│   ├── pages/                # Route pages
│   ├── content/posts/        # Markdown blog posts
│   ├── styles/               # Global CSS + design tokens
│   ├── layouts/              # Page layouts
│   └── test-helpers.ts       # Test factory functions
├── docs/                     # Documentation
└── agents/                   # Agent definitions
```

## Related Topics

- [Architecture Overview](../reference/architecture.md)
- [Coding Conventions](../contributing/conventions.md)
- [Troubleshooting](../../README.md#troubleshooting)
