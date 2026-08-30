import { SITE } from '@/lib/site'

const tagSeoDescriptions: Record<string, string> = {
  astro:
    'Articles on Astro 5, islands architecture, and using Astro with StudioCMS to build fast content sites and maintainable SaaS applications.',
  'web-development':
    'Practical web development with Astro 5, islands architecture, StudioCMS, and patterns for building fast, maintainable SaaS products.',
  '9router':
    'Learn to deploy a 9router API proxy on a VPS, manage multiple AI API keys, rotate providers, protect credentials, and control costs.',
  vps: 'Deploy and operate a 9router API proxy on a VPS with PM2 and Cloudflared, including status checks, remote access, and credential protection.',
  ai: 'Manage OpenAI, Anthropic, and Google API keys through 9router, rotate providers, hide credentials, and control AI usage costs.',
  proxy:
    'Build and run an API proxy with 9router, PM2, and Cloudflared to manage providers, API keys, secure credentials, and remote access.',
  'cloudflare-tunnel':
    'Use Cloudflare Tunnel to expose a 9router API proxy safely, map domains, manage tunnel services, and avoid opening VPS ports directly.',
  pm2: 'Run a 9router API proxy with PM2 on a VPS, manage the process, verify service health, and keep deployments stable.',
  'api-gateway':
    'Use 9router as an API gateway for multiple AI providers, with key rotation, hidden credentials, remote access, and cost controls.',
  performance:
    'Build fast websites with Astro 5, static HTML, and islands architecture that ships browser JavaScript only when interaction requires it.',
  tailwindcss:
    'Migrate to TailwindCSS 4 with guidance on installation, Vite setup, CSS configuration, breaking changes, plugins, and migration steps.',
  css: 'Upgrade project CSS with TailwindCSS 4, covering new configuration, plugin changes, breaking behavior, and a safer migration workflow.',
  frontend:
    'Frontend guidance for migrating to TailwindCSS 4, including Vite integration, CSS configuration, plugin changes, and compatibility work.',
  saas: 'Build a SaaS product with Astro on the frontend and StudioCMS for content, including collections, SEO, RSS, and search.',
  studiocms:
    'Use StudioCMS with Astro to manage SaaS content, configure collections, implement SEO and RSS, and add search with Fuse.js.',
  typescript:
    'Master TypeScript Generics through generic functions, constraints, interfaces, and Repository Pattern examples for reusable, type-safe code.',
  programming:
    'Improve TypeScript programming with Generics, constraints, generic interfaces, and Repository Pattern code that stays reusable and type-safe.',
  generics:
    'Learn TypeScript Generics through functions, constraints, interfaces, and Repository Pattern examples that produce reusable, type-safe code.',
}

const categorySeoDescriptions: Record<string, string> = {
  tutorials:
    'Practical tutorials on Astro, TypeScript Generics, 9router API Proxy, VPS, PM2, Cloudflared, and modern web development.',
  guides:
    'In-depth guides to TailwindCSS 4 migration and building SaaS applications with Astro, StudioCMS, and modern frontend architecture.',
}

