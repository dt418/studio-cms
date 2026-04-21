import { defineConfig } from 'astro/config'
import node from '@astrojs/node' // SSR adapter for Node.js
import studioCMS from 'studiocms'

import studiocmsUi from '@studiocms/ui'
import { langFlags } from './src/lang-flags-icons.js' // custom icon collection

import tailwindcss from '@tailwindcss/vite'

import remarkGfm from 'remark-gfm' // GitHub-flavored markdown
import rehypeSlug from 'rehype-slug' // auto-generate heading IDs
import rehypeAutolinkHeadings from 'rehype-autolink-headings' // make headings clickable links

import rehypePrettyCode from 'rehype-pretty-code' // syntax highlighting for code blocks

import studiocmsCfetch from '@studiocms/cfetch'
import astroExpressiveCode from 'astro-expressive-code'
import ecTwoSlash from 'expressive-code-twoslash' // TypeScript hover types in code blocks

// https://astro.build/config
export default defineConfig({
  // Site URL for sitemap and canonical links
  site:
    process.env['NODE_ENV'] === 'production' ? process.env['SITE_URL'] : 'http://localhost:4321',
  output: 'server', // SSR mode

  adapter: node({
    mode: 'standalone', // self-contained Node.js server
  }),

  security: {
    checkOrigin: false, // disable CSRF origin check (adjust based on your hosting)
  },

  integrations: [
    studioCMS(), // core CMS
    studiocmsUi({
      icons: {
        'lang-flags': langFlags, // register custom flag icons for blog plugin
      },
    }),
    studiocmsCfetch(), // client-side content fetching
    astroExpressiveCode({
      plugins: [ecTwoSlash()], // TS type hover info in code blocks
    }),
  ],

  vite: {
    plugins: [tailwindcss()], // Tailwind CSS 4 via Vite plugin
  },
  markdown: {
    remarkPlugins: [remarkGfm], // tables, strikethrough, task lists, etc.
    rehypePlugins: [
      rehypeSlug, // generate id attributes on headings
      [rehypeAutolinkHeadings, { behavior: 'wrap' }], // wrap heading content in <a> links
      rehypePrettyCode, // code block syntax highlighting
    ],
  },
})
