import './compat/adapter.js';
import { init as loaderInit, show as showLoader, hide as hideLoader } from './components/loader.js';
import { init as navbarInit } from './components/navbar.js';
import { init as footerInit } from './components/footer.js';
import { init as notificationsInit } from './components/notifications.js';
import { connectRealtime } from './services/realtime.js';

function assetPrefix() {
  return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
}

function fileName(path) {
  const raw = (path || location.pathname).split('?')[0];
  let file = (raw.split('/').pop() || 'index.html').toLowerCase();
  if (!file) file = 'index.html';
  if (file === 'clips.html' || file === 'shorts.html') file = 'buzz.html';
  if (file === 'contact.html') file = 'contat.html';
  return file;
}

function routeKey(path) {
  const file = fileName(path);
  if (file === 'index.html' || file === 'index') return '/index.html';
  return '/index/' + file;
}

const ROUTES = {
  '/': 'pages/home.js',
  '/index.html': 'pages/home.js',
  '/index/gallery.html': 'pages/gallery.js',
  '/index/photos.html': 'pages/photos.js',
  '/index/videos.html': 'pages/videos.js',
  '/index/trending.html': 'pages/trending.js',
  '/index/spotlight.html': 'pages/spotlight.js',
  '/index/polls.html': 'pages/polls.js',
  '/index/memories.html': 'pages/memories.js',
  '/index/profile.html': 'pages/profile.js',
  '/index/settings.html': 'pages/settings.js',
  '/index/admin.html': 'pages/admin.js',
  '/index/buzz.html': 'pages/buzz.js',
  '/index/saved.html': 'pages/saved.js',
  '/index/more.html': 'pages/more.js',
  '/index/clips.html': 'pages/clips.js',
  '/index/notifications.html': 'pages/notifications.js',
  '/index/about.html': 'pages/about.js',
  '/index/contact.html': 'pages/contact.js',
  '/index/contat.html': 'pages/contat.js',
  '/index/chat.html': 'pages/chat.js'
};

function loadStyles(files, timeout) {
  timeout = timeout || 8000;
  const prefix = assetPrefix();
  return Promise.all((files || []).map(function (href) {
    const url = href.indexOf('http') === 0 || href.indexOf('/') === 0 || href.indexOf('../') === 0 ? href : prefix + href;
    const bare = url.split('?')[0];
    if (document.querySelector('link[href="' + url + '"], link[href="' + bare + '"]')) return Promise.resolve(url);
    return new Promise(function (resolve) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = url;
      const done = function () { resolve(url); };
      l.onload = done;
      l.onerror = done;
      document.head.appendChild(l);
      setTimeout(done, timeout);
    });
  }));
}

function loadScriptsOnce(files) {
  const prefix = assetPrefix();
  return (files || []).reduce(function (chain, src) {
    return chain.then(function () {
      const url = src.indexOf('http') === 0 || src.indexOf('/') === 0 || src.indexOf('../') === 0 ? src : prefix + src;
      const bare = url.split('?')[0];
      const name = bare.split('/').pop();
      if ([].slice.call(document.scripts).some(function (s) { return (s.src || '').indexOf(name) !== -1; })) return;
      return new Promise(function (resolve) {
        const el = document.createElement('script');
        if (/hshs-chat\.js$/.test(name)) el.type = 'module';
        el.src = url;
        el.onload = resolve;
        el.onerror = resolve;
        document.body.appendChild(el);
      });
    });
  }, Promise.resolve());
}

function releaseBoot() {
  const r = document.documentElement;
  r.classList.remove('hshs-booting');
  r.classList.add('hshs-ready');
  if (document.body) document.body.classList.add('has-mobile-shell');
}

function alreadyPainted(root, module) {
  if (!root) return false;
  if (root.getAttribute('data-hydrated') === '1' && root.children.length) return true;
  const ids = (module && module.rootIds) || [];
  if (ids.length && ids.every(function (id) { return document.getElementById(id); })) return true;
  if (root.getAttribute('data-page') && root.children.length > 0) return true;
  const text = (root.textContent || '').replace(/\s+/g, ' ').trim();
  if (text.length > 40 && !/^loading/i.test(text)) return true;
  return false;
}

