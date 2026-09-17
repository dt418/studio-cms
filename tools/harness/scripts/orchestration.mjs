import { spawn } from 'node:child_process'

const MODELS = new Set(['gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna'])
const EFFORTS = new Set(['low', 'medium', 'high', 'xhigh'])
const COMPLEXITIES = new Set(['simple', 'standard', 'complex'])
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const strings = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string')
const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

export function defaultOrchestration() {
  const highRisk = ['authentication', 'authorization', 'data-migration', 'payment', 'security']
  return {
    version: 2,
    reviewedAt: '2026-09-17',
    defaultRuntime: 'codex',
    profiles: {
      'luna-low': { model: 'gpt-5.6-luna', reasoningEffort: 'low' },
      'luna-medium': { model: 'gpt-5.6-luna', reasoningEffort: 'medium' },
      'luna-xhigh': { model: 'gpt-5.6-luna', reasoningEffort: 'xhigh' },
      'terra-medium': { model: 'gpt-5.6-terra', reasoningEffort: 'medium' },
      'terra-high': { model: 'gpt-5.6-terra', reasoningEffort: 'high' },
      'sol-high': { model: 'gpt-5.6-sol', reasoningEffort: 'high' },
      'astra-medium': { model: 'gpt-5.6-sol', reasoningEffort: 'medium' },
    },
    roles: {
      'spec-creator': 'sol-high',
      planning: 'sol-high',
      implementation: 'luna-xhigh',
      'documentation-sync': 'luna-medium',
      reviewer: 'terra-high',
      qa: 'terra-high',
      tester: 'terra-high',
      advisor: 'terra-high',
      explorer: 'luna-medium',
      'docs-researcher': 'terra-medium',
      observer: 'luna-low',
    },
    complexityOverrides: {
      simple: { implementation: 'luna-medium' },
      complex: {
        'spec-creator': 'astra-medium',
        planning: 'astra-medium',
        implementation: 'sol-high',
        reviewer: 'sol-high',
        qa: 'sol-high',
        tester: 'sol-high',
        advisor: 'sol-high',
        explorer: 'terra-high',
      },
    },
    riskEscalations: Object.fromEntries(
      ['spec-creator', 'planning', 'implementation', 'reviewer', 'qa', 'tester', 'advisor'].map(
        (role) => [role, { high: 'sol-high', triggers: highRisk }]
      )
    ),
    runtimes: ['codex', 'claude', 'pi', 'omp', 'opencode'],
    sharedState: ['tasks', 'decisions', 'patches', 'reviews', 'reports'],
  }
}

export function validOrchestration(config) {
  if (
    !record(config) ||
    ![1, 2].includes(config.version) ||
    typeof config.defaultRuntime !== 'string' ||
    !strings(config.runtimes) ||
    ![...config.runtimes, 'generic'].includes(config.defaultRuntime) ||
    !record(config.roles) ||
    Object.keys(config.roles).length === 0 ||
    !Object.values(config.roles).every((value) => typeof value === 'string' && value.length > 0) ||
    !record(config.riskEscalations) ||
    !strings(config.sharedState)
  ) {
    return false
  }
  // Existing v1 files remain read-only compatible; init does not migrate user state.
  if (config.version === 1) {
    return true
  }
  if (!record(config.profiles) || !record(config.complexityOverrides)) {
    return false
  }
  const profileExists = (name) => typeof name === 'string' && owns(config.profiles, name)
  if (
    !Object.values(config.profiles).every(
      (profile) =>
        record(profile) && MODELS.has(profile.model) && EFFORTS.has(profile.reasoningEffort)
    )
  ) {
    return false
  }
  if (!Object.values(config.roles).every(profileExists)) {
    return false
  }
  if (
    !Object.entries(config.complexityOverrides).every(
      ([complexity, roles]) =>
        ['simple', 'complex'].includes(complexity) &&
        record(roles) &&
        Object.entries(roles).every(
          ([role, profile]) => owns(config.roles, role) && profileExists(profile)
        )
    )
  ) {
    return false
  }
  return Object.entries(config.riskEscalations).every(
    ([role, escalation]) =>
      owns(config.roles, role) &&
      record(escalation) &&
      profileExists(escalation.high) &&
      strings(escalation.triggers)
  )
}

