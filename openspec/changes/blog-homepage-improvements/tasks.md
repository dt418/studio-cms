## 1. Real stats counter
- [ ] Replace fake homepage metric values with computed values from Vietnamese blog collection.
- [ ] Compute post/topic/tag counts with locale-aware filtering.
- [ ] Render values through existing stats UI component without layout regression.

## 2. Vietnamese SEO metadata
- [ ] Update `/vi` description, OG description, Twitter description to Vietnamese.
- [ ] Verify metadata output in rendered HTML.

## 3. Vietnamese title consistency
- [ ] Audit `locale=vi` posts for non-Vietnamese titles.
- [ ] Update titles to Vietnamese while preserving slugs/routes.

## 4. Distinct card descriptions
- [ ] Replace duplicated Topic/Tag/Archive card descriptions with unique copy.

## 5. Replace marquee with tag cloud
- [ ] Remove marquee block from homepage.
- [ ] Add tag cloud component based on real Vietnamese tags.
- [ ] Sort tags by descending frequency.
- [ ] Link each tag to `/vi/blog?tag={tag}`.

## 6. Add `/vi/blog` client-side search
- [ ] Add search input and client filtering by `title + description`.
- [ ] Preserve default unfiltered list when query empty.

## 7. Footer CTA
- [ ] Add `Liên hệ hợp tác →` footer CTA with correct `mailto:` target.

## 8. About page and nav
- [ ] Create `/vi/about` page with existing layout patterns.
- [ ] Add `Về tôi` nav link to header routing to `/vi/about`.

## 9. Verification
- [ ] Verify acceptance criteria on local run.
- [ ] Run `pnpm build` and confirm no regression on `/en/` surfaces.
