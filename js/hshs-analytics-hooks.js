/**
 * Wire custom Analytics events to real UI actions (non-invasive)
 */
(function () {
  if (window.__hshsAnalyticsHooks) return;
  window.__hshsAnalyticsHooks = true;

  function A() {
    return window.HshsAnalytics && window.HshsAnalytics.events;
  }

  function postIdFrom(el) {
    if (!el) return '';
    var card = el.closest('[data-post-id], .post-card, .photo-card, .vibe-feat, .vibe-row, article');
    if (!card) return '';
    return card.getAttribute('data-post-id') || card.getAttribute('data-photo-id') || card.getAttribute('data-id') || '';
  }

  function contentTypeFrom(el) {
    var card = el && el.closest('.vibe-feat, .vibe-row, .photo-card, .post-card, video, [data-type]');
    if (!card) return 'post';
    if (card.classList.contains('vibe-feat') || card.classList.contains('vibe-row') || card.tagName === 'VIDEO') return 'video';
    if (card.classList.contains('photo-card')) return 'photo';
    var t = card.getAttribute('data-type');
    return t || 'post';
  }

  document.addEventListener('click', function (e) {
    var ev = A();
    if (!ev) return;
    var t = e.target;

    var like = t.closest('.like-action, [data-action="like"], .action-btn.like-action, button[aria-label="Like"]');
    if (like) {
      var id = postIdFrom(like);
      var active = like.classList.contains('active') || like.getAttribute('aria-pressed') === 'true';
      if (active) ev.unlike(id);
      else ev.like(id, contentTypeFrom(like));
      return;
    }

    var cmt = t.closest('.comment-action, [data-action="comment"], button[aria-label="Comment"]');
    if (cmt) {
      ev.comment(postIdFrom(cmt));
      return;
    }

    var share = t.closest('.share-action, [data-action="share"], button[aria-label="Share"]');
    if (share) {
      ev.share(postIdFrom(share), 'button');
      return;
    }

    var follow = t.closest('[data-pf="follow"], .pf-btn[data-pf="follow"], [data-action="follow"]');
    if (follow) {
      ev.follow(follow.getAttribute('data-user-id') || '');
      return;
    }

    if (t.closest('#openUploadStudio, .tab-upload, [data-open-studio], .js-open-studio')) {
      ev.openStudio(location.pathname);
      return;
    }

    if (t.closest('#openMoreSheet, [data-tab="more"]')) {
      ev.moreMenuOpen();
      return;
    }

    if (t.closest('.notification-icon, #notificationDropdown, [data-tab="notifications"]')) {
      ev.notificationOpen();
      return;
    }

    var tab = t.closest('.mobile-tabbar a, .mobile-tabbar button, [data-tab]');
    if (tab && tab.closest('.mobile-tabbar, .tabbar')) {
      var name = tab.getAttribute('data-tab') || (tab.getAttribute('href') || '').split('/').pop() || '';
      if (name) ev.tabSwitch(name.replace('.html', ''));
      return;
    }

    var gal = t.closest('a[href*="photos"], a[href*="videos"], a[href*="gallery"]');
    if (gal) {
      var href = gal.getAttribute('href') || '';
      if (href.indexOf('video') >= 0) ev.openGallery('videos');
      else if (href.indexOf('photo') >= 0) ev.openGallery('photos');
      else ev.openGallery('gallery');
    }
  }, true);

  var searchTimer = null;
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.querySelector) return;
    var input = form.querySelector('input[type="search"], input[name="q"], #searchInput, .search-input');
    if (!input) return;
    var ev = A();
    if (ev) ev.search(input.value);
  }, true);

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || !el.matches) return;
    if (!el.matches('input[type="search"], #searchInput, .search-input, input[name="q"]')) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      var val = String(el.value || '').trim();
      if (val.length < 2) return;
      var ev = A();
      if (ev) ev.search(val);
    }, 800);
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.classList || !form.classList.contains('hshs-comment-form')) return;
    var ev = A();
    if (ev) ev.comment(postIdFrom(form));
  }, true);

  document.addEventListener('hshs:auth', function (e) {
    var user = e.detail && e.detail.user;
    if (window.HshsAnalytics && window.HshsAnalytics.setUser) {
      window.HshsAnalytics.setUser(user || null);
    }
  });

  var last = location.pathname;
  setInterval(function () {
    if (location.pathname === last) return;
    last = location.pathname;
    if (!window.HshsAnalytics) return;
    window.HshsAnalytics.pageView();
    var screen = (last.split('/').pop() || 'home').replace(/\.html$/, '') || 'home';
    window.HshsAnalytics.screenView(screen);
    if (screen === 'profile') {
      var ev = A();
      if (ev) ev.profileView('');
    }
  }, 600);

  var n = 0;
  var piv = setInterval(function () {
    var s = window.HshsStore;
    if (s && typeof s.addLocal === 'function' && !s.__analyticsPatched) {
      var orig = s.addLocal.bind(s);
      s.addLocal = function (payload) {
        var ev = A();
        if (ev && payload) {
          ev.uploadComplete(payload.type || 'media', (payload.destinations && payload.destinations[0]) || payload.board || 'general');
        }
        return orig(payload);
      };
      s.__analyticsPatched = true;
    }
    if (++n > 40) clearInterval(piv);
  }, 300);

  document.addEventListener('hshs:track', function (e) {
    var d = e.detail || {};
    if (window.HshsAnalytics && d.name) {
      window.HshsAnalytics.track(d.name, d.params || {});
    }
  });
})();
