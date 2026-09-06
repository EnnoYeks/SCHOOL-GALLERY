# Classic school design pass

Visual design and consistency only. No new features. Existing likes, comments, uploads, admin actions, and routing behaviour are unchanged.

## Shared system

- New `css/hshs-classic.css` is the design source of truth (crest palette, serif headings, sans body, spacing, cards, buttons, nav, footer).
- `css/foundation.css` now imports that sheet last so pages on the foundation path pick it up.
- Pages that still load CSS one-by-one now also load `hshs-classic.css` (and bootstrap injects it as a safety net).
- Tokens in `css/style.css` and `css/hshs-theme.css` moved off indigo/pink neon to navy, gold, cream, and crimson.
- Animated rainbow background and floating shapes are quieted. Dark/light tokens still exist.

## Duplicate files

- `contact.html` is the public name.
- `contat.html` is the old typo. It still works so existing bookmarks and mobile-shell aliases do not break.
- Root `contact.html` redirects to `/index/contact.html`.
- `404.html` no longer lists the staff desk and uses the same campus theme.

## Per page

| Page | Change |
| --- | --- |
| index.html | Crest-style hero: school name, motto, restrained layout |
| about.html | Official school page (history, mission, motto, location) |
| gallery / photos / videos / clips / shorts / spotlight | Shared card radius, cream surfaces, 4:3 media ratio, skeleton tokens |
| buzz / trending / notifications / saved / polls / chat / profile / settings / more | Shared nav, cards, inputs, type scale |
| admin.html | Same tokens; still not in public 404 list |
| contact / contat | Same classic form/info cards |
| 404.html | Campus-themed error panel with way home |
| memories.html | Shared type and card rules |

## Notes

- Crest colours used from the existing campus theme (navy `#0b1f4d`, gold `#c9a227`, blue `#1d4ed8`, crimson `#8b1e1e`) because no separate crest file lives in the repo.
- If the printed crest uses different exact inks, swap the four tokens at the top of `css/hshs-classic.css`.
