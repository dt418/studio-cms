const COMMIT_COMMAND = /(?:^|[;&|()])\s*git\s+commit\b/
const QUALITY_GATE = /\bpnpm\s+(?:check|lint|format:check)\b/
const BLOCKED_PATTERNS = [
  /git\s+commit\b.*--no-verify/,
  /git\s+commit\b.*-n\b/,
  /git\s+push\b.*--no-verify/,
  /git\s+push\b.*-n\b/,
]

export default {
  name: 'commit-quality-gate',
  hooks: [
    {
      event: 'tool.execute.before',
      handler: (input: { tool: string; command?: string }) => {
        if (input.tool !== 'bash' && input.tool !== 'shell') return
        if (!input.command) return

        if (BLOCKED_PATTERNS.some((pattern) => pattern.test(input.command))) {
          return {
            command:
              'echo "BLOCKED: --no-verify is not allowed. Fix the failing hook instead." && exit 1',
          }
        }

        if (!COMMIT_COMMAND.test(input.command) || QUALITY_GATE.test(input.command)) return

        return {
          command: `pnpm check && ${input.command}`,
        }
      },
    },
  ],
}
