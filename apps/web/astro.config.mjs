import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import astroExpressiveCode from 'astro-expressive-code'
import ecTwoSlash from 'expressive-code-twoslash'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  site: process.env['CF_PAGES_URL'] ?? process.env['PUBLIC_SITE_URL'] ?? 'http://localhost:4321',
  output: 'static',
  devToolbar: { enabled: false },

  vite: {
    envDir: '../..',
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      tailwindcss(),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ],
  },

  integrations: [
    react(),
    astroExpressiveCode({
      themes: ['dracula', 'github-light'],
      styleOverrides: {
        borderRadius: '0.5rem',
        frames: {
          shadowColor: '#124',
        },
      },
      plugins: [ecTwoSlash()],
    }),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],

  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypePrettyCode,
    ],
  },
})