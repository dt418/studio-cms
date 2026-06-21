# Agent-Readiness Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship static `.well-known/` discovery endpoints, agent skills index, `/auth.md` policy, and `Content-Signal` line in `robots.txt` so the danhthanh.dev static Astro blog passes the [isitagentready.com](https://isitagentready.com) readiness scan for all 11 Phase 1 surfaces.

**Architecture:** Each discovery surface is an Astro route under `apps/web/src/pages/.well-known/` with `export const prerender = true` + `GET` returning a `Response` with the RFC-prescribed `Content-Type`. A single `agent-metadata.ts` shared lib owns Zod schemas + getters; the `agent-skills` index is generated at build time from a JSON catalog by a zero-dep Node script that hashes each skill's `SKILL.md`. Stubs return honest 200 JSON for OAuth/OIDC/MCP roles the blog does not play; real content is shipped for skills, auth policy, content signals, and the API catalog (which lists the blog's actual machine-readable surfaces: search, RSS, sitemap).

**Tech Stack:** Astro 6.2.1 (static output), Zod 4 (transitive via @astrojs/rss), Vitest 4, Playwright 1.59, Node 22, pnpm 10. The repo's shared ESLint, Prettier (no-semicolons, single-quote, 100-col), markdownlint, commitlint, and lefthook apply.

**Reference spec:** `docs/superpowers/specs/2026-06-21-agent-readiness-phase-1-design.md`

---

## File Structure

| Path | Responsibility |
|---|---|
| `apps/web/src/lib/agent-metadata.ts` | Zod schemas + getters (`getSiteUrl`, `getLocales`, `getContentSignals`, `getAgentSkills`, `getApiCatalogLinks`) |
| `apps/web/src/lib/agent-metadata.test.ts` | Vitest unit tests against schemas |
| `apps/web/src/lib/agent-skills.catalog.json` | Empty `[]` skill catalog data — single source of truth |
| `apps/web/src/lib/.generated/agent-skills-index.json` | Build-script output (gitignored) — runtime read source |
| `apps/web/src/scripts/generate-agent-skills-index.mjs` | Zero-dep Node ESM script: catalog JSON → sha256 hashes → index file |
| `apps/web/src/pages/.well-known/api-catalog.json.ts` | RFC 9264 linkset stub |
| `apps/web/src/pages/.well-known/oauth-protected-resource.json.ts` | RFC 9728 stub |
| `apps/web/src/pages/.well-known/oauth-authorization-server.json.ts` | RFC 8414 stub |
| `apps/web/src/pages/.well-known/openid-configuration.json.ts` | OIDC Discovery stub |
| `apps/web/src/pages/.well-known/mcp/server-card.json.ts` | MCP Server Card stub |
| `apps/web/src/pages/.well-known/agent-skills/index.json.ts` | Real skills index |
| `apps/web/src/pages/auth.md.ts` | Real auth policy markdown |
| `apps/web/src/pages/robots.txt.ts` | Edit: add `Content-Signal` line |
| `apps/web/package.json` | Edit: wire build script before `astro build` |
| `.gitignore` | Edit: add `apps/web/src/lib/.generated/` |
| `e2e/pages/agent-discovery.spec.ts` | Playwright spec hitting all 8 endpoints + `/auth.md` + `/robots.txt` |

---

### Task 1: Shared lib + unit tests (TDD)

