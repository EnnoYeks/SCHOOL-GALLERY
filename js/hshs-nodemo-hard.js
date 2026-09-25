(function () {
  if (window.__hshsNoDemoHard) return;
  window.__hshsNoDemoHard = true;

  var DEMO = /Amina Namukasa|Joel Wambede|Maya Okello|Brian Kato|Daniel Okello|Aisha Nakitende|Faith Namulondo|Gloria Nankinga|Mercy Atim|Joseph Ssemmanda|Class 4A|Sports Day 2026|Graduation Ceremony|Morning Assembly|Science Fair|Sports Day on the main field|Prefects 2026|HSHS Studio · Sports/;

  function wipeKeys() {
    ['hshsWorldChat_v1', 'hshsWorldStore_v1', 'hshsWorldStore_v2', 'hshsWorldStore_v3'].forEach(function (k) {
      try {
        var raw = localStorage.getItem(k);
        if (raw && DEMO.test(raw)) localStorage.removeItem(k);
      } catch (e) {}
    });
  }

  function scrubStore() {
    var store = window.HshsStore;
    if (!store || typeof store.getState !== 'function') return;
    try {
      var s = store.getState();
      if (!s) return;
      ['users', 'posts', 'notifications', 'comments', 'follows', 'friends', 'friendRequests'].forEach(function (k) {
        if (!Array.isArray(s[k])) return;
        s[k] = s[k].filter(function (item) {
          try { return !DEMO.test(JSON.stringify(item)); } catch (e) { return true; }
        });
      });
      try { localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s)); } catch (e) {}
    } catch (e) {}
  }

  function scrubDom() {
    var list = document.getElementById('hshsChatList');
    if (list && DEMO.test(list.textContent || '')) {
      list.innerHTML = '<div class="hshs-chat-empty">No conversations yet. Search a classmate and start a chat.</div>';
    }
    document.querySelectorAll('.hub-card, .home-feature-card, .home-trend-item, .student-card, .spotlight-card, .hshs-notif-card').forEach(function (el) {
      if (DEMO.test(el.textContent || '')) el.remove();
    });
    var badge = document.getElementById('notificationBadge');
    if (badge && window.HshsStore && typeof window.HshsStore.unreadNotifications === 'function') {
      var n = window.HshsStore.unreadNotifications();
      badge.textContent = String(n || 0);
      badge.hidden = !n;
    }
    document.querySelectorAll('#topTrendingHero, #topTrendingSide, #trendingGrid, #featuredVideo, #videosContainer, #hshsSavedList, #onThisDayGrid, #schoolTimeline, #yearArchiveContent, #featuredStudent, #spotlightGrid, #hallOfFameList').forEach(function (el) {
      if (el && DEMO.test(el.textContent || '')) el.innerHTML = '';
    });
  }

  function boot() {
    if (!document.getElementById('hshs-nodemo-style')) {
      var st = document.createElement('style');
      st.id = 'hshs-nodemo-style';
      st.textContent = '#galleryFeed:empty::after,#masonryGrid:empty::after,#trendingGrid:empty::after{content:"Nothing here yet.";display:block;padding:24px;opacity:.7}#topTrendingHero:empty,#topTrendingSide:empty{display:none}@media(max-width:768px){.trending-title-row{flex-direction:column;align-items:flex-start;gap:12px}.trending-filters{overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch}}';
      document.head.appendChild(st);
    }
    wipeKeys();
    scrubStore();
    scrubDom();
  }

  document.addEventListener('hshs:foundation-ready', boot);
  document.addEventListener('hshs:page', boot);
  document.addEventListener('hshs:notify', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 200);
  setTimeout(boot, 900);
  setTimeout(boot, 1800);
})();
