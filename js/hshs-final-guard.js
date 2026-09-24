(function () {
  if (window.__hshsFinalGuard) return;
  window.__hshsFinalGuard = true;

  var DEMO = /Daniel Okello|Aisha Nakitende|Class 4A|Maya Okello|Joel Wambede|Brian Kato|Faith Namulondo|Gloria Nankinga|Mercy Atim|Joseph Ssemmanda|Amina Namukasa|Sports Day 2026|Graduation Ceremony/;

  function wipeStorage() {
    ['hshsWorldChat_v1', 'hshsWorldStore_v1', 'hshsWorldStore_v2', 'hshsWorldStore_v3'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  function emptyArr() { return []; }

  function hardenStore() {
    var store = window.HshsStore;
    if (!store) return;
    try {
      var s = typeof store.getState === 'function' ? store.getState() : null;
      if (s) {
        var blob = JSON.stringify(s.users || []) + JSON.stringify(s.posts || []) + JSON.stringify(s.notifications || []);
        if (DEMO.test(blob) || (s.users && s.users.some(function (u) { return String(u.id || '').indexOf('u-demo') === 0; }))) {
          s.users = [];
          s.posts = [];
          s.follows = [];
          s.friendRequests = [];
          s.friends = [];
          s.notifications = [];
          s.comments = [];
          try { localStorage.setItem('hshsWorldStore_v4', JSON.stringify(s)); } catch (e) {}
        }
      }
    } catch (e) {}
    ['listPosts', 'listUsers', 'listNotifications', 'featured', 'trending', 'search', 'searchPeople'].forEach(function (name) {
      if (typeof store[name] === 'function') {
        var orig = store[name];
        store[name] = function () {
          var out = orig.apply(store, arguments);
          if (!Array.isArray(out)) return out;
          return out.filter(function (item) {
            var blob = JSON.stringify(item || {});
            return !DEMO.test(blob) && String((item && (item.id || item.authorId)) || '').indexOf('u-demo') !== 0 && String((item && item.id) || '').indexOf('p') !== 0;
          });
        };
      } else {
        store[name] = emptyArr;
      }
    });
  }

  function wipeChatDom() {
    var box = document.getElementById('hshsChatList');
    if (box && DEMO.test(box.textContent || '')) {
      box.innerHTML = '<div class="hshs-chat-empty">No conversations yet. Search a classmate and start a chat.</div>';
    }
  }

  function boot() {
    wipeStorage();
    hardenStore();
    wipeChatDom();
  }

  document.addEventListener('hshs:foundation-ready', boot);
  document.addEventListener('hshs:page', boot);
  document.addEventListener('hshs:auth', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
