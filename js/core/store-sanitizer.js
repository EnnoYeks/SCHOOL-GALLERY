(function (global) {
  'use strict';
  if (global.__hshsStoreSanitizer) return;
  global.__hshsStoreSanitizer = true;

  var demoUsers = {
    'u-demo': true,
    'u-prefect': true,
    'u-sports': true,
    'u-choir': true,
    'u-lab': true,
    'u-house': true,
    'u-maya': true,
    'u-brian': true
  };
  var demoPosts = { p1: true, p2: true, p3: true, p4: true, p5: true };
  var demoRequests = { 'fr-seed1': true };
  var demoNotifications = { 'n-seed1': true };
  var demoComments = { c1: true };

  function cleanState(s) {
    if (!s || typeof s !== 'object') return s;
    s.users = Array.isArray(s.users) ? s.users.filter(function (u) { return !u || !demoUsers[u.id]; }) : [];
    s.posts = Array.isArray(s.posts) ? s.posts.filter(function (p) { return !p || !demoPosts[p.id]; }) : [];
    s.follows = Array.isArray(s.follows) ? s.follows.filter(function (f) { return !f || (!demoUsers[f.followerId] && !demoUsers[f.followingId]); }) : [];
    s.friendRequests = Array.isArray(s.friendRequests) ? s.friendRequests.filter(function (r) { return !r || (!demoRequests[r.id] && !demoUsers[r.fromId] && !demoUsers[r.toId]); }) : [];
    s.friends = Array.isArray(s.friends) ? s.friends.filter(function (f) { return !f || (!demoUsers[f.a] && !demoUsers[f.b]); }) : [];
    s.notifications = Array.isArray(s.notifications) ? s.notifications.filter(function (n) { return !n || (!demoNotifications[n.id] && !demoUsers[n.userId]); }) : [];
    s.comments = Array.isArray(s.comments) ? s.comments.filter(function (c) { return !c || (!demoComments[c.id] && !demoPosts[c.postId]); }) : [];
    s.likes = Array.isArray(s.likes) ? s.likes.filter(function (k) { return typeof k !== 'string' || k.indexOf('u-demo:') !== 0; }) : [];
    s.saves = Array.isArray(s.saves) ? s.saves.filter(function (k) { return typeof k !== 'string' || k.indexOf('u-demo:') !== 0; }) : [];
    if (demoUsers[s.sessionUserId]) s.sessionUserId = null;
    return s;
  }

  function persist(s) {
    try { localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s)); } catch (e) {}
    global.__hshsState = s;
  }

  function run() {
    var store = global.HshsStore;
    if (!store || typeof store.getState !== 'function') return;
    try {
      var s = cleanState(store.getState());
      persist(s);

      if (typeof store.addPost === 'function' && !store.__realOnlyAddPost) {
        var originalAddPost = store.addPost;
        store.addPost = function (data) {
          data = data || {};
          if (!String(data.image || data.imageUrl || '').trim()) {
            return { ok: false, error: 'Add a real photo or video before publishing.' };
          }
          return originalAddPost.call(store, data);
        };
        store.__realOnlyAddPost = true;
      }

      try { document.dispatchEvent(new Event('hshs:storechange')); } catch (e) {}
    } catch (e) {
      if (global.HshsApp) global.HshsApp.reportError(e, 'store.sanitizer');
    }
  }

  if (global.HshsStore) run();
  else setTimeout(run, 0);
})(typeof window !== 'undefined' ? window : this);
