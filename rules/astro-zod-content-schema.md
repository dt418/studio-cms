# Astro And Zod Content Schema Rules

Use these rules when editing Astro content schemas, JSON-LD scripts, or any component that injects
JSON into a `<script>` tag.

## Zod URL Validation

- Use `z.url()` for URL fields.
- Do not use deprecated `z.string().url()`.
- For HTTP/HTTPS-only fields, use `z.url({ protocol: /^https?$/ })` or a stricter project-specific
  schema.

```ts
// Correct
canonicalUrl: z.url().optional()

// Incorrect
canonicalUrl: z.string().url().optional()
```

## Astro Inline Scripts

- Add `is:inline` to Astro `<script>` tags that have attributes and are intentionally unprocessed.
- This includes JSON data scripts and JSON-LD scripts using `set:html`.
- Keep executable inline scripts explicit with `is:inline` when they rely on browser globals and do
  not need TypeScript/import processing.

```astro
<script is:inline type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
<script is:inline type="application/json" id="filter-data" set:html={serializedJson} />
```

## Guardrail

Run `pnpm lint:patterns` after touching content schema or Astro script injection. It fails on:

- `z.string().url(`
- `<script ... set:html=...>` without `is:inline`
