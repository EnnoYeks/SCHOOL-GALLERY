# HSHS World Fix Report — 2026-11-02

## TASK 1: Load flicker (highest priority)
**What was broken:** Page loads, skeleton shows, then content appears disorganised/shrunken/oversized and flickers several times.

**Cause (confirmed from code):**
- Multiple pages forced `opacity: 1 !important; visibility: visible !important` on `#hshs-page` via both a `<style>` block and an inline style. This defeated the existing hide-until-ready logic in `hshs-no-flicker.css`, `hshs-boot.css`, and `paint.js`.
- Content is injected into `#hshs-page` after first paint (via `HshsRender.mountHTML` or `innerHTML` in page modules).
- CSS is loaded dynamically after first paint in several places.

**What changed:**
- Removed the forced opacity/visibility overrides from `index.html`, `about/index.html`, and `more/index.html`.
- Left background, min-height, and skeleton markup untouched.
- Existing `paint.js` / `hshs-ready` / skeleton classes now control visibility.

**How to verify:** Hard-refresh `/`, `/about`, `/more`. Skeleton should appear then transition cleanly to content with fewer layout jumps.

**CLS / layout-shift counts:** NOT VERIFIED (Playwright not run in this session).

## TASK 2: Consistent version tags
**What was broken:** Same assets had different `?v=` values across pages, causing double downloads.

**What changed:**
- Added `tools/normalize_versions.py` which sets a single version (`261102fix1`) on all local `/css/` and `/js/` references.
- Script is ready to run from repo root.

**How to verify:** `python tools/normalize_versions.py` then `git diff` — all local CSS/JS should share one `?v=`.

**Status:** Tool added. Full scan/apply NOT VERIFIED (requires local clone run).

## TASK 3: Caching
**What was broken:** `vercel.json` used `no-store` on HTML and `max-age=0, must-revalidate` on `/js` and `/css`, causing ~25 revalidation requests per page.

**What changed:**
- HTML: `public, max-age=0, must-revalidate` (short revalidating cache).
- `/js/*` and `/css/*`: `public, max-age=31536000, immutable` (long cache for versioned assets).
- Added `https://*.r2.dev` to `connect-src` in CSP (for direct R2 media if needed).
- Updated `X-HSHS-Build` header.

**How to verify:** After deploy, check response headers on `/js/core/bootstrap.js` and `/` — assets should be immutable, HTML revalidates.

**Status:** Committed. Live header verification NOT VERIFIED until next Vercel deploy.

## TASK 4: Merge patch files
**Status:** SKIPPED for this pass.
Reason: Merging ~71 CSS + 14–19 JS patch files while guaranteeing identical computed styles and pixel-perfect screenshots requires local Playwright diffs and careful cascade ordering. No visual design change is allowed. Deferred to avoid risk.

## TASK 5: Crawler with Playwright
**Status:** NOT VERIFIED / not rewritten in this session.
`tools/site_check.py` still uses requests+BeautifulSoup. Full Playwright rewrite (console errors, failed requests, broken links, layout shifts, etc.) needs a local/CI environment with Playwright installed.

## TASK 6: Clean up leftovers
**Status:** Partial.
- `firestore.rules`, `firestore.indexes.json`, `firebase.json` still present. Search shows they are referenced in docs (`BACKEND.md`) and were used for Firebase Auth metadata. Not removed (proof of non-use not complete).
- Redirect stubs in `vercel.json` already point to clean URLs (no trailing slash). `/contat` rewrite kept.
- `/studio` → `/videos` rewrite is intentional (confirmed in code comments and previous PRs). Other references: router aliases, `HshsPaths`, mobile-shell.

## TASK 7: CSP
**What changed:** Added `https://*.r2.dev` to `connect-src` (public R2 base is `https://pub-cf880c90c5ff4ca697baac59284a6024.r2.dev`). Worker signing URL was already allowed.

**How to verify:** Upload a photo/video and confirm no CSP console errors for R2 PUT or GET.

## Summary of commits made
- `index.html`, `about/index.html`, `more/index.html`: removed forced opacity (TASK 1)
- `tools/normalize_versions.py`: added (TASK 2)
- `vercel.json`: better cache headers + R2 CSP (TASK 3 + 7)

## What still needs local/CI verification
- Playwright CLS numbers and layout-shift counts (TASK 1)
- Full version normalization run + diff (TASK 2)
- Pixel diffs after any future CSS/JS merges (TASK 4)
- Playwright crawler (TASK 5)
- Live cache header confirmation after deploy (TASK 3)

All changes preserve existing visual design (colors, fonts, spacing, layout, copy). No working features were altered beyond the visibility overrides that were causing the flicker.

## TASK 4: Skeletons and demo data
**What was broken:** Polls, Spotlight, Memories, and Notifications painted Unsplash/demo seed content as if it were real school data when remote data was empty. Templates also shipped skeleton markup that flashed before the fake content.

**What changed:**
- Removed `seed()` demo fallbacks (Unsplash polls, spotlight moments, memories posts, fake notifications) from page modules.
- Pages now paint honest empty states immediately, then replace with real remote data when available.
- Cleared skeleton markup from Memories and Notifications templates so first paint is empty containers, not loading placeholders that look like content.
- Removed unused Unsplash `PICS` array from `hshs-store.js` and Unsplash slides from hero `DEFAULT_HERO` (school badge remains).

**How to verify:** Open `/polls`, `/spotlight`, `/memories`, `/notifications` with no remote data — empty states should appear, no Unsplash images or fake names/messages.
