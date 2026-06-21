# danhthanh.dev

## Agent-Readiness

The blog exposes machine-readable metadata so AI agents and crawlers can verify its purpose and signal policy without scraping.

### Surface area

| Endpoint                                  | Content-Type                          | Status      | Source                                                                |
| ----------------------------------------- | ------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `/.well-known/api-catalog`                | `application/linkset+json` (RFC 9264) | real        | linkset pointing at search/RSS/sitemap + `/auth.md`                   |
| `/.well-known/oauth-protected-resource`   | `application/json` (RFC 9728)         | honest stub | declares `authorization_servers: []`                                  |
| `/.well-known/oauth-authorization-server` | `application/json` (RFC 8414)         | honest stub | endpoint URLs point at `/auth.md`                                     |
| `/.well-known/openid-configuration`       | `application/json` (OIDC 1.0)         | honest stub | mirrors the RFC 8414 stub                                             |
| `/.well-known/mcp/server-card.json`       | `application/json` (MCP draft)        | honest stub | `capabilities: {}`, `tools: []`                                       |
| `/.well-known/agent-skills/index.json`    | `application/json`                    | real        | empty array (Phase 1); built from `src/lib/agent-skills.catalog.json` |
| `/auth.md`                                | `text/markdown`                       | real        | no-auth policy + future intent                                        |
| `/robots.txt`                             | `text/plain`                          | real        | `Content-Signal: ai-train=no, search=yes, ai-input=yes`               |

### Content signals

The blog signals in `robots.txt`:

```
Content-Signal: ai-train=no, search=yes, ai-input=yes
```

- `ai-train=no` — do not use posts as training data
- `search=yes` — search engine indexing allowed
- `ai-input=yes` — posts may be fed to AI agents as input

### Local development

The `.well-known` endpoints are prerendered at build time. No runtime configuration is needed. The build script `apps/web/scripts/generate-agent-skills-index.mjs` runs automatically as part of `pnpm web:build`.

To verify locally:

```bash
pnpm --filter web build
pnpm --filter web preview
curl -i http://localhost:4321/.well-known/api-catalog
curl -i http://localhost:4321/.well-known/agent-skills/index.json
curl -i http://localhost:4321/auth.md
```

### Tests

Unit tests live in `apps/web/src/lib/agent-metadata.test.ts`. E2E coverage lives in `e2e/agent-discovery.spec.ts` and exercises every endpoint over HTTP via Playwright.
