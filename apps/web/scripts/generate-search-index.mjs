import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const POSTS_DIR = resolve('./src/content/posts')
const OUTPUT_DIR = resolve('./dist')
const OUTPUT_FILE = join(OUTPUT_DIR, 'search-index.html')

function walkDirectory(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDirectory(fullPath, files)
    } else if (entry.name.match(/\.(md|mdx)$/)) {
      files.push(fullPath)
    }
  }
  return files
}

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { data: {}, body: '' }

  const rawFrontmatter = match[1]
  const body = match[2]

  const data = {}
  for (const line of rawFrontmatter.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()

    if ((value.startsWith('[') && value.endsWith(']'))) {
      const items = value.slice(1, -1)
      value = items
        ? items.split(',').map((str) => str.trim().replace(/^["']|["']$/g, ''))
        : []
    } else {
      value = value.replace(/^["']|["']$/g, '')
    }

    data[key] = value
  }

  return { data, body }
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^(\d+)\.\s+/gm, '')
    .replace(/^---$/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function htmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const files = walkDirectory(POSTS_DIR)

function groupPostsByLocale(posts) {
  const groups = {}
  for (const post of posts) {
    // Determine locale from file path: en/ or vi/ prefix
    const localeMatch = post.file.match(/^(en|vi)\//)
    const locale = localeMatch ? localeMatch[1] : 'vi'
    if (!groups[locale]) groups[locale] = []
    groups[locale].push(post)
  }
  return groups
}

function generateHtmlForLocale(posts, locale) {
  const htmlParts = posts.map((post) => {
    const categoryFilter = post.category
      ? `<span data-pagefind-filter="category" hidden>${htmlEscape(post.category)}</span>`
      : ''
    const tagFilters = post.tags
      .map((tag) => `<span data-pagefind-filter="tag" hidden>${htmlEscape(tag)}</span>`)
      .join('')

    return `
<article data-pagefind-body${locale ? ` lang="${locale}"` : ''}>
  ${categoryFilter}${tagFilters}
  <h1 data-pagefind-meta="title">${htmlEscape(post.title)}</h1>
  <p data-pagefind-meta="excerpt">${htmlEscape(post.excerpt)}</p>
  <p data-pagefind-meta="coverImage">${htmlEscape(post.coverImage)}</p>
  <p data-pagefind-meta="category">${htmlEscape(post.category)}</p>
  <p data-pagefind-meta="tags">${post.tags.map((tag) => htmlEscape(tag)).join(', ')}</p>
  <p data-pagefind-meta="slug">${htmlEscape(post.slug)}</p>
  <p data-pagefind-meta="publishedAt">${htmlEscape(post.publishedAt)}</p>
  <div>${htmlEscape(post.body)}</div>
</article>`
  })

  const langAttr = locale ? ` lang="${locale}"` : ''
  return `<!DOCTYPE html>
<html${langAttr}>
<head>
  <meta charset="UTF-8">
  <title>Search Index${locale ? ` - ${locale.toUpperCase()}` : ''}</title>
  <meta name="robots" content="noindex">
</head>
<body>
${htmlParts.join('\n')}
</body>
</html>`
}

const posts = files.map((file) => {
  const content = readFileSync(file, 'utf-8')
  const { data, body } = parseFrontmatter(content)
  const relativePath = file.replace(POSTS_DIR + '/', '')
  return {
    file: relativePath,
    slug: data.slug || relativePath.replace(/\.(md|mdx)$/, '').replace(/^[^\/]+\//, ''),
    title: data.title || 'Untitled',
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || '',
    category: data.category || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    publishedAt: data.publishedAt || '',
    body: stripMarkdown(body),
  }
})

posts.sort((nameA, nameB) => {
  if (!nameA.publishedAt) return 1
  if (!nameB.publishedAt) return -1
  return new Date(nameB.publishedAt) - new Date(nameA.publishedAt)
})

// Generate separate index file per locale
const postsByLocale = groupPostsByLocale(posts)

for (const [locale, localePosts] of Object.entries(postsByLocale)) {
  const outputFile = join(OUTPUT_DIR, `search-index-${locale}.html`)
  const fullHtml = generateHtmlForLocale(localePosts, locale)
  writeFileSync(outputFile, fullHtml, 'utf-8')
  console.log(`[search-index] Generated ${outputFile} with ${localePosts.length} posts`)
}
