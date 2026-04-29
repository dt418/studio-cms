# Skill: danhthanh-tailwind-theme

Use this skill when changing styling, design tokens, theme behavior, shadcn/ui wiring, or Tailwind CSS in `danhthanh.dev`.

## Project Facts

- Tailwind CSS v4 enters through `src/styles/app.css`.
- `src/styles/app.css` imports `tokens.css`, `semantic.css`, `base.css`, and `components.css`.
- Keep token and theme changes in those modules instead of adding new global CSS entrypoints.
- `components.json` configures shadcn with TSX, `@/components/ui`, `@/lib/utils`, Tailwind CSS at `src/styles/app.css`, and no RSC.
- Prettier includes Astro and Tailwind plugins; let it sort classes.

## Styling Rules

- Preserve established project visual language unless the task explicitly asks for a redesign.
- Use CSS custom properties for themeable values.
- Keep broad utilities such as `.container` stable; accidental width changes can regress the entire site.
- Current `.container` should retain centered max-width behavior: `mx-auto max-w-7xl px-6 lg:px-8`.
- Prefer Tailwind utilities for component layout and spacing.
- Use existing style modules before adding component-global CSS.

## Theme Rules

- `BaseLayout.astro` is responsible for early theme initialization before first paint.
- Preserve saved `theme-config` behavior when changing the layout head.
- Saved `theme-config.mode` values `light` and `dark` should apply before render.
- Saved primary color values should apply as `--primary: oklch(...)` before render.
- Do not remove the minimal inline initializer unless replacing it with an equal or better no-flash theme path.

## Astro Component Rules

- Do not create React-style JSX-returning helper functions in Astro frontmatter.
- Extract reusable render logic into `.astro` components or render inline.
- With `exactOptionalPropertyTypes`, conditionally spread optional props instead of passing `undefined`.
- Use `@/*` imports over deep relative imports.

## Verification

- Run `pnpm format:check` after Tailwind class changes.
- Run `pnpm lint` after Astro/TS/TSX changes.
- Run `pnpm typecheck` when props, imports, or component types change.
- Run `pnpm check` before claiming a styling/theme change is complete.
- Run browser or E2E checks when layout, responsive behavior, or first-paint theme behavior changes substantially.

## Documentation

- Update `docs/reference/architecture.md` if style entrypoints, token locations, or shadcn wiring change.
- Update `CHANGELOG.md` for user-visible visual, layout, or theme behavior changes.
