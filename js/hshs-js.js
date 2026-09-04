/**
 * HSHS JS migration kernel — hydrate only, never wipe a painted page.
 *
 * Rules (do not break these):
 * 1. HTML in the .html file is the first paint. Keep it.
 * 2. A page is "converted" only when listed in CONVERTED below.
 * 3. If the original shell is already in the DOM, do not innerHTML-replace it.
 * 4. Unconverted pages keep a normal full-page load.
 * 5. Convert one page per pull request. Check it. Then the next page.
 */
(function () {
  if (window.__hshsJsKernel) return;
  window.__hshsJsKernel = true;

  var PREFIX = location.pathname.indexOf('/index/') !== -1 ? '../js/' : 'js/';

  // Page 1 of the JS transition. Add the next page only after this one is confirmed.
  var CONVERTED = {
    gallery: 'pages/gallery.js'
  };

  function pageId() {
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file || file === 'index.html') return 'home';
    if (file === 'clips.html' || file === 'shorts.html') file = 'buzz.html';
    if (file === 'contact.html') file = 'contat.html';
    return file.replace(/\.html$/, '');
  }

  function painted(id, module) {
    if (document.querySelector('[data-js-page="' + id + '"]')) return true;
    var ids = (module && module.rootIds) || [];
    for (var i = 0; i < ids.length; i++) {
      if (document.getElementById(ids[i])) return true;
    }
    return false;
  }

  async function boot() {
    var id = pageId();
    var file = CONVERTED[id];
    if (!file) {
      document.documentElement.setAttribute('data-js-mode', 'html');
      return;
    }
    document.documentElement.setAttribute('data-js-mode', 'hydrate');
    document.documentElement.setAttribute('data-js-page', id);
    var module = await import(PREFIX + file);
    var already = painted(id, module);
    if (!already && typeof module.render === 'function') {
      var host = document.getElementById('app-root');
      if (!host) {
        host = document.createElement('div');
        host.id = 'app-root';
        var nav = document.querySelector('nav.navbar');
        if (nav && nav.parentNode) nav.parentNode.insertBefore(host, nav.nextSibling);
        else document.body.appendChild(host);
      }
      host.innerHTML = await module.render();
      host.setAttribute('data-js-page', id);
    }
    if (typeof module.init === 'function') {
      await module.init({ hydrated: already, pageId: id });
    }
    document.documentElement.classList.remove('hshs-booting');
    document.documentElement.classList.add('hshs-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot().catch(function (e) { console.warn(e); }); });
  } else {
    boot().catch(function (e) { console.warn(e); });
  }
})();