**Files:**
- Create: `apps/web/src/lib/agent-metadata.ts`
- Create: `apps/web/src/lib/agent-metadata.test.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/web/src/lib/agent-metadata.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  ContentSignalSchema,
  AgentSkillSchema,
  LocaleSchema,
  getSiteUrl,
  getLocales,
  getContentSignals,
  getAgentSkills,
  getApiCatalogLinks,
} from './agent-metadata'

describe('agent-metadata schemas', () => {
  it('LocaleSchema accepts vi and en', () => {
    expect(LocaleSchema.parse('vi')).toBe('vi')
    expect(LocaleSchema.parse('en')).toBe('en')
    expect(() => LocaleSchema.parse('fr')).toThrow()
  })

  it('ContentSignalSchema requires ai-train, search, ai-input', () => {
    const ok = ContentSignalSchema.parse({
      'ai-train': 'no',
      search: 'yes',
      'ai-input': 'yes',
    })
    expect(ok['ai-train']).toBe('no')
    expect(() =>
      ContentSignalSchema.parse({ 'ai-train': 'no', search: 'yes' }),
    ).toThrow()
  })

  it('AgentSkillSchema requires sha256 to be 64 hex chars', () => {
    const sha = 'a'.repeat(64)
    const ok = AgentSkillSchema.parse({
      id: 'read-blog',
      title: 'Read blog',
      description: 'Browse posts',
      url: 'https://danhthanh.dev/.well-known/agent-skills/read-blog/SKILL.md',
      sha256: sha,
      version: '0.1.0',
    })
    expect(ok.sha256).toBe(sha)
    expect(() =>
      AgentSkillSchema.parse({
        id: 'x',
        title: 'x',
        description: 'x',
        url: 'https://danhthanh.dev',
        sha256: 'too-short',
        version: '0.1.0',
      }),
    ).toThrow()
  })
})

describe('agent-metadata getters', () => {
  it('getSiteUrl returns a URL', () => {
    const url = getSiteUrl()
    expect(url).toBeInstanceOf(URL)
    expect(url.protocol).toMatch(/^https?:$/)
  })

  it('getLocales returns vi and en', () => {
    expect(getLocales()).toEqual(['vi', 'en'])
  })

  it('getContentSignals declares ai-train=no, search=yes, ai-input=yes', () => {
    expect(getContentSignals()).toEqual({
      'ai-train': 'no',
      search: 'yes',
      'ai-input': 'yes',
    })
  })

  it('getAgentSkills returns an array (empty in Phase 1)', () => {
    const skills = getAgentSkills()
    expect(Array.isArray(skills)).toBe(true)
    skills.forEach((skill) => AgentSkillSchema.parse(skill))
  })

  it('getApiCatalogLinks includes search, rss, sitemap, and /auth.md', () => {
    const links = getApiCatalogLinks()
    const hrefs = links.map((link) => link.href)
    expect(hrefs.some((href) => href.endsWith('/search'))).toBe(true)
    expect(hrefs.some((href) => href.endsWith('/rss.xml'))).toBe(true)
    expect(hrefs.some((href) => href.endsWith('/sitemap.xml'))).toBe(true)
    expect(hrefs.some((href) => href.endsWith('/auth.md'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter web test -- agent-metadata`
Expected: FAIL — module not found (`./agent-metadata` does not exist yet).

- [ ] **Step 3: Implement the lib**

Create `apps/web/src/lib/agent-metadata.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import { SUPPORTED_LOCALES, type SupportedLocale } from './routes'

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

const GENERATED_INDEX_PATH = fileURLToPath(
  new URL('./.generated/agent-skills-index.json', import.meta.url),
)

let cachedSkills: z.infer<typeof AgentSkillSchema>[] | null = null

function readGeneratedSkills(): z.infer<typeof AgentSkillSchema>[] {
  if (cachedSkills) return cachedSkills
  const raw = readFileSync(GENERATED_INDEX_PATH, 'utf8')
  const parsed = JSON.parse(raw) as { skills?: unknown }
  const list = Array.isArray(parsed.skills) ? parsed.skills : []
  cachedSkills = z.array(AgentSkillSchema).parse(list)
  return cachedSkills
}

export function getSiteUrl(): URL {
  const raw =
    import.meta.env['SITE'] ??
    process.env['SITE_URL'] ??
    process.env['CF_PAGES_URL'] ??
    'http://localhost:4321'
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) {
    throw new Error('SITE_URL is not configured. Set SITE_URL in apps/web/.env.')
  }
  return new URL(value)
}

export function getLocales(): SupportedLocale[] {
  return [...SUPPORTED_LOCALES]
}

export function getContentSignals(): z.infer<typeof ContentSignalSchema> {
  return ContentSignalSchema.parse({
    'ai-train': 'no',
    search: 'yes',
    'ai-input': 'yes',
  })
}

export function getAgentSkills(): z.infer<typeof AgentSkillSchema>[] {
  return readGeneratedSkills()
}

export function getApiCatalogLinks(): Array<{
  rel: string
  href: string
  type: string
  title?: string
}> {
  const site = getSiteUrl()
  return [
    {
      rel: 'service-doc',
      href: new URL('/search', site).toString(),
      type: 'text/html',
      title: 'Blog search',
    },
    {
      rel: 'service-doc',
      href: new URL('/rss.xml', site).toString(),
      type: 'application/rss+xml',
      title: 'RSS feed',
    },
    {
      rel: 'service-doc',
      href: new URL('/sitemap.xml', site).toString(),
      type: 'application/xml',
      title: 'Sitemap',
    },
    {
      rel: 'service-doc',
      href: new URL('/auth.md', site).toString(),
      type: 'text/markdown',
      title: 'Auth policy',
    },
  ]
}
```

