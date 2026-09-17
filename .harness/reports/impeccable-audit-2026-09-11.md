# Impeccable technical audit — 2026-09-11

## Implementation integrity verdict

**Fail, with a coherent foundation.** Shared semantic tokens, localized copy,
reusable components, and static publishing support a product-specific editorial
blog. The 404 surface departs from that theme contract, the brand font does not
resolve as intended, and the accessibility gate misses serious failures. This
does not imply that the visual direction should be replaced.

The detector returned one `bounce-easing` warning at
`apps/web/src/styles/tokens.css:81`. Repository search found no consumer of
`--ease-spring`; this unused declaration is not a verified animation defect and
is excluded from the count.

## Executive summary

**11/20 — Acceptable; significant work needed.** Provisional score.
Ten findings: **0 P0, 2 P1, 8 P2, 0 P3**. Related symptoms are grouped by cause.

| Dimension                | Score | Key finding                                          |
| ------------------------ | ----- | ---------------------------------------------------- |
| Accessibility            | 2/4   | Contrast and incomplete filter keyboard behavior     |
| Performance              | 3/4   | Static architecture; no fresh production measurement |
| Responsive design        | 2/4   | English footer overflow and compact touch controls   |
| Theming                  | 2/4   | Fixed dark 404 mixed with theme-dependent controls   |
| Implementation integrity | 2/4   | Font mapping, TOC initialization, permissive tests   |
| Total                    | 11/20 | Acceptable                                           |

Prioritize contrast, footer reflow, and filter keyboard behavior. Preserve the
existing product identity and static content workflow.

## Scope and evidence limits

- Reviewed current layouts, components, style modules, route composition, Astro
  configuration, and accessibility tests. No production source was changed.
- Ran `impeccable.cmd detect --json apps/web/src` once.
- `pnpm dev --host 127.0.0.1` failed with `Dev server failed to start within 30s`.
- Bundled Playwright Chromium was missing. Installed Microsoft Edge successfully
  ran headless Playwright checks using an explicit browser context.
- Served existing `apps/web/dist` with `SKIP_WEB_BUILD=true`. Sampled HTML was
  dated September 7, after the inspected layout and token files. Findings were
  cross-checked against current source; this is not fresh-build validation or
  proof that the entire dist matches the checkout.
- Supplementary runtime sample: Vietnamese home at 1280px/dark and 375px/light,
  Vietnamese blog and 404 at 375px/light, English home at 320px/dark. Axe reported
  no violations on the sampled home/blog states. The 404 returned six contrast
  failures and duplicate/nested main-landmark findings. Zero axe findings does
  not establish full accessibility.
- Current OKLCH tokens were measured independently in Edge through sRGB canvas
  output and relative luminance calculations; 8-bit rounded results are approximate.
- No Core Web Vitals, production transfer budget, full text-zoom assessment,
  screen-reader session, or Firefox/WebKit verification was performed.

## Detailed findings

### 1. [P1] Normal text uses insufficient contrast

**Location:** `apps/web/src/styles/tokens.css:17`,
`apps/web/src/styles/components.css:95`,
`apps/web/src/components/LanguageSwitcher.astro:42`,
`apps/web/src/components/NotFoundPage.astro:130`.
**Category:** Accessibility.

Primary `rgb(242,78,43)` on the light background `rgb(246,245,241)` measures
**3.26:1**; primary on the light card is **2.91:1**. White on primary measures
**3.56:1** in either theme. Normal-size primary text appears in language links,
labels, and article links; white-on-primary appears in selected taxonomy controls
and button hover styles. Static 404 axe results include **3.87:1** terminal labels
and **4.14:1** terminal metadata, among six failing nodes.

**Impact/standard:** Small text becomes harder to read; these normal-text pairings
fall below WCAG 1.4.3's 4.5:1 AA threshold. Assess large text and decoration separately.
**Recommendation:** Establish accessible text/action foreground pairs per theme;
correct 404 secondary text as well. **Command:** `$impeccable harden`.

