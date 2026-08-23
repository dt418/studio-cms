# Environment Variables

The static web app only needs the variables below. Astro automatically loads `apps/web/.env` during development and build commands.

| Variable       | Purpose                                                          | Example                     |
| -------------- | ---------------------------------------------------------------- | --------------------------- |
| `SITE_URL`     | Canonical site URL used by metadata, RSS, and sitemap generation | `https://danhthanh.dev`     |
| `CF_PAGES_URL` | Optional Cloudflare Pages fallback when `SITE_URL` is not set    | `https://project.pages.dev` |

## Local setup

```bash
Copy-Item .env.example apps/web/.env
```

Do not commit `.env` files or credentials. There is no runtime database, CMS server, OAuth flow, or backend environment in this project.