Note: `readFileSync` uses `import.meta.url` so the path resolves correctly under Vitest (resolves to the compiled file path) and Astro (resolves to the source path). The lib has no top-level await; the first getter call reads the file lazily and caches.

- [ ] **Step 4: Stage the generated file so tests do not fail on missing file**

The test for `getAgentSkills` will fail until `apps/web/src/lib/.generated/agent-skills-index.json` exists. Create a placeholder manually for now (Task 2 will own the real generation):

Run from repo root:

```bash
mkdir -p apps/web/src/lib/.generated
echo '{"skills":[]}' > apps/web/src/lib/.generated/agent-skills-index.json
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter web test -- agent-metadata`
Expected: PASS — all 8 tests green.

- [ ] **Step 6: Run typecheck to verify types resolve**

Run: `pnpm web:typecheck`
Expected: PASS — 0 errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/agent-metadata.ts apps/web/src/lib/agent-metadata.test.ts
git commit -m "feat(web): add agent-metadata shared lib with Zod schemas"
```

Note: do **not** commit the placeholder `.generated/` file — it will be added to `.gitignore` in Task 3.

---

### Task 2: Skill catalog + build script

**Files:**
- Create: `apps/web/src/lib/agent-skills.catalog.json`
- Create: `apps/web/src/scripts/generate-agent-skills-index.mjs`

- [ ] **Step 1: Create empty catalog**

Create `apps/web/src/lib/agent-skills.catalog.json`:

```json
[]
```

- [ ] **Step 2: Write the build script**

Create `apps/web/src/scripts/generate-agent-skills-index.mjs`:

```js
#!/usr/bin/env node
// Generate apps/web/src/lib/.generated/agent-skills-index.json from
// apps/web/src/lib/agent-skills.catalog.json, attaching sha256 of each
// skill's SKILL.md content. Zero external deps; uses Node built-ins only.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = resolve(__dirname, '..')
const CATALOG_PATH = resolve(WEB_ROOT, 'src/lib/agent-skills.catalog.json')
const OUTPUT_PATH = resolve(
  WEB_ROOT,
  'src/lib/.generated/agent-skills-index.json',
)

const SHA256_HEX = /^[a-f0-9]{64}$/

function fail(message) {
  console.error(`[generate-agent-skills-index] ${message}`)
  process.exit(1)
}

