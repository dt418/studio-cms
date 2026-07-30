const BLOCKED_PATTERNS = [
  /git\s+commit\b.*--no-verify/,
  /git\s+commit\b.*-n\b/,
  /git\s+push\b.*--no-verify/,
  /git\s+push\b.*-n\b/,
]

export default {
  name: 'no-verify-guard',
  hooks: [
    {
      event: 'tool.execute.before',
      handler: (input: { tool: string; command?: string }) => {
        if (input.tool !== 'bash' && input.tool !== 'shell') return
        if (!input.command) return

        for (const pattern of BLOCKED_PATTERNS) {
          if (pattern.test(input.command)) {
            return {
              command:
                'echo "BLOCKED: --no-verify is not allowed. Fix the failing hook instead." && exit 1',
            }
          }
        }
      },
    },
  ],
}
