import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const repoRoot = new URL('..', import.meta.url).pathname
const scanRoots = ['apps']
const ignoredDirectories = new Set(['.astro', 'dist', 'node_modules', 'coverage', '.turbo'])
const includedExtensions = new Set([
  '.astro',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])

const rules = [
  {
    name: 'no-deprecated-zod-string-url',
    pattern: /z\.string\(\)\.url\(/,
    message: 'Use z.url() instead of deprecated z.string().url().',
  },
  {
    name: 'astro-script-set-html-requires-inline',
    pattern: /<script(?![^>]*\bis:inline\b)[^>]*\bset:html=/,
    message: 'Add is:inline to Astro <script> tags that use set:html.',
  },
]

const failures = []

async function directoryExists(path) {
  try {
    await readdir(path)
    return true
  } catch {
    return false
  }
}

function extensionOf(path) {
  const match = path.match(/\.[^.]+$/)
  return match?.[0] ?? ''
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)

      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          await walk(path)
        }
        return
      }

      if (!entry.isFile() || !includedExtensions.has(extensionOf(entry.name))) {
        return
      }

      const content = await readFile(path, 'utf8')
      for (const rule of rules) {
        const match = rule.pattern.exec(content)
        if (match) {
          const line = content.slice(0, match.index).split('\n').length
          failures.push({ path: relative(repoRoot, path), line, rule })
        }
      }
    })
  )
}

for (const root of scanRoots) {
  const path = join(repoRoot, root)
  if (await directoryExists(path)) {
    await walk(path)
  }
}

if (failures.length > 0) {
  console.error('Pattern lint failed:')
  for (const failure of failures) {
    console.error(
      `- ${failure.path}:${failure.line} [${failure.rule.name}] ${failure.rule.message}`
    )
  }
  process.exit(1)
}

console.log('Pattern lint passed')
