# Blog Filter Fix & Documentation Plan

**Date:** 2026-05-06
**Status:** Complete — All tasks done

---

## ✅ Completed (Already Executed)

### 1. Bug Fixes from Code Review
- [x] **Fix duplicate event listeners** in `BlogFilter.astro`
  - Added `initialized` guard to prevent multiple `initBlogFilter()` calls on SPA navigation
  - Removed immediate calls; kept only `astro:page-load` listener with guard

- [x] **Fix form submission** on Enter key in search
  - Added `id="filter-form"` to form element
  - Added `form.addEventListener("submit", (e) => e.preventDefault())` in `setupFilterBridge()`

- [x] **Revert button hover style** (per user request)
  - Reverted to `[a]:hover:bg-primary/80` for buttons rendered inside `<a>` tags

### 2. FilterSelect Component Updates
- [x] **Add useEffect sync** in `FilterSelect.tsx`
  - Syncs initial `value` prop to hidden input on mount and when value changes
  - Guard: skips only when `value === undefined || value === null`

- [x] **Re-add initialCategory/initialTag props** to `BlogFilter.astro`
  - Added props with conditional spread for `exactOptionalPropertyTypes`:
    ```astro
    {...(initialCategory && { value: initialCategory })}
    {...(initialTag && { value: initialTag })}
    ```

- [x] **Fix FilterSelect renders label instead of value**
  - Changed from uncontrolled (`defaultValue`) to controlled component (`value` + `useState`)
  - Added label lookup from options array to display selected label in trigger
  - Removed unused `SelectValue` import

- [x] **Fix FilterSelect reset button clears selected value**
  - Added `filter-reset` event listener in `FilterSelect.tsx` to reset state
  - Updated reset button in `BlogFilter.astro` to dispatch `filter-reset` event before `filter-change`

- [x] **Fix FilterSelect TypeScript error**
  - Updated `onValueChange` handler parameter type to accept `string | null`
  - Added null check before processing value

### 3. Code Quality
- [x] **Prettier fixes** — double-quote style violations (5 files)
  - `apps/web/src/components/ui/button.tsx`
  - `apps/web/src/lib/post.ts`
  - `apps/web/src/components/ui/input-group.tsx`
  - `apps/web/src/components/ui/select.tsx`
  - `apps/web/src/components/ui/input.tsx`

- [x] **Unit tests pass** — 73/73 tests passed

### 4. Build Verification
- [x] **Production build succeeded** (m0065)
  - 20 pages built in 28.92s
  - Search index generated with 4 posts
  - Pagefind indexed 1 page, 286 words

- [x] **Production build succeeded** (m0039, m0033)
  - Build passes after FilterSelect fixes
  - TypeScript check passes

### 5. Documentation
- [x] **Updated `CHANGELOG.md`** with 11 entries under `[Unreleased]`
  - Bug Fixes: 4 entries (duplicate listeners, form submission, FilterSelect sync, props re-add)
  - Features: 3 entries (FilterSelect component, post.ts utilities, shadcn/ui components)
  - Refactors: 2 entries (extract post utilities, update components)
  - Chores/Style: 2 entries (Tailwind config, Prettier fixes)

- [x] **Updated `CHANGELOG.md`** with FilterSelect fixes (m0044)
  - FilterSelect now renders label instead of value
  - FilterSelect reset button clears selected value
  - FilterSelect TypeScript error fix

- [x] **Markdownlint validation** passed

---

## 🔍 Root Cause Analysis (Latest Fixes)

### 1. FilterSelect Not Showing Selected Label

**Symptom:** After selecting an item, the Select trigger showed the value (e.g., "date-desc") instead of the label (e.g., "Newest first").

**Root Cause:**
- `FilterSelect` was using uncontrolled mode with `defaultValue` prop
- The `@base-ui/react` Select component needs controlled mode (`value` prop) to properly track and display the selected item
- No label lookup was implemented — the component relied on `SelectValue` which wasn't properly reflecting the label

