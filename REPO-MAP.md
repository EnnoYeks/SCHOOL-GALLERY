# REPO-MAP — EnnoYeks/SCHOOL-GALLERY

This map records the repo state before any feature work begins. I have not changed application behavior yet; this is a repo-level audit only.

## 1) High-level repo structure

- `/` — root site entry points and app metadata
  - `index.html` — homepage, root route `/`
  - `404.html` — fallback page for unknown routes
  - `vercel.json` — Vercel config, redirects, rewrites, cleanUrls
  - `README.md` — project overview
  - `STRUCTURE.md` — clean URL notes
  - `BACKEND.md` — backend notes
  - `.gitignore` — ignore rules
  - `firebase.json`, `firestore.indexes.json`, `firestore.rules` — Firebase config files; note: auth is Firebase, but the app is not using Firestore for media metadata or storage
- `/about/` — About page
- `/admin/` — admin dashboard
- `/buzz/` — social feed / vibe buzzer page
- `/chat/` — live chat/messages page
- `/contact/` — contact page
- `/edit-profile/` — profile editor
- `/gallery/` — main gallery feed
- `/index/` — legacy generated page variants and HTML fallbacks for migrated routes
- `/js/` — front-end logic, config, templates, renderers, app shell
- `/css/` — site-wide stylesheets; large patch-style cascade with many overrides
- `/assets/` or similar generated content — not listed in the tree at the moment, but current page bundle relies heavily on CSS/JS assets and dynamic media URLs

## 2) Full folder tree with one-line purpose

The repo tree shows the following important folders and files:

- `/about/` — About page entry point
  - `/about/index.html` — about page template
- `/admin/` — admin dashboard
  - `/admin/index.html` — admin page shell
- `/buzz/` — social/discussion + “buzz” feed
  - `/buzz/index.html` — buzz page shell
- `/chat/` — direct messaging / live chat area
  - `/chat/index.html` — chat page shell
- `/contact/` — contact page
  - `/contact/index.html` — contact page shell
- `/css/` — stylesheets, theme patches, and dashboard-specific styling
  - `admin.css` — admin styles
  - `animations.css` — general animations
  - `foundation.css` — base resets / framework styles
  - `gallery.css` — gallery layout
  - `home.css` — homepage styling
  - `hshs-*.css` — many theme, polish, glass, chat, patch, and page-specific CSS files
  - `memories.css`, `photos.css`, `videos.css`, `polls.css`, `trending.css`, etc. — content-specific pages
  - `style.css`, `theme.css`, `responsive.css`, `vibe.css` — core app styles
  - `hshs-chat-fixes.css`, `hshs-chat-finish.css`, `hshs-chat-spring.css`, `hshs-chat-packs.css` — patch files that strongly suggest CSS layering and override fixes
  - `hshs-no-flicker.css`, `hshs-perf.css`, `hshs-skeleton.css` — preloader/loading / performance controls
- `/edit-profile/` — profile editor route
  - `/edit-profile/index.html` — edit-profile page shell
- `/gallery/` — gallery entry point
  - `/gallery/index.html` — gallery page shell
- `/index/` — legacy HTML route versions used during or after migration
  - `/index/about.html`, `/index/gallery.html`, `/index/photos.html`, `/index/videos.html`, etc. — old route equivalents
  - `/index/contat.html` — typo variant; rewrite exists to `/contact`
- `/js/` — client-side logic and app boot sequence
  - `/js/config.js` — Firebase app init, Supabase client init, R2 config, app config
  - `/js/db.js` — Supabase access layer; CRUD and query helpers
  - `/js/storage.js` — Cloudflare R2 upload/list logic
  - `/js/hshs-auth.js` — login, signup, reset, Google auth UI
  - `/js/admin-api.js` — admin actions and API calls
  - `/js/core/*.js` — app startup, templates, registry, rendering, bootstrap
  - `/js/components/*.js` — reusable UI components
  - `/js/pages/*.js` — per-page page initialization
- `/js/core/templates/` — page template renderers for about, admin, buzz, gallery, memories, more, notifications, search, settings, etc.
- `vercel.json` — route mapping (clean URLs, redirects, rewrites)

## 3) Every page and its real URL under cleanUrls

The site uses clean URLs and Vercel rewrites/redirects.

Primary clean routes:

- `/` — homepage
- `/about/` — About
- `/admin/` — Admin
- `/buzz/` — Buzz / social feed
- `/chat/` — Messages
- `/contact/` — Contact
- `/edit-profile/` — Edit profile
- `/gallery/` — Gallery
- `/login/` — Login
- `/memories/` — Memories
- `/more/` — More / account / settings / expanded hub entry
- `/notifications/` — Notifications
- `/photos/` — Photos
- `/polls/` — Polls
- `/profile/` — Profile
- `/saved/` — Saved posts
- `/search/` — Search
- `/settings/` — Settings
- `/spotlight/` — Spotlight
- `/trending/` — Trending
- `/videos/` — Videos

Legacy redirects and aliases currently in `vercel.json`:

