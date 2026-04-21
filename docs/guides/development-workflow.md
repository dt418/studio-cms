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
| `pnpm build`     | Build for production                     |
| `pnpm preview`   | Preview production build locally         |
| `pnpm migrate`   | Run database migrations                  |
| `pnpm studiocms` | StudioCMS CLI tools                      |

## Code Quality

### Linting

```bash
# Check for lint errors
pnpm lint

# Auto-fix lint issues
pnpm lint:fix
```

### Formatting

```bash
# Format code with Prettier
pnpm format

# Check formatting without modifying
pnpm format:check
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm typecheck
```

## Pre-commit Hooks

This project uses Lefthook to run automated checks on commit:

- **ESLint**: Auto-fixes lint issues on staged JS/TS files
- **Prettier**: Auto-formats staged files
- **TypeScript**: Validates types on staged TS files

All fixes are automatically staged after hooks run, so you don't need to manually re-stage.

## Coding Conventions

### File Naming

- Components: `PascalCase` (e.g., `BlogPost.astro`)
- Utils/Hooks: `camelCase` (e.g., `useAuth.js`)
- Type files: `*.types.ts` suffix

### TypeScript

- No `any` types — use proper type definitions
- Use `interface` for public APIs, `type` for unions/intersections
- Enable strict mode in `tsconfig.json`

### React/Astro Components

- Use functional components
- Define proper prop types
- Use custom hooks for reusable logic
- Never mutate state directly — use spread operator

### Git Workflow

1. Create a feature branch from `main`
2. Make changes with descriptive commits
3. Push and create a pull request
4. Ensure CI checks pass (lint, format, typecheck)

## Project Structure

```
├── astro.config.mjs          # Astro + integrations config
├── studiocms.config.mjs      # StudioCMS plugins config
├── eslint.config.js          # ESLint configuration
├── lefthook.yml              # Pre-commit hooks configuration
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Prettier ignore patterns
├── src/
│   ├── lang-flags-icons.js   # Custom icon collection
│   └── styles/               # CSS files
├── docs/                     # Documentation
└── tender-series/            # Blog content files
```

## Related Topics

- [Architecture Overview](../reference/architecture.md)
- [Coding Conventions](../contributing/conventions.md)
- [Troubleshooting](../../README.md#troubleshooting)
