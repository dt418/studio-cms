import { SITE } from '@/lib/site'

const tagSeoDescriptions: Record<string, string> = {
  astro:
    'Bài viết về Astro 5, kiến trúc islands và cách dùng Astro cùng StudioCMS để xây dựng website nội dung hoặc ứng dụng SaaS hiệu năng cao.',
  'web-development':
    'Kinh nghiệm phát triển web với Astro 5, kiến trúc islands, StudioCMS và quy trình xây dựng ứng dụng SaaS nhanh, dễ bảo trì.',
  '9router':
    'Hướng dẫn cài đặt 9router API Proxy trên VPS, quản lý nhiều API key AI, xoay vòng provider và kiểm soát chi phí sử dụng.',
  vps: 'Hướng dẫn triển khai 9router API Proxy trên VPS với PM2 và Cloudflared, kèm cách vận hành, kiểm tra trạng thái và bảo vệ credentials.',
  ai: 'Bài viết về quản lý nhiều API key AI qua 9router, xoay vòng OpenAI, Anthropic và Google provider, ẩn credentials và kiểm soát chi phí.',
  proxy:
    'Hướng dẫn xây dựng và vận hành API proxy với 9router, PM2 và Cloudflared để quản lý provider, API key và truy cập từ bên ngoài.',
  'cloudflare-tunnel':
    'Cách dùng Cloudflare Tunnel để công khai 9router API Proxy an toàn, mapping domain, quản lý tunnel và tránh mở trực tiếp cổng VPS.',
  pm2: 'Hướng dẫn chạy 9router API Proxy bằng PM2 trên VPS, quản lý tiến trình, kiểm tra trạng thái và duy trì dịch vụ ổn định.',
  'api-gateway':
    'Bài viết về dùng 9router như API gateway cho nhiều nhà cung cấp AI, hỗ trợ xoay vòng key, ẩn credentials và kiểm soát chi phí.',
  performance:
    'Kỹ thuật xây dựng website hiệu năng cao với Astro 5, static HTML và kiến trúc islands chỉ tải JavaScript khi cần tương tác.',
  tailwindcss:
    'Cẩm nang migrate lên TailwindCSS 4, từ cài đặt và cấu hình Vite đến breaking changes, CSS configuration và plugin mới.',
  css: 'Hướng dẫn nâng cấp CSS với TailwindCSS 4, gồm cấu hình mới, thay đổi plugin, breaking changes và các bước migrate an toàn.',
  frontend:
    'Kiến thức frontend qua quá trình migrate TailwindCSS 4, xử lý cấu hình Vite, CSS mới, plugin changes và tương thích dự án.',
  saas: 'Hướng dẫn xây dựng ứng dụng SaaS với Astro cho frontend và StudioCMS để quản lý nội dung, tối ưu SEO, RSS và tìm kiếm.',
  studiocms:
    'Cách kết hợp StudioCMS với Astro để quản lý nội dung cho ứng dụng SaaS, thiết lập collection, SEO, RSS và tìm kiếm bằng Fuse.js.',
  typescript:
    'Học TypeScript Generics từ hàm generic, constraints và interface đến Repository Pattern để viết mã tái sử dụng, an toàn kiểu.',
  programming:
    'Kiến thức lập trình TypeScript qua Generics, constraints, generic interface và Repository Pattern cho mã dễ tái sử dụng, mở rộng và an toàn kiểu.',
  generics:
    'Làm chủ TypeScript Generics với generic function, constraints, interface và Repository Pattern để xây dựng mã tái sử dụng, an toàn kiểu.',
}

const categorySeoDescriptions: Record<string, string> = {
  tutorials:
    'Các bài hướng dẫn thực hành về Astro, TypeScript Generics, 9router API Proxy, VPS, PM2, Cloudflared và phát triển web hiện đại.',
  guides:
    'Các bài cẩm nang chuyên sâu về migrate TailwindCSS 4 và xây dựng ứng dụng SaaS với Astro, StudioCMS cùng kiến trúc frontend hiện đại.',
}