export function resolveRoute(config, options = {}) {
  if (!validOrchestration(config)) {
    throw new Error('Invalid orchestration configuration')
  }
  const role = options.role ?? 'planning'
  const runtime = options.runtime ?? config.defaultRuntime
  const risk = options.risk ?? 'standard'
  const complexity = options.complexity ?? 'standard'
  if (!owns(config.roles, role)) {
    throw new Error(`Unknown orchestration role: ${role}`)
  }
  if (![...config.runtimes, 'generic'].includes(runtime)) {
    throw new Error(`Unknown runtime: ${runtime}`)
  }
  if (!COMPLEXITIES.has(complexity)) {
    throw new Error(`Unknown complexity: ${complexity}`)
  }
  if (!['standard', 'high'].includes(risk)) {
    throw new Error(`Unknown risk: ${risk}`)
  }
  const escalation = config.riskEscalations[role]
  if (risk === 'high' && !escalation?.high) {
    throw new Error(`No high risk escalation for role: ${role}`)
  }
  if (config.version === 1) {
    if (complexity !== 'standard') {
      throw new Error('Complexity routing requires orchestration version 2')
    }
    return {
      role,
      model: risk === 'high' ? escalation.high : config.roles[role],
      runtime,
      ...(risk !== 'standard' && { risk }),
    }
  }
  let profile = config.complexityOverrides[complexity]?.[role] ?? config.roles[role]
  // High-risk work always uses the configured escalation after complexity routing.
  if (risk === 'high') {
    profile = escalation.high
  }
  return {
    role,
    profile,
    ...config.profiles[profile],
    runtime,
    complexity,
    ...(risk !== 'standard' && { risk }),
  }
}

export function workerLaunch(route, options, spec, env = process.env, platform = process.platform) {
  if (route.runtime !== 'codex' || !route.reasoningEffort) {
    throw new Error('Orca launch requires version 2 routing and --runtime codex')
  }
  if (typeof spec !== 'string' || !spec.trim()) {
    throw new Error('A nonempty --spec-file is required')
  }
  for (const key of ['run', 'worktree']) {
    if (typeof options[key] !== 'string' || !options[key].trim()) {
      throw new Error(`--${key} is required`)
    }
  }
  if (['new-child', 'new-top-level'].includes(options.worktree)) {
    throw new Error('Create the worktree in Orca first, then pass its existing selector')
  }
  const sender = options.from ?? env.ORCA_TERMINAL_HANDLE
  if (typeof sender !== 'string' || !sender.trim()) {
    throw new Error('Use a live Orca coordinator terminal or pass its real --from handle')
  }
  const command =
    env.ORCA_CLI_COMMAND ||
    (env.ORCA_DEV_REPO_ROOT ? 'orca-dev' : platform === 'linux' ? 'orca-ide' : 'orca')
  return {
    command,
    args: [
      'orchestration',
      'worker-start',
      '--spec',
      spec,
      '--task-title',
      route.role,
      '--worktree',
      options.worktree,
      '--agent',
      'codex',
      '--model',
      route.model,
      '--effort',
      route.reasoningEffort,
      '--run',
      options.run,
      '--from',
      sender,
      '--json',
    ],
  }
}

export async function launchWorker(launch, cwd, spawnProcess = spawn) {
  // One attempt only. Nonzero/unknown receipts must be reconciled with Orca, not retried.
  return new Promise((resolve, reject) => {
    const child = spawnProcess(launch.command, launch.args, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('close', (code) => resolve(code ?? 1))
  })
}
