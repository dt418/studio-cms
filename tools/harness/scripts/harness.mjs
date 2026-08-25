#!/usr/bin/env node
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import path from 'node:path'

const HARNESS_DIRECTORY = '.harness'
const CONTEXT_OUTPUT_DIRECTORY = 'graphify-out'
const SOURCE_EXTENSIONS = new Set(['.astro', '.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx'])
const CONTEXT_EXTENSIONS = new Set([...SOURCE_EXTENSIONS, '.json', '.md', '.yaml', '.yml'])

function parseArgs(argv) {
  const [command = 'help', ...tokens] = argv
  const options = { command, _: [] }
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token.startsWith('--')) {
      options._.push(token)
      continue
    }
    const [rawKey, inlineValue] = token.slice(2).split('=', 2)
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    if (inlineValue !== undefined) options[key] = inlineValue
    else if (tokens[index + 1] && !tokens[index + 1].startsWith('--'))
      options[key] = tokens[++index]
    else options[key] = true
  }
  return options
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function packageCommands(target) {
  const packagePath = path.join(target, 'package.json')
  if (!(await exists(packagePath))) return []
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  const scripts = packageJson.scripts ?? {}
  const packageManager = (await exists(path.join(target, 'pnpm-lock.yaml'))) ? 'pnpm' : 'npm'
  const run = (name) => (packageManager === 'npm' ? `npm run ${name}` : `pnpm ${name}`)
  return ['check', 'typecheck', 'lint', 'test', 'build']
    .filter((name) => Boolean(scripts[name]))
    .map(run)
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/')
}

function compareText(left, right) {
  return left === right ? 0 : left < right ? -1 : 1
}

async function directoryEntries(directory) {
  try {
    return await readdir(directory, { withFileTypes: true })
  } catch {
    return []
  }
}

async function sourceFiles(directory, root) {
  const files = []
  for (const entry of await directoryEntries(directory)) {
    if (['.astro', '.git', 'dist', 'node_modules', 'coverage'].includes(entry.name)) continue
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await sourceFiles(entryPath, root)))
    else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)))
      files.push(toPosix(path.relative(root, entryPath)))
  }
  return files
}

async function filesWithExtensions(directory, root, extensions) {
  const files = []
  for (const entry of await directoryEntries(directory)) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory() && entry.name === 'npm-cache') continue
    if (entry.isDirectory()) files.push(...(await filesWithExtensions(entryPath, root, extensions)))
    else if (entry.isFile() && extensions.has(path.extname(entry.name)))
      files.push(toPosix(path.relative(root, entryPath)))
  }
  return files
}

async function discoverSourceFiles(target) {
  const roots = [
    path.join(target, 'src'),
    path.join(target, 'scripts'),
    path.join(target, 'tools'),
    path.join(target, '.opencode', 'plugins'),
  ]
  for (const container of ['apps', 'packages']) {
    for (const entry of await directoryEntries(path.join(target, container))) {
      if (entry.isDirectory()) roots.push(path.join(target, container, entry.name, 'src'))
    }
  }
  const files = await Promise.all(roots.map((directory) => sourceFiles(directory, target)))
  return [...new Set(files.flat())].sort()
}

async function discoverContextFiles(target, sources) {
  const rootFiles = ['package.json', 'skills-lock.json', 'AGENTS.md', 'CLAUDE.md', 'opencode.json']
  const directories = [
    path.join(target, HARNESS_DIRECTORY),
    path.join(target, 'agents'),
    path.join(target, 'skills'),
    path.join(target, '.codex'),
    path.join(target, '.github', 'workflows'),
    path.join(target, '.claude', 'commands'),
    path.join(target, '.opencode', 'commands'),
    path.join(target, '.opencode', 'plugins'),
  ]
  const discovered = await Promise.all(
    directories.map((directory) => filesWithExtensions(directory, target, CONTEXT_EXTENSIONS))
  )
  return [...new Set([...sources, ...rootFiles, ...discovered.flat()])].sort()
}

