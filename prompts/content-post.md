# Content Post Prompt

Use this prompt when creating or updating blog content.

## Prompt

Create or update content in `apps/web/src/content/posts` following the current Astro content schema.

Rules:

- Keep frontmatter compatible with `apps/web/src/content.config.ts`.
- Use stable slugs and route helpers; avoid hardcoded route assumptions in components.
- Preserve author/date/tag/category conventions used by existing posts.
- If metadata affects listing, RSS, search, sitemap, or canonical behavior, run `pnpm build`.
- For text-only post edits, run `pnpm lint:md` and relevant Prettier checks.

Return:

- Post path and slug.
- Metadata changed.
- Verification commands and results.
