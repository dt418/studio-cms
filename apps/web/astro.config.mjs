import { defineConfig, fontProviders } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import remarkGfm from 'remark-gfm'
import rehypeVietnameseSlug from './rehype-vietnamese-slug.mjs'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'

import astroExpressiveCode from 'astro-expressive-code'
import ecTwoSlash from 'expressive-code-twoslash'
import { visualizer } from 'rollup-plugin-visualizer'
import compress from '@playform/compress'

export default defineConfig({
  site: process.env['SITE_URL'] ?? process.env['CF_PAGES_URL'] ?? 'http://localhost:4321',
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'oblique', 'italic'],
      fallbacks: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'oblique', 'italic'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
    },
  ],
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
      plugins: [ecTwoSlash()],
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