function validateSkill(raw, index) {
  if (typeof raw !== 'object' || raw === null) {
    fail(`catalog[${index}] is not an object`)
  }
  const { id, title, description, url, version } = raw
  if (typeof id !== 'string' || !id) fail(`catalog[${index}].id missing`)
  if (typeof title !== 'string' || !title)
    fail(`catalog[${index}].title missing`)
  if (typeof description !== 'string' || !description)
    fail(`catalog[${index}].description missing`)
  if (typeof url !== 'string' || !/^https?:\/\//.test(url))
    fail(`catalog[${index}].url must be an http(s) URL`)
  if (typeof version !== 'string' || !version)
    fail(`catalog[${index}].version missing`)
  return { id, title, description, url, version }
}

function hashSkillContent(url) {
  // Map a URL like https://danhthanh.dev/.well-known/agent-skills/<id>/SKILL.md
  // to a local path apps/web/.well-known/agent-skills/<id>/SKILL.md
  const marker = '/.well-known/agent-skills/'
  const idx = url.indexOf(marker)
  if (idx < 0) return null
  const relative = url.slice(idx + 1) // ".well-known/agent-skills/<id>/SKILL.md"
  const localPath = resolve(WEB_ROOT, 'public', relative)
  if (!existsSync(localPath)) {
    fail(`SKILL.md not found at ${localPath}`)
  }
  const content = readFileSync(localPath, 'utf8')
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

function main() {
  if (!existsSync(CATALOG_PATH)) {
    fail(`catalog not found at ${CATALOG_PATH}`)
  }
  const raw = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'))
  if (!Array.isArray(raw)) {
    fail('catalog must be a JSON array')
  }

  const skills = raw.map((entry, index) => {
    const skill = validateSkill(entry, index)
    const sha256 = hashSkillContent(skill.url)
    return sha256 ? { ...skill, sha256 } : skill
  })

  for (const skill of skills) {
    if (typeof skill.sha256 !== 'string' || !SHA256_HEX.test(skill.sha256)) {
      fail(`skill "${skill.id}" missing valid sha256`)
    }
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify({ skills }, null, 2) + '\n')
  console.log(
    `[generate-agent-skills-index] wrote ${skills.length} skill(s) to ${OUTPUT_PATH}`,
  )
}

main()
```

Note on URL → local mapping: the script reads `public/.well-known/agent-skills/<id>/SKILL.md` because Astro's `public/` folder is served verbatim. Skills are static content that ships in `public/`, not source. The lib is generated; the skill content is authored.

- [ ] **Step 3: Run the script with the empty catalog**

Run from repo root:

```bash
node apps/web/src/scripts/generate-agent-skills-index.mjs
```

Expected output: `[generate-agent-skills-index] wrote 0 skill(s) to ...apps/web/src/lib/.generated/agent-skills-index.json`

Verify file:

```bash
cat apps/web/src/lib/.generated/agent-skills-index.json
```

Expected: `{"skills":[]}` (formatted JSON with trailing newline).

- [ ] **Step 4: Smoke-test with a sample skill**

Create a temporary sample SKILL.md:

```bash
mkdir -p apps/web/public/.well-known/agent-skills/sample
cat > apps/web/public/.well-known/agent-skills/sample/SKILL.md <<'EOF'
# Sample Skill

Test content for sha256 hashing.
EOF
```

Edit `apps/web/src/lib/agent-skills.catalog.json`:

```json
[
  {
    "id": "sample",
    "title": "Sample",
    "description": "Test skill",
    "url": "http://localhost:4321/.well-known/agent-skills/sample/SKILL.md",
    "version": "0.1.0"
  }
]
```

Re-run: `node apps/web/src/scripts/generate-agent-skills-index.mjs`
Expected: writes 1 skill with sha256.

Verify sha256 matches an independent hash:

```bash
sha256sum apps/web/public/.well-known/agent-skills/sample/SKILL.md
```

The hash should match the `sha256` field in the generated file.

- [ ] **Step 5: Remove the smoke-test sample**

```bash
rm -rf apps/web/public/.well-known/agent-skills/sample
echo '[]' > apps/web/src/lib/agent-skills.catalog.json
node apps/web/src/scripts/generate-agent-skills-index.mjs
cat apps/web/src/lib/.generated/agent-skills-index.json
```

Expected: back to `{"skills":[]}`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/agent-skills.catalog.json apps/web/src/scripts/generate-agent-skills-index.mjs
git commit -m "feat(web): add skills catalog source and build-time sha256 generator"
```

---

### Task 3: Wire build script + gitignore generated dir

**Files:**
- Modify: `apps/web/package.json:10` (build script)
- Modify: `.gitignore`

- [ ] **Step 1: Update build script**

In `apps/web/package.json` change the `"build"` line from:

```json
"build": "node scripts/generate-og-image.mjs && astro build && pagefind --site dist",
```

to:

```json
"build": "node scripts/generate-agent-skills-index.mjs && node scripts/generate-og-image.mjs && astro build && pagefind --site dist",
```

Order matters: skills index must exist before Astro renders the route that imports it.

- [ ] **Step 2: Add generated dir to .gitignore**

Append to `.gitignore` (root):

```
# Generated agent metadata
apps/web/src/lib/.generated/
```

- [ ] **Step 3: Run full web build to verify wiring**

Run: `pnpm web:build`
Expected: build succeeds. Generated file present. Astro output present. No errors.

Verify output exists:

```bash
ls apps/web/dist/client/.well-known 2>&1 | head
```

Note: at this point `.well-known/` may not exist yet (no routes added). The build will still succeed; the script just runs first.

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json .gitignore
git commit -m "chore(web): wire agent-skills generator into build and ignore output"
```

---

### Task 4: Add Content-Signal to robots.txt

**Files:**
- Modify: `apps/web/src/pages/robots.txt.ts`

- [ ] **Step 1: Edit robots.txt route**

In `apps/web/src/pages/robots.txt.ts`, replace the `body` array literal so the file ends with:

```ts
export const prerender = true

export const GET: APIRoute = ({ site }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /api/',
    '',
    `Sitemap: ${new URL('sitemap.xml', site)}`,
    '',
    'Content-Signal: ai-train=no, search=yes, ai-input=yes',
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then: `grep -A1 Sitemap apps/web/dist/client/robots.txt`
Expected output includes the `Content-Signal` line.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/robots.txt.ts
git commit -m "feat(web): add Content-Signal directive to robots.txt"
```

---

### Task 5: OAuth Protected Resource route (RFC 9728)

**Files:**
- Create: `apps/web/src/pages/.well-known/oauth-protected-resource.json.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/.well-known/oauth-protected-resource.json.ts`:

```ts
import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const payload = {
    resource: site.origin,
    authorization_servers: [],
    bearer_methods_supported: [],
    resource_documentation: new URL('/auth.md', site).toString(),
    resource_policy_uri: new URL('/auth.md', site).toString(),
  }
  return new Response(JSON.stringify(payload, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
test -f apps/web/dist/client/.well-known/oauth-protected-resource.json && cat apps/web/dist/client/.well-known/oauth-protected-resource.json
```

Expected: valid JSON with `authorization_servers: []` and `resource_documentation` pointing at `/auth.md`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/.well-known/oauth-protected-resource.json.ts
git commit -m "feat(web): expose RFC 9728 OAuth Protected Resource metadata"
```

---

### Task 6: OAuth Authorization Server route (RFC 8414)

**Files:**
- Create: `apps/web/src/pages/.well-known/oauth-authorization-server.json.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/.well-known/oauth-authorization-server.json.ts`:

```ts
import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const policy = new URL('/auth.md', site).toString()
  const payload = {
    issuer: site.origin,
    authorization_endpoint: policy,
    token_endpoint: policy,
    jwks_uri: policy,
    response_types_supported: ['none'],
    grant_types_supported: [],
    scopes_supported: [],
    token_endpoint_auth_methods_supported: ['none'],
    service_documentation: policy,
  }
  return new Response(JSON.stringify(payload, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

Honest stub: the blog is not an OAuth server, so all endpoints point at `/auth.md` and `response_types_supported: ['none']` declares that no flow is implemented.

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
cat apps/web/dist/client/.well-known/oauth-authorization-server.json
```

Expected: valid JSON with `scopes_supported: []` and `issuer` matching site origin.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/.well-known/oauth-authorization-server.json.ts
git commit -m "feat(web): expose RFC 8414 OAuth Authorization Server stub"
```

---

### Task 7: OpenID Configuration route (OIDC Discovery 1.0)

**Files:**
- Create: `apps/web/src/pages/.well-known/openid-configuration.json.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/.well-known/openid-configuration.json.ts`:

```ts
import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const policy = new URL('/auth.md', site).toString()
  const payload = {
    issuer: site.origin,
    authorization_endpoint: policy,
    jwks_uri: policy,
    token_endpoint: policy,
    userinfo_endpoint: policy,
    response_types_supported: ['none'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['none'],
    scopes_supported: [],
    claims_supported: [],
    service_documentation: policy,
  }
  return new Response(JSON.stringify(payload, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
cat apps/web/dist/client/.well-known/openid-configuration.json
```

Expected: valid JSON with all required OIDC fields present and pointing at `/auth.md`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/.well-known/openid-configuration.json.ts
git commit -m "feat(web): expose OIDC Discovery stub"
```

---

### Task 8: MCP Server Card route

**Files:**
- Create: `apps/web/src/pages/.well-known/mcp/server-card.json.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/.well-known/mcp/server-card.json.ts`:

```ts
import type { APIRoute } from 'astro'
import { getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const payload = {
    serverInfo: {
      name: 'danhthanh-dev-blog',
      version: '0.0.0',
      vendor: 'danhthanh.dev',
      description:
        'Static Astro blog. No MCP server today; metadata exposed for future intent.',
    },
    transport: {
      type: 'none',
      url: new URL('/auth.md', site).toString(),
    },
    capabilities: {},
    tools: [],
    documentation: new URL('/auth.md', site).toString(),
  }
  return new Response(JSON.stringify(payload, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
cat apps/web/dist/client/.well-known/mcp/server-card.json
```

Expected: valid JSON with `serverInfo.name: "danhthanh-dev-blog"` and `tools: []`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/.well-known/mcp/server-card.json.ts
git commit -m "feat(web): expose MCP Server Card stub"
```

---

### Task 9: API Catalog (RFC 9264 linkset) route

**Files:**
- Create: `apps/web/src/pages/.well-known/api-catalog.json.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/.well-known/api-catalog.json.ts`:

```ts
import type { APIRoute } from 'astro'
import { getApiCatalogLinks, getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const linkset = getApiCatalogLinks().map((link) => ({
    href: link.href,
    rel: link.rel,
    type: link.type,
    ...(link.title ? { title: link.title } : {}),
  }))
  const payload = {
    linkset: [
      {
        anchor: site.origin,
        ...(linkset.length > 0 ? { service: linkset } : {}),
      },
    ],
  }
  return new Response(JSON.stringify(payload, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

Note: the spread `(linkset.length > 0 ? { service: linkset } : {})` avoids passing an empty `service: []` to keep TS strict-mode happy (matches the project convention from CLAUDE.md).

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
cat apps/web/dist/client/.well-known/api-catalog.json
```

Expected: valid RFC 9264 linkset JSON with at least search, RSS, sitemap, and auth.md entries.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/.well-known/api-catalog.json.ts
git commit -m "feat(web): expose RFC 9264 API catalog linkset"
```

---

### Task 10: Agent skills index route

**Files:**
- Create: `apps/web/src/pages/.well-known/agent-skills/index.json.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/.well-known/agent-skills/index.json.ts`:

```ts
import type { APIRoute } from 'astro'
import { getAgentSkills, getSiteUrl } from '@/lib/agent-metadata'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const skills = getAgentSkills()
  const payload = {
    issuer: site.origin,
    generated: new Date().toISOString(),
    count: skills.length,
    skills,
  }
  return new Response(JSON.stringify(payload, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
cat apps/web/dist/client/.well-known/agent-skills/index.json
```

Expected: valid JSON with `count: 0` and `skills: []` (Phase 1 ships empty).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/.well-known/agent-skills/index.json.ts
git commit -m "feat(web): expose agent skills index"
```

---

### Task 11: auth.md route

**Files:**
- Create: `apps/web/src/pages/auth.md.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/src/pages/auth.md.ts`:

```ts
import type { APIRoute } from 'astro'
import { getSiteUrl, getLocales } from '@/lib/agent-metadata'
import { SITE } from '@/lib/site'

export const prerender = true

export const GET: APIRoute = () => {
  const site = getSiteUrl()
  const locales = getLocales()
  const body = [
    `# ${SITE.name} — Authentication Policy`,
    '',
    `URL: ${site.origin}`,
    `Last updated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Current state',
    '',
    `\`${site.origin}\` is a public read-only blog. No login is required to read`,
    'any page, post, tag, category, or feed. No API keys, no session cookies,',
    'no user accounts are issued.',
    '',
    '## What you can do',
    '',
    `- Read posts in either locale: ${locales.map((locale) => `\`/${locale}\``).join(', ')}`,
    '- Subscribe via the RSS feed at `/rss.xml`',
    '- Use the on-site search',
    '- Read the sitemap at `/sitemap.xml`',
    '',
    '## What you cannot do',
    '',
    '- There is no write API. The blog does not accept POST, PUT, PATCH, or',
    '  DELETE requests from public clients.',
    '- There is no per-user personalization. Every visitor sees the same',
    '  content set.',
    '- There is no rate-limited public API surface beyond static asset',
    '  fetches.',
    '',
    '## Discovery endpoints',
    '',
    'The following endpoints exist for AI agents and crawlers. Most are',
    'honest stubs that document an absence rather than a real server role:',
    '',
    '| Endpoint | Role |',
    '|---|---|',
    '| `/.well-known/api-catalog` | Real: links to search, RSS, sitemap, this file |',
    '| `/.well-known/agent-skills/index.json` | Real: index of published skills (empty in Phase 1) |',
    '| `/.well-known/oauth-protected-resource` | Stub: declares no authorization servers required |',
    '| `/.well-known/oauth-authorization-server` | Stub: blog is not an OAuth server |',
    '| `/.well-known/openid-configuration` | Stub: blog is not an OIDC identity provider |',
    '| `/.well-known/mcp/server-card.json` | Stub: blog is not an MCP server today |',
    '',
    '`robots.txt` carries a `Content-Signal` line declaring: AI training',
    'not allowed (`ai-train=no`), search indexing allowed (`search=yes`),',
    'AI input grounding allowed (`ai-input=yes`).',
    '',
    '## Future intent',
    '',
    'If interactive or write-capable features are added later (comments,',
    'authenticated subscriptions, an MCP server, an OAuth-protected API),',
    'this file will document the supported flows, scopes, and discovery',
    'endpoints. Today, none of those roles are filled.',
    '',
    '## Contact',
    '',
    `Author: ${SITE.author}`,
    `Email: ${SITE.email}`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

- [ ] **Step 2: Build and verify**

Run: `pnpm web:build`
Then:

```bash
head -5 apps/web/dist/client/auth.md
grep -c "no auth required" apps/web/dist/client/auth.md || echo "missing keyword"
```

Expected: markdown file starts with `# DanhThanh.dev — Authentication Policy`. The `grep -c "no auth required"` is allowed to return 0 — the keyword used in the spec ("no login is required") is what matters, see next step.

- [ ] **Step 3: Add grep guard for E2E compatibility**

The E2E spec (Task 12) will check for the phrase "no auth required" — make the policy body include that exact phrase. Replace this paragraph in `auth.md.ts`:

```
    'any page, post, tag, category, or feed. No API keys, no session cookies,',
    'no user accounts are issued.',
```

with:

```
    'any page, post, tag, category, or feed. In short: no auth required.',
    'No API keys, no session cookies, no user accounts are issued.',
```

Re-build and verify:

```bash
pnpm web:build && grep "no auth required" apps/web/dist/client/auth.md
```

Expected: line containing "no auth required".

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/auth.md.ts
git commit -m "feat(web): add /auth.md plain-language auth policy"
```

---

### Task 12: E2E discovery spec

**Files:**
- Create: `e2e/pages/agent-discovery.spec.ts`

- [ ] **Step 1: Write the spec**

Create `e2e/pages/agent-discovery.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const ENDPOINTS: Array<{
  path: string
  contentType: string
  requiredJsonFields?: string[]
}> = [
  {
    path: '/.well-known/api-catalog',
    contentType: 'application/linkset+json',
    requiredJsonFields: ['linkset'],
  },
  {
    path: '/.well-known/oauth-protected-resource',
    contentType: 'application/json',
    requiredJsonFields: ['resource', 'authorization_servers'],
  },
  {
    path: '/.well-known/oauth-authorization-server',
    contentType: 'application/json',
    requiredJsonFields: ['issuer', 'authorization_endpoint'],
  },
  {
    path: '/.well-known/openid-configuration',
    contentType: 'application/json',
    requiredJsonFields: ['issuer', 'authorization_endpoint'],
  },
  {
    path: '/.well-known/mcp/server-card.json',
    contentType: 'application/json',
    requiredJsonFields: ['serverInfo', 'transport', 'tools'],
  },
  {
    path: '/.well-known/agent-skills/index.json',
    contentType: 'application/json',
    requiredJsonFields: ['issuer', 'count', 'skills'],
  },
]

test.describe('Agent discovery endpoints', () => {
  for (const endpoint of ENDPOINTS) {
    test(`${endpoint.path} returns 200 with expected content-type`, async ({
      request,
    }) => {
      const response = await request.get(endpoint.path)
      expect(response.status()).toBe(200)
      const contentType = response.headers()['content-type'] ?? ''
      expect(contentType).toContain(endpoint.contentType)

      if (endpoint.requiredJsonFields) {
        const body = await response.json()
        for (const field of endpoint.requiredJsonFields) {
          expect(body).toHaveProperty(field)
        }
      }
    })
  }

  test('/auth.md returns markdown with "no auth required"', async ({
    request,
  }) => {
    const response = await request.get('/auth.md')
    expect(response.status()).toBe(200)
    const contentType = response.headers()['content-type'] ?? ''
    expect(contentType).toContain('text/markdown')
    const body = await response.text()
    expect(body).toContain('no auth required')
  })

  test('/robots.txt contains Content-Signal directive', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('Content-Signal:')
    expect(body).toContain('ai-train=no')
    expect(body).toContain('search=yes')
    expect(body).toContain('ai-input=yes')
  })

  test('API catalog linkset references search, rss, sitemap, and /auth.md', async ({
    request,
  }) => {
    const response = await request.get('/.well-known/api-catalog')
    const body = await response.json()
    const flat = JSON.stringify(body)
    expect(flat).toContain('/search')
    expect(flat).toContain('/rss.xml')
    expect(flat).toContain('/sitemap.xml')
    expect(flat).toContain('/auth.md')
  })

  test('OAuth Protected Resource declares no authorization servers', async ({
    request,
  }) => {
    const response = await request.get('/.well-known/oauth-protected-resource')
    const body = await response.json()
    expect(Array.isArray(body.authorization_servers)).toBe(true)
    expect(body.authorization_servers.length).toBe(0)
  })
})
```

- [ ] **Step 2: Run the spec**

Run: `pnpm test:e2e -- agent-discovery`
Expected: all tests pass.

If the dev server is not already running on port 4321, Playwright will start it via the `webServer.command` configured in `playwright.config.ts` (`pnpm web:e2e:server`, which builds + previews).

- [ ] **Step 3: Commit**

```bash
git add e2e/pages/agent-discovery.spec.ts
git commit -m "test(e2e): add agent-discovery endpoint coverage"
```

---

### Task 13: Final verification + CHANGELOG

**Files:**
- Modify: `apps/web/README.md` (if it exists; otherwise skip)
- Create: `apps/web/README.md` only if missing — document the agent-readiness surface

- [ ] **Step 1: Run full check**

Run: `pnpm check`
Expected: lint, format:check, vitest, typecheck all pass.

- [ ] **Step 2: Run full build and inspect output**

Run: `pnpm web:build`
Then:

```bash
find apps/web/dist/client/.well-known -type f | sort
echo '---'
ls apps/web/dist/client/auth.md apps/web/dist/client/robots.txt
```

Expected: 6 files under `.well-known/` (`api-catalog.json`, `oauth-authorization-server.json`, `oauth-protected-resource.json`, `openid-configuration.json`, `mcp/server-card.json`, `agent-skills/index.json`) + `auth.md` + `robots.txt`.

- [ ] **Step 3: Run E2E spec one more time**

Run: `pnpm test:e2e -- agent-discovery`
Expected: all tests pass.

- [ ] **Step 4: Update apps/web/README.md if it exists**

Skip this step if `apps/web/README.md` does not exist. Otherwise, append a short section:

````markdown
## Agent-Readiness

This blog exposes the following machine-readable discovery surfaces:

| Path | Purpose |
|---|---|
| `/robots.txt` | Includes `Content-Signal: ai-train=no, search=yes, ai-input=yes` |
| `/.well-known/api-catalog` | RFC 9264 linkset pointing at search, RSS, sitemap, /auth.md |
| `/.well-known/oauth-protected-resource` | RFC 9728 — declares no auth servers required |
| `/.well-known/oauth-authorization-server` | RFC 8414 honest stub |
| `/.well-known/openid-configuration` | OIDC Discovery honest stub |
| `/.well-known/mcp/server-card.json` | MCP Server Card honest stub |
| `/.well-known/agent-skills/index.json` | Real: catalog of agent skills with sha256 |
| `/auth.md` | Plain-language auth policy |

The skills index is generated at build time from
`apps/web/src/lib/agent-skills.catalog.json` by
`apps/web/src/scripts/generate-agent-skills-index.mjs`. Add a skill by
creating `apps/web/public/.well-known/agent-skills/<id>/SKILL.md` and
appending the entry to the catalog JSON.
````

- [ ] **Step 5: Final commit**

```bash
git add apps/web/README.md 2>/dev/null || true
git commit -m "docs(web): document agent-readiness surface in README" || echo "no README change"
```

If the README does not exist or the previous step was skipped, no commit is made. The plan is complete.

---

## Completion Standard Checklist

- [ ] All 13 tasks committed with conventional-commit messages
- [ ] `pnpm check` passes
- [ ] `pnpm web:build` produces the 6 `.well-known/*.json` files + `auth.md` + `robots.txt` with `Content-Signal`
- [ ] `pnpm test:e2e -- agent-discovery` passes
- [ ] No `apps/web/src/lib/.generated/` files committed
- [ ] `apps/web/src/lib/agent-skills.catalog.json` is `[]`
