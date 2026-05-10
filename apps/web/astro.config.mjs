import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import remarkGfm from 'remark-gfm'
import rehypeVietnameseSlug from './rehype-vietnamese-slug.mjs'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'

import astroExpressiveCode from 'astro-expressive-code'
import { visualizer } from 'rollup-plugin-visualizer'
import compress from '@playform/compress'

export default defineConfig({
  site: process.env['SITE_URL'] ?? process.env['CF_PAGES_URL'] ?? 'http://localhost:4321',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },

  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: 'manual',
  },

  vite: {
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
    }),
    compress({
      HTML: {
        'html-minifier-terser': {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          minifyCSS: true,
          minifyJS: true,
          sortAttributes: true,
          sortClassName: true,
        },
      },
      JavaScript: {
        terser: {
          compress: { drop_console: true, drop_debugger: true },
          ecma: 2020,
        },
      },
      SVG: { svgo: { multipass: true } },
    }),
  ],

  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeVietnameseSlug,
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypePrettyCode,
    ],
  },
})