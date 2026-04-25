<h1 align="center">StudioCMS Blog</h1>

<p align="center">
  <strong>A personal blog built with Astro 5 and StudioCMS — SSR, libSQL, multi-language.</strong>
</p>

<p align="center">
  <a href="https://github.com/dt418/studio-cms/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

---

A fast, database-backed blog with a full CMS dashboard, OAuth login, and support for Markdown, MDX, HTML, Markdoc, and WYSIWYG editing.

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

# Run database migrations
pnpm migrate

# Start the development server
pnpm dev
```

Open `http://localhost:4321` in your browser. Visit `/studiocms` to create your admin account.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| **Framework** | Astro 5 (SSR, Node adapter)           |
| **CMS**       | StudioCMS 0.4                         |
| **Database**  | libSQL (local file or Turso remote)   |
| **Styling**   | Tailwind CSS 4 + @studiocms/ui        |
| **Search**    | Pagefind (build-time) + Fuse.js (client-side) |
| **Testing**   | Vitest (unit) + Playwright (E2E)      |
| **Linting**   | ESLint (flat config) + Prettier       |
| **Git Hooks** | Lefthook + commitlint                 |
| **Auth**      | OAuth (GitHub + Google)               |
| **Markdown**  | remark-gfm → rehype-slug → rehype-autolink-headings → rehype-pretty-code |
| **Code Blocks** | Expressive Code + TwoSlash           |

---

## Available Routes

| Route            | Description                          |
|------------------|--------------------------------------|
| `/`              | Home page                            |
| `/blog`          | Blog listing                         |
| `/blog/:slug`    | Individual blog post                 |
| `/search`        | Search page (Pagefind + Fuse.js)     |
| `/blog/rss.xml`  | RSS feed                             |
| `/studiocms`     | CMS dashboard (admin)                |
| `/studiocms-blog`| CMS-managed blog content             |

---

## Project Structure

```
├── astro.config.mjs          # Astro + integrations config
├── studiocms.config.mjs      # StudioCMS plugins config
├── eslint.config.js          # ESLint flat config
├── commitlint.config.js      # Conventional commit rules
├── lefthook.yml              # Git hooks configuration
├── vitest.config.ts          # Vitest test config
├── playwright.config.ts      # Playwright E2E test config
├── .prettierrc               # Prettier formatting rules
├── .prettierignore           # Prettier ignore patterns
├── scripts/
│   └── generate-search-index.mjs  # Pagefind index generator
├── e2e/                      # Playwright E2E tests
│   ├── pages/                # Page-level E2E tests
│   ├── components/           # Component E2E tests
│   ├── fixtures/             # Test fixtures
│   └── utils/                # Test utilities
├── src/
│   ├── lib/                  # Utility modules
│   │   ├── filter.ts         # Post filtering/sorting logic
│   │   ├── filter.test.ts    # Tests for filter
│   │   ├── group.ts          # Post grouping logic
│   │   ├── group.test.ts     # Tests for group
│   │   └── search.ts         # Hybrid search (Pagefind + Fuse.js)
│   ├── components/           # Astro components
│   │   ├── Search.astro      # Search UI (imports from lib/search.ts)
│   │   └── Blog/             # Blog-specific components
│   ├── pages/                # Route pages
│   ├── content/posts/        # Markdown blog posts
│   ├── styles/               # Global CSS + design tokens
│   ├── layouts/              # Page layouts
│   └── test-helpers.ts       # Test factory functions
├── docs/                     # Documentation
├── tender-series/            # Blog content files
├── agents/                   # Agent definitions (markdown)
├── skills/                   # Skills for agents
├── rules/                    # Project rules and guidelines
└── .claude/                  # Claude Code commands and skills
```

---

## Development Commands

| Command          | Description                              |
|------------------|------------------------------------------|
| `pnpm dev`       | Start development server with hot reload |
| `pnpm build`     | Build for production (includes Pagefind) |
| `pnpm preview`   | Preview production build locally         |
| `pnpm migrate`   | Run database migrations                  |
| `pnpm studiocms` | StudioCMS CLI tools                      |
| `pnpm test`      | Run unit tests (Vitest)                  |
| `pnpm test:watch`| Run tests in watch mode                  |
| `pnpm test:e2e`  | Run E2E tests (Playwright)               |
| `pnpm test:e2e:ui`| Run E2E tests with UI mode            |
| `pnpm lint`      | Check for lint errors                    |
| `pnpm lint:fix`  | Auto-fix lint issues                     |
| `pnpm format`    | Format code with Prettier                |
| `pnpm format:check` | Check formatting without modifying    |
| `pnpm typecheck` | Run TypeScript type checking             |
| `pnpm check`     | Run all checks (lint + format + test + typecheck) |

---

## Content Management

StudioCMS supports multiple content formats out of the box:

| Format   | Use Case               |
|----------|------------------------|
| Markdown | Standard blog posts    |
| HTML     | Rich formatted content |
| MDX      | Interactive posts with React components |
| Markdoc  | Structured content     |
| WYSIWYG  | Visual editor for non-technical users |

Content is created and managed via the CMS dashboard at `/studiocms`.

---

## Deployment

### Production Build

```bash
pnpm install
pnpm migrate
pnpm build
node dist/server/entry.mjs
```

### Environment Variables

See `.env.demo` for a template. Required variables:

| Variable             | Description                          |
|----------------------|--------------------------------------|
| `CMS_LIBSQL_URL`     | `file:./libsql.db` or Turso URL      |
| `CMS_ENCRYPTION_KEY` | Generate: `openssl rand --base64 16` |

For production, configure OAuth credentials and set `SITE_URL` to your domain.

See the [Deployment Guide](docs/guides/deployment.md) for full instructions.

---

## Troubleshooting

| Issue                  | Solution                                           |
|------------------------|----------------------------------------------------|
| Database not found     | Run `pnpm migrate` to initialize                   |
| OAuth login fails      | Verify callback URLs match your domain             |
| Port already in use    | Set `PORT=xxxx` env var or kill the existing process |
| Build fails            | Run `pnpm typecheck` and `pnpm lint` to diagnose   |
| Tests fail             | Run `pnpm test` to see which tests failed          |
| Commit rejected        | Use Conventional Commits format: `type: subject`   |

---

## Documentation

| Document                              | What you'll learn                  |
|---------------------------------------|------------------------------------|
| [Getting Started](#quick-start)       | Set up and run locally             |
| [Architecture](docs/reference/architecture.md) | System architecture overview  |
| [Environment Variables](docs/reference/environment-variables.md) | All config options |
| [Development Workflow](docs/guides/development-workflow.md) | Commands, testing, git hooks |
| [Content Management](docs/guides/content-management.md) | Using the CMS dashboard |
| [Deployment](docs/guides/deployment.md) | Production deployment steps       |
| [Coding Conventions](docs/contributing/conventions.md) | Code style and standards |

---

## License

MIT — see [LICENSE](LICENSE).
