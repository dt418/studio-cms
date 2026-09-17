import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  defaultOrchestration,
  validOrchestration,
  resolveRoute,
  workerLaunch,
  launchWorker,
} from './orchestration.mjs'

test('checked-in routing matches defaults for fresh repositories', async () => {
  const checkedIn = JSON.parse(
    await readFile(new URL('../../../.harness/orchestration.json', import.meta.url), 'utf8')
  )
  assert.deepEqual(checkedIn, defaultOrchestration())
})

test('simple work saves reasoning while independent verification retains Terra', () => {
  const config = defaultOrchestration()
  assert.equal(
    resolveRoute(config, { role: 'implementation', complexity: 'simple' }).reasoningEffort,
    'medium'
  )
  assert.equal(resolveRoute(config, { role: 'implementation' }).reasoningEffort, 'xhigh')
  for (const role of ['reviewer', 'tester', 'qa', 'advisor']) {
    assert.equal(resolveRoute(config, { role }).model, 'gpt-5.6-terra')
    assert.equal(resolveRoute(config, { role }).reasoningEffort, 'high')
  }
})

test('high risk escalates after complexity routing', () => {
  const config = defaultOrchestration()
  for (const role of ['implementation', 'reviewer', 'tester', 'advisor']) {
    assert.equal(
      resolveRoute(config, { role, complexity: 'simple', risk: 'high' }).model,
      'gpt-5.6-sol'
    )
  }
  for (const role of ['planning', 'spec-creator']) {
    const route = resolveRoute(config, { role, complexity: 'complex', risk: 'high' })
    assert.equal(route.model, 'gpt-5.6-sol')
    assert.equal(route.reasoningEffort, 'high')
  }
  const complexStandard = resolveRoute(config, { role: 'planning', complexity: 'complex' })
  assert.equal(complexStandard.model, 'gpt-5.6-sol')
  assert.equal(complexStandard.reasoningEffort, 'medium')
  const complexHighRisk = resolveRoute(config, {
    role: 'planning',
    complexity: 'complex',
    risk: 'high',
  })
  assert.equal(complexHighRisk.model, 'gpt-5.6-sol')
  assert.equal(complexHighRisk.reasoningEffort, 'high')
  assert.equal(resolveRoute(config, { role: 'planning' }).model, 'gpt-5.6-sol')
})

test('invalid profiles, efforts, models and routing choices fail closed', () => {
  for (const mutate of [
    (c) => {
      c.roles.implementation = 'missing'
    },
    (c) => {
      c.profiles['luna-xhigh'].reasoningEffort = 'xHigh'
    },
    (c) => {
      c.profiles['luna-xhigh'].model = 'gpt-made-up'
    },
    (c) => {
      c.complexityOverrides.simple.implementation = 'missing'
    },
    (c) => {
      c.riskEscalations.reviewer.high = 'missing'
    },
  ]) {
    const config = defaultOrchestration()
    mutate(config)
    assert.equal(validOrchestration(config), false)
    assert.throws(() => resolveRoute(config), /Invalid orchestration/)
  }
  for (const options of [
    { role: 'toString' },
    { role: 'unknown' },
    { complexity: 'huge' },
    { risk: 'urgent' },
    { runtime: 'unknown' },
  ]) {
    assert.throws(() => resolveRoute(defaultOrchestration(), options), /Unknown/)
  }
})

test('v1 routing keeps its output contract without automatic launch or migration', () => {
  const legacy = {
    version: 1,
    defaultRuntime: 'generic',
    roles: { implementation: 'luna-max' },
    runtimes: ['codex'],
    riskEscalations: {},
    sharedState: ['tasks'],
  }
  assert.deepEqual(resolveRoute(legacy, { role: 'implementation' }), {
    role: 'implementation',
    model: 'luna-max',
    runtime: 'generic',
  })
  assert.throws(
    () => resolveRoute(legacy, { role: 'implementation', complexity: 'simple' }),
    /version 2/
  )
  assert.throws(
    () => workerLaunch(resolveRoute(legacy, { role: 'implementation' }), {}, 'task'),
    /version 2/
  )
})

test('Orca argv carries the resolved profile and preserves literal task text', () => {
  const route = resolveRoute(defaultOrchestration(), { role: 'implementation' })
  const spec = 'Target: a file with spaces\nDo not evaluate $(echo secret); `literal` & text'
  const options = { run: 'run-real', from: 'terminal-real', worktree: 'path:D:\\My Project' }
  const launch = workerLaunch(
    route,
    options,
    spec,
    { ORCA_CLI_COMMAND: 'C:\\Tools\\orca.exe' },
    'win32'
  )
  assert.equal(launch.command, 'C:\\Tools\\orca.exe')
  for (const [flag, value] of [
    ['--model', 'gpt-5.6-luna'],
    ['--effort', 'xhigh'],
    ['--spec', spec],
    ['--from', options.from],
    ['--run', options.run],
    ['--worktree', options.worktree],
  ]) {
    assert.equal(launch.args[launch.args.indexOf(flag) + 1], value)
  }
  assert.equal(workerLaunch(route, options, spec, {}, 'linux').command, 'orca-ide')
  assert.equal(
    workerLaunch(route, options, spec, { ORCA_DEV_REPO_ROOT: '/dev' }, 'linux').command,
    'orca-dev'
  )
  assert.throws(() => workerLaunch(route, { ...options, from: undefined }, spec, {}), /coordinator/)
  assert.throws(() => workerLaunch(route, { ...options, run: undefined }, spec), /--run/)
  assert.throws(
    () => workerLaunch(route, { ...options, worktree: 'new-child' }, spec),
    /Create the worktree/
  )
  assert.throws(() => workerLaunch({ ...route, runtime: 'claude' }, options, spec), /runtime codex/)
})

test('worker launch uses no shell and never retries failed or unknown outcomes', async () => {
  for (const code of [0, 1, null]) {
    let calls = 0
    const result = await launchWorker(
      { command: 'orca', args: ['literal & arg'] },
      '/workspace',
      (command, args, options) => {
        calls++
        assert.equal(command, 'orca')
        assert.deepEqual(args, ['literal & arg'])
        assert.equal(options.shell, false)
        assert.equal(options.windowsHide, true)
        const child = new EventEmitter()
        queueMicrotask(() => child.emit('close', code))
        return child
      }
    )
    assert.equal(calls, 1)
    assert.equal(result, code ?? 1)
  }
  await assert.rejects(
    launchWorker({ command: 'missing', args: [] }, '/workspace', () => {
      const child = new EventEmitter()
      queueMicrotask(() => child.emit('error', new Error('ENOENT')))
      return child
    }),
    /ENOENT/
  )
})
