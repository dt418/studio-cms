---
description: Run the SEO & e2e workflow skill for pi.
---

Read and follow `.codex/skills/seo-e2e-workflow/SKILL.md`. Apply it when diagnosing Playwright or harness CI failures, and when changing titles, routes, hreflang alternates, or SEO metadata. Key rules: titles always keep the ` | ${SITE.name}` suffix (`resolveSeoTitle` truncates content, never the brand); internal links and e2e route fixtures use trailing slashes; hreflang alternates only for locales where the term exists; build with `SITE_URL=http://localhost:4321 pnpm web:build` before running Playwright against `apps/web/dist` (`SKIP_WEB_BUILD=true` to reuse); diagnose CI from full job logs, never check badges alone.