- `/index/more.html` -> `/more`
- `/index/about.html` -> `/about`
- `/index/profile.html` -> `/profile`
- `/index/settings.html` -> `/settings`
- `/index/gallery.html` -> `/gallery`
- `/index/photos.html` -> `/photos`
- `/index/videos.html` -> `/videos`
- `/index/buzz.html` -> `/buzz`
- `/index/chat.html` -> `/chat`
- `/index/polls.html` -> `/polls`
- `/index/memories.html` -> `/memories`
- `/index/notifications.html` -> `/notifications`
- `/index/saved.html` -> `/saved`
- `/index/search.html` -> `/search`
- `/index/admin.html` -> `/admin`
- `/index/login.html` -> `/login`
- `/index/contact.html` -> `/contact`
- `/index/edit-profile.html` -> `/edit-profile`
- `/index/spotlight.html` -> `/spotlight`
- `/index/trending.html` -> `/trending`

Rewrites:

- `/vibe`, `/vibe.html` -> `/buzz`
- `/clips`, `/clips.html` -> `/buzz`
- `/shorts`, `/shorts.html` -> `/buzz`
- `/studio`, `/studio.html` -> `/videos`
- `/contat`, `/contat.html` -> `/contact`

This is a good clean-URL migration pattern, but it also means there are obvious stale legacy paths still present in the repo and old links can easily regress if JS generates `.html` URLs.

## 4) Script and stylesheet load patterns per page

The pages all follow a common base pattern, with a few variations by route.

Base CSS pattern on many pages:

- `/css/hshs-fonts.css`
- `/css/foundation.css`
- `/css/hshs-glass.css`
- `/css/hshs-skeleton.css`
- page-specific CSS, such as:
  - `/css/home.css`, `/css/gallery.css`, `/css/admin.css`, `/css/videos.css`, `/css/photos.css`, `/css/polls.css`, `/css/memories.css`, `/css/hshs-more.css`, `/css/hshs-about.css`, `/css/hshs-chat.css`
- patch files like:
  - `/css/hshs-chat-fixes.css`
  - `/css/hshs-chat-finish.css`
  - `/css/hshs-chat-spring.css`
  - `/css/hshs-chat-packs.css`
  - `/css/hshs-home-polish.css`
  - `/css/hshs-campus.css`

Base JS pattern on many pages:

- `/js/config.js` (ES module)
- `/js/db.js` (ES module)
- `/js/utils.js`
- `/js/theme.js`
- `/js/navigation.js`
- `/js/mobile-navigation.js`
- `/js/search.js`
- `/js/core/navigation-perf.js`
- `/js/mobile-shell.js`
- `/js/core/bootstrap.js`
- page-specific JS such as:
  - `/js/pages/home.js`
  - `/js/pages/gallery.js`
  - `/js/pages/admin.js`
  - `/js/pages/more.js`
  - `/js/pages/about.js`
  - `/js/pages/chat.js`

Examples from actual pages:

- Homepage (`/index.html`): loads ~8-10 CSS files and ~8-12 scripts before page logic; includes `home.css`, `hshs-home-polish.css`, `hshs-vibe-home.css`, `hshs-campus.css`, `hshs-skeleton.css`, plus page JS and header JS.
- Gallery (`/gallery/index.html`): loads `gallery.css` + `hshs-wave.css` + shared base CSS + page JS.
- Admin (`/admin/index.html`): loads `admin.css` + shared CSS + `admin.js` + `admin-api.js`.
- Chat (`/chat/index.html`): loads `hshs-chat-ui.css`, `hshs-chat-desktop.css`, `hshs-chat.css` plus live chat modules and page JS.
- More (`/more/index.html`): loads a very heavy CSS stack with inline skeleton-preventing styles and page-specific `hshs-more.css` + `hshs-hub.css`.

This aligns with your estimate: the repo contains a very large CSS footprint, and many pages are using 7–12 stylesheet entries and 14–19 scripts depending on route. The actual bundle is highly page-specific and patch-heavy.

## 5) How auth, Supabase queries, and R2 uploads currently work

### Auth

Auth currently uses Firebase Authentication and is initialized in `/js/config.js`.

Relevant code:

- `initializeApp(firebaseConfig)`
- `getAuth(app)`
- `onAuthStateChanged(auth, applyAuthUser)`
- `setPersistence(auth, browserLocalPersistence)`

Important details:

- Firebase config values are hardcoded in `/js/config.js`.
- `window.hshsAuthState` and `window.hshsAuthUser` are set when auth changes.
- `hshs-auth.js` handles login, signup, password reset, and Google sign in.
- `hshs-auth.js` has user lookup and username validation logic.

This means the app stays on Firebase Auth as required, with user and session state living in the client app rather than in Python code.

### Supabase queries

Supabase is initialized in `/js/config.js`:

- `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`

Then `/js/db.js` wraps all database work.

Important functions:

- `queryTable(table, limitValue = 10, offset = 0, extra = {})`
- `getPosts()`, `getPhotos()`, `getVideos()`
- `getFeatured()`
- `getUpcomingEvents()`
- `createPost()`, `createPhoto()`, `createVideo()`
- `getAnalytics()`

