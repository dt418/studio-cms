# Code Conventions

## TypeScript
- Strict with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, unused checks
- Conditionally spread optional Astro props: `{...(value && { value })}`
- ESLint forbids `any` except in `*.test.ts`

## Astro
- Do NOT create React-style JSX-returning helper functions in frontmatter
- Extract a `.astro` component or render inline
- `@` is the alias for `src/*` — prefer it over deep relative imports

## Styling
- Tailwind v4 in web enters through `src/styles/app.css`
- Keep token/theme changes in `tokens.css`, `semantic.css`, `base.css`, `components.css`
- Prettier: no semicolons, single quotes, 100-column width, Astro + Tailwind plugins

## Images
- Every `<img>` must include `width`/`height` to prevent CLS
- Non-hero images: `loading="lazy"` and `decoding="async"`
- Always use descriptive `alt` text (never empty on content images)

## Content
- All user-facing text goes through `src/lib/i18n/{en,vi}.ts`
- Page titles: `${title} | ${SITE.name}` (no `-` separator)
- JSON-LD required on index/list pages and post pages
- No `<meta name="generator">`

## Commits
- Conventional Commits: `fix:`, `feat:`, `perf:`, etc.
- Use `perf` for CLS, LCP, font-loading, image-optimization changes
