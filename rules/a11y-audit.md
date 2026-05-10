# A11y audit rules

Apply these rules when editing Astro, HTML, TS, TSX, CSS, or markdown that affects public UI.

## Required behavior

- Use localized labels from `apps/web/src/lib/i18n/{en,vi}.ts`; do not hardcode assistive UI text in components.
- Preserve semantic HTML first: `button`, `a`, `nav`, `main`, `article`, `aside`, `header`, `footer` before ARIA roles.
- Add `aria-label` to repeated landmarks and icon-only controls.
- Add `aria-current="page"` to current navigation, breadcrumb, and language links.
- Mark decorative SVGs as `aria-hidden="true" focusable="false"`.
- Keep skip-to-content link and stable `main id` available in layouts.
- Keep focus indicators visible; do not remove outlines without equivalent `:focus-visible` styling.
- Ensure every non-decorative image has width, height, and descriptive alt.
- Ensure new interactive targets are at least 24×24 CSS px.

## Verification

Run before completion:

```bash
pnpm lint:patterns
pnpm lint
pnpm typecheck
```

Run `pnpm build` when changing routes, structured data, generated search/RSS/sitemap behavior, or page-level layout output.