export const vi = {
  nav: {
    writing: 'Bài viết',
    about: 'Về tôi',
    rss: 'rss',
    primary: 'Điều hướng chính',
    brandHome: `${SITE.name} trang chủ`,
    skipToContent: 'Bỏ qua đến nội dung',
    menu: 'Mở menu',
    toggleTheme: 'Đổi giao diện',
    themeDark: 'Chuyển sang giao diện tối',
    themeLight: 'Chuyển sang giao diện sáng',
  },
  language: {
    navigation: 'Chọn ngôn ngữ',
    footerNavigation: 'Chọn ngôn ngữ ở chân trang',
    switchTo: (language: string) => `Chuyển ngôn ngữ sang ${language}`,
    names: {
      en: 'English',
      vi: 'Tiếng Việt',
    },
  },
  breadcrumb: {
    label: 'Đường dẫn điều hướng',
  },
  hero: {
    tagline: 'Dành cho nhà phát triển xây dựng sản phẩm web hiện đại',
    activeNotes: 'Ghi chú đang hoạt động',
    description:
      'Kỹ sư phần mềm chia sẻ góc nhìn thực tế về thiết kế, phát triển, ra mắt và mở rộng sản phẩm web hiện đại.',
    focus: {
      title: 'Đang tập trung',
      items: ['Hệ thống nội dung', 'Hạ tầng API', 'Hiệu năng web'],
    },
    posts: 'bài viết',
    topics: 'chủ đề',
    tags: 'thẻ',
    cta: {
      readBlog: 'Đọc blog',
      rssFeed: 'RSS',
    },
  },
  section: {
    latestInsights: 'Góc nhìn mới nhất',
    practicalKnowledge: 'Kiến thức thực tế cho nhà phát triển hiện đại.',
  },
  archive: {
    browse: 'Duyệt',
    allPosts: 'Tất cả bài viết.',
    fullArchive: 'Toàn bộ bài viết gồm hướng dẫn, cẩm nang và ghi chú.',
    openFullArchive: 'Mở tất cả bài viết',
    noArchivedPosts: 'Chưa có bài viết cũ — xem các bài mới ở trên.',
  },
  blog: {
    archive: 'Bài viết',
    description:
      'Khám phá bài viết, hướng dẫn và ghi chú kỹ thuật về Astro, TypeScript, TailwindCSS, API proxy, hiệu năng và phát triển web hiện đại.',
    stats: {
      publishedNotes: 'Bài đã xuất bản',
      categories: 'Chủ đề',
      tags: 'thẻ',
      archiveSnapshot: 'Tổng quan lưu trữ',
    },
  },
  home: {
    title: 'Blog Lập Trình',
    featured: 'Nổi bật',
    latestFromBlog: 'Bài viết mới nhất từ blog.',
    recentDescription: 'Hướng dẫn, cẩm nang và ghi chú mới về phát triển web.',
    readMore: 'Đọc thêm',
    recentLabel: 'Vừa xuất bản',
    featuredIndex: 'nổi bật / 01',
    notesLabel: 'ghi chú',
    minRead: 'phút đọc',
    description:
      'Blog của Danh Thanh chia sẻ kinh nghiệm thực tế về TypeScript, Astro, kiến trúc web, hiệu năng và cách xây dựng sản phẩm hiện đại.',
    topicStrip: [
      'Astro 7 Islands',
      'TypeScript Generics',
      'TailwindCSS v4',
      'VPS & PM2',
      'Cloudflare Tunnels',
      'AI API Proxy',
    ],
    metrics: {
      postsDescription: 'Bài viết mới nhất về xây dựng sản phẩm web và hệ thống kỹ thuật bền vững.',
      topicsDescription:
        'Mỗi chủ đề tập trung vào vấn đề thực tế: hiệu năng, kiến trúc và trải nghiệm phát triển.',
      tagsDescription: 'Khám phá nhanh theo thẻ để tìm đúng bài viết bạn cần ngay lúc này.',
    },
  },
  about: {
    pageTitle: 'Về tôi',
    metaDescription:
      'Tìm hiểu về Danh Thanh, định hướng chia sẻ kỹ thuật, nguyên tắc làm việc, công nghệ sử dụng và cách liên hệ hợp tác.',
    eyebrow: 'Software engineer / creator',
    monogramLabel: 'Biểu trưng Danh Thanh',
    intro:
      'Tôi tập trung vào phát triển giải pháp phần mềm, internal tooling, hệ thống proxy API và tối ưu hiệu năng ứng dụng web.',
    principleIndex: '01',
    principleTitle: 'Triết lý làm việc',
    principleBody:
      'Xây dựng thứ phức tạp, đơn giản hơn. Tôi tin kỹ thuật tốt biến những hệ thống rối rắm thành sản phẩm dễ hiểu, dễ bảo trì và đáng tin cậy.',
    stackIndex: '02',
    stackTitle: 'Tech stack cốt lõi',
    stack: [
      'TypeScript',
      'Astro 7',
      'Node.js / PM2',
      'Tailwind CSS',
      'Cloudflare Tunnels',
      'AI API Gateways',
    ],
    contactTitle: 'Kết nối & Kênh liên lạc',
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
    minRead: 'phút đọc',
    tableOfContents: 'Mục lục',
    faqEyebrow: 'HỎI ĐÁP / Q&A',
    faqTitle: 'Câu hỏi thường gặp',
    faqDescription: 'Một vài giải đáp thực tế giúp bạn áp dụng nội dung trong bài viết.',
    relatedPosts: 'Bài liên quan',
    readingDetails: 'Chi tiết đọc',
    author: 'Tác giả',
    published: 'Xuất bản',
    updated: 'Cập nhật',
    words: 'Từ',
    share: 'Chia sẻ',
    onThisPage: 'Trên trang này',
    readMore: 'Đọc thêm →',
    prevPost: 'Bài trước',
    nextPost: 'Bài sau',
    postNavigation: 'Điều hướng bài viết',
    shareOnX: 'Chia sẻ lên X',
    copyLink: 'Sao chép liên kết',
  },
  author: {
    role: 'Writer & Developer',
  },
  filter: {
    sortNewest: 'Mới nhất',
    sortOldest: 'Cũ nhất',
    sortTitleAZ: 'Tiêu đề A-Z',
    sortTitleZA: 'Tiêu đề Z-A',
    sortShortest: 'Ngắn nhất',
    sortLongest: 'Dài nhất',
    searchPlaceholder: 'Tìm bài viết...',
    allCategories: 'Tất cả chủ đề',
    allTags: 'Tất cả tags',
    sortBy: 'Sắp xếp',
    clearTitle: 'Xóa tìm kiếm và reset bộ lọc',
    reset: 'Đặt lại',
    emptyPrompt: 'Nhập để tìm kiếm hoặc điều chỉnh bộ lọc...',
    noMatch: 'Không có bài viết nào phù hợp.',
    enter: 'vào',
    minRead: 'phút',
    single: 'bài',
    plural: 'bài',
    found: 'tìm thấy',
  },
  schema: {
    home: 'Trang chủ',
    blog: 'Blog',
    about: 'Về tôi',
    postsTagged: (tag: string) => `Bài viết gắn tag: ${tag}`,
    allPostsTaggedWith: (tag: string) =>
      tagSeoDescriptions[tag] ??
      `Khám phá bài viết về ${tag} trên DanhThanh.dev, với hướng dẫn thực tế, ví dụ kỹ thuật và kinh nghiệm phát triển sản phẩm web hiện đại.`,
    postsIn: (category: string) => `Bài viết trong ${category}`,
    allPostsInCategory: (category: string) =>
      categorySeoDescriptions[category] ??
      `Khám phá các bài viết thuộc danh mục ${category} trên DanhThanh.dev, gồm hướng dẫn thực tế và kinh nghiệm xây dựng sản phẩm web hiện đại.`,
  },
  tags: {
    title: 'Thẻ:',
    postsTaggedWith: 'bài viết gắn tag',
    backToBlog: 'Quay lại Blog',
    searchFilter: 'Tìm & Lọc',
    heading: 'Tất cả Tags',
  },
  categories: {
    title: 'Danh mục:',
    postsIn: 'bài viết trong',
    backToBlog: 'Quay lại Blog',
    searchFilter: 'Tìm & Lọc',
    heading: 'Tất cả Danh mục',
  },
  footer: {
    buildingOn: 'Xây dựng onboarding, internal tooling và hệ thống vận hành với proof rõ ràng.',
    softwareEngineer:
      'Software engineer xây dựng hệ thống giúp sản phẩm phức tạp dễ adopt và tin tưởng hơn.',
    links: 'liên kết',
    email: 'email',
    collaboration: 'Liên hệ hợp tác →',
    github: 'github',
    rss: 'rss',
    linkedin: 'linkedin',
  },
  rss: {
    title: `${SITE.name} Blog RSS Feed`,
  },
  errors: {
    notFound: 'Không tìm thấy trang',
    goHome: 'Quay về trang chủ',
    subtitle404: 'Trang này không còn ở đây nữa.',
    description404:
      'Có thể URL bị sai, trang đã được di chuyển, hoặc đơn giản là chưa bao giờ tồn tại. Thử kiểm tra lại đường dẫn hoặc quay về trang chủ.',
    viewBlog: 'Xem blog',
    status: 'HTTP 404 · NOT FOUND',
    terminalLabel404: 'Terminal',
    terminalTitle: 'bash — zsh',
    terminalContentType: 'content-type: text/html',
    terminalServer: 'server: cloudflare',
    quickLinks404: 'Liên kết nhanh',
    maybeLookingFor: 'Có thể bạn đang tìm',
    allPosts: 'Tất cả bài viết',
    githubLabel: 'GitHub / dt418',
    linkedinLabel: 'LinkedIn',
    rssFeed: 'RSS feed',
    tracePrefix: 'Bạn đang ở: ',
    footerRole: 'Software engineer · Web development · TypeScript',
  },
  redirect: {
    title: 'Đang chuyển hướng...',
    description: 'Đang chuyển hướng đến',
  },
}
