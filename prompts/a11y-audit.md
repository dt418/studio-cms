# Accessibility audit prompt

Use this prompt when asking an agent to audit accessibility.

```text
Audit accessibility for: <URL, route, component, or changed files>

Goal:
- Improve WCAG 2.2 AA compliance and PageSpeed/Lighthouse Accessibility score.
- Prefer small, source-backed fixes over broad rewrites.

Context:
- Read project rules first: AGENTS.md, relevant skills, i18n files, layout/components.
- If project has i18n, keep all user-facing and assistive text localized.

Audit steps:
1. Run automated checks when possible:
   - npx lighthouse <url> --only-categories=accessibility
   - npx @axe-core/cli <url>
2. If remote audit fails, inspect source and generated DOM.
3. Check manually for:
   - html lang
   - skip link and main landmark
   - heading order
   - nav/breadcrumb/language labels
   - aria-current
   - image alt/size
   - icon button names
   - decorative SVG aria-hidden/focusable
   - form labels/errors
   - keyboard focus and target size
   - color contrast
4. Patch the smallest safe change.
5. Verify with lint/typecheck/tests/build as relevant.

Output format:
- Findings: prioritized list with file paths and lines.
- Fixes: files changed and why.
- Verification: exact commands and pass/fail.
- Remaining risks: anything not verified or needing browser/manual review.
```
