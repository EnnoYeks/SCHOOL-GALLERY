/**
 * HSHS Foundation Bootstrap – loads modular core after existing shell.
 * Additive; existing mobile-shell continues to own page swapping.
 */
(function () {
  'use strict';
  if (window.__hshsFoundationBooted) return;
  window.__hshsFoundationBooted = true;
  try { document.documentElement.classList.add('hshs-js-booting'); } catch (e) {}

  function assetBase() {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('navigation.js') !== -1 && src.indexOf('mobile-navigation') === -1) {
        return src.replace(/js\/navigation\.js.*$/, 'js/');
      }
      if (src.indexOf('mobile-shell.js') !== -1) {
        return src.replace(/js\/mobile-shell\.js.*$/, 'js/');
      }
    }
    return location.pathname.indexOf('/index/') !== -1 ? '../js/' : 'js/';
  }

  function loadScript(src, id) {
    return new Promise(function (resolve, reject) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ver(url) {
    var v = window.__hshsAssetVer || '260905p6';
    return url + (url.indexOf('?') === -1 ? '?v=' + v : '');
  }

  async function boot() {
    var base = assetBase();
    try {
      await loadScript(ver(base + 'core/app.js'), 'hshs-core-app');
      await loadScript(ver(base + 'utils/dom.js'), 'hshs-utils-dom');
      await loadScript(ver(base + 'router/history.js'), 'hshs-router-history');
      await loadScript(ver(base + 'router/router.js'), 'hshs-router-main');
      try { await loadScript(ver(base + 'components/loading.js'), 'hshs-comp-loading'); } catch (e) {}
      try { await loadScript(ver(base + 'components/error.js'), 'hshs-comp-error'); } catch (e) {}
      try { await loadScript(ver(base + 'components/shared-ui.js'), 'hshs-comp-shared'); } catch (e) {}
      try { await loadScript(ver(base + 'core/data.js'), 'hshs-core-data'); } catch (e) {}
      try { await loadScript(ver(base + 'core/lifecycle.js'), 'hshs-core-lifecycle'); } catch (e) {}
      if (window.HshsApp) {
        window.HshsApp.setState({ foundation: true });
        window.HshsApp.markReady();
      }
      document.dispatchEvent(new CustomEvent('hshs:foundation-ready', {
        detail: { version: (window.HshsApp && window.HshsApp.version) || '1.0.0-phase6' }
      }));
      document.documentElement.classList.add('hshs-js-ready');
      document.documentElement.classList.remove('hshs-js-booting');
      console.info('[HSHS] Phase 1+5+6 foundation ready');
    } catch (err) {
      console.warn('[HSHS] Foundation boot partial failure — falling back to existing system', err);
      if (window.HshsApp) window.HshsApp.reportError(err, 'foundation.boot');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