async function existingContextFiles(target, sources) {
  const candidates = await discoverContextFiles(target, sources)
  const files = []
  for (const filePath of candidates)
    if (await exists(path.join(target, filePath))) files.push(filePath)
  return files
}

async function projectIdentity(target) {
  const packagePath = path.join(target, 'package.json')
  if (!(await exists(packagePath))) return 'workspace'
  try {
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
    return typeof packageJson.name === 'string' && packageJson.name ? packageJson.name : 'workspace'
  } catch {
    return 'workspace'
  }
}

async function contextFingerprint(target, files) {
  const hash = createHash('sha256')
  for (const filePath of files) {
    hash.update(filePath)
    hash.update('\0')
    hash.update(await readFile(path.join(target, filePath)))
    hash.update('\0')
  }
  return hash.digest('hex')
}

async function directoryHash(directory) {
  const hash = createHash('sha256')
  async function addFiles(currentDirectory) {
    const entries = await directoryEntries(currentDirectory)
    entries.sort((left, right) => (left.name === right.name ? 0 : left.name < right.name ? -1 : 1))
    for (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name)
      if (entry.isDirectory()) await addFiles(entryPath)
      else if (entry.isSymbolicLink())
        throw new Error(
          `Unsupported symlink in installed skill: ${toPosix(path.relative(directory, entryPath))}`
        )
      else if (entry.isFile()) {
        hash.update(toPosix(path.relative(directory, entryPath)))
        hash.update('\0')
        hash.update(await readFile(entryPath))
        hash.update('\0')
      }
    }
  }
  await addFiles(directory)
  return hash.digest('hex')
}

function contextKind(filePath, sourceSet) {
  if (sourceSet.has(filePath)) return 'source'
  if (filePath === 'package.json') return 'manifest'
  if (filePath.endsWith('.md') && (filePath === 'AGENTS.md' || filePath === 'CLAUDE.md'))
    return 'instructions'
  if (filePath.startsWith(`${HARNESS_DIRECTORY}/`)) return 'harness'
  if (filePath === 'skills-lock.json' || filePath.startsWith('skills/')) return 'skills'
  return 'context'
}

