(function () {
  'use strict';
  try { document.documentElement.classList.add('hshs-js-booting'); } catch (e) {}

  function scriptBase() {
    try {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src') || '';
        if (src.indexOf('core/bootstrap') !== -1) {
          return src.replace(/core\/bootstrap\.js.*$/, '');
        }
      }
    } catch (e) {}
    return location.pathname.indexOf('/index/') !== -1 ? '../js/' : 'js/';
  }

  function loadScript(src, id) {
    return new Promise(function (resolve, reject) {
      if (id && document.getElementById(id)) return resolve();
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ver(url) {
    var v = '260912gsap';
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + v;
  }

  function add(rel, href, id, extra) {
    if (id && document.getElementById(id)) return;
    var l = document.createElement('link');
    if (id) l.id = id;
    l.rel = rel;
    l.href = href;
    if (extra) Object.keys(extra).forEach(function (k) { l.setAttribute(k, extra[k]); });
    document.head.appendChild(l);
  }

  async function boot() {
    var base = scriptBase();
    var cssBase = base.replace(/js\/?$/, 'css/');
    try {
      add('preconnect', 'https://fonts.googleapis.com', 'hshs-gf-pre');
      add('preconnect', 'https://fonts.gstatic.com', 'hshs-gf-pre2', { crossorigin: '' });
      add('stylesheet', 'https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap', 'hshs-google-fonts');
      add('stylesheet', ver(cssBase + 'hshs-fonts.css'), 'hshs-fonts-css');
    } catch (e) {}

    var TEMPLATE_NAMES = ['home','gallery','photos','videos','about','trending','more','spotlight','settings','chat','admin','profile','notifications','saved','buzz','contact','polls','memories'];

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
      try { await loadScript(ver(base + 'hshs-labels.js'), 'hshs-labels'); } catch (e) {}
    } catch (e) {
      console.error('[HSHS] Core boot failed', e);
      document.documentElement.classList.add('hshs-js-failed');
      document.documentElement.classList.remove('hshs-js-booting');
      return;
    }

    try { await loadScript(ver(base + 'hshs-store.js'), 'hshs-store'); } catch (e) { console.warn('[HSHS] Data store unavailable', e); }
    try { await loadScript(ver(base + 'storage.js'), 'hshs-storage'); } catch (e) { console.warn('[HSHS] Storage layer unavailable', e); }
    try { await loadScript(ver(base + 'hshs-upload.js'), 'hshs-upload'); } catch (e) {}
    try { await loadScript(ver(base + 'hshs-filter-engine.js'), 'hshs-filter-engine'); } catch (e) {}
    try { await loadScript(ver(base + 'hshs-studio-stable.js'), 'hshs-studio-stable'); } catch (e) {}
    try { await loadScript(ver(base + 'core/store-sanitizer.js'), 'hshs-store-sanitizer'); } catch (e) { console.warn('[HSHS] Store sanitizer unavailable', e); }
    try { await loadScript(ver(base + 'components/loading.js'), 'hshs-comp-loading'); } catch (e) {}
    try { await loadScript(ver(base + 'components/error.js'), 'hshs-comp-error'); } catch (e) {}
    try { await loadScript(ver(base + 'components/shared-ui.js'), 'hshs-comp-shared'); } catch (e) {}
    try { await loadScript(ver(base + 'core/data.js'), 'hshs-core-data'); } catch (e) {}
    try { await loadScript(ver(base + 'core/lifecycle.js'), 'hshs-core-lifecycle'); } catch (e) {}
    try { await loadScript(ver(base + 'hshs-gsap.js'), 'hshs-gsap'); } catch (e) { console.warn('[HSHS] GSAP motion unavailable', e); }

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
