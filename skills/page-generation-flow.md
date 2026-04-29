# StudioCMS Blog Page Generation

Visual guide to how the homepage and blog index pages are generated in the Astro 5 + StudioCMS 0.4 + libSQL project.

## Architecture Overview

```
libSQL (Turso) Database
    ↓
StudioCMS (studiocms + @studiocms/blog + @studiocms/md)
    ↓
Content Collections (src/content.config.ts) -- glob loader
    ↓
src/content/posts/*.md, *.mdx -- markdown/MDX source files
    ↓
astro:content getCollection('posts') -- Astro's content API
    ↓
src/lib/cms.ts -- getAllPosts(), getAllCategories(), etc.
    ↓
Pages (index.astro, blog/index.astro) -- consume and render
    ↓
Components (BlogCard, YearGroup, PostItem, Search) -- presentational
```

**Key detail:** Content is stored as filesystem-based markdown/MDX files. StudioCMS provides the CMS UI, but `@studiocms/blog` has `injectRoutes: false` and `enableRSS: false` -- custom pages handle all routing.

## Data Flow

### 1. Content Collection Schema (`src/content.config.ts`)

The `posts` collection uses a Zod schema:

| Field          | Type       | Required | Notes                  |
| -------------- | ---------- | -------- | ---------------------- |
| `title`        | `string`   | Yes      | Post title             |
| `slug`         | `string`   | Yes      | URL slug               |
| `excerpt`      | `string`   | Yes      | Short description      |
| `coverImage`   | `string`   | No       | Hero image URL         |
| `publishedAt`  | `Date`     | Yes      | Coerced from string    |
| `updatedAt`    | `Date`     | No       | Last-modified date     |
| `tags`         | `string[]` | Yes      | Default `[]`           |
| `category`     | `string`   | Yes      | Single category        |
| `author`       | `string`   | Yes      | Default `'Danh Thanh'` |
| `authorAvatar` | `string`   | No       | Author avatar URL      |

Loader: `glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' })`

### 2. CMS Data Layer (`src/lib/cms.ts`)

All functions wrap `getCollection('posts')`:

```ts
// Returns all posts sorted by publishedAt descending
getAllPosts() → Post[]

// Finds single post by slug
getPostBySlug(slug: string) → Post | undefined

// Returns unique sorted lists
getAllTags() → string[]
getAllCategories() → string[]

// Filtered queries
getPostsByTag(tag: string) → Post[]
getPostsByCategory(category: string) → Post[]
```

**Note:** No caching layer -- each request hits the content layer fresh in SSR mode.

### 3. Grouping Utilities (`src/lib/group.ts`)

```ts
// Groups posts by publishedAt.getFullYear()
groupByYear(posts: Post[]) → Record<number, Post[]>

// Returns years sorted descending (newest first)
sortedYears(groups: Record<number, Post[]>) → number[]
```

## Homepage Generation (`src/pages/index.astro`)

### Structure (5 vertical sections)

```
┌─────────────────────────────────────────────┐
│ 1. HERO SECTION                              │
│  ┌─────────────────────────────────────┐    │
│  │  ✨ Welcome to my blog              │    │
│  │  Practical insights for             │    │
│  │  modern developers                  │    │
│  │  Learn how to design, develop...    │    │
│  │  [🔍 Search input]                  │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│ 2. FEATURED POST (posts[0])                  │
│  ┌─────────────────────────────────────┐    │
│  │  [Cover Image - aspect-video]       │    │
│  │  🏷️ Category  •  Jan 15, 2024      │    │
│  │  Post Title Here                    │    │
│  │  Post excerpt text...               │    │
│  │  Read more →                        │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│ 3. CATEGORIES                                │
│  Categories              [View all →]       │
│  [Tag1] [Tag2] [Tag3] ...                   │
├─────────────────────────────────────────────┤
│ 4. LATEST POSTS (posts.slice(1))             │
│  Latest Posts  •  12 posts published        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ BlogCard │ │ BlogCard │ │ BlogCard │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐                 │
│  │ BlogCard │ │ BlogCard │                 │
│  └──────────┘ └──────────┘                 │
├─────────────────────────────────────────────┤
│ 5. CTA SECTION                               │
│  ┌─────────────────────────────────────┐    │
│  │  Enjoyed the content?               │    │
│  │  Follow along for more...           │    │
│  │  [Browse all posts] [RSS Feed]      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Data Flow

```ts
// 1. Fetch all posts and categories
const posts = await getAllPosts() // sorted by publishedAt desc
const categories = await getAllCategories()

