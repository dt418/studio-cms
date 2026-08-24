# Agent-Readiness Phase 1 Design Spec

**Date:** 2026-06-21
**Author:** Droid (AI Agent)
**Status:** Approved (brainstorming complete)

---

## Overview

Make `danhthanh.dev` discoverable and honest to AI agents by exposing the
machine-readable metadata that the [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering)
checklist and the [isitagentready.com](https://isitagentready.com) readiness
scan test for. Phase 1 ships the static `.well-known/` endpoints, the agent
skills index, the auth.md policy file, and the `Content-Signal` line in
`robots.txt`.

Harness scaffolding (AGENTS.md, CLAUDE.md, specs, plans, .claude, .agents,
.factory) already exists at repo root. This phase does **not** touch those
files; it only extends the public app with the metadata surface.

## Goals (Phase 1 scope)

| #   | Goal                     | Surface                                                                        | Implementation                                    |
| --- | ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------- |
| 1   | Link headers             | Out of scope (Phase 2)                                                         | —                                                 |
| 2   | DNS-AID                  | Out of scope (Phase 4 docs only)                                               | —                                                 |
| 3   | Markdown negotiation     | Out of scope (Phase 2)                                                         | —                                                 |
| 4   | Content signals          | `robots.txt`                                                                   | Add `Content-Signal` line                         |
| 5   | API catalog              | `/.well-known/api-catalog`                                                     | Stub: search/RSS/sitemap via service-doc relation |
| 6   | OAuth/OIDC discovery     | `/.well-known/oauth-authorization-server`, `/.well-known/openid-configuration` | Stub: minimal metadata                            |
| 7   | OAuth Protected Resource | `/.well-known/oauth-protected-resource`                                        | Stub: declare no authorization servers required   |
| 8   | auth.md                  | `/auth.md`                                                                     | Real: "no auth required" + future intent          |
| 9   | MCP Server Card          | `/.well-known/mcp/server-card.json`                                            | Stub: serverInfo + transport URL                  |
| 10  | Agent skills index       | `/.well-known/agent-skills/index.json`                                         | Real: list blog skills with sha256                |
| 11  | WebMCP                   | Out of scope (Phase 3)                                                         | —                                                 |

Stub vs. Real decision rule: if the surface exists for the blog's actual
state (search/RSS/sitemap, skills, no-auth policy), ship real data. If the
RFC prescribes a server role the blog does not play (OAuth server, OIDC IdP,
MCP server), ship an honest stub that declares the absence rather than
silently 404. Stubs return `200 application/json` with RFC-shaped metadata
that documents why the role is unfulfilled and points readers at the real
contact surface.

---

## Architecture

```
apps/web/src/
├── pages/
│   ├── .well-known/
│   │   ├── api-catalog.json.ts
│   │   ├── oauth-authorization-server.json.ts
│   │   ├── oauth-protected-resource.json.ts
│   │   ├── openid-configuration.json.ts
│   │   ├── mcp/
│   │   │   └── server-card.json.ts
│   │   └── agent-skills/
│   │       └── index.json.ts
│   ├── auth.md.ts
│   └── robots.txt.ts          (edit — add Content-Signal)
├── lib/
│   ├── agent-metadata.ts          (shared: getSiteUrl, getLocales, getContentSignals, getAgentSkills, getApiCatalogLinks)
│   ├── agent-skills.catalog.json  (skill catalog data — single source of truth)
│   ├── agent-metadata.test.ts     (Zod validation against RFC schemas)
│   └── .generated/                (gitignored — build script output)
│       └── agent-skills-index.json
└── scripts/
    └── generate-agent-skills-index.mjs   (sha256 → index payload, runs in pnpm web:build)
```

Astro's `.well-known/` directory under `pages/` maps to the literal URL path
`/.well-known/...` in the static build. Filenames with dots are valid in
Astro routes (the dot becomes a literal path character when nested in a
folder). Astro 6 preserves the prerendered output bytes verbatim.

## Endpoint Contracts

### `GET /.well-known/api-catalog`

- **Content-Type:** `application/linkset+json` (RFC 9264)
- **Purpose:** Declare the absence of a public API surface while pointing at
  the closest machine-readable surfaces that do exist (search, RSS, sitemap).
- **Payload shape:** Linkset JSON object with one `linkset` array; each entry
  contains `anchor` and a `service-doc` relation pointing at the search/RSS/
  sitemap endpoints.

### `GET /.well-known/oauth-protected-resource`

- **Content-Type:** `application/json` (RFC 9728)
- **Purpose:** Declare that no OAuth authorization server is required to
  access the public blog. Field `authorization_servers` is an empty array.
  Field `resource` is the site URL. Include `bearer_methods_supported: []`
  and `resource_documentation` linking to `/auth.md`.

### `GET /.well-known/oauth-authorization-server`

- **Content-Type:** `application/json` (RFC 8414)
- **Purpose:** Honest stub. The blog is not an OAuth server; the response
  documents this by returning only the required identifier fields
  (`issuer`, `authorization_endpoint`, `token_endpoint`,
  `response_types_supported`) and a `scopes_supported: []` array. Endpoint
  URLs point at `/auth.md` so consumers land on the policy doc instead of
  404'ing.

### `GET /.well-known/openid-configuration`

- **Content-Type:** `application/json` (OIDC Discovery 1.0)
- **Purpose:** Honest stub mirroring the OAuth stub. Required OIDC fields
  (`issuer`, `authorization_endpoint`, `jwks_uri`, `response_types_supported`,
  `subject_types_supported`, `id_token_signing_alg_values_supported`) all
  point at `/auth.md`. The presence of this file alone lets the
  isitagentready scanner confirm "discovery endpoint exists, declares
  intent."

### `GET /.well-known/mcp/server-card.json`

- **Content-Type:** `application/json` (MCP Server Card draft)
- **Purpose:** Honest stub. The blog is not an MCP server today. Payload
  contains `serverInfo` (name, version, vendor) and a `transport` block
  pointing at `/auth.md` with a comment-like `note` field describing future
  intent. `capabilities: {}` and `tools: []` make the absence explicit.

### `GET /.well-known/agent-skills/index.json`

- **Content-Type:** `application/json`
- **Purpose:** List every skill the blog publishes for AI agents (currently
  empty — index is shipped empty but valid so consumers see the surface).
  Each entry: `{ id, title, description, url, sha256, version }`.
- **Build-time generation:** `apps/web/scripts/generate-agent-skills-index.mjs`
  reads `apps/web/src/lib/agent-skills.ts`, computes sha256 of each skill's
  `SKILL.md` content, and writes the final `index.json` content that the
  Astro route serializes. Runs as part of `pnpm web:build`.

### `GET /auth.md`

- **Content-Type:** `text/markdown; charset=utf-8`
- **Purpose:** Plain-language auth policy. Sections:
  1. **Current state:** Public blog, no login, no tokens, no user data.
  2. **What you can do:** Read posts, subscribe to RSS, use search.
  3. **What you cannot do:** No API access, no write operations, no
     personalized content.
  4. **Future intent:** If OAuth/OIDC/MCP roles are added later, this file
     will document the discovery endpoints and supported flows. Today those
     endpoints are honest stubs.
  5. **Contact:** Author email from `SITE.email`.

### `GET /robots.txt` (edit)

Append a single blank line followed by:

```
Content-Signal: ai-train=no, search=yes, ai-input=yes
```

The existing User-agent, Allow, Disallow, and Sitemap directives stay
untouched. `Content-Signal` is a [draft RFC](https://datatracker.ietf.org/doc/draft-ietf-httpapi-content-signals/)
header convention that scrapers and crawlers read from robots.txt to declare
how AI systems may use the content.

## Shared Lib — `apps/web/src/lib/agent-metadata.ts`

```ts
import { z } from 'zod'

export const LocaleSchema = z.enum(['vi', 'en'])

export const ContentSignalSchema = z.object({
  'ai-train': z.enum(['yes', 'no']),
  search: z.enum(['yes', 'no']),
  'ai-input': z.enum(['yes', 'no']),
})

export const AgentSkillSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  version: z.string(),
})

export function getSiteUrl(): URL
export function getLocales(): z.infer<typeof LocaleSchema>[]
export function getContentSignals(): z.infer<typeof ContentSignalSchema>
export function getAgentSkills(): z.infer<typeof AgentSkillSchema>[]
export function getApiCatalogLinks(): Array<{
  rel: string
  href: string
  type: string
  title?: string
}>
```

`getSiteUrl()` reads `import.meta.env.SITE` (set by Astro from the
`SITE_URL` env var per `apps/web/astro.config.mjs:13`). Throws if
`SITE_URL` is missing so the build fails fast.

`getAgentSkills()` reads the generated JSON file produced by the build
script (path: `apps/web/src/lib/.generated/agent-skills-index.json`). The
generated file is gitignored.

## Skill Catalog Source — `apps/web/src/lib/agent-skills.catalog.json`

Plain JSON data file (not TypeScript) so the build script can read it with
`JSON.parse` and stay zero-dep. Schema (validated by the matching Zod schema
in `agent-metadata.ts`):

```json
[
  {
    "id": "read-blog",
    "title": "Read danhthanh.dev blog",
    "description": "Browse posts, tags, categories, and authors.",
    "url": "https://danhthanh.dev/.well-known/agent-skills/read-blog/SKILL.md",
    "version": "0.1.0"
  }
]
```

Phase 1 ships an empty array `[]`. The build script generates `sha256` from
each skill's `SKILL.md` file referenced by `url`. When the array is empty,
the build step is a no-op and the index payload is `{ "skills": [] }`.

## Build Script — `apps/web/scripts/generate-agent-skills-index.mjs`

1. Read `apps/web/src/lib/agent-skills.catalog.json` with `JSON.parse`.
2. Validate each entry against `AgentSkillSchema` (imported via a tiny
   helper that re-declares the schema, since this script is ESM and
   zero-dep). Fail loudly on mismatch.
3. For each entry, fetch the SKILL.md content via `fs.readFile` from
   `apps/web/<local-path>` (strip `SITE_URL` prefix from `url`). Compute
   `sha256` of the content with Node's `crypto`.
4. Attach `sha256` to each entry.
5. Write the resolved payload to
   `apps/web/src/lib/.generated/agent-skills-index.json` (gitignored).
6. Exit non-zero on any validation failure so `pnpm web:build` fails.

Add the script invocation to `apps/web/package.json` `build` script **before**
`astro build` so the file exists when Astro renders the route. Phase 1 order:

```
"build": "node scripts/generate-agent-skills-index.mjs && astro build"
```

## Testing

### Unit — `apps/web/src/lib/agent-metadata.test.ts`

Vitest tests:

- Each getter returns a value that satisfies its Zod schema.
- `getSiteUrl()` throws when `SITE_URL` is missing.
- `getApiCatalogLinks()` includes search, RSS, sitemap, and `/auth.md`.
- `getContentSignals()` returns exactly `ai-train=no, search=yes, ai-input=yes`.

### E2E — `e2e/agent-discovery.spec.ts`

Playwright spec hitting `localhost:4321`:

- Each of the 7 `.well-known/*.json` routes returns `200` with the expected
  Content-Type.
- `/auth.md` returns `200` with `text/markdown` and body contains
  "no auth required".
- `/robots.txt` body contains the `Content-Signal` line.
- Each stub payload's required fields parse as valid JSON.

### Build gate

`pnpm web:build` fails if any route throws or if the build script cannot
produce the skills index. No additional runtime check — Astro serves the
prerendered file directly.

## Error Handling

- Missing `SITE_URL` → build fails with a clear message naming the env var.
- Missing `.generated/agent-skills-index.json` → Astro route throws on
  import, build fails.
- Schema mismatch in any getter → unit test fails, `pnpm check` fails.
- Empty `agent-skills` array → index returns `[]`; that is a valid Phase 1
  state and does not fail the build.

## Out of Scope (later phases)

- **Phase 2 — HTTP behavior:** Per-page `Link: rel="..."` headers pointing
  at the `.well-known` files; `Accept: text/markdown` content negotiation on
  blog pages.
- **Phase 3 — WebMCP:** Browser-side WebMCP wiring for the homepage search
  (deferred until the search UI has a stable API contract).
- **Phase 4 — DNS-AID:** Documentation in `apps/web/README.md` explaining
  how operators publish TXT records for `aitxt`, `aimcp`, `aiauth` once the
  domain is on a DNS provider that supports user records.

## Completion Standard

- Every file listed in the Architecture table exists and compiles.
- `pnpm check` (lint + typecheck + format:check + test) passes.
- `pnpm web:build` succeeds and `dist/client/.well-known/...` contains the
  expected JSON files with the correct Content-Type metadata.
- `pnpm test:e2e` passes against `e2e/agent-discovery.spec.ts`.
