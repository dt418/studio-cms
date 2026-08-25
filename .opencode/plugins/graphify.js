// graphify OpenCode plugin
// Emits a knowledge graph reminder before shell tool calls when the graph exists.
import { existsSync } from 'fs'
import { join } from 'path'

export const GraphifyPlugin = async ({ directory }) => {
  let reminded = false

  return {
    'tool.execute.before': async (input, output) => {
      if (reminded) return
      if (!existsSync(join(directory, 'graphify-out', 'graph.json'))) return

      if (input.tool === 'bash' || input.tool === 'shell') {
        console.warn(
          '[graphify] Knowledge graph available. Read graphify-out/GRAPH_REPORT.md for god nodes and architecture context before searching files.'
        )
        reminded = true
      }
    },
  }
}
