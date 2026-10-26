# Clean URL Structure

Pages are being moved to the professional folder layout:

```
more/index.html     →  /more/
about/index.html    →  /about/
...
```

## Benefits
- Clean permanent URLs with no .html
- Root-relative asset paths (`/css/...`, `/js/...`) that never break
- Works naturally on Vercel without relying only on rewrites

## Current status
- `more/index.html` is live (paths updated to root-relative)
- Existing `vercel.json` rewrites still work as fallback
- Other pages under `index/*.html` can be migrated the same way

## How to migrate a page
1. Create `pagename/index.html`
2. Change all `../css/` and `../js/` to `/css/` and `/js/`
3. Update internal links to use `/pagename/`
4. Optional: remove the old `index/pagename.html` once confirmed working