**Fix:** Changed to controlled component with `useState`, added label lookup from options array, and rendered label directly in trigger.

---

### 2. Reset Button Not Clearing FilterSelect

**Symptom:** Clicking "Reset" cleared the hidden input values but the Select UI still showed the previously selected value.

**Root Cause:**
- The reset button in `BlogFilter.astro` only cleared DOM elements (`filter-category`, `filter-tag`, `filter-sort` hidden inputs)
- `FilterSelect` React components have their own internal state that isn't automatically synced with DOM changes
- No event mechanism existed to notify React components of external reset

**Fix:** Added `filter-reset` custom event that `FilterSelect` listens for via `useEffect`. Reset button now dispatches this event before `filter-change`.

---

### 3. TypeScript Error: onValueChange Handler

**Symptom:** TypeScript error when assigning `handleChange` to `onValueChange` prop.

**Root Cause:**
- `@base-ui/react` Select's `onValueChange` callback type is `(value: string | null) => void`
- The `null` value is passed when the Select is cleared or no item is selected
- Original handler was typed as `(value: string) => void`, causing type mismatch

**Fix:** Updated `handleChange` parameter type to `string | null` and added null guard at the start of the function.

---

## ✅ Additional Work Completed (Beyond Original Plan)

### Phase 1a: E2E Test Fixes
- [x] **Fixed `blog.spec.ts:56`** — `page.locator('select')` returned 0 because FilterSelect renders Base UI combobox buttons, not native `<select>`. Changed to `page.locator('[role="combobox"]')`.
- [x] **Fixed `tags.spec.ts:43`** — `#filter-tag option` returned 0. Rewrote helper and test to use Base UI Select popover pattern: click `[role="combobox"]` → wait for `[role="listbox"]` → find `[role="option"]` with `data-value`.
- [x] **E2E suite passes**: **213 passed, 0 failed, 21 skipped** (3 browsers)

### Phase 1b: Accessibility Fix
- [x] Added `aria-label` to `SelectScrollUpButton`/`SelectScrollDownButton` in `select.tsx`
- [x] Documented remaining axe-core false positive (Base UI combobox buttons) in `accessibility.spec.ts`

### Phase 1c: robots.txt Fix
- [x] Deleted static `apps/web/public/robots.txt`
- [x] Created dynamic `apps/web/src/pages/robots.txt.ts` with proper RFC 9309 directives
- Note: `Content-Signal` directive came from Cloudflare CDN, must be disabled in Cloudflare Dashboard

### Phase 1d: Core Web Vitals
- [x] `CoverImage.astro`: Changed `loading="lazy"` → `loading="eager"`, added `fetchpriority="high"`, added `sizes`
- [x] `ImageBlock.astro`: Added `width`/`height` props, added `sizes`
- [x] `BlogCard.astro`: Added `sizes` attribute

### Phase 1e: Performance Optimizations
- [x] Self-hosted fonts via `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono` (already installed)
- [x] Removed Google Fonts CDN block from `BaseLayout.astro` (~19 lines)
- [x] Removed `@import '@fontsource-variable/jetbrains-mono'` from `app.css`
- [x] Removed unused `.animate-on-scroll` CSS (~78 lines) + IntersectionObserver JS (~19 lines)
- [x] Added hero image `<link rel="preload" as="image">` in `BaseLayout.astro`

### Phase 1f: Code Review Fixes
- [x] Removed duplicate `:root`/`.dark` CSS blocks from `app.css` (silently overrode `tokens.css`)
- [x] Added `listenersRegistered` guard in `blog-filter.ts` to prevent listener accumulation
- [x] Removed redundant reset button listener from `blog-filter.ts`
- [x] Changed `HTMLSelectElement` → `HTMLInputElement` casts in `blog-filter.ts`
- [x] Fixed vite version in `package.json` (removed direct dep, synced override)
- [x] Updated `FilterSelect` `onValueChange` type to `(value: string | null)`

