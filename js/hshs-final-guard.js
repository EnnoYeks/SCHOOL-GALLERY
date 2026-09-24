(function () {
  if (window.__hshsFinalGuard) return;
  window.__hshsFinalGuard = true;

  var DEMO = /Daniel Okello|Aisha Nakitende|Class 4A|Maya Okello|Joel Wambede|Brian Kato|Faith Namulondo|Gloria Nankinga|Mercy Atim|Joseph Ssemmanda|Amina Namukasa|Sports Day 2026|Graduation Ceremony|Morning Assembly|Science Fair/;
  var DEMO_ID = /^(u-demo|u-prefect|u-sports|u-choir|u-lab|u-house|u-maya|u-brian|p1|p2|p3|p4|p5|fr-seed1|n-seed1|c1)$/;

  function wipeStorage() {
    ['hshsWorldChat_v1', 'hshsWorldStore_v1', 'hshsWorldStore_v2', 'hshsWorldStore_v3'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  function isDemo(item) {
    if (!item) return false;
    if (DEMO_ID.test(String(item.id || '')) || DEMO_ID.test(String(item.authorId || ''))) return true;
    return DEMO.test(JSON.stringify(item));
  }

  function hardenStore() {
    var store = window.HshsStore;
    if (!store) return;
    try {
      var s = typeof store.getState === 'function' ? store.getState() : null;
      if (s) {
        s.users = (s.users || []).filter(function (u) { return !isDemo(u); });
        s.posts = (s.posts || []).filter(function (p) { return !isDemo(p); });
        s.notifications = (s.notifications || []).filter(function (n) { return !isDemo(n); });
        s.comments = (s.comments || []).filter(function (c) { return !isDemo(c); });
        s.follows = (s.follows || []).filter(function (f) { return !DEMO_ID.test(f.followerId || '') && !DEMO_ID.test(f.followingId || ''); });
        try { localStorage.setItem('hshsWorldStore_v4', JSON.stringify(s)); } catch (e) {}
      }
    } catch (e) {}
    ['listPosts', 'listUsers', 'listNotifications', 'featured', 'trending', 'search', 'searchPeople', 'postsByUser'].forEach(function (name) {
      if (typeof store[name] !== 'function') return;
      if (store[name].__hshsNoDemo) return;
      var orig = store[name];
      var wrapped = function () {
        var out = orig.apply(store, arguments);
        if (!Array.isArray(out)) return out;
        return out.filter(function (item) { return !isDemo(item); });
      };
      wrapped.__hshsNoDemo = true;
      store[name] = wrapped;
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
