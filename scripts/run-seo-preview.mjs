import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const siteOrigin = process.argv[2] ?? process.env.PREVIEW_SITE_URL ?? 'http://seo.test:4321'
const environment = { ...process.env, SITE_URL: siteOrigin }
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const buildCommand = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : pnpmCommand
const buildArgs =
  process.platform === 'win32' ? ['/d', '/s', '/c', `${pnpmCommand} web:build`] : ['web:build']
const build = spawnSync(buildCommand, buildArgs, {
  env: environment,
  stdio: 'inherit',
})

if (build.status !== 0) process.exit(build.status ?? 1)

const root = resolve(fileURLToPath(new URL('../apps/web/dist/', import.meta.url)))
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}
const routeMimeTypes = {
  '/.well-known/api-catalog': 'application/linkset+json; charset=utf-8',
  '/.well-known/oauth-authorization-server': 'application/json; charset=utf-8',
  '/.well-known/oauth-protected-resource': 'application/json; charset=utf-8',
  '/.well-known/openid-configuration': 'application/json; charset=utf-8',
}

const contentTypeFor = (file) => {
  const relative = file.slice(root.length).replaceAll('\\', '/') || '/'
  return (
    routeMimeTypes[relative] ?? mimeTypes[extname(file).toLowerCase()] ?? 'application/octet-stream'
  )
}

const resolveFile = async (requestUrl) => {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname)
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
  const requested = normalize(join(root, relative))
  const safeRoot = `${root}${process.platform === 'win32' ? '\\' : '/'}`
  if (requested !== root && !requested.startsWith(safeRoot)) return undefined

  const candidates = [requested]
  if (!extname(requested)) candidates.push(join(requested, 'index.html'))

  for (const candidate of candidates) {
    try {
      const file = await stat(candidate)
      if (file.isFile()) return candidate
    } catch {
      // Try the next static route candidate.
    }
  }
  return undefined
}

const server = createServer(async (request, response) => {
  try {
    const requestedFile = await resolveFile(request.url ?? '/')
    const file =
      requestedFile ??
      (await stat(join(root, '404.html'))
        .then(() => join(root, '404.html'))
        .catch(() => undefined))
    if (!file) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }
    response.writeHead(requestedFile ? 200 : 404, {
      'cache-control': 'no-store',
      'content-type': contentTypeFor(file),
    })
    createReadStream(file).pipe(response)
  } catch {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Internal server error')
  }
})

const shutdown = () => server.close(() => process.exit(0))
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
server.listen(4321, '127.0.0.1')
