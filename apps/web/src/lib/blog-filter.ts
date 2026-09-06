import { filterPosts } from './filter'

interface SerializedPostData {
  title: string
  excerpt: string
  description: string
  publishedAt: string
  tags: string[]
  category: string
  author: string
  draft: boolean
  noindex: boolean
  slug: string
  path: string
  formattedDate: string
  coverImage?: string
  coverCaption?: string
  coverAlt?: string
  readingTime?: number
}

interface SerializedPost {
  id: string
  body?: string
  collection: string
  data: SerializedPostData
}

interface FilterI18n {
  enter: string
  min: string
  noMatch: string
  single: string
  plural: string
  found: string
}

function escapeHtml(value: string | number | boolean): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderCard(post: SerializedPost, i18n: FilterI18n): string {
  const words = post.body ? post.body.split(/\s+/).filter(Boolean).length : 0
  const minutes = post.data.readingTime ?? Math.max(1, Math.ceil(words / 200))
  const pathAttr = escapeHtml(post.data.path)
  const title = escapeHtml(post.data.title)
  const excerpt = escapeHtml(post.data.description)
  const formattedDate = escapeHtml(post.data.formattedDate)
  const category = escapeHtml(post.data.category)
  const cover = post.data.coverImage ? escapeHtml(post.data.coverImage) : ''

  const tagsHtml = post.data.tags
    .slice(0, 3)
    .map(
      (tag) =>
        `<span class="inline-flex items-center rounded-sm bg-muted px-2 py-1 text-[0.6rem] font-mono tracking-[0.04em] text-muted-foreground">${escapeHtml(tag)}</span>`
    )
    .join('')

  const coverHtml = cover
    ? `<div class="relative aspect-[16/10] overflow-hidden bg-muted"><img src="${cover}" alt="" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" /></div>`
    : `<div class="approved-card-fallback aspect-[16/10]" aria-hidden="true"></div>`

  return `
    <article data-testid="blog-post-card" class="group overflow-hidden rounded-lg border border-border bg-background transition-colors duration-200 hover:border-primary/45">
      <a href="${pathAttr}" class="flex h-full flex-col">
        ${coverHtml}
        <div class="flex flex-1 flex-col p-4 sm:p-5">
          <div class="mb-3 flex items-center justify-between gap-4">
            <span class="editorial-kicker">${category}</span>
            <time class="text-[0.62rem] font-mono text-muted-foreground tabular-nums">${formattedDate}</time>
          </div>
          <h2 class="editorial-display text-[1.55rem] leading-[1.08] font-semibold tracking-[-0.03em] text-foreground transition-colors group-hover:text-primary sm:text-[1.7rem]">${title}</h2>
          <p class="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">${excerpt}</p>
          <div class="mt-4 flex flex-wrap gap-1.5">${tagsHtml}</div>
          <div class="mt-auto flex items-center justify-between gap-4 pt-6">
            <span class="inline-flex items-center gap-1 text-[0.62rem] font-mono font-semibold uppercase tracking-[0.14em] text-primary">
              ${escapeHtml(i18n.enter)} <span aria-hidden="true">→</span>
            </span>
            <span class="text-[0.62rem] font-mono text-muted-foreground/75 tabular-nums">${minutes} ${escapeHtml(i18n.min)}</span>
          </div>
        </div>
      </a>
    </article>
  `
}

export function initBlogFilter(): void {
  const postsData: SerializedPost[] = JSON.parse(
    document.getElementById('filter-data')?.textContent?.trim() || '[]'
  )

  const i18nEl = document.getElementById('filter-i18n')
  const i18n: FilterI18n = i18nEl?.textContent
    ? JSON.parse(i18nEl.textContent)
    : {
        enter: 'enter',
        min: 'min',
        noMatch: 'No posts match your filters.',
        single: 'post',
        plural: 'posts',
        found: 'found',
      }

  const searchInput = document.getElementById('filter-search') as HTMLInputElement | null
  const categoryInput = document.getElementById('filter-category') as HTMLInputElement | null
  const tagInput = document.getElementById('filter-tag') as HTMLInputElement | null
  const sortInput = document.getElementById('filter-sort') as HTMLInputElement | null
  const resultsContainer = document.getElementById('filter-results')
  const resultsCount = document.getElementById('filter-results-count')

  if (
    !searchInput ||
    !categoryInput ||
    !tagInput ||
    !sortInput ||
    !resultsContainer ||
    !resultsCount
  ) {
    return
  }

  resultsContainer.className = 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'

  function applyFilters(): void {
    const query = searchInput!.value.toLowerCase().trim()
    const category = categoryInput!.value || ''
    const tag = tagInput!.value || ''
    const sortValue = sortInput!.value
    const [sortField, sortOrder] = sortValue.split('-') as [
      'date' | 'title' | 'readingTime',
      'asc' | 'desc',
    ]

    const result = filterPosts<SerializedPost>(postsData, {
      query: query || '',
      category,
      tag,
      sortField,
      sortOrder,
    })

    resultsCount!.textContent = `${result.length} ${result.length === 1 ? i18n.single : i18n.plural} ${i18n.found}`

    if (result.length === 0) {
      resultsContainer!.innerHTML = `
        <div class="md:col-span-2 xl:col-span-3 text-center py-12 border border-dashed border-border rounded-lg">
          <p class="text-muted-foreground">${escapeHtml(i18n.noMatch)}</p>
        </div>
      `
      return
    }

    resultsContainer!.innerHTML = result.map((post) => renderCard(post, i18n)).join('')
  }

  if (searchInput.dataset.filterBound !== 'true') {
    searchInput!.addEventListener('input', applyFilters)
    searchInput.dataset.filterBound = 'true'
  }
  if (categoryInput.dataset.filterBound !== 'true') {
    categoryInput!.addEventListener('change', applyFilters)
    categoryInput.dataset.filterBound = 'true'
  }
  if (tagInput.dataset.filterBound !== 'true') {
    tagInput!.addEventListener('change', applyFilters)
    tagInput.dataset.filterBound = 'true'
  }
  if (sortInput.dataset.filterBound !== 'true') {
    sortInput!.addEventListener('change', applyFilters)
    sortInput.dataset.filterBound = 'true'
  }

  applyFilters()
}