function importSpecifiers(source) {
  const pattern =
    /(?:import|export)\s+(?:[^'"\n]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
  return [...source.matchAll(pattern)].map((match) => match[1] ?? match[2]).filter(Boolean)
}

function packageName(specifier) {
  const segments = specifier.split('/')
  return specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]
}

async function resolveRelativeImport(target, sourceFile, specifier) {
  const base = path.resolve(path.dirname(path.join(target, sourceFile)), specifier)
  const candidates = [
    base,
    ...[...SOURCE_EXTENSIONS].map((extension) => `${base}${extension}`),
    ...[...SOURCE_EXTENSIONS].map((extension) => path.join(base, `index${extension}`)),
  ]
  for (const candidate of candidates) {
    if (await exists(candidate)) return toPosix(path.relative(target, candidate))
  }
  return null
}

async function buildContextGraph(target) {
  const nodes = new Map()
  const edges = new Map()
  const addNode = (id, kind, label, filePath) => {
    if (!nodes.has(id)) nodes.set(id, { id, kind, label, ...(filePath && { path: filePath }) })
  }
  const addEdge = (from, to, type) => edges.set(`${from}|${to}|${type}`, { from, to, type })
  const workspaceId = 'workspace:root'
  const identity = await projectIdentity(target)
  addNode(workspaceId, 'workspace', identity)

  const files = await discoverSourceFiles(target)
  const sourceSet = new Set(files)
  const contextFiles = await existingContextFiles(target, files)
  for (const filePath of contextFiles) {
    const kind = contextKind(filePath, sourceSet)
    const id = `file:${filePath}`
    addNode(id, kind, path.basename(filePath), filePath)
    addEdge(workspaceId, id, kind === 'instructions' ? 'governed-by' : 'contains')
  }

  for (const filePath of files) {
    const sourceId = `file:${filePath}`
    const source = await readFile(path.join(target, filePath), 'utf8')
    for (const specifier of importSpecifiers(source)) {
      if (specifier.startsWith('.')) {
        const resolved = await resolveRelativeImport(target, filePath, specifier)
        if (resolved) addEdge(sourceId, `file:${resolved}`, 'imports')
        continue
      }
      if (specifier.startsWith('@/')) {
        const resolved = await resolveRelativeImport(
          target,
          'apps/web/src/index.ts',
          `.${specifier.slice(1)}`
        )
        if (resolved) addEdge(sourceId, `file:${resolved}`, 'imports')
        continue
      }
      const dependency = packageName(specifier)
      if (!dependency) continue
      const dependencyId = `package:${dependency}`
      addNode(dependencyId, 'dependency', dependency)
      addEdge(sourceId, dependencyId, 'imports')
    }
  }

  return {
    version: 2,
    root: identity,
    fingerprints: { context: await contextFingerprint(target, contextFiles) },
    nodes: [...nodes.values()].sort((left, right) => compareText(left.id, right.id)),
    edges: [...edges.values()].sort((left, right) => {
      const leftKey = `${left.from}|${left.to}|${left.type}`
      const rightKey = `${right.from}|${right.to}|${right.type}`
      return compareText(leftKey, rightKey)
    }),
  }
}

function contextReport(graph) {
  const degree = new Map(graph.nodes.map((node) => [node.id, 0]))
  for (const edge of graph.edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1)
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1)
  }
  const central = [...degree.entries()]
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1] || compareText(left[0], right[0]))
    .slice(0, 10)

  return [
    '# Context Graph',
    '',
    'Regenerate with `pnpm harness:context` after source, workspace, or harness changes.',
    '',
    '## Summary',
    '',
    `- Nodes: ${graph.nodes.length}`,
    `- Edges: ${graph.edges.length}`,
    `- Context fingerprint: \`${graph.fingerprints.context}\``,
    '',
    '## High-connectivity nodes',
    '',
    ...(central.length ? central.map(([id, count]) => `- \`${id}\` (${count} links)`) : ['- None']),
    '',
  ].join('\n')
}

async function context(target, check = false) {
  const graph = await buildContextGraph(target)
  const graphSource = `${JSON.stringify(graph, null, 2)}\n`
  const reportSource = contextReport(graph)
  const outputDirectory = path.join(target, CONTEXT_OUTPUT_DIRECTORY)
  const graphPath = path.join(outputDirectory, 'graph.json')
  const reportPath = path.join(outputDirectory, 'GRAPH_REPORT.md')

  if (check) {
    const currentGraph = (await exists(graphPath)) ? await readFile(graphPath, 'utf8') : ''
    const currentReport = (await exists(reportPath)) ? await readFile(reportPath, 'utf8') : ''
    if (currentGraph !== graphSource || currentReport !== reportSource) {
      console.error('Context graph is out of date. Run "pnpm harness:context".')
      process.exitCode = 1
    } else console.log('Context graph is current.')
    return
  }

  await mkdir(outputDirectory, { recursive: true })
  await writeFile(graphPath, graphSource, 'utf8')
  await writeFile(reportPath, reportSource, 'utf8')
  console.log(`Context graph written to ${outputDirectory}`)
}

function initModule() {
  return [
    "import { readFile } from 'node:fs/promises'",
    "import { spawn } from 'node:child_process'",
    '',
    "const commands = JSON.parse(await readFile(new URL('./commands.json', import.meta.url), 'utf8'))",
    '',
    'function run(command) {',
    '  return new Promise((resolve) => {',
    "    const child = spawn(command, { shell: true, stdio: 'inherit' })",
    "    child.on('close', (code) => resolve(code ?? 1))",
    '  })',
    '}',
    '',
    'for (const command of commands) {',
    '  console.log(`\\n[harness] ${command}`)',
    '  if (await run(command) !== 0) process.exit(1)',
    '}',
    '',
    "console.log('\\n[harness] verification complete')",
    '',
  ].join('\n')
}

