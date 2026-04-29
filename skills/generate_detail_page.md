You are a senior frontend architect.

Generate a fully production-ready Blog Post Detail Page using:

- Astro (v5)
- TailwindCSS v4 (token-based design system, no tailwind.config.\*)
- shadcn-style component architecture (CVA variants)
- MDX content support
- Clean SaaS/blog hybrid UI

---

## DESIGN GOAL

Create a premium dark-mode editorial layout similar to modern dev blogs (Stripe, Vercel, Linear style):

- Minimal
- High typography contrast
- Subtle grid background
- Clean reading experience
- Component-driven

---

## PAGE STRUCTURE

### 1. Global Layout

- Max width: 1200px
- Centered content
- 3-column layout:
  - Left: Table of Contents (sticky)
  - Center: Article content
  - Right: Meta info (sticky)

---

### 2. Hero Section (Top)

Include:

- Breadcrumb (small, muted)
- Title (very large, bold, tight leading)
- Subtitle / excerpt
- Tags (pill badges)
- Metadata:
  - Published date
  - Reading time
- Divider line

---

### 3. Sidebar LEFT (Table of Contents)

- Sticky
- Auto-generated from headings (h2, h3)
- Active section highlight
- Smooth scroll
- Small typography

---

### 4. Sidebar RIGHT (Post Info Card)

Card component:

- Title: "Reading Details"
- Published date
- Author
- Reading time
- Optional share buttons

Style:

- Glass / subtle border
- Rounded-xl
- Dark elevated surface

---

### 5. Article Content (MAIN)

Typography:

- Prose (custom, not default @tailwind typography)
- Max width: 720px
- Strong hierarchy:
  - h1 (hero only)
  - h2 (section titles)
  - h3 (subsections)
- Line height: relaxed

Content blocks:

#### a. Paragraphs

- Muted white text
- Good spacing

#### b. Image Blocks

- Rounded-xl
- Border
- Caption support

#### c. Callout Blocks

Variants:

- info
- warning
- success

#### d. Code Blocks

- Dark themed
- Rounded-lg
- Copy button
- Syntax highlight

#### e. Feature Highlight Card

Centered visual block:

- White background inside dark layout
- Used to emphasize product

#### f. Lists

- Styled bullets
- Good spacing

---

### 6. Section Divider

- Subtle horizontal line
- Used between sections

---

### 7. Bottom Section

Include:

- "What I don't want this to become" section
- Links section
- Previous / Next post navigation

---

### 8. Footer CTA Section

Full-width block:

- Large heading
- Short description
- CTA button

---

## DESIGN SYSTEM (Tailwind v4 Tokens)

Define tokens:

- bg-primary: #0a0a0a
- bg-secondary: #111111
- border-subtle: rgba(255,255,255,0.08)
- text-primary: #ffffff
- text-muted: #a1a1aa
- accent: #ffffff

Spacing scale: 4px base

Radius:

- lg: 12px
- xl: 16px
- 2xl: 20px

---

## COMPONENTS REQUIRED

- <Container />
- <PostHeader />
- <TOC />
- <PostMetaCard />
- <ArticleContent />
- <Callout />
- <CodeBlock />
- <ImageBlock />
- <FooterCTA />

Use CVA for variants.

---

## FUNCTIONALITY

- Generate TOC from headings
- Scroll spy active section
- Responsive:
  - Mobile: single column
  - Tablet: hide right sidebar
- MDX support
- Dark mode default

---

## OUTPUT

Return:

1. Astro page file (`[slug].astro`)
2. Component files
3. Tailwind config (v4 token system)
4. Example MDX content
5. Utility hooks (TOC + scroll spy)

---

## STYLE NOTES

- Avoid clutter
- Use whitespace aggressively
- Typography is the hero
- Subtle grid background overlay
- No bright colors except accents

---

Make the result feel like a premium developer blog + SaaS documentation hybrid.
