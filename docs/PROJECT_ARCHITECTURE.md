# Project Architecture Diagrams

These diagrams summarize the current monorepo structure. For the prose overview, see [Architecture Overview](./reference/architecture.md).

## Workspace Map

```mermaid
graph TB
    ROOT["danhthanh.dev monorepo"]
    ROOT --> WEB["apps/web - static Astro site"]
    ROOT --> CMS["apps/cms - StudioCMS SSR app"]
    ROOT --> E2E["e2e - Playwright tests"]
    ROOT --> DOCS["docs - project documentation"]

    WEB --> WEB_CONTENT["src/content/posts"]
    WEB --> WEB_PAGES["src/pages"]
    WEB --> WEB_COMPONENTS["src/components"]
    WEB --> WEB_LIB["src/lib"]
    WEB --> WEB_STYLES["src/styles"]
    WEB --> WEB_DIST["dist - static output"]

    CMS --> CMS_CONFIG["studiocms.config.mjs"]
    CMS --> CMS_ROUTES["/studiocms and /studiocms_api"]
    CMS --> CMS_SERVER["dist/server/entry.mjs"]
    CMS --> DB["libSQL / Turso"]

    E2E --> WEB
```

## Web Content Flow

```mermaid
sequenceDiagram
    participant Author
    participant Content as apps/web/src/content/posts
    participant Astro as Astro content collections
    participant Pages as Public pages
    participant Pagefind as Pagefind index
    participant User

    Author->>Content: Add or edit Markdown/MDX post
    Content->>Astro: Validate frontmatter with content schema
    Astro->>Pages: Build blog, tag, category, search, and RSS routes
    Pages->>Pagefind: Generate static search index after build
    User->>Pages: Visit public site
    User->>Pagefind: Search generated index
```

## CMS Runtime Flow

```mermaid
sequenceDiagram
    participant Admin
    participant CMS as apps/cms StudioCMS
    participant OAuth as GitHub / Google OAuth
    participant DB as libSQL / Turso

    Admin->>CMS: Visit /studiocms
    CMS->>OAuth: Start OAuth login
    OAuth-->>CMS: Return auth callback
    CMS->>DB: Read and write CMS data
    DB-->>CMS: Return persisted content and auth state
    CMS-->>Admin: Render dashboard and CMS routes
```

## Import And Styling Patterns

```mermaid
graph LR
    ALIAS["@ alias"] --> WEB_SRC["apps/web/src"]
    WEB_SRC --> LIB["@/lib/*"]
    WEB_SRC --> COMPONENTS["@/components/*"]
    WEB_SRC --> STYLES["src/styles/app.css"]
    STYLES --> TOKENS["tokens.css"]
    STYLES --> SEMANTIC["semantic.css"]
    STYLES --> BASE["base.css"]
    STYLES --> COMPONENT_CSS["components.css"]
```
