(function () {
  if (window.__hshsFinalGuard) return;
  window.__hshsFinalGuard = true;

  var DEMO = /Daniel Okello|Aisha Nakitende|Class 4A|Maya Okello|Joel Wambede|Brian Kato|Faith Namulondo|Gloria Nankinga|Mercy Atim|Joseph Ssemmanda|Amina Namukasa|Sports Day 2026|Graduation Ceremony/;

  function wipeStorage() {
    ['hshsWorldChat_v1', 'hshsWorldStore_v1', 'hshsWorldStore_v2', 'hshsWorldStore_v3'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  function wipeChatDom() {
    var box = document.getElementById('hshsChatList');
    if (!box) return;
    if (DEMO.test(box.textContent || '')) {
      box.innerHTML = '<div class="hshs-chat-empty">No conversations yet. Search a classmate and start a chat.</div>';
    }
  }

  function wipeStore() {
    var store = window.HshsStore;
    if (!store || typeof store.getState !== 'function') return;
    try {
      var s = store.getState();
      var blob = JSON.stringify(s.users || []) + JSON.stringify(s.posts || []) + JSON.stringify(s.notifications || []);
      if (!DEMO.test(blob) && !(s.users && s.users.some(function (u) { return String(u.id || '').indexOf('u-demo') === 0; }))) return;
      s.users = [];
      s.posts = [];
      s.follows = [];
      s.friendRequests = [];
      s.friends = [];
      s.notifications = [];
      s.comments = [];
      try { localStorage.setItem('hshsWorldStore_v4', JSON.stringify(s)); } catch (e) {}
    } catch (e) {}
  }

  function boot() {
    wipeStorage();
    wipeStore();
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
