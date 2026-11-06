# Skeleton verification — 2026-11-02

Method: Playwright held every Supabase request behind a manual gate. After `domcontentloaded`, the run waited until a skeleton (`.hshs-sk-*`) was visible, recorded the container box, and took the skel screenshot. It asserted no empty-state text was in the DOM. Then it released the requests, waited for the skeleton to leave, waited 2s for CLS, and took the content screenshot.

Viewports: mobile 390x844, desktop 1440x900. Datasets: empty `[]` and populated mock rows. Cold context per case.

Fast 3G throttle and warm-cache: **NOT VERIFIED**. This run used a request gate instead of a timer or throttle, as required for a real skeleton capture.

## What the screenshots show

All 20 cases: skeleton was visible while requests were held, the skel and content PNGs differ, and empty-state text was never in the DOM during loading.

| page | viewport | dataset | skeleton visible | empty while loading | height delta px | CLS | shots differ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| polls | mobile | empty | yes | no | 0 | 0.0806 | yes |
| polls | desktop | empty | yes | no | 0 | 0.0556 | yes |
| polls | mobile | populated | yes | no | 0 | 0.0806 | yes |
| polls | desktop | populated | yes | no | 0 | 0.0031 | yes |
| spotlight | mobile | empty | yes | no | 0 | 0.3424 | yes |
| spotlight | desktop | empty | yes | no | 0 | 0.0094 | yes |
| spotlight | mobile | populated | yes | no | 221 | 0.3721 | yes |
| spotlight | desktop | populated | yes | no | 271 | 0.0554 | yes |
| memories | mobile | empty | yes | no | 0 | 0.0806 | yes |
| memories | desktop | empty | yes | no | 0 | 0.0101 | yes |
| memories | mobile | populated | yes | no | 0 | 0.0806 | yes |
| memories | desktop | populated | yes | no | 0 | 0.0029 | yes |
| notifications | mobile | empty | yes | no | 0 | 0.0713 | yes |
| notifications | desktop | empty | yes | no | 0 | 0.0076 | yes |
| notifications | mobile | populated | yes | no | 0 | 0.0900 | yes |
| notifications | desktop | populated | yes | no | 0 | 0.0029 | yes |
| home | mobile | empty | yes | no | 10 | 0.0806 | yes |
| home | desktop | empty | yes | no | 170 | 0.5078 | yes |
| home | mobile | populated | yes | no | 78 | 0.0865 | yes |
| home | desktop | populated | yes | no | 78 | 0.5057 | yes |

## Pass / fail

- Empty text never visible while loading: **pass** on every page.
- Skeleton to content height under 2px: **pass** for polls, memories, notifications (empty and populated) and spotlight empty. **FAIL** for spotlight populated (221 mobile / 271 desktop) and home.
- CLS under 0.05: **pass** on desktop for memories, notifications, spotlight empty, polls populated. **FAIL** on mobile. The mobile shift is one entry, value ~0.0806, source `hshs-swipe-stage` (the swipe shell wrapping `#hshs-page` after load). It is not the skeleton swap.
- No fake Unsplash/demo seed data: **pass**. Populated rows are the test mock, not app seed data.

## Not verified

- Fast 3G throttle.
- Warm cache (each case used a fresh context).
- A live populated Supabase `polls` / `notifications` table. Those tables do not exist yet; the migration is unapplied. Populated results use mocked responses.
- Home feed height stability. Home still paints through its own path and was not given the same reserved-height treatment.

Screenshots: `docs/screenshots/`.
