# Clean URL Structure

Main pages now have folder-based clean URLs:

```
more/index.html       →  /more/
about/index.html      →  /about/
profile/index.html    →  /profile/
settings/index.html   →  /settings/
gallery/index.html    →  /gallery/
photos/index.html     →  /photos/
videos/index.html     →  /videos/
login/index.html      →  /login/
contact/index.html    →  /contact/
```

## Status
- All of the above use root-relative paths (`/css/...`, `/js/...`)
- Existing `vercel.json` rewrites still work as fallback for the old `/index/*.html` files
- Remaining pages under `index/` (buzz, chat, polls, memories, notifications, saved, search, admin, edit-profile, spotlight, trending, etc.) can be migrated the same way when ready

## How to finish the rest
Copy any `index/pagename.html` to `pagename/index.html` and replace every `../css/` and `../js/` with `/css/` and `/js/`.
