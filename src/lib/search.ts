export interface SearchablePost {
  title: string
  excerpt: string
  tags: string[]
  slug: string
  category: string
}

interface SearchResult {
  title: string
  url: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  publishedAt: string
  body: string
  score?: number
}

interface PagefindInstance {
  init: () => Promise<void>
  search: (
    query: string,
    options?: { filters?: Record<string, string[]> }
  ) => Promise<{ results: { data: () => Promise<PagefindData> }[] }>
  filters: () => Promise<{
    filters?: Record<string, Record<string, number>>
  }>
}

interface PagefindData {
  meta?: Record<string, string>
  url?: string
  excerpt?: string
  content?: string
}

type FuseConstructor = new <TItem>(
  items: TItem[],
  options: {
    keys: { name: string; weight: number }[]
    threshold: number
    includeScore: boolean
    minMatchCharLength: number
  }
) => { search: (query: string) => { item: TItem; score: number }[] }

const PAGEFIND_BASE_URL = '/pagefind'
const DEBOUNCE_MS = 200
const MAX_RESULTS = 10

let pagefind: PagefindInstance | null = null
let Fuse: FuseConstructor | null = null
let allCategories = new Set<string>()
let allTags = new Set<string>()
let currentRequestId = 0

function debounce<Args extends unknown[]>(fn: (...args: Args) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

function highlightText(text: string, query: string): string {
  if (!query || !text) {
    return text
  }
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function formatDate(dateStr: string): string {
  if (!dateStr) {
    return ''
  }
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function showStatus(message: string): void {
  const status = document.getElementById('search-status')
  if (!status) {
    return
  }
  status.textContent = message
  status.hidden = false
}

function hideStatus(): void {
  const status = document.getElementById('search-status')
  if (status) {
    status.hidden = true
  }
}

function renderEmpty(): void {
  const container = document.getElementById('search-results')
  if (!container) {
    return
  }
  container.innerHTML = `
    <div class="search-empty">
      <p>No results found.</p>
    </div>
  `
}

function renderBadge(text: string, variant: string, query: string): string {
  const highlighted = highlightText(escapeHtml(text), query)
  return `<span class="search-badge search-badge--${variant}">${highlighted}</span>`
}

function renderResults(results: SearchResult[], query: string): void {
  const container = document.getElementById('search-results')
  if (!container) {
    return
  }

  if (results.length === 0) {
    renderEmpty()
    return
  }

  container.innerHTML = results
    .map((result) => {
      const score = result.score !== undefined ? Math.round((1 - result.score) * 100) : null
      const hasImage = result.coverImage !== ''
      const modifier = hasImage ? 'search-result search-result--with-image' : 'search-result'

      const imageHtml = hasImage
        ? `<div class="search-result__image"><img src="${escapeHtml(result.coverImage)}" alt="" loading="lazy" /></div>`
        : ''

      const tagsHtml = result.tags
        .slice(0, 4)
        .map((tag) => renderBadge(tag, 'tag', query))
        .join('')

      const overflow =
        result.tags.length > 4 ? renderBadge(`+${result.tags.length - 4}`, 'overflow', '') : ''

      const categoryHtml = result.category ? renderBadge(result.category, 'category', query) : ''

      const dateHtml = result.publishedAt
        ? `<span class="search-result__date">${formatDate(result.publishedAt)}</span>`
        : ''

      const scoreHtml =
        score !== null ? `<span class="search-result__score">${score}% match</span>` : ''

      const excerptHtml = result.excerpt
        ? `<p class="search-result__excerpt">${highlightText(escapeHtml(result.excerpt), query)}</p>`
        : ''

      return `
        <article class="${modifier}">
          ${imageHtml}
          <div class="search-result__body">
            <a href="${escapeHtml(result.url)}" class="search-result__link">
              <h2 class="search-result__title">${highlightText(escapeHtml(result.title), query)}</h2>
              ${excerptHtml}
              <div class="search-result__meta">
                ${categoryHtml}
                ${tagsHtml}${overflow}
                ${dateHtml}
              </div>
            </a>
          </div>
          <div class="search-result__aside">
            <span class="search-result__enter">
              <span>enter</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
            ${scoreHtml}
          </div>
        </article>
      `
    })
    .join('')
}

function populateFilters(): void {
  const categoryFilter = document.getElementById(
    'search-category-filter'
  ) as HTMLSelectElement | null
  const tagFilter = document.getElementById('search-tag-filter') as HTMLSelectElement | null

  if (categoryFilter && allCategories.size > 0) {
    const options = [...allCategories]
      .sort()
      .map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`)
      .join('')
    categoryFilter.innerHTML = '<option value="">All Categories</option>' + options
    categoryFilter.closest('#search-filters')!.toggleAttribute('hidden', false)
  }

  if (tagFilter && allTags.size > 0) {
    const options = [...allTags]
      .sort()
      .map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`)
      .join('')
    tagFilter.innerHTML = '<option value="">All Tags</option>' + options
    tagFilter.closest('#search-filters')!.toggleAttribute('hidden', false)
  }
}

async function initSearch(): Promise<void> {
  const input = document.getElementById('search-input') as HTMLInputElement | null
  const clearBtn = document.getElementById('search-clear') as HTMLButtonElement | null
  const categoryFilter = document.getElementById(
    'search-category-filter'
  ) as HTMLSelectElement | null
  const tagFilter = document.getElementById('search-tag-filter') as HTMLSelectElement | null

  if (!input) {
    return
  }

  // Reset per-page state so SPA navigations don't accumulate stale entries or
  // leave stale request flags behind.
  allCategories = new Set<string>()
  allTags = new Set<string>()
  currentRequestId = 0

  try {
    showStatus('Loading search index...')

    pagefind = (await import(
      /* @vite-ignore */ `${PAGEFIND_BASE_URL}/pagefind.js`
    )) as unknown as PagefindInstance
    await pagefind.init()

    const filterData = await pagefind.filters()
    if (filterData.filters) {
      if (filterData.filters.category) {
        Object.keys(filterData.filters.category).forEach((cat) => allCategories.add(cat))
      }
      if (filterData.filters.tag) {
        Object.keys(filterData.filters.tag).forEach((tag) => allTags.add(tag))
      }
    }

    populateFilters()
    hideStatus()

    const doSearch = debounce(async () => {
      const query = input.value.trim()
      if (!query) {
        const resultsContainer = document.getElementById('search-results')
        if (resultsContainer) {
          resultsContainer.innerHTML = ''
        }
        hideStatus()
        if (clearBtn) {
          clearBtn.hidden = true
        }
        return
      }

      if (clearBtn) {
        clearBtn.hidden = false
      }

      const requestId = ++currentRequestId
      showStatus('Searching...')

      try {
        const filters: Record<string, string[]> = {}
        if (categoryFilter && categoryFilter.value) {
          filters.category = [categoryFilter.value]
        }
        if (tagFilter && tagFilter.value) {
          filters.tag = [tagFilter.value]
        }

        const searchResult = await pagefind!.search(query, { filters })

        // Drop stale results — only the most recent request is allowed to render.
        if (requestId !== currentRequestId) {
          return
        }

        if (!searchResult.results || searchResult.results.length === 0) {
          renderEmpty()
          showStatus('No results found.')
          return
        }

        const pagefindResults = await Promise.all(
          searchResult.results.slice(0, 20).map((result) => result.data())
        )

        if (requestId !== currentRequestId) {
          return
        }

        const normalized = pagefindResults
          .filter(Boolean)
          .map((data) => ({
            title: data.meta?.title ?? '',
            url: data.url ?? '#',
            excerpt: data.meta?.excerpt ?? data.excerpt ?? '',
            coverImage: data.meta?.coverImage ?? '',
            category: data.meta?.category ?? '',
            tags: (data.meta?.tags ?? '')
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
            publishedAt: data.meta?.publishedAt ?? '',
            body: data.content ?? '',
          }))
          .filter((item) => item.title !== '')

        if (Fuse !== null && normalized.length > 1) {
          const fuseInstance = new Fuse(normalized, {
            keys: [
              { name: 'title', weight: 0.5 },
              { name: 'excerpt', weight: 0.3 },
              { name: 'tags', weight: 0.2 },
            ],
            threshold: 0.3,
            includeScore: true,
            minMatchCharLength: 2,
          })

          const fuseResults = fuseInstance.search(query)
          const refined = fuseResults
            .slice(0, MAX_RESULTS)
            .map((result) => ({ ...result.item, score: result.score }))

          renderResults(refined, query)
        } else {
          renderResults(normalized.slice(0, MAX_RESULTS), query)
        }

        hideStatus()
      } catch (err) {
        if (requestId !== currentRequestId) {
          return
        }
        console.error('Search error:', err)
        showStatus('Search failed. Please try again.')
      }
    }, DEBOUNCE_MS)

    input.addEventListener('input', doSearch)

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = ''
        clearBtn!.hidden = true
        const resultsContainer = document.getElementById('search-results')
        if (resultsContainer) {
          resultsContainer.innerHTML = ''
        }
        hideStatus()
        input.focus()
      })
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        if (input.value.trim()) {
          doSearch()
        }
      })
    }

    if (tagFilter) {
      tagFilter.addEventListener('change', () => {
        if (input.value.trim()) {
          doSearch()
        }
      })
    }

    const urlParams = new URLSearchParams(window.location.search)
    const initialQuery = urlParams.get('q')
    if (initialQuery) {
      input.value = initialQuery
      doSearch()
    }
  } catch (err) {
    console.error('Failed to load search:', err)
    showStatus('Search unavailable.')
  }
}

async function loadFuse(): Promise<void> {
  try {
    const fuseModule = await import('fuse.js')
    Fuse = fuseModule.default as unknown as FuseConstructor
  } catch {
    Fuse = null
  }
}

export { initSearch, loadFuse }
