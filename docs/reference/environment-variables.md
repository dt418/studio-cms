# Environment Variables Reference

All environment variables are defined in `.env` (gitignored). Use `.env.demo` as a template.

## Required Variables

| Variable             | Description             | Example                                           |
| -------------------- | ----------------------- | ------------------------------------------------- |
| `CMS_LIBSQL_URL`     | Database connection URL | `libsql://your-db.turso.io` or `file:./libsql.db` |
| `CMS_ENCRYPTION_KEY` | Auth encryption key     | Generate: `openssl rand --base64 16`              |

## Authentication Variables

### GitHub OAuth

| Variable                   | Description                    | Example     |
| -------------------------- | ------------------------------ | ----------- |
| `CMS_GITHUB_CLIENT_ID`     | GitHub OAuth app client ID     | `Ov23li...` |
| `CMS_GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | `abc123...` |

**Callback URL**: `http://localhost:4321/studiocms_api/auth/callback/github`

### Google OAuth

| Variable                   | Description                | Example                                 |
| -------------------------- | -------------------------- | --------------------------------------- |
| `CMS_GOOGLE_CLIENT_ID`     | Google OAuth client ID     | `123456-abc.apps.googleusercontent.com` |
| `CMS_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abc123`                         |

**Callback URL**: `http://localhost:4321/studiocms_api/auth/callback/google`

## Optional Variables

| Variable                | Description                               | Default                 |
| ----------------------- | ----------------------------------------- | ----------------------- |
| `CMS_LIBSQL_AUTH_TOKEN` | Turso auth token (required for remote DB) | Empty (local only)      |
| `SITE_URL`              | Production site URL                       | `http://localhost:4321` |

## Local vs Production

### Local Development

```env
CMS_LIBSQL_URL=file:./libsql.db
CMS_LIBSQL_AUTH_TOKEN=
SITE_URL=http://localhost:4321
```

### Production

```env
CMS_LIBSQL_URL=libsql://your-database.turso.io
CMS_LIBSQL_AUTH_TOKEN=your-turso-auth-token
SITE_URL=https://yourdomain.com
```

## Generating Encryption Key

```bash
openssl rand --base64 16
```

## Related Topics

- [Deployment Guide](../guides/deployment.md)
- [Troubleshooting](../../README.md#troubleshooting)
