(function (global) {
  'use strict';
  if (global.__hshsStoreSanitizer) return;
  global.__hshsStoreSanitizer = true;

  /**
   * Campus product mode:
   * Keep seeded HSHS showcase posts/users so Home/Chat never boot empty.
   * Only strip broken null entries. Real student content is additive.
   */
  function cleanState(s) {
    if (!s || typeof s !== 'object') return s;
    s.users = Array.isArray(s.users) ? s.users.filter(Boolean) : [];
    s.posts = Array.isArray(s.posts) ? s.posts.filter(Boolean) : [];
    s.follows = Array.isArray(s.follows) ? s.follows.filter(Boolean) : [];
    s.friendRequests = Array.isArray(s.friendRequests) ? s.friendRequests.filter(Boolean) : [];
    s.friends = Array.isArray(s.friends) ? s.friends.filter(Boolean) : [];
    s.notifications = Array.isArray(s.notifications) ? s.notifications.filter(Boolean) : [];
    s.comments = Array.isArray(s.comments) ? s.comments.filter(Boolean) : [];
    s.likes = Array.isArray(s.likes) ? s.likes.filter(Boolean) : [];
    s.saves = Array.isArray(s.saves) ? s.saves.filter(Boolean) : [];
    return s;
  }

  function persist(s) {
    try { localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s)); } catch (e) {}
    global.__hshsState = s;
  }

  function ensureShowcase(store) {
    try {
      if (!store || typeof store.getState !== 'function') return;
      var s = store.getState();
      if (!s) return;
      // Empty arrays are truthy — force reseed when a prior wipe left no content.
      if ((!s.posts || !s.posts.length) || (!s.users || !s.users.length)) {
        try { localStorage.removeItem('hshsWorldStore_v2'); } catch (e) {}
        try {
          // Trigger store state() path by clearing and re-reading if available
          if (typeof store.getState === 'function') {
            // HshsStore.state internal will reseed when posts/users empty after our store fix
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  function run() {
    var store = global.HshsStore;
    if (!store || typeof store.getState !== 'function') return;
    try {
      var s = cleanState(store.getState());
      // If wiped by an old sanitizer, clear storage so store reseed can run
      if (!s.posts || !s.posts.length || !s.users || !s.users.length) {
        try { localStorage.removeItem('hshsWorldStore_v2'); } catch (e) {}
        try { localStorage.removeItem('hshsWorldStore_v1'); } catch (e) {}
        // Soft reload state by page modules that call getState after seed
        return;
      }
      persist(s);
      ensureShowcase(store);
    } catch (e) {
      console.warn('[HSHS] store sanitizer', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('hshs:foundation-ready', run);
  global.HshsStoreSanitizer = { run: run };
})(typeof window !== 'undefined' ? window : this);
