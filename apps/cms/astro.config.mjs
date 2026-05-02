import { createRequire } from 'node:module'
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'
import studioCMS from 'studiocms'
import sitemap from '@astrojs/sitemap'
import studiocmsUi from '@studiocms/ui'
import studiocmsCfetch from '@studiocms/cfetch'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

import { langFlags } from './src/lang-flags-icons.js'

const require = createRequire(import.meta.url)
const heroicons = require('@iconify-json/heroicons/icons.json')
const singleIcons = require('@iconify-json/simple-icons/icons.json')

const studioCMSLayoutOverrides = () => ({
  name: 'studiocms-layout-overrides',
  enforce: 'pre',
  transform(code, id) {
    if (id.endsWith('/studiocms/frontend/styles/dashboard-base.css')) {
      return `${code}

/* Keep StudioCMS dashboard content aligned with the sidebar without patching node_modules. */
main {
  width: 100%;
  max-width: 100%;
}
`
    }

    if (id.endsWith('/studiocms/frontend/styles/auth-layout.css')) {
      return `${code}

/* Avoid viewport-unit horizontal overflow on StudioCMS auth screens. */
main {
  width: 100%;
}
`
    }

    return null
  },
})

export default defineConfig({
  site: process.env['CMS_SITE_URL'] ?? 'http://localhost:4322',
  output: 'server',

  vite: {
    envDir: '../..',
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      tailwindcss(),
      studioCMSLayoutOverrides(),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ],
  },

  adapter: node({
    mode: 'standalone',
  }),

  security: {
    checkOrigin: false,
  },

  integrations: [
    react(),
    studioCMS(),
    studiocmsUi({
      icons: {
        'lang-flags': langFlags,
        heroicons,
        simpleicons: singleIcons,
      },
    }),
    studiocmsCfetch(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
})
