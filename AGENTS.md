# StudioCMS Blog — Agent Instructions

## Commands

| Task          | Command                                     |
| ------------- | ------------------------------------------- |
| Dev server    | `pnpm dev`                                  |
| Build         | `pnpm build`                                |
| Preview       | `pnpm preview`                              |
| DB migrations | `pnpm migrate` (select "Migrate to latest") |
| StudioCMS CLI | `pnpm studiocms`                            |
| Lint          | `pnpm lint` / `pnpm lint:fix`               |
| Format        | `pnpm format` / `pnpm format:check`         |
| Typecheck     | `pnpm typecheck`                            |

**Package manager**: pnpm (not npm)

## Code Quality

- **ESLint**: Flat config in `eslint.config.js` — no `any`, consistent type imports, max depth 4
- **Prettier**: Single quotes, no semicolons, 100 char print width
- **Lefthook**: Pre-commit hooks auto-fix lint + format on staged files
- **Ignored by Prettier**: `pnpm-lock.yaml`, `libsql.*`, `dist/`, `.astro/`, `node_modules/`

## Architecture

- **Astro 5** in SSR mode (`output: 'server'`) with Node standalone adapter
- **StudioCMS 0.4** headful CMS with libSQL (Turso) database
- **Tailwind CSS 4** via Vite plugin (not PostCSS)
- Content stored in DB (CMS-managed), not file-based

## Key Conventions

### Custom Icons Workaround

`@studiocms/blog` uses `lang-flags` icons but `@studiocms/ui` only ships `heroicons`. The fix:

- `src/lang-flags-icons.js` defines a custom `lang-flags` collection
- Registered in `astro.config.mjs` via `studiocmsUi({ icons: { 'lang-flags': langFlags } })`
- Do not remove this or blog language indicators will break

### Database

- Local: `file:./libsql.db` (gitignored)
- Remote: Turso URL + auth token
- Always run `pnpm migrate` after StudioCMS updates
- First run: visit `http://localhost:4321/studiocms` to create admin account

### Content

- Blog content managed via CMS dashboard at `/studiocms`
- `tender-series/` directory for blog content files

### Markdown Pipeline

- remark: `remark-gfm` (tables, strikethrough, task lists)
- rehype: `rehype-slug` → `rehype-autolink-headings` (wrap behavior) → `rehype-pretty-code` (syntax highlighting)
- Code blocks: Expressive Code + TwoSlash (TS type hover info)

## Gotchas

- **pnpm overrides**: vite pinned to 6.3.5 despite deps listing 7.3.2 — do not change without testing
- **checkOrigin**: disabled in astro.config.mjs (adjust for production hosting)
- **Effect library** present in deps but not yet wired into codebase
- OAuth callback URLs: `/studiocms_api/auth/callback/{github,google}`

## File Boundaries

| Path                      | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `astro.config.mjs`        | Astro + all integrations config          |
| `studiocms.config.mjs`    | StudioCMS plugins + DB dialect           |
| `eslint.config.js`        | ESLint flat config                       |
| `lefthook.yml`            | Pre-commit hooks config                  |
| `.prettierrc`             | Prettier formatting rules                |
| `.prettierignore`         | Prettier ignore patterns                 |
| `src/lang-flags-icons.js` | Custom icon collection                   |
| `src/styles/`             | Global CSS, component/layout/page styles |
| `.env`                    | Secrets (gitignored)                     |
| `.env.demo`               | Env template (commit this)               |
| `docs/`                   | Project documentation                    |
