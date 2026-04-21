# StudioCMS Blog

Personal blog built with [Astro](https://astro.build) and [StudioCMS](https://docs.studiocms.dev) — a headful CMS with database-backed content management.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Plugins](#plugins)
- [Getting Started](#getting-started)
- [Available Routes](#available-routes)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Content Types](#content-types)
- [Custom Icons](#custom-icons)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Links](#links)

## Tech Stack

| Layer           | Tool                                  |
| --------------- | ------------------------------------- |
| **Framework**   | Astro 5 (SSR, Node adapter)           |
| **CMS**         | StudioCMS 0.4                         |
| **Database**    | Turso (libSQL)                        |
| **UI**          | @studiocms/ui + Tailwind CSS 4        |
| **Content**     | Markdown, HTML, MDX, Markdoc, WYSIWYG |
| **Code blocks** | Expressive Code + TwoSlash            |
| **Auth**        | GitHub & Google OAuth                 |

## Plugins

- `@studiocms/blog` — blog listing, post pages, RSS feed, sitemap
- `@studiocms/md` — Markdown content rendering
- `@studiocms/html` — HTML content rendering
- `@studiocms/mdx` — MDX support
- `@studiocms/markdoc` — Markdoc support
- `@studiocms/wysiwyg` — WYSIWYG editor
- `@studiocms/cfetch` — client-side content fetching

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.demo` to `.env` and fill in your values:

```bash
cp .env.demo .env
```

Required variables:

| Variable                   | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `CMS_LIBSQL_URL`           | Turso database URL or local `file:./libsql.db`   |
| `CMS_LIBSQL_AUTH_TOKEN`    | Turso auth token (optional for local)            |
| `CMS_ENCRYPTION_KEY`       | Auth encryption key (`openssl rand --base64 16`) |
| `CMS_GITHUB_CLIENT_ID`     | GitHub OAuth client ID                           |
| `CMS_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret                       |
| `CMS_GOOGLE_CLIENT_ID`     | Google OAuth client ID                           |
| `CMS_GOOGLE_CLIENT_SECRET` | Google OAuth client secret                       |
| `SITE_URL`                 | Production site URL                              |

### 3. Run database migrations

```bash
pnpm run migrate
```

Select **Migrate to latest** when prompted.

### 4. Start the dev server

```bash
pnpm dev
```

Open `http://localhost:4321` and complete the first-time setup (create admin account).

## Available Routes

| Route              | Description          |
| ------------------ | -------------------- |
| `/`                | Home page            |
| `/blog`            | Blog listing         |
| `/blog/[slug]`     | Individual blog post |
| `/blog/rss.xml`    | RSS feed             |
| `/studiocms`       | CMS dashboard        |
| `/studiocms_api/*` | CMS API endpoints    |

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start dev server         |
| `pnpm build`     | Build for production     |
| `pnpm preview`   | Preview production build |
| `pnpm migrate`   | Run database migrations  |
| `pnpm studiocms` | StudioCMS CLI            |

## Project Structure

```tree
├── astro.config.mjs          # Astro + integrations config
├── studiocms.config.mjs      # StudioCMS plugins config
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables (gitignored)
├── .env.demo                 # Environment variable template
├── src/
│   ├── lang-flags-icons.js   # Custom icon collection for i18n
│   └── styles/               # Global CSS + custom layouts
│       ├── global.css        # Tailwind directives
│       ├── components/       # Component-level styles
│       ├── layouts/          # Layout styles
│       └── pages/            # Page-level styles
├── public/                   # Static assets
├── tender-series/            # Blog content directory
├── dist/                     # Production build output (gitignored)
└── .vscode/                  # VS Code workspace settings
```

## Content Types

StudioCMS supports multiple content formats out of the box:

- **Markdown** — standard `.md` content with GFM
- **HTML** — raw HTML content
- **MDX** — React components in content
- **Markdoc** — Markdoc-flavored content
- **WYSIWYG** — visual editor for non-technical users

## Custom Icons

The `@studiocms/blog` plugin uses the `lang-flags` icon collection for language indicators, but `@studiocms/ui` only ships with `heroicons` by default. This project includes a workaround:

1. Install `@iconify-json/flag` for the icon data
2. `src/lang-flags-icons.js` defines a custom `lang-flags` collection with flags for supported locales (en-us, de, fr, es-mx, zh)
3. The collection is registered via `studiocmsUi({ icons: { 'lang-flags': langFlags } })` in `astro.config.mjs`

To add more flags, edit `src/lang-flags-icons.js` and add entries from [flag-icons](https://github.com/lipis/flag-icons).

## Development Workflow

### Code Quality

This project uses ESLint, Prettier, and Lefthook for automated code quality checks:

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm lint`         | Run ESLint (errors on any warning) |
| `pnpm lint:fix`     | Run ESLint with auto-fix           |
| `pnpm format`       | Format code with Prettier          |
| `pnpm format:check` | Check formatting without modifying |
| `pnpm typecheck`    | Run TypeScript type checking       |

### Pre-commit Hooks

Lefthook runs the following checks automatically on `git commit`:

- **lint**: Auto-fixes ESLint issues on staged JS/TS files
- **format**: Auto-formats staged files with Prettier
- **typecheck**: Validates TypeScript types on staged TS files

All fixes are automatically staged after the hooks run.

### Conventions

- **Naming**: PascalCase for components, camelCase for utils/hooks
- **Immutability**: Never mutate state directly — use spread operator
- **Types**: No `any` — use proper TypeScript types
- **Testing**: AAA pattern with descriptive test names
- **Files**: `.types` suffix for type definition files

## Deployment

### Build for Production

```bash
pnpm build
```

The output is a standalone Node.js server in `dist/`. Run with:

```bash
node dist/server/entry.mjs
```

### Production Environment

Before deploying, ensure:

1. **Environment variables** are set for production (see `.env.demo` for template)
2. **Database migrations** are run: `pnpm migrate`
3. **SITE_URL** is updated to your production domain
4. **OAuth callback URLs** are updated to point to your production domain:
   - GitHub: `https://yourdomain.com/studiocms_api/auth/callback/github`
   - Google: `https://yourdomain.com/studiocms_api/auth/callback/google`
5. **checkOrigin** is enabled in `astro.config.mjs` (disabled locally for development)

### Deployment Checklist

- [ ] Set production environment variables
- [ ] Run database migrations
- [ ] Update OAuth redirect URIs
- [ ] Enable CSRF origin checking
- [ ] Build the application
- [ ] Start the Node.js server
- [ ] Verify CMS dashboard access
- [ ] Test blog routes and RSS feed

## Troubleshooting

### First-time setup

After starting the dev server, visit `http://localhost:4321/studiocms` to create your admin account. This is required before you can access the CMS dashboard.

### Database migrations

Run `pnpm run migrate` whenever you update StudioCMS or change the database schema. Select **Migrate to latest** when prompted. If you get migration errors, try deleting `libsql.db` and running migrate again (note: this deletes all content).

### OAuth setup

- **GitHub**: Create an OAuth App at [GitHub Settings > Developer settings](https://github.com/settings/developers). Set the callback URL to `http://localhost:4321/studiocms_api/auth/callback/github`
- **Google**: Create credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Set the authorized redirect URI to `http://localhost:4321/studiocms_api/auth/callback/google`

### Local vs remote database

- **Local**: Set `CMS_LIBSQL_URL=file:./libsql.db` — no auth token needed
- **Remote (Turso)**: Set `CMS_LIBSQL_URL=libsql://your-database.turso.io` and provide `CMS_LIBSQL_AUTH_TOKEN`

### Build fails with missing icons

If you see `lang-flags icon not found` errors, ensure `@iconify-json/flag` is installed and `src/lang-flags-icons.js` is properly imported in `astro.config.mjs`.

## Links

- [StudioCMS Docs](https://docs.studiocms.dev)
- [StudioCMS UI Docs](https://ui.studiocms.dev)
- [Astro Docs](https://docs.astro.build)
- [Turso Docs](https://docs.turso.tech)