### 2. [P1] Footer fails narrow-screen reflow

**Location:** `apps/web/src/layouts/BaseLayout.astro:371`.
**Category:** Responsive design.

The footer is a non-wrapping flex row with `gap-6`. At `/en/`, 320px wide,
document scroll width was **395px** and LinkedIn's right edge was **394.91px**.
The body also hides horizontal overflow.

**Impact/standard:** A contact destination extends beyond the viewport, requiring
clipping or horizontal scrolling; ordinary navigation should reflow under WCAG 1.4.10.
**Recommendation:** Wrap the footer links or use a narrow-screen grid; verify both
locales and enlarged text. **Command:** `$impeccable adapt`.

### 3. [P2] Filter combobox keyboard behavior is incomplete

**Location:** `apps/web/src/components/ui/FilterSelect.astro:142`.
**Category:** Accessibility.

ArrowDown opens the menu but does not focus an option or update an active
descendant. Further ArrowDown does nothing; Escape has no handler. Runtime
reproduced focus remaining on the trigger and `aria-expanded=true` after Escape.
Selection also hides the focused option without explicitly restoring trigger focus.

**Impact:** Keyboard users must discover a Tab workaround and lose expected
combobox navigation/dismissal behavior. This is not a claim that selection is
entirely blocked. **Recommendation:** Use a native select or implement complete
arrow navigation, option focus, selection, Escape, and focus restoration.
**Command:** `$impeccable harden`.

### 4. [P2] 404 mixes a fixed dark surface with global theme controls

**Location:** `apps/web/src/components/NotFoundPage.astro:43` and `:111`.
**Category:** Theming.

The surface fixes its background to `#050608` and uses zinc/cyan/red utilities,
while recovery buttons and quick links consume global theme tokens. Light mode
changes those controls and the shell but leaves the surface dark.

**Impact:** Theme switching produces inconsistent recovery-control pairings;
global token improvements cannot reliably correct the surface.
**Recommendation:** Use semantic tokens throughout or define a complete scoped
dark theme encompassing every control. **Command:** `$impeccable harden`.

### 5. [P2] 404 nests a second main landmark

**Location:** `apps/web/src/components/NotFoundPage.astro:43` and
`apps/web/src/layouts/BaseLayout.astro:360`.
**Category:** Accessibility.

Localized 404 routes insert NotFoundPage into BaseLayout's existing main.
Runtime found two main elements; axe reported `landmark-main-is-top-level`,
`landmark-no-duplicate-main`, and `landmark-unique`.

**Impact:** Assistive-technology landmark navigation exposes duplicate main regions.
**Recommendation:** Change the inner wrapper to a div or appropriate section,
retaining the layout's main and skip-link destination.
**Command:** `$impeccable harden`.

### 6. [P2] Storage errors interrupt theme-control synchronization

**Location:** `apps/web/src/layouts/BaseLayout.astro:166`.
**Category:** Theming / Accessibility.

Initial storage reading is guarded, but `setTheme` writes localStorage before
updating button state, title, and icons, without catching failures. Injecting a
throwing `Storage.prototype.setItem` reproduced uncaught initialization/click errors.

**Impact:** The root theme can change while control state and icons remain stale.
**Recommendation:** Synchronize UI independently of persistence and guard storage
operations. **Command:** `$impeccable harden`.

### 7. [P2] TOC enhancement lacks ordinary-load initialization

**Location:** `apps/web/src/components/Blog/TableOfContents.astro:54`.
**Category:** Implementation integrity.

The initializer only subscribes to `astro:page-load`. BaseLayout does not render
ClientRouter, and repository search found no ClientRouter or manual dispatcher.
Other interactive components also call their initializers directly.

**Impact:** Native anchors still work, but the active-section indicator and
IntersectionObserver enhancement are not initialized on ordinary page loads.
**Recommendation:** Run an idempotent initializer on ordinary load; retain the
Astro event if client navigation is supported. Resolve target headings by ID,
not array position. **Command:** `$impeccable harden`.

