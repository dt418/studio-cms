import { filterPosts } from './filter'

interface SerializedPostData {
  title: string
  excerpt: string
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

function escapeHtml(value: string | number | boolean): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderCard(post: SerializedPost): string {
  const words = post.body ? post.body.split(/\s+/).filter(Boolean).length : 0
  const minutes = Math.max(1, Math.ceil(words / 200))
  const pathAttr = escapeHtml(post.data.path)
  const title = escapeHtml(post.data.title)
  const excerpt = escapeHtml(post.data.excerpt)
  const formattedDate = escapeHtml(post.data.formattedDate)

  const tagsHtml = post.data.tags
    .slice(0, 4)
    .map(
      (tag) =>
        `<span class="inline-flex items-center rounded-sm bg-white/5 px-2 py-0.5 text-xs font-mono text-muted-foreground/50">${escapeHtml(tag)}</span>`
    )
    .join('')

  const tagsOverflow =
    post.data.tags.length > 4
      ? `<span class="inline-flex items-center rounded-sm bg-white/5 px-2 py-0.5 text-xs font-mono text-muted-foreground/50">+${post.data.tags.length - 4}</span>`
      : ''

  return `
    <article data-testid="blog-post-card" class="post-card group grid grid-cols-[120px_1fr_auto] gap-4 sm:gap-6 py-7 border-b border-white/5 items-start last:border-b-0 hover:bg-white/[0.01] transition-colors duration-200 rounded-lg -mx-4 px-4">
      <div class="pt-0.5">
        <time class="text-sm font-mono text-muted-foreground tabular-nums">${formattedDate}</time>
      </div>
      <a href="${pathAttr}" class="block min-w-0">
        <h2 class="text-lg font-semibold leading-snug tracking-tight text-foreground/90 group-hover:text-foreground transition-colors mb-1.5">${title}</h2>
        <p class="text-sm leading-relaxed text-muted-foreground/70 line-clamp-2 mb-3">${excerpt}</p>
        <div class="flex flex-wrap gap-1.5">${tagsHtml}${tagsOverflow}</div>
      </a>
      <div class="pt-0.5 pl-4 flex flex-col items-end gap-1">
        <a href="${pathAttr}" class="group/enter inline-flex items-center gap-1 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground/40 hover:text-foreground transition-colors">
          <span>enter</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover/enter:translate-x-0.5">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
        <span class="text-xs font-mono text-muted-foreground/30 tabular-nums">${minutes} min</span>
      </div>
    </article>
  `
}

export function initBlogFilter(): void {
  const postsData: SerializedPost[] = JSON.parse(
    document.getElementById('filter-data')?.textContent?.trim() || '[]'
  )

  const searchInput = document.getElementById('filter-search') as HTMLInputElement | null
  const categorySelect = document.getElementById('filter-category') as HTMLSelectElement | null
  const tagSelect = document.getElementById('filter-tag') as HTMLSelectElement | null
  const sortSelect = document.getElementById('filter-sort') as HTMLSelectElement | null
  const resultsContainer = document.getElementById('filter-results')
  const resultsCount = document.getElementById('filter-results-count')
  const resetButton = document.getElementById('filter-reset')

  if (
    !searchInput ||
    !categorySelect ||
    !tagSelect ||
    !sortSelect ||
    !resultsContainer ||
    !resultsCount ||
    !resetButton
  ) {
    return
  }

  function applyFilters(): void {
    const query = searchInput!.value.toLowerCase().trim()
    const category = categorySelect!.value || ''
    const tag = tagSelect!.value || ''
    const sortValue = sortSelect!.value
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

    resultsCount!.textContent = `${result.length} ${result.length === 1 ? 'post' : 'posts'} found`

    if (result.length === 0) {
      resultsContainer!.innerHTML = `
        <div class="text-center py-12 border border-dashed border-border rounded-lg">
          <p class="text-muted-foreground">No posts match your filters.</p>
        </div>
      `
      return
    }

    resultsContainer!.innerHTML = result.map(renderCard).join('')
  }

  function resetFilters(): void {
    searchInput!.value = ''
    categorySelect!.value = ''
    tagSelect!.value = ''
    sortSelect!.value = 'date-desc'
    applyFilters()
  }

  resetButton!.addEventListener('click', resetFilters)
  searchInput!.addEventListener('input', applyFilters)
  categorySelect!.addEventListener('change', applyFilters)
  tagSelect!.addEventListener('change', applyFilters)
  sortSelect!.addEventListener('change', applyFilters)

  applyFilters()
}