function orchestration() {
  return {
    version: 1,
    defaultRuntime: 'generic',
    roles: {
      'spec-creator': 'tera-high',
      planning: 'tera-high',
      implementation: 'luna-max',
      'documentation-sync': 'tera-medium',
      reviewer: 'tera-medium',
      qa: 'tera-high',
      tester: 'luna-max',
      observer: 'tera-medium',
    },
    riskEscalations: {
      reviewer: {
        high: 'tera-high',
        triggers: ['authentication', 'authorization', 'data-migration', 'payment', 'security'],
      },
    },
    runtimes: ['codex', 'claude', 'pi', 'omp', 'opencode'],
    sharedState: ['tasks', 'decisions', 'patches', 'reviews', 'reports'],
  }
}

function defaultManifest(commands) {
  return {
    version: 1,
    verification: { entrypoint: '.harness/init.mjs', commands },
    policies: { default: 'deny', merge: 'human-or-lead-agent-only' },
    state: {
      tasks: 'tasks/',
      decisions: 'decisions/',
      reports: 'reports/',
      featureList: 'feature-list.json',
      handoff: 'session-handoff.md',
    },
  }
}

function sessionHandoffTemplate() {
  return [
    '# Session Handoff',
    '',
    '## Last Updated',
    '',
    'Not started.',
    '',
    '## Current Objective',
    '',
    'No active task.',
    '',
    '## Completed',
    '',
    '- None.',
    '',
    '## Blockers',
    '',
    '- None.',
    '',
    '## Verification Evidence',
    '',
    '- Not run.',
    '',
    '## Recommended Next Step',
    '',
    '1. Read `.harness/state.json` and this handoff, then select a role with `pnpm harness:orchestrate`.',
    '',
  ].join('\n')
}

async function initialize(target, force = false) {
  const directory = path.join(target, HARNESS_DIRECTORY)
  const commands = await packageCommands(target)
  await Promise.all(
    ['tasks', 'decisions', 'patches', 'reviews', 'reports'].map(async (name) => {
      const artifactDirectory = path.join(directory, name)
      await mkdir(artifactDirectory, { recursive: true })
      await writeFile(path.join(artifactDirectory, '.gitkeep'), '', 'utf8')
    })
  )
  const files = {
    'manifest.json': defaultManifest(commands),
    'commands.json': commands,
    'orchestration.json': orchestration(),
    'external-skills.json': { version: 1, skills: [] },
    'state.json': { version: 1, currentTask: null, updatedAt: null },
    'feature-list.json': { version: 1, activeFeature: null, features: [] },
    'policies/permissions.json': {
      default: 'deny',
      allowed: ['read', 'write-workspace', 'run-verification'],
    },
    'policies/merge.json': { allowedRoles: ['human', 'lead-agent'], requireVerification: true },
    'schemas/task.schema.json': {
      type: 'object',
      required: ['task_id', 'status'],
      properties: { task_id: { type: 'string' }, status: { type: 'string' } },
    },
    'schemas/decision.schema.json': {
      type: 'object',
      required: ['artifact_id', 'version'],
      properties: { artifact_id: { type: 'string' }, version: { type: 'number' } },
    },
    'schemas/patch.schema.json': {
      type: 'object',
      required: ['artifact_id', 'task_id'],
      properties: { artifact_id: { type: 'string' }, task_id: { type: 'string' } },
    },
    'schemas/review.schema.json': {
      type: 'object',
      required: ['artifact_id', 'status'],
      properties: { artifact_id: { type: 'string' }, status: { type: 'string' } },
    },
    'schemas/report.schema.json': {
      type: 'object',
      required: ['artifact_id', 'version'],
      properties: { artifact_id: { type: 'string' }, version: { type: 'number' } },
    },
    'schemas/feature-list.schema.json': {
      type: 'object',
      required: ['version', 'activeFeature', 'features'],
      properties: {
        version: { type: 'number' },
        activeFeature: { type: ['string', 'null'] },
        features: { type: 'array' },
      },
    },
  }
  for (const [relativePath, value] of Object.entries(files)) {
    const filePath = path.join(directory, relativePath)
    if (force || !(await exists(filePath))) await writeJson(filePath, value)
  }
  const initPath = path.join(directory, 'init.mjs')
  if (force || !(await exists(initPath))) await writeFile(initPath, initModule(), 'utf8')
  const handoffPath = path.join(directory, 'session-handoff.md')
  if (force || !(await exists(handoffPath)))
    await writeFile(handoffPath, sessionHandoffTemplate(), 'utf8')
  await context(target)
  console.log(`Harness initialized at ${directory}`)
}

