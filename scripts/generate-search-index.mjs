import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const POSTS_DIR = './src/content/posts'
const OUTPUT_DIR = './dist/client'
const OUTPUT_FILE = join(OUTPUT_DIR, 'search-index.html')

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

const files = readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))

const posts = files.map((file) => {
  const content = readFileSync(join(POSTS_DIR, file), 'utf-8')
  const { data, body } = parseFrontmatter(content)
  return {
    file,
    slug: data.slug || file.replace(/\.(md|mdx)$/, ''),
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

const htmlParts = posts.map((post) => {
  const categoryFilter = post.category
    ? `<span data-pagefind-filter="category" hidden>${htmlEscape(post.category)}</span>`
    : ''
  const tagFilters = post.tags
    .map((tag) => `<span data-pagefind-filter="tag" hidden>${htmlEscape(tag)}</span>`)
    .join('')

  return `
<article data-pagefind-body>
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

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Search Index</title>
  <meta name="robots" content="noindex">
</head>
<body>
${htmlParts.join('\n')}
</body>
</html>`

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

writeFileSync(OUTPUT_FILE, fullHtml, 'utf-8')
console.log(`[search-index] Generated ${OUTPUT_FILE} with ${posts.length} posts`)
