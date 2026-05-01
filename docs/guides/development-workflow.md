# Development Workflow Guide

This guide covers the development workflow for the danhthanh.dev monorepo.

## Prerequisites

- Node.js 22+ installed
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

# Run CMS database migrations
pnpm cms:migrate

# Start the development server
pnpm dev
```

Open `http://localhost:4321` for the public web app. Run `pnpm cms:dev` and open `http://localhost:4322/studiocms` for the CMS dashboard.

## Development Commands

| Command              | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `pnpm dev`           | Start the public web dev server                              |
| `pnpm web:dev`       | Start `apps/web` on port 4321                                |
| `pnpm cms:dev`       | Start `apps/cms` on port 4322                                |
| `pnpm build`         | Build web and CMS with Turborepo                             |
| `pnpm web:build`     | Build the static web app                                     |
| `pnpm cms:build`     | Build the StudioCMS SSR app                                  |
| `pnpm preview`       | Preview the web production build locally                     |
| `pnpm cms:migrate`   | Run StudioCMS database migrations                            |
| `pnpm studiocms`     | StudioCMS CLI tools                                          |
| `pnpm test`          | Run web unit tests (Vitest)                                  |
| `pnpm test:watch`    | Run tests in watch mode                                      |
| `pnpm test:e2e`      | Run E2E tests (Playwright)                                   |
| `pnpm lint`          | Check for lint errors                                        |
| `pnpm lint:patterns` | Check project-specific forbidden patterns                    |
| `pnpm lint:fix`      | Auto-fix lint issues                                         |
| `pnpm format`        | Format code with Prettier                                    |
| `pnpm format:check`  | Check formatting without modifying                           |
| `pnpm typecheck`     | Run TypeScript type checking                                 |
| `pnpm check`         | Run all checks (patterns + lint + format + test + typecheck) |

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
- `z.string().url()` is blocked; use `z.url()` for Zod URL schemas
- Astro `<script>` tags with `set:html` must include `is:inline`

### Pattern Linting

`pnpm lint:patterns` catches repo-specific regressions that standard ESLint and Astro typecheck may
only report as warnings or hints.

Current guards:

- Deprecated Zod URL validation: use `z.url()`, not `z.string().url()`.
- Astro script injection: use `is:inline` on `<script>` tags that inject JSON or JSON-LD with
  `set:html`.

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

Runs: lint:patterns → lint → format:check → test → typecheck

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

Unit tests are in `apps/web/src/**/*.test.ts`. Test helpers are in `apps/web/src/test-helpers.ts`.

## Git Hooks (Lefthook)

Automated checks run on git operations:

| Hook         | When      | Commands                                           |
| ------------ | --------- | -------------------------------------------------- |
| `commit-msg` | On commit | commitlint (validate message format)               |
| `pre-commit` | On commit | lint, typecheck, and format check for staged files |
| `pre-push`   | On push   | Tests + full build                                 |

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
- Follow design tokens from `apps/web/src/styles/*.css`

### Git Workflow

1. Create a feature branch from `main`
2. Make changes with descriptive conventional commits
3. Push and create a pull request
4. Ensure CI checks pass (lint, format, test, typecheck)

## Project Structure

```
├── apps/
│   ├── web/                  # Static Astro public site
│   │   ├── astro.config.mjs
│   │   ├── scripts/          # OG image and search index generation
│   │   └── src/
│   │       ├── lib/          # Utility modules and unit tests
│   │       ├── components/   # Astro and React components
│   │       ├── pages/        # Route pages
│   │       ├── content/posts/# Markdown and MDX blog posts
│   │       ├── styles/       # Tailwind entrypoint and token modules
│   │       ├── layouts/      # Page layouts
│   │       └── test-helpers.ts
│   └── cms/                  # StudioCMS SSR admin/API app
│       ├── astro.config.mjs
│       ├── studiocms.config.mjs
│       └── src/
├── pnpm-workspace.yaml       # Workspace package boundaries
├── turbo.json                # Turborepo task graph
├── eslint.config.js          # ESLint flat config
├── commitlint.config.js      # Conventional commit rules
├── lefthook.yml              # Git hooks configuration
├── playwright.config.ts      # Playwright E2E test config
├── .prettierrc               # Prettier formatting rules
├── .prettierignore           # Prettier ignore patterns
├── docs/                     # Documentation
├── e2e/                      # Playwright E2E tests
└── agents/                   # Agent definitions
```

## Related Topics

- [Architecture Overview](../reference/architecture.md)
- [Coding Conventions](../contributing/conventions.md)
- [Troubleshooting](../../README.md#troubleshooting)