export const en = {
  nav: {
    writing: 'writing',
    about: 'about',
    rss: 'rss',
    primary: 'Primary navigation',
    brandHome: `${SITE.name} home`,
    skipToContent: 'Skip to content',
    menu: 'Open menu',
    toggleTheme: 'Toggle theme',
    themeDark: 'Switch to dark mode',
    themeLight: 'Switch to light mode',
  },
  language: {
    navigation: 'Language selector',
    footerNavigation: 'Footer language selector',
    switchTo: (language: string) => `Switch language to ${language}`,
    names: {
      en: 'English',
      vi: 'Tiếng Việt',
    },
  },
  breadcrumb: {
    label: 'Breadcrumb',
  },
  hero: {
    tagline: 'For developers shipping modern web products',
    activeNotes: 'Active notes',
    description:
      'Software engineer sharing practical insights on designing, developing, launching, and growing modern web products.',
    focus: {
      title: 'Current focus',
      items: ['Content systems', 'API infrastructure', 'Web performance'],
    },
    posts: 'posts',
    topics: 'topics',
    tags: 'tags',
    cta: {
      readBlog: 'Read the blog',
      rssFeed: 'RSS Feed',
    },
  },
  section: {
    latestInsights: 'Latest insights',
    practicalKnowledge: 'Practical knowledge for modern developers.',
  },
  archive: {
    browse: 'Browse',
    allPosts: 'All posts and writing.',
    fullArchive: 'The full archive of tutorials, guides, and notes.',
    openFullArchive: 'Open full archive',
    noArchivedPosts: 'No archived posts yet — see the latest above.',
  },
  blog: {
    archive: 'Archive',
    description:
      'Explore build logs, tutorials, and technical notes on Astro, TypeScript, TailwindCSS, API proxies, performance, and modern web development.',
    stats: {
      publishedNotes: 'Published notes',
      categories: 'Categories',
      tags: 'Tags',
      archiveSnapshot: 'Archive snapshot',
    },
  },
  home: {
    title: 'Engineering Blog',
    featured: 'Featured',
    latestFromBlog: 'Latest from the blog.',
    recentDescription: 'Recent tutorials, guides, and notes on web development.',
    readMore: 'Read more',
    recentLabel: 'Recently published',
    featuredIndex: 'featured / 01',
    notesLabel: 'notes',
    minRead: 'min read',
    description:
      'Danh Thanh shares practical lessons on TypeScript, Astro, web architecture, performance, and shipping maintainable modern products.',
    topicStrip: [
      'Astro 7 Islands',
      'TypeScript Generics',
      'TailwindCSS v4',
      'VPS & PM2 Deployment',
      'Cloudflare Tunnels',
      'AI API Proxy',
    ],
    metrics: {
      postsDescription:
        'Fresh notes on building modern products and resilient engineering systems.',
      topicsDescription:
        'Each topic maps to practical concerns: performance, architecture, developer experience.',
      tagsDescription: 'Scan tags quickly to jump to the exact post you need right now.',
    },
  },
  about: {
    pageTitle: 'About',
    metaDescription:
      'Learn about Danh Thanh, his engineering focus, working principles, core technology stack, and ways to connect or collaborate.',
    eyebrow: 'Software engineer / creator',
    monogramLabel: 'Danh Thanh monogram',
    intro:
      'I build software solutions, internal tooling, API proxy systems, and performance-focused web experiences.',
    principleIndex: '01',
    principleTitle: 'Working principle',
    principleBody:
      'Make complex things simpler. Good engineering turns tangled systems into products people can understand, maintain, and trust.',
    stackIndex: '02',
    stackTitle: 'Core stack',
    stack: [
      'TypeScript',
      'Astro 7',
      'Node.js / PM2',
      'Tailwind CSS',
      'Cloudflare Tunnels',
      'AI API gateways',
    ],
    contactTitle: 'Connect & contact',
    contact: {
      emailMarker: '@',
      email: 'Email',
      githubMarker: 'GH',
      github: 'GitHub',
      githubHandle: '@dt418',
      linkedinMarker: 'IN',
      linkedin: 'LinkedIn',
      linkedinHandle: '@danhthanh418',
      rssMarker: 'RSS',
      rss: 'RSS Feed',
    },
  },
  post: {
    minRead: 'min read',
    tableOfContents: 'Table of Contents',
    faqEyebrow: 'FAQ / Q&A',
    faqTitle: 'Frequently asked questions',
    faqDescription: 'A few practical answers to help you apply the ideas from this article.',
    relatedPosts: 'Related Posts',
    readingDetails: 'Reading Details',
    author: 'Author',
    published: 'Published',
    updated: 'Updated',
    words: 'Words',
    share: 'Share',
    onThisPage: 'On this page',
    readMore: 'Read more →',
    prevPost: 'Previous Post',
    nextPost: 'Next Post',
    postNavigation: 'Post navigation',
    shareOnX: 'Share on X',
    copyLink: 'Copy link',
  },
  author: {
    role: 'Writer & Developer',
  },
  filter: {
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortTitleAZ: 'Title A-Z',
    sortTitleZA: 'Title Z-A',
    sortShortest: 'Shortest first',
    sortLongest: 'Longest first',
    searchPlaceholder: 'Search posts...',
    allCategories: 'All Categories',
    allTags: 'All Tags',
    sortBy: 'Sort By',
    clearTitle: 'Clear search and reset filters',
    reset: 'Reset',
    emptyPrompt: 'Type to search or adjust filters...',
    noMatch: 'No posts match your filters.',
    enter: 'enter',
    minRead: 'min',
    single: 'post',
    plural: 'posts',
    found: 'found',
  },
  schema: {
    home: 'Home',
    blog: 'Blog',
    about: 'About',
    postsTagged: (tag: string) => `Posts tagged: ${tag}`,
    allPostsTaggedWith: (tag: string) =>
      tagSeoDescriptions[tag] ??
      `Explore ${tag} articles on DanhThanh.dev with practical guidance, technical examples, and lessons for building maintainable modern web products.`,
    postsIn: (category: string) => `Posts in ${category}`,
    allPostsInCategory: (category: string) =>
      categorySeoDescriptions[category] ??
      `Explore ${category} articles on DanhThanh.dev with practical tutorials, technical examples, and lessons from building modern web products.`,
  },
  tags: {
    title: 'Tag:',
    postsTaggedWith: 'posts tagged with',
    backToBlog: 'Back to Blog',
    searchFilter: 'Search & Filter',
    heading: 'All Tags',
  },
  categories: {
    title: 'Category:',
    postsIn: 'posts in',
    backToBlog: 'Back to Blog',
    searchFilter: 'Search & Filter',
    heading: 'All Categories',
  },
  footer: {
    buildingOn: 'Building onboarding, internal tooling, and operational systems with clear proof.',
    softwareEngineer:
      'Software engineer building systems that make complex products easier to adopt and trust.',
    links: 'links',
    email: 'email',
    collaboration: 'Contact for collaboration →',
    github: 'github',
    rss: 'rss',
    linkedin: 'linkedin',
  },
  rss: {
    title: `${SITE.name} Blog RSS Feed`,
  },
  errors: {
    notFound: 'Page not found',
    goHome: 'Go back home',
    subtitle404: 'This page is no longer here.',
    description404:
      'The URL might be wrong, the page may have moved, or it may never have existed. Check the URL or go back home.',
    viewBlog: 'View blog',
    status: 'HTTP 404 · NOT FOUND',
    terminalLabel404: 'Terminal',
    terminalTitle: 'bash — zsh',
    terminalContentType: 'content-type: text/html',
    terminalServer: 'server: cloudflare',
    quickLinks404: 'Quick links',
    maybeLookingFor: 'You might be looking for',
    allPosts: 'All posts',
    githubLabel: 'GitHub / dt418',
    linkedinLabel: 'LinkedIn',
    rssFeed: 'RSS feed',
    tracePrefix: 'You are at: ',
    footerRole: 'Software engineer · Web development · TypeScript',
  },
  redirect: {
    title: 'Redirecting...',
    description: 'Redirecting to',
  },
}
