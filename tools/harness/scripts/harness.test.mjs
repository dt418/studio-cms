import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawn } from 'node:child_process'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const cliPath = path.join(scriptDirectory, 'harness.mjs')
const graphifyPluginPath = path.resolve(scriptDirectory, '../../../.opencode/plugins/graphify.js')
const harnessGuardPath = path.resolve(
  scriptDirectory,
  '../../../.opencode/plugins/harness-guard.ts'
)

function runCli(args, cwd, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stdout, stderr }))
  })
}

function runGuard(command) {
  const source = [
    `import createPlugin from ${JSON.stringify(pathToFileURL(harnessGuardPath).href)}`,
    'const plugin = await createPlugin()',
    `const output = { args: { command: ${JSON.stringify(command)} } }`,
    "await plugin['tool.execute.before']({ tool: 'shell' }, output)",
    'process.stdout.write(output.args.command)',
  ].join('\n')
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--experimental-strip-types', '--input-type=module', '-e', source],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    )
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject(new Error(stderr || `guard exited with code ${code}`))
    })
  })
}

test('init creates a Node verification entrypoint and validate recognizes it', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-harness-'))

  try {
    await writeFile(
      path.join(target, 'package.json'),
      JSON.stringify({ name: 'fixture', scripts: { test: 'node --version' } }),
      'utf8'
    )
    await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')

    const initialized = await runCli(['init', '--target', target], target)
    assert.equal(initialized.code, 0, initialized.stderr)

    const initSource = await readFile(path.join(target, '.harness', 'init.mjs'), 'utf8')
    assert.match(initSource, /node:child_process/)
    const artifactDirectories = await readdir(path.join(target, '.harness'))
    for (const directory of ['tasks', 'decisions', 'patches', 'reviews', 'reports']) {
      assert.ok(artifactDirectories.includes(directory), `missing ${directory}`)
      await readFile(path.join(target, '.harness', directory, '.gitkeep'), 'utf8')
    }

    const validated = await runCli(
      ['validate', '--target', target, '--json', '--min-score', '100'],
      target
    )
    assert.equal(validated.code, 0, validated.stderr)
    const report = JSON.parse(validated.stdout)
    assert.equal(report.score, 100)
    assert.equal(report.subsystems.verification.pass, true)
    const manifest = JSON.parse(
      await readFile(path.join(target, '.harness', 'manifest.json'), 'utf8')
    )
    assert.equal(manifest.state.patches, 'patches/')
    assert.equal(manifest.state.reviews, 'reviews/')
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('init creates bounded feature state and a session handoff template', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-lifecycle-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)

    const featureList = JSON.parse(
      await readFile(path.join(target, '.harness', 'feature-list.json'), 'utf8')
    )
    assert.deepEqual(featureList, { version: 1, activeFeature: null, features: [] })

    const handoff = await readFile(path.join(target, '.harness', 'session-handoff.md'), 'utf8')
    assert.match(handoff, /Current Objective/)
    assert.match(handoff, /Verification Evidence/)
    assert.match(handoff, /Recommended Next Step/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('validate rejects malformed required harness JSON', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-validation-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)
    await writeFile(path.join(target, '.harness', 'orchestration.json'), '{invalid json', 'utf8')

    const validated = await runCli(['validate', '--target', target, '--json'], target)
    assert.equal(validated.code, 1)
    const report = JSON.parse(validated.stdout)
    assert.equal(report.subsystems.lifecycle.pass, false)
    assert.deepEqual(report.subsystems.lifecycle.invalid, ['orchestration.json'])
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('validate rejects a structurally incomplete orchestration config', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-orchestration-validation-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)
    await writeFile(path.join(target, '.harness', 'orchestration.json'), '{}', 'utf8')

    const validated = await runCli(
      ['validate', '--target', target, '--json', '--min-score', '100'],
      target
    )
    assert.equal(validated.code, 1)
    const report = JSON.parse(validated.stdout)
    assert.equal(report.subsystems.lifecycle.pass, false)
    assert.deepEqual(report.subsystems.lifecycle.invalid, ['orchestration.json'])
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context creates a source graph and detects a stale snapshot', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-context-'))

  try {
    await mkdir(path.join(target, 'apps', 'web', 'src'), { recursive: true })
    await mkdir(path.join(target, 'tools', 'harness', 'scripts'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')
    await writeFile(
      path.join(target, 'apps', 'web', 'src', 'index.ts'),
      "import './utility'\n",
      'utf8'
    )
    await writeFile(
      path.join(target, 'apps', 'web', 'src', 'utility.ts'),
      'export const utility = true\n',
      'utf8'
    )
    await writeFile(
      path.join(target, 'tools', 'harness', 'scripts', 'task.mjs'),
      'export {}\n',
      'utf8'
    )
    await runCli(['init', '--target', target], target)

    const generated = await runCli(['context', '--target', target], target)
    assert.equal(generated.code, 0, generated.stderr)
    const graph = JSON.parse(
      await readFile(path.join(target, 'graphify-out', 'graph.json'), 'utf8')
    )
    assert.equal(graph.root, 'fixture')
    assert.ok(graph.fingerprints.context)
    assert.ok(graph.nodes.some((node) => node.id === 'file:apps/web/src/index.ts'))
    assert.ok(graph.nodes.some((node) => node.id === 'file:tools/harness/scripts/task.mjs'))
    assert.ok(
      graph.edges.some(
        (edge) =>
          edge.from === 'file:apps/web/src/index.ts' &&
          edge.to === 'file:apps/web/src/utility.ts' &&
          edge.type === 'imports'
      )
    )

    const fresh = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(fresh.code, 0, fresh.stderr)

    await writeFile(
      path.join(target, 'apps', 'web', 'src', 'utility.ts'),
      'export const utility = false\n',
      'utf8'
    )
    const staleContent = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(staleContent.code, 1)
    assert.match(staleContent.stderr, /out of date/)

    await writeFile(path.join(target, 'apps', 'web', 'src', 'new-file.ts'), 'export {}\n', 'utf8')
    const stale = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(stale.code, 1)
    assert.match(stale.stderr, /out of date/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context graph is portable across checkout directory names', async () => {
  const firstTarget = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-portable-a-'))
  const secondTarget = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-portable-b-'))

  try {
    for (const target of [firstTarget, secondTarget]) {
      await mkdir(path.join(target, 'src'), { recursive: true })
      await writeFile(
        path.join(target, 'package.json'),
        JSON.stringify({ name: 'fixture' }),
        'utf8'
      )
      await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')
      await writeFile(path.join(target, 'src', 'index.ts'), 'export const fixture = true\n', 'utf8')
    }

    const generated = await runCli(['context', '--target', firstTarget], firstTarget)
    assert.equal(generated.code, 0, generated.stderr)
    await cp(path.join(firstTarget, 'graphify-out'), path.join(secondTarget, 'graphify-out'), {
      recursive: true,
    })

    const checked = await runCli(['context', '--target', secondTarget, '--check'], secondTarget)
    assert.equal(checked.code, 0, checked.stderr)
  } finally {
    await rm(firstTarget, { recursive: true, force: true })
    await rm(secondTarget, { recursive: true, force: true })
  }
})

test('context resolves directory imports to index files', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-context-index-import-'))

  try {
    await mkdir(path.join(target, 'src', 'lib', 'i18n'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')
    await writeFile(path.join(target, 'src', 'index.ts'), "import './lib/i18n'\n", 'utf8')
    await writeFile(
      path.join(target, 'src', 'lib', 'i18n', 'index.ts'),
      'export const locale = "en"\n',
      'utf8'
    )

    await runCli(['context', '--target', target], target)
    const graph = JSON.parse(
      await readFile(path.join(target, 'graphify-out', 'graph.json'), 'utf8')
    )
    assert.ok(
      graph.edges.some(
        (edge) =>
          edge.from === 'file:src/index.ts' &&
          edge.to === 'file:src/lib/i18n/index.ts' &&
          edge.type === 'imports'
      )
    )
    assert.ok(
      !graph.edges.some(
        (edge) =>
          edge.from === 'file:src/index.ts' &&
          edge.to === 'file:src/lib/i18n' &&
          edge.type === 'imports'
      )
    )
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context graph is stable when locale comparison behavior differs', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-locale-portability-'))
  const localeShim = path.join(target, 'reverse-locale-compare.cjs')

  try {
    await mkdir(path.join(target, 'src'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')
    await writeFile(path.join(target, 'src', 'alpha.ts'), 'export const alpha = true\n', 'utf8')
    await writeFile(path.join(target, 'src', 'beta.ts'), 'export const beta = true\n', 'utf8')
    await writeFile(
      localeShim,
      'String.prototype.localeCompare = function (other) { return this < other ? 1 : this > other ? -1 : 0 }\n',
      'utf8'
    )

    const generated = await runCli(['context', '--target', target], target)
    assert.equal(generated.code, 0, generated.stderr)

    const checked = await runCli(['context', '--target', target, '--check'], target, {
      NODE_OPTIONS: `--require=${localeShim}`,
    })
    assert.equal(checked.code, 0, checked.stderr)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context graph fingerprint ignores checkout line-ending conversion', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-line-endings-'))

  try {
    await mkdir(path.join(target, 'src'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')
    await writeFile(path.join(target, 'src', 'index.ts'), 'export const fixture = true\n', 'utf8')

    const generated = await runCli(['context', '--target', target], target)
    assert.equal(generated.code, 0, generated.stderr)

    await writeFile(path.join(target, 'src', 'index.ts'), 'export const fixture = true\r\n', 'utf8')
    const checked = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(checked.code, 0, checked.stderr)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context check ignores line-ending conversion in generated snapshots', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-snapshot-line-endings-'))

  try {
    await mkdir(path.join(target, 'src'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(path.join(target, 'AGENTS.md'), '# Fixture instructions\n', 'utf8')
    await writeFile(path.join(target, 'src', 'index.ts'), 'export const fixture = true\n', 'utf8')

    const generated = await runCli(['context', '--target', target], target)
    assert.equal(generated.code, 0, generated.stderr)

    for (const fileName of ['graph.json', 'GRAPH_REPORT.md']) {
      const filePath = path.join(target, 'graphify-out', fileName)
      const source = await readFile(filePath, 'utf8')
      await writeFile(filePath, source.replaceAll('\n', '\r\n'), 'utf8')
    }

    const checked = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(checked.code, 0, checked.stderr)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context detects Codex instruction changes and ignores local skill cache files', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-context-inputs-'))

  try {
    await mkdir(path.join(target, '.codex'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(
      path.join(target, '.codex', 'README.md'),
      '# Initial Codex instructions\n',
      'utf8'
    )
    await runCli(['context', '--target', target], target)

    await mkdir(path.join(target, '.harness', 'npm-cache'), { recursive: true })
    await writeFile(
      path.join(target, '.harness', 'npm-cache', 'metadata.json'),
      '{"machine":"local"}\n',
      'utf8'
    )
    const cacheOnly = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(cacheOnly.code, 0, cacheOnly.stderr)

    await writeFile(
      path.join(target, '.codex', 'README.md'),
      '# Changed Codex instructions\n',
      'utf8'
    )
    const instructionsChanged = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(instructionsChanged.code, 1)
    assert.match(instructionsChanged.stderr, /out of date/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context detects workflow changes that alter the portable gate', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-workflow-context-'))

  try {
    await mkdir(path.join(target, '.github', 'workflows'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(
      path.join(target, '.github', 'workflows', 'harness.yml'),
      'name: Harness\n',
      'utf8'
    )
    await runCli(['context', '--target', target], target)

    await writeFile(
      path.join(target, '.github', 'workflows', 'harness.yml'),
      'name: Changed Harness\n',
      'utf8'
    )
    const changed = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(changed.code, 1)
    assert.match(changed.stderr, /out of date/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('context detects application config and post content changes', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-context-workspace-inputs-'))

  try {
    await mkdir(path.join(target, 'apps', 'web', 'src', 'content', 'posts'), { recursive: true })
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await writeFile(path.join(target, 'apps', 'web', 'package.json'), '{"name":"web"}\n', 'utf8')
    await writeFile(path.join(target, 'apps', 'web', 'tsconfig.json'), '{}\n', 'utf8')
    await writeFile(
      path.join(target, 'apps', 'web', 'astro.config.mjs'),
      'export default {}\n',
      'utf8'
    )
    await writeFile(
      path.join(target, 'apps', 'web', 'src', 'content', 'posts', 'post.mdx'),
      '# Initial post\n',
      'utf8'
    )

    await runCli(['context', '--target', target], target)
    const graph = JSON.parse(
      await readFile(path.join(target, 'graphify-out', 'graph.json'), 'utf8')
    )
    for (const filePath of [
      'apps/web/package.json',
      'apps/web/tsconfig.json',
      'apps/web/astro.config.mjs',
      'apps/web/src/content/posts/post.mdx',
    ]) {
      assert.ok(
        graph.nodes.some((node) => node.id === `file:${filePath}`),
        filePath
      )
    }

    await writeFile(
      path.join(target, 'apps', 'web', 'src', 'content', 'posts', 'post.mdx'),
      '# Changed post\n',
      'utf8'
    )
    const changedPost = await runCli(['context', '--target', target, '--check'], target)
    assert.equal(changedPost.code, 1)
    assert.match(changedPost.stderr, /out of date/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('orchestrate reports the model routing for an implementation role', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-orchestration-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)

    const routed = await runCli(
      ['orchestrate', '--target', target, '--role', 'implementation', '--json'],
      target
    )
    assert.equal(routed.code, 0, routed.stderr)
    assert.deepEqual(JSON.parse(routed.stdout), {
      role: 'implementation',
      model: 'luna-max',
      runtime: 'generic',
    })
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('orchestrate routes documentation sync work to Tera Medium', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-documentation-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)

    const routed = await runCli(
      ['orchestrate', '--target', target, '--role', 'documentation-sync', '--json'],
      target
    )
    assert.equal(routed.code, 0, routed.stderr)
    assert.deepEqual(JSON.parse(routed.stdout), {
      role: 'documentation-sync',
      model: 'tera-medium',
      runtime: 'generic',
    })
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('orchestrate escalates a high-risk review to Tera High', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-escalation-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)

    const routed = await runCli(
      ['orchestrate', '--target', target, '--role', 'reviewer', '--risk', 'high', '--json'],
      target
    )
    assert.equal(routed.code, 0, routed.stderr)
    assert.deepEqual(JSON.parse(routed.stdout), {
      role: 'reviewer',
      model: 'tera-high',
      runtime: 'generic',
      risk: 'high',
    })
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('init registers specialized orchestration roles', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-roles-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)
    const config = JSON.parse(
      await readFile(path.join(target, '.harness', 'orchestration.json'), 'utf8')
    )

    assert.deepEqual(Object.keys(config.roles).sort(), [
      'documentation-sync',
      'implementation',
      'observer',
      'planning',
      'qa',
      'reviewer',
      'spec-creator',
      'tester',
    ])
    assert.equal(config.roles['spec-creator'], 'tera-high')
    assert.equal(config.roles.reviewer, 'tera-medium')
    assert.equal(config.roles.qa, 'tera-high')
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('init preserves existing shared state unless force is requested', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-state-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)
    const statePath = path.join(target, '.harness', 'state.json')
    await writeFile(statePath, JSON.stringify({ version: 1, currentTask: 'TASK-42' }), 'utf8')

    const initialized = await runCli(['init', '--target', target], target)
    assert.equal(initialized.code, 0, initialized.stderr)
    assert.equal(JSON.parse(await readFile(statePath, 'utf8')).currentTask, 'TASK-42')
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('init refreshes package-derived verification commands', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-init-refresh-'))

  try {
    await writeFile(
      path.join(target, 'package.json'),
      JSON.stringify({ name: 'fixture', scripts: { test: 'node --version' } }),
      'utf8'
    )
    await runCli(['init', '--target', target], target)
    await writeFile(
      path.join(target, 'package.json'),
      JSON.stringify({ name: 'fixture', scripts: { build: 'node --version' } }),
      'utf8'
    )

    const initialized = await runCli(['init', '--target', target], target)
    assert.equal(initialized.code, 0, initialized.stderr)
    assert.deepEqual(
      JSON.parse(await readFile(path.join(target, '.harness', 'commands.json'), 'utf8')),
      ['npm run build']
    )
    const manifest = JSON.parse(
      await readFile(path.join(target, '.harness', 'manifest.json'), 'utf8')
    )
    assert.deepEqual(manifest.verification.commands, ['npm run build'])
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('skills check reports a missing Caveman installation with a sync command', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-skills-'))

  try {
    await mkdir(path.join(target, '.harness'), { recursive: true })
    await writeFile(
      path.join(target, '.harness', 'external-skills.json'),
      JSON.stringify({
        version: 1,
        skills: [
          {
            source: 'JuliusBrussee/caveman',
            expected: ['caveman'],
          },
        ],
      }),
      'utf8'
    )
    await writeFile(
      path.join(target, 'skills-lock.json'),
      JSON.stringify({
        version: 1,
        skills: { caveman: { source: 'JuliusBrussee/caveman' } },
      }),
      'utf8'
    )

    const checked = await runCli(['skills', '--target', target, '--check'], target)
    assert.equal(checked.code, 1)
    assert.match(checked.stderr, /Missing installed skill: caveman/)
    assert.match(checked.stderr, /pnpm harness:skills:sync/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('skills check rejects installed skill content that differs from the manifest hash', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-skill-integrity-'))
  const expectedContent = '# Expected skill\n'

  try {
    await mkdir(path.join(target, '.harness'), { recursive: true })
    await mkdir(path.join(target, '.agents', 'skills', 'caveman'), { recursive: true })
    await writeFile(
      path.join(target, '.harness', 'external-skills.json'),
      JSON.stringify({
        version: 1,
        skills: [
          {
            source: 'JuliusBrussee/caveman',
            expected: ['caveman'],
            contentHashes: {
              caveman: createHash('sha256').update(expectedContent).digest('hex'),
            },
          },
        ],
      }),
      'utf8'
    )
    await writeFile(
      path.join(target, 'skills-lock.json'),
      JSON.stringify({
        version: 1,
        skills: { caveman: { source: 'JuliusBrussee/caveman' } },
      }),
      'utf8'
    )
    await writeFile(
      path.join(target, '.agents', 'skills', 'caveman', 'SKILL.md'),
      '# Tampered skill\n',
      'utf8'
    )

    const checked = await runCli(['skills', '--target', target, '--check'], target)
    assert.equal(checked.code, 1)
    assert.match(checked.stderr, /Changed installed skill: caveman/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('skills check hashes every file in an installed skill directory', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-skill-directory-integrity-'))
  const files = [
    ['SKILL.md', '# Expected skill\n'],
    ['scripts/run.mjs', 'export const run = true\n'],
  ]
  const hash = createHash('sha256')
  for (const [relativePath, content] of files) {
    hash.update(relativePath)
    hash.update('\0')
    hash.update(content)
    hash.update('\0')
  }

  try {
    await mkdir(path.join(target, '.harness'), { recursive: true })
    for (const [relativePath, content] of files) {
      const filePath = path.join(target, '.agents', 'skills', 'caveman', relativePath)
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(filePath, content, 'utf8')
    }
    await writeFile(
      path.join(target, '.harness', 'external-skills.json'),
      JSON.stringify({
        version: 1,
        skills: [
          {
            source: 'JuliusBrussee/caveman',
            expected: ['caveman'],
            contentHashes: { caveman: hash.digest('hex') },
          },
        ],
      }),
      'utf8'
    )
    await writeFile(
      path.join(target, 'skills-lock.json'),
      JSON.stringify({
        version: 1,
        skills: { caveman: { source: 'JuliusBrussee/caveman' } },
      }),
      'utf8'
    )

    const original = await runCli(['skills', '--target', target, '--check'], target)
    assert.equal(original.code, 0, original.stderr)

    await writeFile(
      path.join(target, '.agents', 'skills', 'caveman', 'scripts', 'run.mjs'),
      'export const run = false\n',
      'utf8'
    )
    const changed = await runCli(['skills', '--target', target, '--check'], target)
    assert.equal(changed.code, 1)
    assert.match(changed.stderr, /Changed installed skill: caveman/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test(
  'skills check rejects symlinks in an installed skill directory',
  { skip: process.platform === 'win32' },
  async () => {
    const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-skill-symlink-'))

    try {
      await mkdir(path.join(target, '.harness'), { recursive: true })
      await mkdir(path.join(target, '.agents', 'skills', 'caveman', 'scripts'), { recursive: true })
      await writeFile(
        path.join(target, '.agents', 'skills', 'caveman', 'SKILL.md'),
        '# Skill\n',
        'utf8'
      )
      await writeFile(path.join(target, 'outside.mjs'), 'export const outside = true\n', 'utf8')
      await symlink(
        path.join(target, 'outside.mjs'),
        path.join(target, '.agents', 'skills', 'caveman', 'scripts', 'outside.mjs')
      )
      await writeFile(
        path.join(target, '.harness', 'external-skills.json'),
        JSON.stringify({
          version: 1,
          skills: [{ source: 'JuliusBrussee/caveman', expected: ['caveman'] }],
        }),
        'utf8'
      )
      await writeFile(
        path.join(target, 'skills-lock.json'),
        JSON.stringify({
          version: 1,
          skills: { caveman: { source: 'JuliusBrussee/caveman' } },
        }),
        'utf8'
      )

      const checked = await runCli(['skills', '--target', target, '--check'], target)
      assert.equal(checked.code, 1)
      assert.match(checked.stderr, /Unsupported symlink in installed skill/)
    } finally {
      await rm(target, { recursive: true, force: true })
    }
  }
)

test('validate rejects a malformed external skill manifest', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-external-skills-validation-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)
    await writeFile(path.join(target, '.harness', 'external-skills.json'), '{invalid json', 'utf8')

    const validated = await runCli(
      ['validate', '--target', target, '--json', '--min-score', '100'],
      target
    )
    assert.equal(validated.code, 1)
    const report = JSON.parse(validated.stdout)
    assert.equal(report.subsystems.lifecycle.pass, false)
    assert.deepEqual(report.subsystems.lifecycle.invalid, ['external-skills.json'])
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('validate text output names malformed JSON artifacts', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-validation-output-'))

  try {
    await writeFile(path.join(target, 'package.json'), JSON.stringify({ name: 'fixture' }), 'utf8')
    await runCli(['init', '--target', target], target)
    await writeFile(path.join(target, '.harness', 'external-skills.json'), '{invalid json', 'utf8')

    const validated = await runCli(['validate', '--target', target, '--min-score', '100'], target)
    assert.equal(validated.code, 1)
    assert.match(validated.stdout, /FAIL lifecycle: invalid external-skills\.json/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})

test('Graphify plugin emits a portable reminder without rewriting shell commands', async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), 'studio-cms-graphify-'))
  const reminders = []
  const originalWarn = console.warn

  try {
    await mkdir(path.join(target, 'graphify-out'), { recursive: true })
    await writeFile(path.join(target, 'graphify-out', 'graph.json'), '{}\n', 'utf8')
    const { GraphifyPlugin } = await import(pathToFileURL(graphifyPluginPath).href)
    const plugin = await GraphifyPlugin({ directory: target })
    const output = { args: { command: 'git status' } }
    console.warn = (message) => reminders.push(message)

    await plugin['tool.execute.before']({ tool: 'shell' }, output)

    assert.equal(output.args.command, 'git status')
    assert.equal(reminders.length, 1)
    assert.match(reminders[0], /Knowledge graph available/)
  } finally {
    console.warn = originalWarn
    await rm(target, { recursive: true, force: true })
  }
})

test('Harness guard gates multiline commit commands', async () => {
  const guarded = await runGuard('echo x\ngit commit -m x')

  assert.equal(
    guarded,
    'pnpm harness:context:check && pnpm harness:validate && echo x\ngit commit -m x'
  )
})
