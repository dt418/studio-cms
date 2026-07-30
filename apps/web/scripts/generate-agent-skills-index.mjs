#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const here = dirname(fileURLToPath(import.meta.url))
const webRoot = join(here, '..')
const catalogPath = join(webRoot, 'src', 'lib', 'agent-skills.catalog.json')
const outputDir = join(webRoot, 'src', 'lib', '.generated')
const outputPath = join(outputDir, 'agent-skills-index.json')

const raw = readFileSync(catalogPath, 'utf8')
const catalog = JSON.parse(raw)

if (!Array.isArray(catalog)) {
  console.error(`agent-skills.catalog.json must be an array, got ${typeof catalog}`)
  process.exit(1)
}

const siteUrl = process.env.SITE_URL ?? process.env.CF_PAGES_URL ?? 'http://localhost:4321'

const skills = catalog.map((entry) => {
  if (typeof entry.path !== 'string' || !entry.path.startsWith('/')) {
    console.error(`skill "${entry.id}" path must be an absolute path; got ${entry.path}`)
    process.exit(1)
  }
  const url = `${siteUrl}${entry.path}`
  const skillSource = join(webRoot, 'agent-skills', entry.id, 'SKILL.md')
  const content = readFileSync(skillSource, 'utf8')
  const sha256 = createHash('sha256').update(content).digest('hex')
  return { ...entry, url, sha256 }
})

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, JSON.stringify({ skills }, null, 2) + '\n')
console.log(`wrote ${skills.length} skill(s) to ${outputPath}`)