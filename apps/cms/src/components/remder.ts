import type { PluginRenderer } from 'studiocms/types'

const render = {
  name: 'my-custom-renderer',
  renderer: async (content: string) => {
    // Custom rendering logic goes here
    return content
  },
  sanitizeOpts: {},
} satisfies PluginRenderer

export default render
