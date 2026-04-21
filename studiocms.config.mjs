import blog from '@studiocms/blog' // blog listing, post pages, RSS feed
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
    blog(), // Blog functionality
    html(), // HTML content
    markdoc(), // Markdoc support
    wysiwyg(), // WYSIWYG editor
    mdx(), // MDX support
  ],
})
