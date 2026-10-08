/**
 * HSHS Social — local build (no stale CDN pin)
 * Follow / people actions live in hshs-social-actions.js + HshsPeople + db.js
 */
(function () {
  if (window.__hshsSocialBoot) return;
  window.__hshsSocialBoot = true;
  // Intentionally empty: do not load an old CDN snapshot.
  // Real follow/chat wiring is in hshs-social-actions.js, hshs-people.js, db.js.
})();
