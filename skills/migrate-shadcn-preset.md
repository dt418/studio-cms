You are a senior frontend architect.

Your task is to refactor and migrate an existing Tailwind CSS v4 + shadcn UI theme system into a scalable, production-ready architecture using Astro + React islands.

## 🎯 Goals

* Preserve all existing design tokens (OKLCH-based)
* Keep compatibility with shadcn/ui utilities (bg-primary, text-muted-foreground, etc.)
* Implement a Linear-style theme system (dynamic, shareable, user-customizable)
* Ensure SSR-safe theme initialization (no flash)
* Use Tailwind CSS v4 (@theme inline)

---

## 📦 Input (existing system)

You are given a monolithic CSS file containing:

* :root tokens (OKLCH)
* .dark overrides
* @theme inline mapping
* @layer base + components
* custom animations
* shadcn-compatible utilities

---

## 🧱 Required Architecture

Split the system into the following files:

src/styles/

* tokens.css        → raw design tokens (:root + .dark)
* semantic.css      → @theme inline bridge to Tailwind
* base.css          → base layer
* components.css    → UI components
* app.css           → imports

src/lib/

* theme-store.ts    → apply theme + persist
* palette.ts        → generate OKLCH palette from primary
* theme-url.ts      → encode/decode theme to URL
* presets.ts        → predefined themes

src/components/theme/

* ThemeEditor.tsx   → main UI (React island)
* Panel.tsx         → floating panel
* ColorControl.tsx  → OKLCH sliders (L, C, H)
* Presets.tsx       → preset buttons

src/layouts/

* BaseLayout.astro  → SSR-safe theme init

---

## ⚙️ Functional Requirements

### 1. Theme System

* Use CSS variables as source of truth
* Support:

  * light / dark mode
  * dynamic primary color
* Persist theme in localStorage

---

### 2. Tailwind v4 Integration

* Use @theme inline to map:
  --color-primary → var(--primary)
* Ensure utilities like:
  bg-primary, text-foreground work

---

### 3. Dynamic Palette

Generate:

* --primary-50
* --primary-100
* --primary-200
* --primary-500
* --primary-700
* --primary-900

Using:
color-mix(in oklch, ...)

---

### 4. Theme Editor UI

Build a floating panel (bottom-right):

Features:

* Toggle light/dark
* OKLCH sliders (L, C, H)
* Preset themes (linear, vercel, github)
* Live preview
* Share button (copy URL)

---

### 5. Share via URL

Encode theme state:
?theme=BASE64_JSON

Auto apply on load.

---

### 6. Astro SSR Fix

Inject inline script in <head>:

* read localStorage
* read URL param
* apply before render

---

### 7. Presets

Provide:

linear → purple-ish
vercel → neutral white
github → blue

---

## 🎨 UI Requirements

* Use shadcn button styles
* Use Tailwind utilities only
* Add:
  backdrop-blur
  soft shadow
  rounded-xl panel
* Visual style similar to Linear.app

---

## 🚫 Constraints

* DO NOT use Tailwind config (v4 only)
* DO NOT break existing class names
* DO NOT remove OKLCH
* DO NOT hardcode colors outside tokens

---

## ✅ Output Format

Return:

1. Folder structure
2. Full code for each file
3. Minimal explanation
4. Clean, production-ready code

---

## 🔥 Bonus (if possible)

* Add gradient primary support
* Add theme export/import JSON
* Add smooth transitions

---

Now generate the full implementation.