---

## 📝 Files Changed (Uncommitted)

```
M  apps/web/src/components/BlogFilter.astro
M  apps/web/src/components/ui/button.tsx
M  apps/web/src/components/ui/FilterSelect.tsx
M  apps/web/src/components/ui/input-group.tsx
M  apps/web/src/components/ui/input.tsx
M  apps/web/src/components/ui/select.tsx
M  apps/web/src/lib/post.ts
D  apps/web/src/components/FilterSelect.astro
M  apps/web/src/components/ui/SpotlightCard.tsx
M  apps/web/src/components/ui/textarea.tsx
M  apps/web/src/styles/app.css
M  apps/web/components.json
M  apps/web/package.json
M  apps/web/tsconfig.json
M  CHANGELOG.md
```

**Deleted:**
- `apps/web/src/components/FilterSelect.astro` — removed Astro wrapper; `BlogFilter.astro` now imports React component directly from `./ui/FilterSelect`

---

## 🎯 Task Process Summary

| Step | Task | Status | Notes |
|------|------|--------|-------|
| 1 | Fix duplicate event listeners | ✅ Done | `initialized` guard added |
| 2 | Fix form submission | ✅ Done | preventDefault in setupFilterBridge |
| 3 | Revert button hover | ✅ Done | Per user request |
| 4 | FilterSelect useEffect sync | ✅ Done | Syncs hidden input on mount |
| 5 | Re-add initialCategory/initialTag | ✅ Done | Conditional spread for type safety |
| 6 | Prettier fixes | ✅ Done | 5 files formatted |
| 7 | Unit tests pass | ✅ Done | 73/73 passed |
| 8 | Production build | ✅ Done | 20 pages built successfully |
| 9 | CHANGELOG.md updated | ✅ Done | 11 entries added |
| 10 | **FilterSelect renders label** | ✅ Done | Controlled component with label display |
| 11 | **FilterSelect reset works** | ✅ Done | Added `filter-reset` event listener |
| 12 | **FilterSelect TS fix** | ✅ Done | `onValueChange` accepts `string \| null` |
| 13 | **Build passes** | ✅ Done | TypeScript + production build pass |
| 14 | **CHANGELOG updated** | ✅ Done | Added FilterSelect fixes |
| 15 | **Plans updated** | ✅ Done | Updated blog-filter-fix.md |
| 16 | E2E tests | ✅ Done | 213 passed, 0 failed, 21 skipped |
| 17 | Core Web Vitals fixes | ✅ Done | LCP/CLS optimizations |
| 18 | robots.txt fix | ✅ Done | Dynamic endpoint + RFC 9309 compliance |
| 19 | Accessibility fix | ✅ Done | aria-label + false positive documented |
| 20 | Performance optimizations | ✅ Done | Self-hosted fonts, removed dead code |
| 21 | Code review fixes | ✅ Done | 6 issues fixed from review |
| 22 | Browser smoke test | ✅ Done | Blog + post pages verified |

---

## ✅ Final Verification

| Check | Status | Result |
|-------|--------|--------|
| `pnpm lint` | ✅ | Pass |
| `pnpm format:check` | ✅ | Pass |
| `pnpm test` (73 unit tests) | ✅ | 73/73 passed |
| `pnpm typecheck` | ✅ | 0 errors, 0 warnings, 0 hints |
| `pnpm test:e2e` (3 browsers) | ✅ | 213 passed, 0 failed, 21 skipped |
| `pnpm build` | ✅ | 20 pages built |

---

## 📌 Notes

- User explicitly said "No commit" (m0067)
- User said "Only run e2e no commit" (m0068)
- User said "Not run e2e or commit now. Just create plan" (m0070)
- Build mode is now active (m0064), but user wants plan only
