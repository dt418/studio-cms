# Skill: a11y-audit

Use this skill to audit and improve accessibility for `danhthanh.dev`, Astro routes, blog posts, UI components, and PageSpeed Accessibility regressions.

## Workflow

1. Identify target route, URL, or changed component.
2. Read related Astro component, layout, i18n, and content files.
3. Run automated audit when possible:
   - Lighthouse: `npx lighthouse <url> --only-categories=accessibility`
   - axe: `npx @axe-core/cli <url>`
4. If URL audit fails, inspect local source and generated DOM instead of guessing.
5. Patch smallest safe change.
6. Verify with project gates:
   - `pnpm lint:patterns`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build` when route/search/RSS/generated output changes.
7. Report changed files, exact commands, pass/fail, and remaining warnings.

## DanhThanh Rules

- Keep all user-facing and assistive text in `apps/web/src/lib/i18n/{en,vi}.ts`.
- Use `getTranslations(lang)` and pass localized labels into components.
- Add skip links and landmark labels in `apps/web/src/layouts/BaseLayout.astro`.
- Blog route labels flow through `apps/web/src/pages/[lang]/blog/[slug].astro` into `PostHero`, `PostHeader`, and child components.
- Prefer semantic HTML over ARIA.
- Icon-only buttons need `aria-label`; decorative SVGs need `aria-hidden="true" focusable="false"`.
- Current navigation, language, and breadcrumb items use `aria-current="page"`.
- Breadcrumb and language switcher labels must be localized.
- Every content image needs width, height, and descriptive alt unless decorative.
- Focus styles must stay visible and keyboard-reachable.

## Audit Checklist

- Page language correct.
- Main landmark reachable by skip link.
- Header, footer, breadcrumbs, language switcher have accessible names.
- Heading order logical.
- Links and buttons have descriptive names.
- Forms have labels and error announcements.
- Color contrast passes WCAG AA.
- Touch targets meet 24×24 px minimum.
- Reduced-motion preference respected.
