import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const webVars = ['PUBLIC_SITE_URL', 'CF_PAGES_URL']
const cmsVars = [
  'CMS_LIBSQL_URL',
  'LIBSQL_URL',
  'CMS_LIBSQL_AUTH_TOKEN',
  'LIBSQL_AUTH_TOKEN',
  'CMS_ENCRYPTION_KEY',
  'CMS_GITHUB_CLIENT_ID',
  'CMS_GITHUB_CLIENT_SECRET',
  'CMS_GITHUB_REDIRECT_URI',
  'CMS_GOOGLE_CLIENT_ID',
  'CMS_GOOGLE_CLIENT_SECRET',
  'CMS_GOOGLE_REDIRECT_URI',
  'CMS_SITE_URL',
  'PUBLIC_CMS_SITE_URL',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'PUBLIC_SITE_URL',
]

function parseEnv(path) {
  const content = readFileSync(path, 'utf-8')
  const map = Object.create(null)
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    map[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return map
}

function writeEnv(path, vars, source) {
  const lines = vars.filter((k) => k in source).map((k) => `${k}=${source[k]}`)
  writeFileSync(path, lines.join('\n') + '\n')
}

const reverse = process.argv.includes('--reverse')

if (reverse) {
  // per-app .env → root .env
  const web = parseEnv(resolve(root, 'apps/web/.env'))
  const cms = parseEnv(resolve(root, 'apps/cms/.env'))
  const merged = { ...web, ...cms }
  const rootPath = resolve(root, '.env')
  const existing = (() => {
    try { return parseEnv(rootPath) } catch { return {} }
  })()
  const combined = { ...existing, ...merged }
  const lines = Object.entries(combined).map(([k, v]) => `${k}=${v}`)
  writeFileSync(rootPath, lines.join('\n') + '\n')
  console.log('Merged per-app .env into root .env')
} else {
  // root .env → per-app .env
  const rootEnv = parseEnv(resolve(root, '.env'))
  writeEnv(resolve(root, 'apps/web/.env'), webVars, rootEnv)
  writeEnv(resolve(root, 'apps/cms/.env'), cmsVars, rootEnv)
  console.log('Synced per-app .env files from root .env')
}
