# Deployment Guide

This guide covers deploying the monorepo to production. The public blog and CMS are separate deployable apps.

## Prerequisites

- Node.js 22+ installed where the CMS Node SSR app runs
- pnpm 10 configured in CI or on the target server
- Production domains configured for web and CMS
- SSL certificate for both public endpoints
- Turso database provisioned (or local file database)

## Step 1: Configure Environment Variables

Copy the `.env` templates and update values for production:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/cms/.env.example apps/cms/.env
```

Update the following variables:

| Variable                   | Production Value                         |
| -------------------------- | ---------------------------------------- |
| `CMS_LIBSQL_URL`           | `libsql://your-database.turso.io`        |
| `CMS_LIBSQL_AUTH_TOKEN`    | Your Turso auth token                    |
| `CMS_ENCRYPTION_KEY`       | Generate with `openssl rand --base64 16` |
| `CMS_GITHUB_CLIENT_ID`     | Production GitHub OAuth app ID           |
| `CMS_GITHUB_CLIENT_SECRET` | Production GitHub OAuth app secret       |
| `CMS_GOOGLE_CLIENT_ID`     | Production Google OAuth client ID        |
| `CMS_GOOGLE_CLIENT_SECRET` | Production Google OAuth client secret    |
| `SITE_URL`             | `https://yourdomain.com`                 |
| `CMS_SITE_URL`             | `https://cms.yourdomain.com`             |

## Step 2: Update OAuth Redirect URIs

Update OAuth callback URLs to point to the CMS production domain:

- **GitHub**: `https://cms.yourdomain.com/studiocms_api/auth/callback/github`
- **Google**: `https://cms.yourdomain.com/studiocms_api/auth/callback/google`

## Step 3: Enable CSRF Protection

In `apps/cms/astro.config.mjs`, review `checkOrigin` before production. It is currently disabled for local/CMS compatibility:

```text
security: {
  checkOrigin: true, // Enable for production
}
```

## Step 4: Install Dependencies and Build

```bash
pnpm install
pnpm build
```

`pnpm build` runs Turbo for both workspace apps. For provider-specific builds, use the filtered commands below.

## Web App Deployment

The public web app is static.

| Setting          | Value                                |
| ---------------- | ------------------------------------ |
| Workspace        | `apps/web`                           |
| Build command    | `pnpm --filter web build` |
| Output directory | `apps/web/dist`                      |
| Runtime          | Static hosting                       |
| Required env     | `SITE_URL`                           |

Use this target for Cloudflare Pages, Vercel static output, Netlify, or a VPS static file server.

## CMS App Deployment

The CMS app is SSR and should be deployed separately from the static web app.

| Setting           | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| Workspace         | `apps/cms`                                             |
| Migration command | `pnpm --filter cms migrate --latest`        |
| Build command     | `pnpm --filter cms build`                   |
| Start command     | `node apps/cms/dist/server/entry.mjs`                  |
| Runtime           | Node.js SSR                                            |
| Required env      | `CMS_LIBSQL_URL`, `CMS_ENCRYPTION_KEY`, `CMS_SITE_URL` |

The safest first production target for CMS is a VPS or other Node server because `apps/cms` currently uses `@astrojs/node` standalone output.

## Step 5: Start the Server

```bash
node apps/cms/dist/server/entry.mjs
```

## Step 6: Verify Deployment

1. Visit `https://yourdomain.com` to verify the static web app loads.
2. Visit `https://cms.yourdomain.com/studiocms` to create or access the admin account.
3. Test blog routes and RSS feed at `https://yourdomain.com/rss.xml`.
4. Verify OAuth login works against the CMS domain.
5. Run `pnpm test:e2e` before cutting over DNS.

## Process Management

For production, use a process manager like PM2:

```bash
pm2 start apps/cms/dist/server/entry.mjs --name danhthanh-cms
pm2 save
pm2 startup
```

## Provider Notes

### Cloudflare Pages

Use Cloudflare Pages for `apps/web` only unless the CMS is migrated to a Cloudflare-compatible adapter.

- Build command: `pnpm --filter web build`
- Build output: `apps/web/dist`
- Environment: `SITE_URL=https://yourdomain.com`

### Vercel

Use separate projects for web and CMS.

- Web project root: repository root or `apps/web`, with build `pnpm --filter web build` and output `apps/web/dist`.
- CMS on Vercel requires adapter review because the current CMS build targets `@astrojs/node` standalone output.

### VPS

Use static file serving for `apps/web/dist` and PM2/systemd for the CMS Node process.

- Web build: `pnpm --filter web build`
- CMS migration: `pnpm --filter cms migrate --latest`
- CMS build: `pnpm --filter cms build`
- CMS start: `node apps/cms/dist/server/entry.mjs`

Keep CMS database files, if using `file:`, outside release directories so deployments do not overwrite them.

## Related Topics

- [Environment Variables Reference](../reference/environment-variables.md)
- [Architecture Overview](../reference/architecture.md)
- [Troubleshooting](../../README.md#troubleshooting)
