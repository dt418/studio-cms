<h1 align="center">danhthanh.dev</h1>

<p align="center">
  <strong>A Turborepo monorepo with an Astro static blog and a separate StudioCMS SSR app.</strong>
</p>

<p align="center">
  <a href="https://github.com/dt418/studio-cms/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

---

A fast public blog built as static Astro output, plus a separate StudioCMS dashboard/API app for CMS-managed content and administration.

```bash
pnpm install && pnpm dev
```

---

## Quick start

```bash
# Clone the repository
git clone https://github.com/dt418/studio-cms.git
cd studio-cms

# Install dependencies
pnpm install

# Set up environment variables
cp .env.demo .env

# Run CMS database migrations
pnpm cms:migrate

# Start the development server
pnpm dev
```

Open `http://localhost:4321` in your browser for the public site. Run `pnpm cms:dev` and visit `http://localhost:4322/studiocms` for the CMS app.

---

## Tech Stack

| Layer           | Technology                                                               |
| --------------- | ------------------------------------------------------------------------ |
| **Monorepo**    | pnpm workspaces + Turborepo                                              |
| **Web**         | Astro 6 static build                                                     |
| **CMS**         | StudioCMS 0.4 on Astro SSR + Node adapter (md + blog plugins only)       |
| **Database**    | libSQL (local file or Turso remote)                                      |
| **Styling**     | Tailwind CSS 4 + shadcn/ui (web only)                                    |
| **Search**      | Pagefind (build-time) + Fuse.js (client-side)                            |
| **Testing**     | Vitest (unit) + Playwright (E2E)                                         |
| **Linting**     | ESLint (flat config) + Prettier                                          |
| **Git Hooks**   | Lefthook + commitlint                                                    |
| **Auth**        | OAuth (GitHub + Google)                                                  |
| **Markdown**    | remark-gfm → rehype-slug → rehype-autolink-headings → rehype-pretty-code |
| **Code Blocks** | Expressive Code + TwoSlash                                               |

---

## Available Routes

| Route             | Description                            |
| ----------------- | -------------------------------------- |
| `/`               | Home page                              |
| `/blog`           | Blog listing                           |
| `/blog/:slug`     | Individual blog post                   |
| `/search`         | Search page (Pagefind + Fuse.js)       |
| `/rss.xml`        | RSS feed                               |
| `/studiocms`      | CMS dashboard in `apps/cms`            |
| `/studiocms-blog` | CMS-managed blog content in `apps/cms` |

---

## Project Structure

```
├── apps/
│   ├── web/                  # Static Astro public site
│   │   ├── astro.config.mjs
│   │   ├── src/              # Blog pages, components, content, tests
│   │   ├── public/           # Static assets
│   │   └── scripts/          # OG image and search index generation
│   └── cms/                  # StudioCMS SSR admin/API app
│       ├── astro.config.mjs
│       ├── studiocms.config.mjs
│       └── src/              # CMS routes, renderer, styles
├── pnpm-workspace.yaml       # Workspace package boundaries
├── turbo.json                # Turborepo task graph
├── eslint.config.js          # ESLint flat config
├── commitlint.config.js      # Conventional commit rules
├── lefthook.yml              # Git hooks configuration
├── playwright.config.ts      # Playwright E2E test config
├── .prettierrc               # Prettier formatting rules
├── .prettierignore           # Prettier ignore patterns
├── e2e/                      # Playwright E2E tests
│   ├── pages/                # Page-level E2E tests
│   ├── components/           # Component E2E tests
│   ├── fixtures/             # Test fixtures
│   └── utils/                # Test utilities
├── docs/                     # Documentation
├── tender-series/            # Blog content files
├── agents/                   # Agent definitions (markdown)
├── skills/                   # Skills for agents
├── rules/                    # Project rules and guidelines
└── .claude/                  # Claude Code commands and skills
```

---

## Development Commands

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Start the public web dev server                   |
| `pnpm web:dev`      | Start `apps/web` on port 4321                     |
| `pnpm cms:dev`      | Start `apps/cms` on port 4322                     |
| `pnpm build`        | Build web and CMS with Turborepo                  |
| `pnpm web:build`    | Build the static web app                          |
| `pnpm cms:build`    | Build the StudioCMS SSR app                       |
| `pnpm preview`      | Preview the web production build locally          |
| `pnpm cms:migrate`  | Run StudioCMS database migrations                 |
| `pnpm studiocms`    | StudioCMS CLI tools                               |
| `pnpm test`         | Run web unit tests (Vitest)                       |
| `pnpm test:watch`   | Run tests in watch mode                           |
| `pnpm test:e2e`     | Run E2E tests (Playwright)                        |
| `pnpm test:e2e:ui`  | Run E2E tests with UI mode                        |
| `pnpm lint`         | Check for lint errors                             |
| `pnpm lint:fix`     | Auto-fix lint issues                              |
| `pnpm format`       | Format code with Prettier                         |
| `pnpm format:check` | Check formatting without modifying                |
| `pnpm typecheck`    | Run TypeScript type checking                      |
| `pnpm check`        | Run all checks (lint + format + test + typecheck) |

---

## Content Management

StudioCMS supports Markdown blog posts via the `@studiocms/md` and `@studiocms/blog` plugins.

Public blog posts live in `apps/web/src/content/posts`. StudioCMS content is created and managed via the CMS app dashboard at `/studiocms`.

---

## Deployment

### Production Build

```bash
pnpm install
pnpm build
```

Deploy `apps/web/dist` as the public static site. Deploy `apps/cms` separately as a Node SSR app.

```bash
pnpm cms:migrate
pnpm cms:build
node apps/cms/dist/server/entry.mjs
```

### Environment Variables

See `.env.demo` for a template. Required variables:

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `CMS_LIBSQL_URL`     | `file:./libsql.db` or Turso URL      |
| `CMS_ENCRYPTION_KEY` | Generate: `openssl rand --base64 16` |
| `PUBLIC_SITE_URL`    | Public web URL                       |
| `CMS_SITE_URL`       | CMS/admin app URL                    |

For production, configure OAuth credentials and set `PUBLIC_SITE_URL` to your domain.

See the [Deployment Guide](docs/guides/deployment.md) for full instructions.

---

## Troubleshooting

| Issue               | Solution                                             |
| ------------------- | ---------------------------------------------------- |
| Database not found  | Run `pnpm cms:migrate` to initialize                 |
| OAuth login fails   | Verify callback URLs match your domain               |
| Port already in use | Set `PORT=xxxx` env var or kill the existing process |
| Build fails         | Run `pnpm typecheck` and `pnpm lint` to diagnose     |
| Tests fail          | Run `pnpm test` to see which tests failed            |
| Commit rejected     | Use Conventional Commits format: `type: subject`     |

---

## Documentation

| Document                                                         | What you'll learn            |
| ---------------------------------------------------------------- | ---------------------------- |
| [Getting Started](#quick-start)                                  | Set up and run locally       |
| [Architecture](docs/reference/architecture.md)                   | System architecture overview |
| [Environment Variables](docs/reference/environment-variables.md) | All config options           |
| [Development Workflow](docs/guides/development-workflow.md)      | Commands, testing, git hooks |
| [Content Management](docs/guides/content-management.md)          | Using the CMS dashboard      |
| [Deployment](docs/guides/deployment.md)                          | Production deployment steps  |
| [Coding Conventions](docs/contributing/conventions.md)           | Code style and standards     |

---

## License

MIT — see [LICENSE](LICENSE).
