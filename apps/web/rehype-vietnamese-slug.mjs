function toText(node) {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'text') return typeof node.value === 'string' ? node.value : ''
  if (!Array.isArray(node.children)) return ''

  return node.children.map(toText).join('')
}

export function createSafeSlug(value) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'section'
}

export function getUniqueId(baseId, counts) {
  const count = counts.get(baseId) ?? 0
  counts.set(baseId, count + 1)

  return count === 0 ? baseId : `${baseId}-${count}`
}

function visitHeadings(node, counts) {
  if (!node || typeof node !== 'object') return

  if (
    node.type === 'element' &&
    typeof node.tagName === 'string' &&
    /^h[1-6]$/.test(node.tagName)
  ) {
    node.properties = {
      ...node.properties,
      id: getUniqueId(createSafeSlug(toText(node)), counts),
    }
  }

  if (!Array.isArray(node.children)) return

  for (const child of node.children) {
    visitHeadings(child, counts)
  }
}

export default function rehypeVietnameseSlug() {
  return function transform(tree, file) {
    const counts = new Map()
    visitHeadings(tree, counts)

    if (file.data?.astro?.headings) {
      const astroHeadingCounts = new Map()
      file.data.astro.headings = file.data.astro.headings.map((heading) => ({
        ...heading,
        slug: getUniqueId(createSafeSlug(heading.text), astroHeadingCounts),
      }))
    }
  }
}
