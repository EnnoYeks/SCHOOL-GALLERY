# Clean URL Structure

## Migrated pages (folder/index.html with root-relative paths)

```
more/index.html
about/index.html
profile/index.html
settings/index.html
gallery/index.html
photos/index.html
videos/index.html
login/index.html
contact/index.html
buzz/index.html
chat/index.html
polls/index.html
memories/index.html
notifications/index.html
saved/index.html
search/index.html
admin/index.html
```

## Still under index/ (can be migrated the same way)

- edit-profile.html
- spotlight.html
- trending.html
- clips.html / shorts.html (redirects)
- contat.html (typo)

## Notes
- Existing vercel.json rewrites continue to work as fallback.
- All new pages use `/css/` and `/js/` paths.
- After deploy, test the clean URLs directly.
