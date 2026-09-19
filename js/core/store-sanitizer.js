(function (global) {
  'use strict';
  if (global.__hshsStoreSanitizer) return;
  global.__hshsStoreSanitizer = true;

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
    try { localStorage.setItem('hshsWorldStore_v3', JSON.stringify(s)); } catch (e) {}
    global.__hshsState = s;
  }

  function run() {
    var store = global.HshsStore;
    if (!store || typeof store.getState !== 'function') return;
    try {
      persist(cleanState(store.getState()));
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
