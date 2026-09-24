// hshs-store-bridge.js
// Empty local store until Firebase + R2 storage is wired.
(function () {
  if (window.__hshsStoreBridge) return;
  window.__hshsStoreBridge = true;

  var V2_KEY = 'hshsWorldStore_v4';
  var V1_KEY = 'hshsWorldStore_v1';
  var empty = {
    users: [], posts: [], follows: [], friendRequests: [], friends: [],
    notifications: [], likes: [], saves: [], comments: [], sessionUserId: null
  };

  try {
    ['hshsWorldStore_v1','hshsWorldStore_v2','hshsWorldStore_v3'].forEach(function (k) {
      localStorage.removeItem(k);
    });
    if (!localStorage.getItem(V2_KEY)) localStorage.setItem(V2_KEY, JSON.stringify(empty));
  } catch (e) {}

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(V2_KEY) || 'null') || empty; } catch (e) { return empty; }
  }
  function writeLocal(s) {
    try { localStorage.setItem(V2_KEY, JSON.stringify(s)); } catch (e) {}
  }

  window.HshsStoreBridge = {
    STORE_KEY: V2_KEY,
    read: readLocal,
    write: writeLocal,
    migrateIfNeeded: function () {
      try { if (!localStorage.getItem(V2_KEY)) writeLocal(empty); } catch (e) {}
    }
  };
})();
