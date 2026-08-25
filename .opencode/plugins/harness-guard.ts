const COMMIT_COMMAND = /(?:^|[;&|()\n])\s*git\s+commit\b/
const VALIDATION_COMMAND =
  /(?:^|[;&|()\n])\s*(?:pnpm\s+harness:validate\b|node\s+tools\/harness\/scripts\/harness\.mjs\s+validate\b)/
const CONTEXT_CHECK_COMMAND =
  /(?:^|[;&|()\n])\s*(?:pnpm\s+harness:context:check\b|node\s+tools\/harness\/scripts\/harness\.mjs\s+context\b[^\n]*--check\b)/

type ShellInput = { tool: string }
type ShellOutput = { args?: { command?: string } }

function gateIsSafe(command: string, pattern: RegExp, commitPosition: number) {
  const prefix = command.slice(0, commitPosition)
  return pattern.test(prefix) && prefix.includes('&&') && !/[;\n]|\|\|/.test(prefix)
}
function guardedCommand(command: string) {
  const commitPosition = command.search(COMMIT_COMMAND)
  if (commitPosition < 0) return command

  const missingGates = []
  if (!gateIsSafe(command, CONTEXT_CHECK_COMMAND, commitPosition))
    missingGates.push('pnpm harness:context:check')
  if (!gateIsSafe(command, VALIDATION_COMMAND, commitPosition))
    missingGates.push('pnpm harness:validate')

  return missingGates.length ? `${missingGates.join(' && ')} && ( ${command} )` : command
}

export const HarnessGuardPlugin = async () => ({
  'tool.execute.before': async (input: ShellInput, output: ShellOutput) => {
    if (input.tool !== 'bash' && input.tool !== 'shell') return
    const command = output.args?.command
    if (typeof command !== 'string') return
    const guarded = guardedCommand(command)
    if (guarded !== command && output.args) output.args.command = guarded
  },
})

export default HarnessGuardPlugin