// 2. Prepare search data (flattened for client-side)
const searchPosts: SearchablePost[] = posts.map((post) => ({
  title: post.data.title,
  excerpt: post.data.excerpt,
  tags: post.data.tags,
  slug: post.data.slug,
  category: post.data.category,
}))

// 3. Split into featured + remaining
const featuredPost = posts[0]
const remainingPosts = posts.slice(1)
```

### Components Used

| Component    | Purpose                    | Data Source                                                      |
| ------------ | -------------------------- | ---------------------------------------------------------------- |
| `Search`     | Client-side Fuse.js search | `searchPosts` (serialized to `<script type="application/json">`) |
| `BlogCard`   | Post card in grid          | `remainingPosts` (each `Post`)                                   |
| `BaseLayout` | HTML shell with SEO        | `title`, `description`, `jsonLd`                                 |

## Blog Index Generation (`src/pages/blog/index.astro`)

### Structure (4 sections)

```
┌─────────────────────────────────────────────┐
│ 1. HEADER                                    │
│  [ARCHIVE]                                   │
│  Blog                                        │
│  Build logs, hackathon writeups...           │
├─────────────────────────────────────────────┤
│ 2. STATS BAR                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  12  │ │  3   │ │  01  │ │ 2026 │       │
│  │Posts │ │Years │ │Page  │ │Snap. │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────────────┤
│ 3. CATEGORY FILTER                           │
│  Browse by category                          │
│  [All] [Tech] [Design] [DevOps] ...         │
├─────────────────────────────────────────────┤
│ 4. YEAR GROUPS                               │
│  ─── 2026 (5) ─────────────────────────     │
│  Jan 15  Post Title    [enter →]  3 min     │
│         Post excerpt...                      │
│         #tag1 #tag2                          │
│  Jan 10  Another Post  [enter →]  5 min     │
│  ─── 2025 (4) ─────────────────────────     │
│  Dec 20  Year End Post [enter →]  2 min     │
│  ...                                         │
└─────────────────────────────────────────────┘
```

### Data Flow

```ts
// 1. Fetch and group posts
const posts = await getAllPosts()
const categories = await getAllCategories()
const byYear = groupByYear(posts) // { 2026: [...], 2025: [...] }
const years = sortedYears(byYear) // [2026, 2025, ...]
```

### Components Used

| Component    | Purpose                   | Data Source                      |
| ------------ | ------------------------- | -------------------------------- |
| `YearGroup`  | Year section with heading | `year: number`, `posts: Post[]`  |
| `PostItem`   | Individual post row       | `post: Post`                     |
| `BaseLayout` | HTML shell with SEO       | `title`, `description`, `jsonLd` |

## Component Details

### BlogCard (`src/components/BlogCard.astro`)

```
┌─────────────────────────────┐
│ [Cover Image - optional]    │
│                             │
│ 🏷️ Category  •  Date        │
│ Post Title (line-clamp-2)   │
│ Excerpt text... (lc-3)      │
│                             │
│ #tag1 #tag2 #tag3 +2        │
│ Read more →                 │
└─────────────────────────────┘
```

**Props:** `post: CollectionEntry<'posts'>`
**Link:** `/blog/${post.data.slug}`
**Hover:** Card border brightens, image scales slightly

### YearGroup (`src/components/Blog/YearGroup.astro`)

```
─── 2026 (5) ──────────────────────────────────
┌─ PostItem ─┐
┌─ PostItem ─┐
┌─ PostItem ─┐
```

**Props:** `year: number`, `posts: Post[]`
**Renders:** Monospace year heading + count, border separator, iterates `PostItem`

### PostItem (`src/components/Blog/PostItem.astro`)

```
┌────────────┬──────────────────────────┬────────┐
│ Jan 15     │ Post Title Here          │ enter→ │
│ 2024       │ Post excerpt text...     │ 3 min  │
│            │ #tag1 #tag2 #tag3 +1     │        │
└────────────┴──────────────────────────┴────────┘
```

**Props:** `post: Post`
**Layout:** 3-column grid `[120px date | content | auto metadata]`
**Uses:** `formatDate()` from `src/lib/date.ts`, `readingTime()` from `src/lib/reading-time.ts`

### Search (`src/components/Search.astro`)

```
┌─────────────────────────────────────┐
│ 🔍 Search posts...                  │
├─────────────────────────────────────┤
│ [Result Card 1]                     │
│ [Result Card 2]                     │
│ [Result Card 3]                     │
└─────────────────────────────────────┘
```

**Props:** `posts: SearchablePost[]`
**Server:** Serializes posts to `<script type="application/json" id="search-data">`
**Client:** Parses JSON, creates Fuse.js index, listens to input events
**Fuse config:** title weight 0.5, excerpt weight 0.3, tags weight 0.2, threshold 0.3, limit 8

## BaseLayout (`src/layouts/BaseLayout.astro`)

Wraps all pages with:

- **SEO:** Title, description, canonical URL, OG tags, Twitter cards, JSON-LD
- **Header:** Sticky nav with logo, Blog link, RSS link
- **Footer:** Bio section, links (Email, GitHub, RSS, LinkedIn)
- **Client scripts:** ViewTransition for internal links, IntersectionObserver for `.animate-on-scroll`

**Props:**

```ts
interface Props {
  title: string
  description?: string
  image?: string
  canonicalUrl?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown>
}
```

## SSR vs Static Generation

**Mode:** SSR (`output: 'server'`, `adapter: node({ mode: 'standalone' })`)

- Pages rendered on-demand by Node.js server
- `getAllPosts()` called on every request (no build-time caching)
- View Transitions enabled for SPA-like navigation
- `checkOrigin: false` -- CSRF origin checking disabled

## File Inventory

| File                                  | Purpose                                   |
| ------------------------------------- | ----------------------------------------- |
| `src/pages/index.astro`               | Homepage (5 sections)                     |
| `src/pages/blog/index.astro`          | Blog index (4 sections)                   |
| `src/pages/blog/[slug].astro`         | Post detail (3-column layout)             |
| `src/lib/cms.ts`                      | CMS data fetching (wraps `astro:content`) |
| `src/lib/group.ts`                    | Year grouping utilities                   |
| `src/lib/search.ts`                   | Search types and Fuse.js factory          |
| `src/lib/date.ts`                     | Date formatting utility                   |
| `src/lib/reading-time.ts`             | Reading time calculation (200 WPM)        |
| `src/types/post.ts`                   | `Post` type alias                         |
| `src/content.config.ts`               | Content collection schema (Zod)           |
| `src/components/BlogCard.astro`       | Blog card (homepage grid)                 |
| `src/components/Blog/YearGroup.astro` | Year group section (blog index)           |
| `src/components/Blog/PostItem.astro`  | Individual post row (blog index)          |
| `src/components/Search.astro`         | Client-side search with Fuse.js           |
| `src/layouts/BaseLayout.astro`        | Base HTML layout with SEO                 |
| `astro.config.mjs`                    | Astro configuration                       |
| `studiocms.config.mjs`                | StudioCMS configuration                   |
