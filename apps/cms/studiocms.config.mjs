import blog from '@studiocms/blog' // blog plugin (routes disabled, using custom pages)
import md from '@studiocms/md' // Markdown content rendering
import html from '@studiocms/html' // HTML content rendering

import { defineStudioCMSConfig } from 'studiocms/config'

import markdoc from '@studiocms/markdoc' // Markdoc content format
import wysiwyg from '@studiocms/wysiwyg' // visual WYSIWYG editor
import mdx from '@studiocms/mdx' // MDX (React in Markdown) support

export default defineStudioCMSConfig({
  dbStartPage: false, // disable the default database landing page (use custom home instead)
  dialect: 'libsql', // use libSQL (Turso) as the database backend
  plugins: [
    md(), // Markdown rendering
    blog({
      blog: {
        title: 'DanhThanh.dev Blog',
        enableRSS: false, // using custom RSS at /rss.xml
        route: '/studiocms-blog', // move to different path to avoid collision
      },
      injectRoutes: false, // disable auto-injected routes (we have custom blog pages)
      sitemap: false,
    }),
    html(), // HTML content
    markdoc(), // Markdoc support
    wysiwyg(), // WYSIWYG editor
    mdx(), // MDX support
  ],
})
