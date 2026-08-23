# Deployment

The site is a static Astro 7 build. It does not require a Node server, database, CMS runtime, or OAuth credentials.

## Build

```bash
pnpm install
pnpm build
```

The output is `apps/web/dist`.

## Static hosts

Deploy `apps/web/dist` to Cloudflare Pages, Vercel static output, Netlify, GitHub Pages, or any CDN that serves static files. Set `SITE_URL` in the build environment so canonical URLs, RSS, sitemap, and Open Graph metadata use the production domain.

## Preview locally

```bash
pnpm preview
```

The preview server serves the already-generated `apps/web/dist` directory.
