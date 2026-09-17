import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import test from 'node:test'
import { defaultOrchestration, launchWorker, resolveRoute, workerLaunch } from './orchestration.mjs'

test('worker launch treats task and selector values as literal argv data', () => {
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
})

test('worker launch rejects unsupported runtimes and unsafe worktree creation', () => {
  const route = resolveRoute(defaultOrchestration(), { role: 'implementation' })
  const options = { run: 'run-real', from: 'terminal-real', worktree: 'path:D:\\My Project' }
  const spec = 'literal task'

  assert.throws(() => workerLaunch({ ...route, runtime: 'claude' }, options, spec), /runtime codex/)
  assert.throws(
    () => workerLaunch(route, { ...options, worktree: 'new-child' }, spec),
    /Create the worktree/
  )
})

test('worker execution disables shell evaluation and never retries', async () => {
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