### 8. [P2] Brand font does not resolve to the documented family

**Location:** `apps/web/src/styles/tokens.css:65`,
`apps/web/src/styles/app.css:25`, `apps/web/src/layouts/BaseLayout.astro:224`.
**Category:** Implementation integrity.

The brand uses `font-display`; the raw token names `Syne`, while bundled
font-face declarations register `Syne Variable`. The Tailwind theme exposes
`--font-syne`, not the display mapping. Runtime computed `.font-display` as the
inherited Space Grotesk stack; loaded fonts did not include Syne.

**Impact:** The brand renders differently from its documented contract, while
the Syne stylesheet is still imported. **Recommendation:** Connect the actual
utility to `Syne Variable` through existing typography modules and verify its
resolved family. **Command:** `$impeccable typeset`.

### 9. [P2] Mobile controls fall below the audit's touch-target goal

**Location:** `apps/web/src/layouts/BaseLayout.astro:300`,
`apps/web/src/components/ui/FilterSelect.astro:33`,
`apps/web/src/components/LanguageSwitcher.astro:41`.
**Category:** Responsive design.

At 375px, the menu toggle measured **36×36px**, filter triggers **343×32px**, and
language links approximately **34×24px**.

**Impact:** Small controls are harder to operate accurately on touchscreens.
**Recommendation:** Expand hit areas toward 44px without unnecessarily enlarging
type. **Standard:** 44px is the audit's enhanced target, not WCAG 2.2 AA's 24px
minimum; these measurements alone do not establish an AA violation.
**Command:** `$impeccable adapt`.

### 10. [P2] A11y tests silently exclude serious violations

**Location:** `e2e/pages/accessibility.spec.ts:15` and `:38`.
**Category:** Implementation integrity.

Both axe assertions discard everything except `impact === 'critical'`, including
serious contrast findings. The focus-indicator test checks element visibility,
not visible focus styling. The 404 is absent from axe route coverage.

**Impact:** CI can remain green with accessibility defects.
**Recommendation:** Assert all applicable A/AA violations with narrowly justified
exceptions, cover both themes and the 404, and verify actual focus styling.
**Command:** `$impeccable harden`.

## Patterns and uncounted observations

- Exceptional surfaces mix fixed colors with tokens; foreground/background
  combinations need validation together.
- Custom controls declare semantics more fully than their keyboard behavior.
- Tests emphasize default desktop states and a restricted severity subset.
- `base.css:107` reduces all animations/transitions to 0.001ms. The 404 separately
  disables its custom effects. Prefer intentional reduced-motion alternatives;
  no lost essential feedback was demonstrated, so this is not a counted defect.
- SpotlightCard reads geometry and updates a gradient on every mousemove.
  Profile before changing it: no frame-rate or layout-thrashing regression was
  measured, so it is not a counted performance defect.

## Positive findings

- Static Astro output, build compression, and no observed hydrated React islands
  in inspected page paths provide a useful performance foundation.
- CoverImage uses Astro assets, explicit dimensions, responsive sizing, and hero
  loading priority.
- The shared layout includes a skip link, focusable main destination, localized
  language navigation, and descriptive theme labels.
- Shared tokens, translation files, and localized routes centralize most decisions.
- Sampled Vietnamese home/blog pages at 375px showed no footer overflow.
- Existing axe and keyboard tests provide a foundation to strengthen.

## Recommended actions

1. **[P1/P2] `$impeccable harden`**: contrast, keyboard controls, 404 semantics and
   theming, storage handling, TOC initialization, and accessibility coverage.
2. **[P1/P2] `$impeccable adapt`**: 320px footer reflow and larger touch targets.
3. **[P2] `$impeccable typeset`**: brand utility and font-family mapping.
4. **`$impeccable audit`**: reassess a fresh build across themes/locales/routes.
5. **`$impeccable polish`**: final bounded consistency pass after functional fixes.

You can ask me to run these one at a time, all at once, or in any order you prefer.
Re-run `$impeccable audit` after fixes to reassess the score.
