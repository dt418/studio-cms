const COMMIT_COMMAND = /(?:^|[;&|()])\s*git\s+commit\b/
const HAS_VALIDATION = /harness:validate|tools\/harness\/scripts\/harness\.mjs\s+validate/
const HAS_CONTEXT_CHECK =
  /harness:context:check|tools\/harness\/scripts\/harness\.mjs\s+context[^\n]*--check/

export default {
  name: 'harness-guard',
  hooks: [
    {
      event: 'tool.execute.before',
      handler: (input: { tool: string; command?: string }) => {
        if (input.tool !== 'bash' && input.tool !== 'shell') return
        if (
          !input.command ||
          !COMMIT_COMMAND.test(input.command) ||
          (HAS_VALIDATION.test(input.command) && HAS_CONTEXT_CHECK.test(input.command))
        )
          return
        return {
          command: `pnpm harness:context:check && pnpm harness:validate && ${input.command}`,
        }
      },
    },
  ],
}