const App = {
  rootId: 'app-root',
  root: null,
  async init() {
    try { loaderInit(); } catch (e) {}
    loadStyles(['css/hshs-no-flicker.css?v=260903c','css/style.css','css/animations.css','css/responsive.css','css/mobile-shell.css?v=260903c','css/hshs-theme.css?v=260903c']).catch(function () {});
    this.root = document.getElementById(this.rootId);
    if (!this.root) {
      this.root = document.createElement('main');
      this.root.id = this.rootId;
      this.root.setAttribute('aria-live', 'polite');
      const nav = document.querySelector('nav.navbar');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(this.root, nav.nextSibling);
      else document.body.insertBefore(this.root, document.body.firstChild);
    }
    releaseBoot();
    try { navbarInit(); } catch (e) {}
    try { footerInit(); } catch (e) {}
    try { notificationsInit(); } catch (e) {}
    try { connectRealtime(); } catch (e) {}
    this.bindLinkIntercepts();
    window.addEventListener('popstate', () => {
      const path = location.pathname === '/' ? '/index.html' : location.pathname;
      this.loadRoute(path, { replaceState: true });
    });
    const startPath = location.pathname === '/' ? '/index.html' : location.pathname;
    this.loadRoute(startPath, { replaceState: true, initial: true }).catch(function () {});
  },
  async loadRoute(path, opts) {
    opts = opts || {};
    const initial = !!opts.initial;
    const replaceState = !!opts.replaceState;
    const key = routeKey(path);
    const modulePath = ROUTES[key];
    if (!modulePath) return;
    try {
      const m = await import('./' + modulePath);
      if (m.styles) await loadStyles(m.styles);
      if (m.bodyClass && document.body) m.bodyClass.split(/\s+/).forEach(function (cls) { if (cls) document.body.classList.add(cls); });
      const painted = alreadyPainted(this.root, m);
      if (!painted) {
        if (!initial) { try { showLoader(); } catch (e) {} }
        let html = '';
        if (typeof m.render === 'function') html = await m.render();
        else if (typeof m.html === 'string') html = m.html;
        if (html) {
          this.root.innerHTML = html;
          this.root.setAttribute('data-page', m.pageId || fileName(path).replace('.html', ''));
        }
      }
      this.root.setAttribute('data-hydrated', '1');
      if (m.scripts) await loadScriptsOnce(m.scripts);
      if (m.init) { try { await m.init({ root: this.root, path: path, hydrated: painted }); } catch (e) { console.warn(e); } }
      try { navbarInit(); } catch (e) {}
      try { footerInit(); } catch (e) {}
      try { notificationsInit(); } catch (e) {}
      releaseBoot();
      window.dispatchEvent(new CustomEvent('app:page:loaded', { detail: { path: path, hydrated: painted } }));
      if (!initial) {
        if (replaceState) history.replaceState({}, '', path);
        else history.pushState({}, '', path);
      }
    } catch (err) {
      console.error('router loadRoute error', err);
      releaseBoot();
      if (!initial) window.location.href = path;
    } finally {
      try { hideLoader(); } catch (e) {}
    }
  },
  bindLinkIntercepts() {
    if (window.__hshsMobileShell) return;
    document.addEventListener('click', (ev) => {
      if (ev.defaultPrevented) return;
      const a = ev.target.closest && ev.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return;
      let url;
      try { url = new URL(href, location.href); } catch (e) { return; }
      if (url.origin !== location.origin) return;
      const key = routeKey(url.pathname);
      if (!ROUTES[key]) return;
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      ev.preventDefault();
      this.loadRoute(url.pathname + url.search + url.hash);
    });
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { App.init(); });
else setTimeout(function () { App.init(); }, 0);

export default App;
