# Environment Variables Reference

Each app has its own `.env` at `apps/web/.env` (web) and `apps/cms/.env` (CMS). The root `.env` serves as a combined reference. The web app primarily needs public site metadata, while the CMS app also needs database and authentication settings.

## Dotenv Vault

Encrypted environment configs are stored in `.env.vault` (committed). Team members with access can decrypt and pull the latest configs using:

```bash
npx dotenv-vault@latest pull
```

See the [dotenv vault docs](https://dotenv.org/env-vault) for more.

## Required Variables

| Variable             | Description                 | Example                                           |
| -------------------- | --------------------------- | ------------------------------------------------- |
| `CMS_LIBSQL_URL`     | CMS database connection URL | `libsql://your-db.turso.io` or `file:./libsql.db` |
| `CMS_ENCRYPTION_KEY` | CMS auth encryption key     | Generate: `openssl rand --base64 16`              |

## Authentication Variables

### GitHub OAuth

| Variable                   | Description                    | Example     |
| -------------------------- | ------------------------------ | ----------- |
| `CMS_GITHUB_CLIENT_ID`     | GitHub OAuth app client ID     | `Ov23li...` |
| `CMS_GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | `abc123...` |

**Local callback URL**: `http://localhost:4322/studiocms_api/auth/callback/github`

**Production callback URL**: `https://cms.yourdomain.com/studiocms_api/auth/callback/github`

### Google OAuth

| Variable                   | Description                | Example                                 |
| -------------------------- | -------------------------- | --------------------------------------- |
| `CMS_GOOGLE_CLIENT_ID`     | Google OAuth client ID     | `123456-abc.apps.googleusercontent.com` |
| `CMS_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abc123`                         |

**Local callback URL**: `http://localhost:4322/studiocms_api/auth/callback/google`

**Production callback URL**: `https://cms.yourdomain.com/studiocms_api/auth/callback/google`

## Optional Variables

| Variable                | Description                               | Default                 |
| ----------------------- | ----------------------------------------- | ----------------------- |
| `CMS_LIBSQL_AUTH_TOKEN` | Turso auth token (required for remote DB) | Empty (local only)      |
| `SITE_URL`            | Public web URL                            | `http://localhost:4321` |
| `CMS_SITE_URL`          | CMS/admin app URL                         | `http://localhost:4322` |

## Local vs Production

### Local Development

```env
CMS_LIBSQL_URL=file:./libsql.db
CMS_LIBSQL_AUTH_TOKEN=
SITE_URL=http://localhost:4321
CMS_SITE_URL=http://localhost:4322
```

### Production

```env
CMS_LIBSQL_URL=libsql://your-database.turso.io
CMS_LIBSQL_AUTH_TOKEN=your-turso-auth-token
SITE_URL=https://yourdomain.com
CMS_SITE_URL=https://cms.yourdomain.com
```

## Generating Encryption Key

```bash
openssl rand --base64 16
```

## Related Topics

- [Deployment Guide](../guides/deployment.md)
- [Troubleshooting](../../README.md#troubleshooting)