async function validate(target, json = false) {
  const directory = path.join(target, HARNESS_DIRECTORY)
  const requirements = {
    instructions: [],
    state: [
      'state.json',
      'feature-list.json',
      'schemas/task.schema.json',
      'schemas/decision.schema.json',
      'schemas/patch.schema.json',
      'schemas/review.schema.json',
      'schemas/report.schema.json',
      'schemas/feature-list.schema.json',
    ],
    verification: ['init.mjs', 'commands.json'],
    scope: ['policies/permissions.json'],
    lifecycle: [
      'manifest.json',
      'policies/merge.json',
      'orchestration.json',
      'external-skills.json',
      'session-handoff.md',
    ],
  }
  const subsystems = {}
  for (const [name, files] of Object.entries(requirements)) {
    const missing = []
    const invalid = []
    for (const file of files) {
      const filePath = path.join(directory, file)
      if (!(await exists(filePath))) {
        missing.push(file)
        continue
      }
      if (path.extname(file) === '.json') {
        try {
          JSON.parse(await readFile(filePath, 'utf8'))
        } catch {
          invalid.push(file)
        }
      }
    }
    subsystems[name] = { pass: missing.length === 0 && invalid.length === 0, missing, invalid }
  }
  const hasInstructions =
    (await exists(path.join(target, 'AGENTS.md'))) || (await exists(path.join(target, 'CLAUDE.md')))
  subsystems.instructions = {
    pass: hasInstructions,
    missing: hasInstructions ? [] : ['AGENTS.md or CLAUDE.md'],
    invalid: [],
  }
  const passed = Object.values(subsystems).filter((item) => item.pass).length
  const result = { score: Math.round((passed / Object.keys(subsystems).length) * 100), subsystems }
  if (json) console.log(JSON.stringify(result))
  else {
    console.log(`Harness score: ${result.score}/100`)
    for (const [name, item] of Object.entries(subsystems)) {
      const problems = [...item.missing, ...(item.invalid ?? []).map((file) => `invalid ${file}`)]
      console.log(
        `${item.pass ? 'PASS' : 'FAIL'} ${name}${problems.length ? `: ${problems.join(', ')}` : ''}`
      )
    }
  }
  return result
}

async function runVerification(target) {
  const entrypoint = path.join(target, HARNESS_DIRECTORY, 'init.mjs')
  if (!(await exists(entrypoint)))
    throw new Error('Harness is not initialized. Run "pnpm harness:init" first.')
  const child = spawn(process.execPath, [entrypoint], { cwd: target, stdio: 'inherit' })
  await new Promise((resolve) => child.on('close', resolve))
  if (child.exitCode !== 0) process.exitCode = child.exitCode ?? 1
}

async function status(target) {
  const result = await validate(target, true)
  if (result.score < 100) process.exitCode = 1
}

