(function (global) {
  'use strict';
  if (global.__hshsNavigationPerf) return;
  global.__hshsNavigationPerf = true;

  var cache = global.__hshsPageCache = global.__hshsPageCache || {};
  var pending = Object.create(null);
  var started = false;
  var targets = ['gallery.html', 'buzz.html', 'photos.html', 'videos.html', 'trending.html', 'more.html'];

  function canonical(url) {
    try {
      var u = new URL(url, location.href);
      var file = (u.pathname.split('/').pop() || '').toLowerCase();
      if (file === 'contact.html') u.pathname = u.pathname.replace(/contact\.html$/i, 'contat.html');
      if (file === 'clips.html' || file === 'shorts.html') u.pathname = u.pathname.replace(/(clips|shorts)\.html$/i, 'buzz.html');
      if (['gallery.html','photos.html','videos.html','trending.html','spotlight.html','polls.html','memories.html','about.html','contat.html','profile.html','settings.html','admin.html','buzz.html','chat.html','more.html'].indexOf(file) !== -1 && u.pathname.indexOf('/index/') === -1) {
        u.pathname = '/index/' + file;
      }
      return u;
    } catch (e) { return null; }
  }

  function keyFor(url) {
    var u = canonical(url);
    if (!u) return '';
    var file = (u.pathname.split('/').pop() || '').toLowerCase();
    return file === 'clips.html' || file === 'shorts.html' ? 'buzz.html' : file;
  }

  function prefetch(url) {
    var u = canonical(url);
    if (!u || u.origin !== location.origin) return Promise.resolve();
    var key = keyFor(u.href);
    if (!key || cache[key] || cache[u.href] || pending[key]) return pending[key] || Promise.resolve();

    pending[key] = fetch(u.href, { credentials: 'same-origin', cache: 'force-cache' })
      .then(function (res) {
        if (!res.ok) return null;
        return res.text();
      })
      .then(function (html) {
        if (!html) return;
        cache[u.href] = html;
        cache[key] = html;

        // Warm the page module too. mobile-shell will reuse the browser cache
        // when it injects the script after the navigation begins.
        try {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          doc.querySelectorAll('script[src]').forEach(function (script) {
            var src = script.getAttribute('src') || '';
            if (!/js\/pages\//.test(src)) return;
            var abs = new URL(src, u.href).href;
            var link = document.querySelector('link[data-hshs-prefetch-script="' + abs + '"]');
            if (link) return;
            link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'script';
            link.href = abs;
            link.dataset.hshsPrefetchScript = abs;
            document.head.appendChild(link);
          });
        } catch (e) {}
      })
      .catch(function () {})
      .finally(function () { delete pending[key]; });

    return pending[key];
  }

  function hrefForAnchor(a) {
    if (!a || !a.getAttribute) return null;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#' || /^https?:/i.test(raw) && raw.indexOf(location.origin) !== 0) return null;
    var u = canonical(a.href);
    if (!u || u.origin !== location.origin) return null;
    var file = (u.pathname.split('/').pop() || '').toLowerCase();
    if (!/\.html$/i.test(file)) return null;
    return u.href;
  }

  function start() {
    if (started) return;
    started = true;
    var run = function () {
      targets.forEach(function (file) {
        var u = canonical(file);
        if (u) prefetch(u.href);
      });
    };
    if ('requestIdleCallback' in global) global.requestIdleCallback(run, { timeout: 1800 });
    else setTimeout(run, 900);
  }

  document.addEventListener('pointerover', function (e) {
    var a = e.target.closest && e.target.closest('a');
    var href = hrefForAnchor(a);
    if (href) prefetch(href);
  }, { passive: true });

  document.addEventListener('touchstart', function (e) {
    var a = e.target.closest && e.target.closest('a');
    var href = hrefForAnchor(a);
    if (href) prefetch(href);
  }, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  global.__hshsPrefetchPage = prefetch;
})(typeof window !== 'undefined' ? window : this);
