# Content Management Guide

This guide explains how to manage blog content using the StudioCMS dashboard.

## Prerequisites

- Admin account created (visit `/studiocms` on first run)
- Development server running (`pnpm dev`)

## Accessing the CMS Dashboard

Navigate to `http://localhost:4321/studiocms` to access the CMS dashboard.

## Creating Blog Posts

1. Log in to the CMS dashboard
2. Navigate to the content management section
3. Click "Create New" and select your content type
4. Fill in the content fields:
   - **Title**: Post title (used for URL slug)
   - **Content**: Write using your preferred format (Markdown, MDX, HTML, etc.)
   - **Language**: Select the post language (en-us, de, fr, es-mx, zh)
   - **Tags/Categories**: Organize content for discoverability
5. Save and publish

## Content Types

StudioCMS supports multiple content formats:

| Format   | Use Case               | Features                                        |
| -------- | ---------------------- | ----------------------------------------------- |
| Markdown | Standard blog posts    | GFM support (tables, strikethrough, task lists) |
| HTML     | Rich formatted content | Full HTML support                               |
| MDX      | Interactive posts      | React components in content                     |
| Markdoc  | Structured content     | Markdoc-flavored syntax                         |
| WYSIWYG  | Non-technical users    | Visual editor                                   |

## Managing Content

### Editing Posts

1. Find the post in the content list
2. Click to open the editor
3. Make changes and save

### Deleting Posts

1. Select the post in the content list
2. Use the delete action
3. Confirm deletion

> **Warning**: Deleting content is irreversible.

## RSS Feed

Blog posts are automatically included in the RSS feed at `/blog/rss.xml`.

## Language Support

The blog supports multiple languages with language indicators displayed using flag icons. To add support for a new language:

1. Edit `src/lang-flags-icons.js`
2. Add the new flag entry from [flag-icons](https://github.com/lipis/flag-icons)
3. The new language will be available in the CMS

## Related Topics

- [Environment Variables](../reference/environment-variables.md)
- [Architecture Overview](../reference/architecture.md)
- [Troubleshooting](../../README.md#troubleshooting)