Behavior:

- Uses `.from(table).select('*')` and `.order('created_at', { ascending: false })`
- Filters `posts` with `.eq('status', 'published')`
- Normalizes item data into a shared shape (`normalizeItem`) for feed rendering
- Uses `author_id` / `author` / `media_key` / `media_provider` with field normalization
- Adds stub methods for compatibility, so older code does not break when chat or other features are not fully wired yet

This is a clean pattern for public read access to feed data with Firebase handling auth separately.

### Cloudflare R2 uploads

R2 upload behavior is in `/js/storage.js`.

Key functions:

- `publicBase()`
- `publicUrl(key)`
- `mediaUrl(item)`
- `objectKey(kind, file)`
- `list(options)`
- `upload(file, options)`
- `uploadFromUrl(src, options)`
- `uploadAdmin(file)`

Behavior:

- Uses `CONFIG.r2.publicBaseUrl` and a signed-worker endpoint (`CONFIG.r2.signUrl`)
- Pre-signed PUT uploads are attempted first via `POST /sign`
- If the presigned path fails, it falls back to local data URLs or blob URLs (client-side fallback only)
- Public object URLs are built from the `r2.dev` base + object key
- File names are structured by kind: `photos/YYYY/MM/DD/<uid>-<timestamp>.<ext>` and `videos/...`
- `uploadAdmin()` calls the worker with Authorization bearer token to upload under admin context

This is consistent with the project rule: R2 is the main media store, and Firestore is not used for the media layer.

## 6) SUSPICIOUS / broken / risky findings

These are the most important issues I noticed from the static repo audit before Phase 1:

1. CSS bloat and cascade risk
   - The repo has a very large number of CSS files, including many patch files such as `hshs-chat-fixes.css`, `hshs-chat-finish.css`, `hshs-chat-spring.css`, and `hshs-home-polish.css`.
   - This is exactly the kind of setup that can create override conflicts, duplicate selectors, or “works on page X but not page Y” regressions.
   - A safe CSS audit is needed before any deep maintenance.

2. Legacy URL remnants after cleanUrl migration
   - The repo contains many nested `/index/*.html` files and the old `.html` routes are still present in `vercel.json` redirects.
   - That is a common place for stale internal links, bad hrefs, and broken navigation after a migration.
   - It is the main risk area for the clean-url conversion.

3. Hardcoded secrets and config in the frontend
   - `js/config.js` includes Firebase config + a Supabase publishable key in the client code.
   - This is normal for a public frontend, but it is exactly the kind of thing that should be moved behind env configuration in a Python/admin ecosystem, and it should be carefully separated from the server-side Python tools.

4. Skeleton / reveal logic can cause flicker or flash
   - Several pages use inline skeleton code that waits for CSS load before removing the skeleton (`hshs-load-skel`, `__hshsRevealPage`, etc.).
   - This is probably a deliberate anti-flicker mechanism, but it is also a likely source of load flash, paint timing issues, and timing bugs if CSS or scripts are delayed.
   - The project already contains `hshs-no-flicker.css`, which suggests there was a known flicker problem.

5. Risk of duplicate IDs and broken links in generated page content
   - The repo is large and split into many page-specific scripts and templates.
   - The code pattern strongly suggests dynamic rendering, and there is a realistic chance of duplicate IDs or missing handlers if templates are not carefully generated.
   - This is why the first productivity tool should be a crawler and health checker.

6. The site uses patch files and versioned cache strings (`?v=261002fast1`, `?v=261025admin3`, etc.)
   - That is a practical way to bust cache, but it also means scripts and styles are heavily layered across versions.
   - The repo is likely not a single coherent stylesheet, but a stack of override files.

7. Missing env-driven Python tool setup
   - The repo has no `.env.example` yet and no Python project scaffold for the requested tooling.
   - This is expected at this stage, but it must be addressed before the Python toolset is added.

## 7) Most likely root causes of current fragility

The three main sources of fragility are:

1. CSS is fragmented into too many patch files and big per-page stylesheets.
2. URL migration was done with redirects/rewrites, but old HTML route variants remain in the repo.
3. The app relies on a dynamic client-side boot sequence with skeleton screens and JS initialization timing; this can hide timing bugs on slower networks.

## 8) Short summary of findings before building anything

- The repo is a static, front-end-heavy school social/gallery site with Firebase auth, Supabase for metadata queries, and Cloudflare R2 for media.
- The clean-URL migration is largely in place (`vercel.json` + folder routes), but there are legacy route files still present and old links can easily break.
- The CSS architecture is very heavy and patch-driven, which is likely to cause override issues and visual drift.
- Auth and media storage flows are clear and intentionally separated; the app is already following your architecture rules.
- The next step should be a crawl-based health check before writing any Python tooling, because the biggest risks are stale links, missing assets, CSS cascade drift, and load timing problems.

This is the baseline I’m starting from. Phase 1 begins after this audit, starting with the site crawler and health checker in `/tools/site_check.py`.