async function verifySkills(target) {
  const manifestPath = path.join(target, HARNESS_DIRECTORY, 'external-skills.json')
  const lockPath = path.join(target, 'skills-lock.json')
  if (!(await exists(manifestPath)))
    throw new Error('External skill manifest is missing. Run "pnpm harness:skills:sync" first.')
  if (!(await exists(lockPath)))
    throw new Error('skills-lock.json is missing. Run "pnpm harness:skills:sync" first.')

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const lock = JSON.parse(await readFile(lockPath, 'utf8'))
  const issues = []
  for (const skillSet of manifest.skills ?? []) {
    for (const name of skillSet.expected ?? []) {
      const lockedSkill = lock.skills?.[name]
      if (!lockedSkill || lockedSkill.source !== skillSet.source)
        issues.push(`Missing lock entry: ${name}`)
      const expectedLockHash = skillSet.lockHashes?.[name]
      if (expectedLockHash && lockedSkill?.computedHash !== expectedLockHash)
        issues.push(`Changed locked skill: ${name}`)
      const skillDirectory = path.join(target, '.agents', 'skills', name)
      if (!(await exists(path.join(skillDirectory, 'SKILL.md')))) {
        issues.push(`Missing installed skill: ${name}`)
        continue
      }
      const expectedContentHash = skillSet.contentHashes?.[name]
      try {
        const installedContentHash = await directoryHash(skillDirectory)
        if (expectedContentHash && installedContentHash !== expectedContentHash)
          issues.push(`Changed installed skill: ${name}`)
      } catch (error) {
        issues.push(error instanceof Error ? error.message : `Invalid installed skill: ${name}`)
      }
    }
  }
  if (issues.length) {
    for (const issue of issues) console.error(issue)
    console.error('Run "pnpm harness:skills:sync" to install the declared skills.')
    process.exitCode = 1
    return
  }
  console.log('External skills match the declared lock.')
}

async function route(target, role, runtime, risk, json = false) {
  const configPath = path.join(target, HARNESS_DIRECTORY, 'orchestration.json')
  if (!(await exists(configPath)))
    throw new Error('Harness is not initialized. Run "pnpm harness:init" first.')
  const config = JSON.parse(await readFile(configPath, 'utf8'))
  const selectedRole = role === true ? 'planning' : (role ?? 'planning')
  const selectedRuntime =
    runtime === true ? config.defaultRuntime : (runtime ?? config.defaultRuntime)
  const selectedRisk = risk === true ? 'standard' : (risk ?? 'standard')
  if (!config.roles[selectedRole]) throw new Error(`Unknown orchestration role: ${selectedRole}`)
  if (!config.runtimes.includes(selectedRuntime) && selectedRuntime !== 'generic')
    throw new Error(`Unknown runtime: ${selectedRuntime}`)
  const escalation = config.riskEscalations?.[selectedRole]
  if (selectedRisk !== 'standard' && !escalation?.[selectedRisk])
    throw new Error(`No ${selectedRisk} risk escalation for role: ${selectedRole}`)
  const result = {
    role: selectedRole,
    model: escalation?.[selectedRisk] ?? config.roles[selectedRole],
    runtime: selectedRuntime,
    ...(selectedRisk !== 'standard' && { risk: selectedRisk }),
  }
  if (json) console.log(JSON.stringify(result))
  else console.log(`${result.role} → ${result.model} (${result.runtime})`)
}

const options = parseArgs(process.argv.slice(2))
const target = path.resolve(
  options.target === true ? process.cwd() : (options.target ?? options._[0] ?? process.cwd())
)

if (options.command === 'init') await initialize(target, options.force === true)
else if (options.command === 'validate') {
  const result = await validate(target, options.json === true)
  const minimum = Number(options.minScore === true ? 70 : (options.minScore ?? 70))
  if (result.score < minimum) process.exitCode = 1
} else if (options.command === 'verify') await runVerification(target)
else if (options.command === 'status') await status(target)
else if (options.command === 'context') await context(target, options.check === true)
else if (options.command === 'skills') await verifySkills(target)
else if (options.command === 'orchestrate')
  await route(target, options.role, options.runtime, options.risk, options.json === true)
else {
  console.log(
    'Usage: node tools/harness/scripts/harness.mjs <init|status|validate|verify|context|skills|orchestrate> [--target DIR] [--json]'
  )
}
