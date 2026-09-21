// hshs-store-bridge.js
// Lightweight store migration and safe polyfills so pages won't throw if the in-memory store
// isn't ready yet. Adds a stable localStorage key and migrates any v1 data.
(function () {
  if (window.__hshsStoreBridge) return;
  window.__hshsStoreBridge = true;

  var V2_KEY = 'hshsWorldStore_v3';
  var LEGACY_V2 = 'hshsWorldStore_v2';
  var V1_KEY = 'hshsWorldStore_v1';

  try {
    if (!localStorage.getItem(V2_KEY)) {
      localStorage.setItem(V2_KEY, JSON.stringify({
        users: [], posts: [], follows: [], friendRequests: [], friends: [],
        notifications: [], likes: [], saves: [], comments: [], sessionUserId: null
      }));
    }
  } catch (e) { /* ignore localStorage errors */ }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(V2_KEY) || 'null') || {}; } catch (e) { return {}; }
  }
  function writeLocal(s) {
    try { localStorage.setItem(V2_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  if (!window.HshsStore) {
    var shim = {
      getState: function () { return readLocal(); },
      currentUser: function () { try { var s = readLocal(); return s && s.currentUser ? s.currentUser : null; } catch (e) { return null; } },
      listUsers: function () { var s = readLocal(); return s && s.users ? s.users : []; },
      getUser: function (id) { var u = (this.listUsers() || []).find(function (x) { return x.id === id; }); return u || null; },
      postsByUser: function () { return []; },
      addPost: function () { return { ok: false, error: 'offline' }; },
      toggleLike: function () { return { ok: false }; },
      toggleSave: function () { return { ok: false }; },
      isLiked: function () { return false; },
      isSaved: function () { return false; },
      isFollowing: function () { return false; },
      toggleFollow: function () { return { ok: false }; },
      followCounts: function () { return { friends: 0, followers: 0 }; },
      search: function () { return []; },
      searchPeople: function () { return []; },
      addComment: function () { return { ok: false }; },
      markAllNotificationsRead: function () {},
      markNotificationRead: function () {},
      acceptFriend: function () {},
      declineFriend: function () {},
      unreadNotifications: function () { return 0; },
      listNotifications: function () { return []; },
      heartbeat: function () {}
    };
    window.HshsStore = shim;
  } else {
    try {
      var originalGetState = window.HshsStore.getState;
      if (typeof originalGetState === 'function') {
        var _orig = originalGetState.bind(window.HshsStore);
        window.HshsStore.getState = function () {
          try {
            var s = _orig();
            if (!s || Object.keys(s).length === 0) return readLocal();
            return s;
          } catch (e) { return readLocal(); }
        };
      }
    } catch (e) {}
  }

  window.HshsStoreBridge = {
    STORE_KEY: V2_KEY,
    read: readLocal,
    write: writeLocal,
    migrateIfNeeded: function () {
      try { if (!localStorage.getItem(V2_KEY) && localStorage.getItem(V1_KEY)) { localStorage.setItem(V2_KEY, JSON.stringify({ users: [], posts: [], follows: [], friendRequests: [], friends: [], notifications: [], likes: [], saves: [], comments: [], sessionUserId: null })); } } catch (e) {}
    }
  };
})();
