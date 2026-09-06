(function () {
  'use strict';
  if (window.__hshsFoundationBooted) return;
  window.__hshsFoundationBooted = true;
  try { document.documentElement.classList.add('hshs-js-booting'); } catch (e) {}
  var ASSET_VER = window.__hshsAssetVer || '260906split2';
  function assetBase() {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('core/bootstrap.js') !== -1) return src.replace(/js\/core\/bootstrap\.js.*$/, 'js/');
      if (src.indexOf('navigation.js') !== -1 && src.indexOf('mobile-navigation') === -1) return src.replace(/js\/navigation\.js.*$/, 'js/');
    }
    return location.pathname.indexOf('/index/') !== -1 ? '../js/' : 'js/';
  }
  function loadScript(src, id) {
    return new Promise(function (resolve, reject) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src; s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function ver(url) { return url + (url.indexOf('?') === -1 ? '?v=' + ASSET_VER : ''); }
  var TEMPLATE_NAMES = ['home','gallery','photos','videos','about','trending','more','spotlight','settings','chat','admin','profile','notifications','saved','buzz','contact','polls','memories'];
  function ensureClassicCss() {
    if (document.getElementById('hshs-classic-css')) return;
    var cssBase = assetBase().replace(/js\/?$/, 'css/');
    var link = document.createElement('link');
    link.id = 'hshs-classic-css';
    link.rel = 'stylesheet';
    link.href = ver(cssBase + 'hshs-classic.css');
    document.head.appendChild(link);
  }
  async function boot() {
    var base = assetBase();
    try { ensureClassicCss(); } catch (e) {}
    try {
      await loadScript(ver(base + 'core/app.js'), 'hshs-core-app');
      await loadScript(ver(base + 'core/registry.js'), 'hshs-core-registry');
      try { await loadScript(ver(base + 'utils/dom.js'), 'hshs-utils-dom'); } catch (e) {}
      await loadScript(ver(base + 'core/render.js'), 'hshs-core-render');
      for (var i = 0; i < TEMPLATE_NAMES.length; i++) {
        var n = TEMPLATE_NAMES[i];
        try { await loadScript(ver(base + 'core/templates/' + n + '.js'), 'hshs-tpl-' + n); } catch (e) {}
      }
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
    try { await loadScript(ver(base + 'hshs-store.js'), 'hshs-store'); } catch (e) { console.warn('[HSHS] Data store unavailable', e); }
    try { await loadScript(ver(base + 'core/store-sanitizer.js'), 'hshs-store-sanitizer'); } catch (e) { console.warn('[HSHS] Store sanitizer unavailable', e); }
    try { await loadScript(ver(base + 'components/loading.js'), 'hshs-comp-loading'); } catch (e) {}
    try { await loadScript(ver(base + 'components/error.js'), 'hshs-comp-error'); } catch (e) {}
    try { await loadScript(ver(base + 'components/shared-ui.js'), 'hshs-comp-shared'); } catch (e) {}
    try { await loadScript(ver(base + 'core/data.js'), 'hshs-core-data'); } catch (e) {}
    try { await loadScript(ver(base + 'core/lifecycle.js'), 'hshs-core-lifecycle'); } catch (e) {}
    if (!window.HshsRender || !window.HshsUI || !window.HshsShell) {
      console.error('[HSHS] Foundation incomplete after load');
      document.documentElement.classList.add('hshs-js-failed');
      document.documentElement.classList.remove('hshs-js-booting');
      return;
    }
    try {
      if (window.HshsRegistry && window.HshsApp) {
        var active = window.HshsRegistry.activeRoute();
        window.HshsApp.setState({ currentRoute: active.route.appPath || active.route.path, currentPage: active.name, foundation: true });
        if (active.route.title) document.title = active.route.title;
      }
    } catch (e) {}
    if (window.HshsApp) {
      window.HshsApp.setState({ foundation: true });
      window.HshsApp.markReady();
    }
    document.dispatchEvent(new CustomEvent('hshs:foundation-ready', { detail: { version: (window.HshsApp && window.HshsApp.version) || '1.0.0-phase1', route: window.HshsRegistry ? window.HshsRegistry.activeRoute() : null } }));
    document.documentElement.classList.remove('hshs-js-booting');
    document.documentElement.classList.add('hshs-js-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
