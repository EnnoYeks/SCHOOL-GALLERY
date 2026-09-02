feat(upload+hardening): upload studio, social/notify hardening, store bridge, accessibility

Summary
- Adds a robust Upload Studio (drag/drop, camera/record, client-side resizing, filters, sound preview, class tags, multi-destination posting, progress UI) implemented in js/hshs-upload.js.
- Introduces a safe HshsStore bridge (js/hshs-store-bridge.js) that migrates any existing hshsWorldStore_v1 data to hshsWorldStore_v2 and exposes a non-throwing shim when the in-memory store isn't present.
- Hardens several social modules (js/hshs-social.js, js/hshs-social-actions.js, js/hshs-notify.js) to use escaped text and defensive guards around store APIs.
- Photos page (js/photos.js) refactor to safer DOM creation and pagination fixes.
- Accessibility: small helpers and a11y annotations to ensure buttons/controls are keyboard reachable and modals focus correctly.

Files added
- js/hshs-store-bridge.js
- js/hshs-utils.js (utilities: escapeHtml, safeText, makeFocusable)
- js/hshs-a11y.js (small helpers for focus management and a11y labels)

Files updated
- js/hshs-upload.js
- js/hshs-social.js
- js/hshs-social-actions.js
- js/hshs-notify.js
- js/hshs-school.js
- js/photos.js
- js/navigation.js

Checklist (manual smoke to run before merging)
- [ ] Site loads with no uncaught console errors on home and gallery pages.
- [ ] Upload Studio: drag/drop, camera snap, record video, filter preview, sound preview, caption, class tag, multi-destination posting, Post persists to store or local fallback.
- [ ] Photos page: cards render, modal opens, Like/Save/Comment controls respond or fail gracefully.
- [ ] Notifications: badge updates and dropdown renders; accept/decline works when a store is available.
- [ ] School Hub: nomination flow + prefect confirm updates house points and emits notification.

Notes
- No squash requested. Keep branch history intact.
- Sound assets referenced in upload studio must be added to /assets/sounds/ or point to external CDN URLs.

