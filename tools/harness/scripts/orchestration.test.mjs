import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  defaultOrchestration,
  validOrchestration,
  resolveRoute,
  workerLaunch,
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
test('non-Codex routing returns capability tier separately from reasoning effort', () => {
  const config = defaultOrchestration()
  for (const runtime of ['claude', 'pi', 'omp', 'opencode']) {
    assert.deepEqual(resolveRoute(config, { role: 'implementation', runtime }), {
      role: 'implementation',
      profile: 'luna-xhigh',
      tier: 'standard',
      reasoningEffort: 'xhigh',
      runtime,
      complexity: 'standard',
    })
    assert.deepEqual(
      resolveRoute(config, { role: 'implementation', runtime, complexity: 'complex' }),
      {
        role: 'implementation',
        profile: 'sol-high',
        tier: 'frontier',
        reasoningEffort: 'high',
        runtime,
        complexity: 'complex',
      }
    )
    const standardReview = resolveRoute(config, { role: 'reviewer', runtime })
    assert.equal(standardReview.tier, 'advanced')
    assert.equal(standardReview.reasoningEffort, 'high')
    const highRiskReview = resolveRoute(config, { role: 'reviewer', runtime, risk: 'high' })
    assert.equal(highRiskReview.tier, 'frontier')
    assert.equal(highRiskReview.reasoningEffort, 'high')
  }
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
