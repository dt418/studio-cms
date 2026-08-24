import { spawnSync } from 'node:child_process'

const input = await new Promise((resolve) => {
  let value = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => {
    value += chunk
  })
  process.stdin.on('end', () => resolve(value))
})

let payload = {}
try {
  payload = input.trim() ? JSON.parse(input) : {}
} catch {
  // Non-Claude callers may not provide JSON. The guard remains a no-op.
}

const command = payload?.tool_input?.command ?? payload?.command ?? ''
if (!/\bgit\s+commit\b/.test(command)) process.exit(0)

if (/git\s+(?:commit|push)\b.*(?:--no-verify|-n\b)/.test(command)) {
  console.error('BLOCKED: --no-verify is not allowed. Fix the failing hook instead.')
  process.exit(1)
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const result = spawnSync(pnpm, ['check'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
