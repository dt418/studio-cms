# Content Management

The project intentionally uses repository-owned Markdown/MDX instead of a runtime CMS. This keeps the deployment static and makes every content change reviewable in Git.

## Add a post

1. Choose a locale directory: `apps/web/src/content/posts/vi` or `apps/web/src/content/posts/en`.
2. Create a `.md` or `.mdx` file with frontmatter matching `apps/web/src/content.config.ts`.
3. Write the article body using Markdown, GFM, and Astro components where needed.
4. Run `pnpm typecheck` to validate the collection.
5. Run `pnpm build` to generate pages, OG assets, RSS, and the Pagefind index.

## Localized slugs

Keep the same `slug` across the `vi` and `en` versions of a post when they represent the same article. The locale is derived from the content path.

## Visibility

Use the frontmatter fields defined by the content schema. The public route helpers in `apps/web/src/lib/post-visibility.ts` decide which entries are included in the static build.
