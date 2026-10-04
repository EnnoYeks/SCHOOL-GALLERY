(function () {
  'use strict';
  try { document.documentElement.classList.add('hshs-js-booting'); } catch (e) {}

  var BOOT_VER = '261002fast1';
  var TEMPLATE_NAMES = ['home','gallery','photos','videos','about','trending','more','search','spotlight','settings','chat','admin','profile','notifications','saved','buzz','contact','polls','memories'];
  var PAGE_ALIAS = { '': 'home', index: 'home', vibe: 'videos', studio: 'videos', clips: 'buzz', shorts: 'buzz', contat: 'contact' };
  var PAGE_CSS = {
    home: ['home.css', 'hshs-home-polish.css', 'hshs-vibe-home.css'],
    gallery: ['gallery.css', 'hshs-wave.css'],
    photos: ['photos.css', 'photos-campus.css'],
    videos: ['videos.css', 'vibe.css', 'hshs-hub.css'],
    buzz: ['buzz.css', 'hshs-wave.css'],
    chat: ['hshs-chat-ui.css', 'hshs-chat-desktop.css', 'hshs-chat.css'],
    about: ['hshs-about.css'],
    contact: ['hshs-contact.css'],
    admin: ['admin.css'],
    trending: ['trending.css', 'hshs-hub.css'],
    polls: ['polls.css', 'hshs-hub.css'],
    memories: ['memories.css'],
    more: ['hshs-more.css', 'hshs-hub.css'],
    search: ['hshs-search.css', 'hshs-account.css'],
    spotlight: ['spotlight.css'],
    settings: ['hshs-settings.css'],
    profile: ['hshs-profile.css', 'hshs-profile-photo.css'],
    notifications: ['hshs-account.css', 'hshs-hub.css'],
    saved: ['hshs-account.css']
  };

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

  function currentPageName() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase().replace(/\.html$/, '');
    return PAGE_ALIAS[file] || file || 'home';
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
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + BOOT_VER;
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

  function cssAlreadyIn(href) {
    var file = href.split('?')[0].split('/').pop();
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      if (h.indexOf(file) !== -1) return links[i];
    }
    return null;
  }

  function loadCssWait(href, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) return resolve();
      var existing = cssAlreadyIn(href);
      if (existing) {
        if (existing.sheet) return resolve();
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 700);
        return;
      }
      var l = document.createElement('link');
      if (id) l.id = id;
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = resolve;
      l.onerror = resolve;
      document.head.appendChild(l);
      setTimeout(resolve, 700);
    });
  }

  function loadTemplate(base, name) {
    var templateUrl = base + 'core/templates/' + name + '.js';
    var src = name === 'chat'
      ? templateUrl + '?v=260928chat1'
      : name === 'spotlight'
        ? templateUrl + '?v=261002spot1'
        : ver(templateUrl);
    return loadScript(src, 'hshs-tpl-' + name);
  }

  function markFoundation(page) {
    try {
      if (window.HshsRegistry && window.HshsApp) {
        var active = window.HshsRegistry.activeRoute();
        window.HshsApp.setState({
          currentRoute: active.route.appPath || active.route.path,
          currentPage: active.name,
          foundation: true
        });
        if (active.route.title) document.title = active.route.title;
      }
    } catch (e) {}
    if (window.HshsApp) {
      window.HshsApp.setState({ foundation: true });
      window.HshsApp.markReady();
    }
    document.dispatchEvent(new CustomEvent('hshs:foundation-ready', {
      detail: {
        version: (window.HshsApp && window.HshsApp.version) || '1.0.0-phase1',
        page: page,
        route: window.HshsRegistry ? window.HshsRegistry.activeRoute() : null
      }
    }));
    document.documentElement.classList.remove('hshs-js-booting');
    document.documentElement.classList.add('hshs-js-ready');
    try { if (window.HshsShell && window.HshsShell.ensureShell) window.HshsShell.ensureShell(); } catch (e) {}
  }

  async function boot() {
    var base = scriptBase();
    var cssBase = base.replace(/js\/?$/, 'css/');
    var page = currentPageName();
    try {
      add('preconnect', 'https://fonts.googleapis.com', 'hshs-gf-pre');
      add('preconnect', 'https://fonts.gstatic.com', 'hshs-gf-pre2', { crossorigin: '' });
      add('stylesheet', 'https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap', 'hshs-google-fonts');
      add('stylesheet', ver(cssBase + 'hshs-fonts.css'), 'hshs-fonts-css');
      add('stylesheet', ver(cssBase + 'hshs-official.css'), 'hshs-official-css');
      add('stylesheet', ver(cssBase + 'hshs-glass.css'), 'hshs-glass-css');
    } catch (e) {}

    try {
      await loadScript(ver(base + 'core/app.js'), 'hshs-core-app');
      await loadScript(ver(base + 'core/registry.js'), 'hshs-core-registry');
      try { await loadScript(ver(base + 'utils/dom.js'), 'hshs-utils-dom'); } catch (e) {}
      await loadScript(ver(base + 'core/render.js'), 'hshs-core-render');
      try { await loadScript(ver(base + 'hshs-route.js'), 'hshs-route'); } catch (e) {}

      var currentTpl = TEMPLATE_NAMES.indexOf(page) !== -1 ? page : 'home';
      try { await loadTemplate(base, currentTpl); } catch (e) {}

      var restTpl = TEMPLATE_NAMES.filter(function (n) { return n !== currentTpl; }).map(function (n) {
        return loadTemplate(base, n).catch(function () {});
      });

      await loadScript(ver(base + 'components/ui.js'), 'hshs-comp-ui');
      await loadScript(ver(base + 'components/shell.js'), 'hshs-comp-shell');

      var pageCss = PAGE_CSS[page] || [];
      await Promise.all(pageCss.map(function (file, i) {
        return loadCssWait(ver(cssBase + file), 'hshs-page-css-' + i);
      }));

      try { await loadScript(ver(base + 'hshs-store.js'), 'hshs-store'); } catch (e) { console.warn('[HSHS] Data store unavailable', e); }
    } catch (e) {
      console.error('[HSHS] Core boot failed', e);
      document.documentElement.classList.add('hshs-js-failed');
      document.documentElement.classList.remove('hshs-js-booting');
      return;
    }

    if (!window.HshsRender || !window.HshsUI || !window.HshsShell) {
      console.error('[HSHS] Foundation incomplete after load');
      document.documentElement.classList.add('hshs-js-failed');
      document.documentElement.classList.remove('hshs-js-booting');
      return;
    }

    markFoundation(page);

    (async function extras() {
      try { await Promise.all(restTpl); } catch (e) {}
      try { await loadScript(ver(base + 'router/history.js'), 'hshs-router-history'); } catch (e) {}
      try { await loadScript(ver(base + 'router/router.js'), 'hshs-router-main'); } catch (e) {}
      try { await loadScript(ver(base + 'hshs-labels.js'), 'hshs-labels'); } catch (e) {}
      try { await loadScript(ver(base + 'storage.js'), 'hshs-storage'); } catch (e) {}
      try { await loadScript(ver(base + 'hshs-upload.js'), 'hshs-upload'); } catch (e) {}
      try { await loadScript(ver(base + 'hshs-filter-engine.js'), 'hshs-filter-engine'); } catch (e) {}
      try { await loadScript(ver(base + 'hshs-studio-stable.js'), 'hshs-studio-stable'); } catch (e) {}
      try { await loadScript(ver(base + 'core/store-sanitizer.js'), 'hshs-store-sanitizer'); } catch (e) {}
      try { await loadScript(ver(base + 'components/loading.js'), 'hshs-comp-loading'); } catch (e) {}
      try { await loadScript(ver(base + 'components/error.js'), 'hshs-comp-error'); } catch (e) {}
      try { await loadScript(ver(base + 'components/shared-ui.js'), 'hshs-comp-shared'); } catch (e) {}
      try { await loadScript(ver(base + 'core/data.js'), 'hshs-core-data'); } catch (e) {}
      try { await loadScript(ver(base + 'core/lifecycle.js'), 'hshs-core-lifecycle'); } catch (e) {}
      try { await loadScript(ver(base + 'hshs-gsap.js'), 'hshs-gsap'); } catch (e) {}
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
