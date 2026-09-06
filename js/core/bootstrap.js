/**
 * HSHS Foundation Bootstrap – JS-first stack
 * Critical modules must load; optional modules may fail.
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
      if (src.indexOf('core/bootstrap.js') !== -1) {
        return src.replace(/js\/core\/bootstrap\.js.*$/, 'js/');
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
    var v = window.__hshsAssetVer || '260906f2';
    return url + (url.indexOf('?') === -1 ? '?v=' + v : '');
  }

  async function boot() {
    var base = assetBase();
    try {
      await loadScript(ver(base + 'core/app.js'), 'hshs-core-app');
      await loadScript(ver(base + 'utils/dom.js'), 'hshs-utils-dom');
      await loadScript(ver(base + 'core/render.js'), 'hshs-core-render');
      try { await loadScript(ver(base + 'core/templates/home.js'), 'hshs-tpl-home'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/gallery.js'), 'hshs-tpl-gallery'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/photos.js'), 'hshs-tpl-photos'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/videos.js'), 'hshs-tpl-videos'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/about.js'), 'hshs-tpl-about'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/spotlight.js'), 'hshs-tpl-spotlight'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/polls.js'), 'hshs-tpl-polls'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/memories.js'), 'hshs-tpl-memories'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/more.js'), 'hshs-tpl-more'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/chat.js'), 'hshs-tpl-chat'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/admin.js'), 'hshs-tpl-admin'); } catch (e) {}
      try { await loadScript(ver(base + 'core/templates/settings.js'), 'hshs-tpl-settings'); } catch (e) {}
      await loadScript(ver(base + 'components/ui.js'), 'hshs-comp-ui');
      await loadScript(ver(base + 'components/shell.js'), 'hshs-comp-shell');
      await loadScript(ver(base + 'router/history.js'), 'hshs-router-history');
      await loadScript(ver(base + 'router/router.js'), 'hshs-router-main');
    } catch (err) {
      console.error('[HSHS] Critical foundation failure', err);
      if (window.HshsApp) window.HshsApp.reportError(err, 'foundation.critical');
      document.documentElement.classList.add('hshs-js-failed');
      document.documentElement.classList.remove('hshs-js-booting');
      return;
    }

    try { await loadScript(ver(base + 'components/loading.js'), 'hshs-comp-loading'); } catch (e) { console.warn('[HSHS] optional loading.js', e); }
    try { await loadScript(ver(base + 'components/error.js'), 'hshs-comp-error'); } catch (e) { console.warn('[HSHS] optional error.js', e); }
    try { await loadScript(ver(base + 'components/shared-ui.js'), 'hshs-comp-shared'); } catch (e) { console.warn('[HSHS] optional shared-ui.js', e); }
    try { await loadScript(ver(base + 'core/data.js'), 'hshs-core-data'); } catch (e) { console.warn('[HSHS] optional data.js', e); }
    try { await loadScript(ver(base + 'core/lifecycle.js'), 'hshs-core-lifecycle'); } catch (e) { console.warn('[HSHS] optional lifecycle.js', e); }

    if (!window.HshsRender || !window.HshsUI || !window.HshsShell) {
      console.error('[HSHS] Foundation incomplete after load');
      document.documentElement.classList.add('hshs-js-failed');
      document.documentElement.classList.remove('hshs-js-booting');
      return;
    }

    if (window.HshsApp) {
      window.HshsApp.setState({ foundation: true });
      window.HshsApp.markReady();
    }
    document.dispatchEvent(new CustomEvent('hshs:foundation-ready', {
      detail: { version: (window.HshsApp && window.HshsApp.version) || '1.0.0-jsfirst' }
    }));
    document.documentElement.classList.add('hshs-js-ready');
    document.documentElement.classList.remove('hshs-js-booting');
    console.info('[HSHS] JS-first foundation ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
