# StudioCMS Blog

Personal blog built with [Astro](https://astro.build) and [StudioCMS](https://docs.studiocms.dev) — a headful CMS with database-backed content management.

## Tech Stack

| Layer | Tool |
|---|---|
| **Framework** | Astro 5 (SSR, Node adapter) |
| **CMS** | StudioCMS 0.4 |
| **Database** | Turso (libSQL) |
| **UI** | @studiocms/ui + Tailwind CSS 4 |
| **Content** | Markdown, HTML, MDX, Markdoc, WYSIWYG |
| **Code blocks** | Expressive Code + TwoSlash |
| **Auth** | GitHub & Google OAuth |

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

| Variable | Description |
|---|---|
| `CMS_LIBSQL_URL` | Turso database URL or local `file:./libsql.db` |
| `CMS_LIBSQL_AUTH_TOKEN` | Turso auth token (optional for local) |
| `CMS_ENCRYPTION_KEY` | Auth encryption key (`openssl rand --base64 16`) |
| `CMS_GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `CMS_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `CMS_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CMS_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SITE_URL` | Production site URL |

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

| Route | Description |
|---|---|
| `/` | Home page |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/blog/rss.xml` | RSS feed |
| `/studiocms` | CMS dashboard |
| `/studiocms_api/*` | CMS API endpoints |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm migrate` | Run database migrations |
| `pnpm studiocms` | StudioCMS CLI |

## Project Structure

```
├── astro.config.mjs          # Astro + integrations config
├── studiocms.config.mjs      # StudioCMS plugins config
├── src/
│   ├── lang-flags-icons.js   # Custom icon collection for i18n
│   └── styles/               # Global CSS + custom layouts
├── public/                   # Static assets
└── .env                      # Environment variables (gitignored)
```

## Content Types

StudioCMS supports multiple content formats out of the box:

- **Markdown** — standard `.md` content with GFM
- **HTML** — raw HTML content
- **MDX** — React components in content
- **Markdoc** — Markdoc-flavored content
- **WYSIWYG** — visual editor for non-technical users

## Deployment

Build for production:

```bash
pnpm build
```

The output is a standalone Node.js server in `dist/`. Run with:

```bash
node dist/server/entry.mjs
```

## Links

- [StudioCMS Docs](https://docs.studiocms.dev)
- [StudioCMS UI Docs](https://ui.studiocms.dev)
- [Astro Docs](https://docs.astro.build)
- [Turso Docs](https://docs.turso.tech)
