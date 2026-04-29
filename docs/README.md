# Documentation

danhthanh.dev monorepo documentation, organized following the [Diátaxis framework](https://diataxis.fr/). Start with the root README for local setup, then use the guides for task-based workflows and the reference docs for system details.

## Structure

```
docs/
├── guides/         # Task-oriented how-to guides
│   ├── component-usage.md
│   ├── content-management.md
│   ├── deployment.md
│   └── development-workflow.md
├── reference/      # Information-oriented reference docs
│   ├── architecture.md
│   ├── design-system.md
│   └── environment-variables.md
└── contributing/   # Contributor guidelines
    └── conventions.md
```

## Quick Links

- [Quick Start](../README.md#quick-start)
- [Tech Stack](../README.md#tech-stack)
- [Available Routes](../README.md#available-routes)
- [Design System](./reference/design-system.md)
- [Component Usage](./guides/component-usage.md)
- [Troubleshooting](../README.md#troubleshooting)

## Recommended Reading Path

1. [Quick Start](../README.md#quick-start) to install dependencies, configure `.env`, run migrations, and start local apps.
2. [Development Workflow](./guides/development-workflow.md) for commands, tests, formatting, and git hooks.
3. [Architecture Overview](./reference/architecture.md) to understand the `apps/web` and `apps/cms` split.
4. [Deployment Guide](./guides/deployment.md) when preparing separate static web and Node SSR CMS deployments.

## Guides

- [Component Usage](./guides/component-usage.md)
- [Content Management](./guides/content-management.md)
- [Deployment](./guides/deployment.md)
- [Development Workflow](./guides/development-workflow.md)

## Reference

- [Architecture](./reference/architecture.md)
- [Design System](./reference/design-system.md)
- [Environment Variables](./reference/environment-variables.md)

## Contributing

- [Coding Conventions](./contributing/conventions.md)
