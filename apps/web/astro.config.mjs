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
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export function resolveConfiguredSiteUrl(command, env = process.env) {
  const siteValue = [env.SITE_URL, env.CF_PAGES_URL]
    .map((value) => value?.trim())
    .find((value) => value)

  if (!siteValue) {
    if (command === 'dev') return 'http://localhost:4321'
    throw new Error('SITE_URL or CF_PAGES_URL is required for astro build')
  }

  let parsed
  try {
    parsed = new URL(siteValue)
  } catch {
    throw new Error('SITE_URL or CF_PAGES_URL must be an absolute http(s) origin')
  }
  if (
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (parsed.pathname !== '/' && parsed.pathname !== '')
  ) {
    throw new Error('SITE_URL or CF_PAGES_URL must be an absolute http(s) origin')
  }
  return parsed.origin
}

function readOriginEnv(directory, mode) {
  const values = {}
  const files = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]

  for (const file of files) {
    const path = resolve(directory, file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*(SITE_URL|CF_PAGES_URL)\s*=\s*(.*?)\s*$/)
      if (!match) continue
      values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return values
}

function findAncestor(start, marker) {
  let directory = resolve(start)
  while (true) {
    if (existsSync(join(directory, marker))) return directory
    const parent = resolve(directory, '..')
    if (parent === directory) return undefined
    directory = parent
  }
}

const command = process.argv.includes('build') ? 'build' : 'dev'
const envMode = command === 'build' ? 'production' : 'development'
const workspaceRoot = findAncestor(process.cwd(), 'pnpm-workspace.yaml') ?? process.cwd()
const appEnvDirectory =
  findAncestor(process.cwd(), 'astro.config.mjs') ?? resolve(workspaceRoot, 'apps/web')
const rootEnvDirectory = workspaceRoot
const configuredEnv = {
  ...readOriginEnv(rootEnvDirectory, envMode),
  ...readOriginEnv(appEnvDirectory, envMode),
  ...process.env,
}

export default defineConfig({
  site: resolveConfiguredSiteUrl(command, configuredEnv),
  output: 'static',
  // Keep v6-compatible whitespace semantics while the content templates migrate.
  compressHTML: true,
  devToolbar: { enabled: false },

  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: 'manual',
  },

  vite: {
    css: {
      transformer: 'postcss',
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      ...tailwindcss(),
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
      CSS: {
        csso: false,
        lightningcss: { minify: true },
      },
      HTML: {
        'html-minifier-terser': {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          // html-minifier-terser's CSS parser does not understand Tailwind v4
          // range media queries such as `@media (width>=48rem)`.
          minifyCSS: false,
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
