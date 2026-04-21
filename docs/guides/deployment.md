# Deployment Guide

This guide covers deploying the StudioCMS Blog to production.

## Prerequisites

- Node.js 20+ installed on the target server
- Production domain configured
- SSL certificate (recommended)
- Turso database provisioned (or local file database)

## Step 1: Configure Environment Variables

Copy the `.env.demo` template and update values for production:

```bash
cp .env.demo .env
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
| `SITE_URL`                 | `https://yourdomain.com`                 |

## Step 2: Update OAuth Redirect URIs

Update OAuth callback URLs to point to your production domain:

- **GitHub**: `https://yourdomain.com/studiocms_api/auth/callback/github`
- **Google**: `https://yourdomain.com/studiocms_api/auth/callback/google`

## Step 3: Enable CSRF Protection

In `astro.config.mjs`, ensure `checkOrigin` is enabled for production:

```js
security: {
  checkOrigin: true, // Enable for production
}
```

## Step 4: Install Dependencies and Build

```bash
pnpm install
pnpm migrate
pnpm build
```

## Step 5: Start the Server

```bash
node dist/server/entry.mjs
```

## Step 6: Verify Deployment

1. Visit `https://yourdomain.com` to verify the site loads
2. Visit `https://yourdomain.com/studiocms` to create admin account
3. Test blog routes and RSS feed at `/blog/rss.xml`
4. Verify OAuth login works

## Process Management

For production, use a process manager like PM2:

```bash
pm2 start dist/server/entry.mjs --name studiocms-blog
pm2 save
pm2 startup
```

## Related Topics

- [Environment Variables Reference](../reference/environment-variables.md)
- [Architecture Overview](../reference/architecture.md)
- [Troubleshooting](../../README.md#troubleshooting)
