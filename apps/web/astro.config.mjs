import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import remarkGfm from 'remark-gfm'
import rehypeVietnameseSlug from './rehype-vietnamese-slug.mjs'
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import astroExpressiveCode from 'astro-expressive-code'
import { visualizer } from 'rollup-plugin-visualizer'
import compress from '@playform/compress'

export default defineConfig({
  site: process.env['SITE_URL'] ?? process.env['CF_PAGES_URL'] ?? 'http://localhost:4321',
  output: 'static',
  // Keep v6-compatible whitespace semantics while the content templates migrate.
  compressHTML: true,
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
      // Keep the copy control visible in dev and static previews even when the
      // generated asset manifest has not been refreshed yet.
      emitExternalStylesheet: false,
      themes: ['dracula', 'github-light'],
      frames: {
        showCopyToClipboardButton: true,
      },
      styleOverrides: {
        borderRadius: '0.5rem',
        frames: {
          shadowColor: 'rgb(43 33 20)',
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
    processor: unified({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeVietnameseSlug,
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      ],
    }),
  },
})
