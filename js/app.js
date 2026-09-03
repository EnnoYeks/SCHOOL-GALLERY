window.__hshsJsApp = true;

import './compat/adapter.js';
import { init as loaderInit, show as showLoader, hide as hideLoader } from './components/loader.js';
import { init as navbarInit } from './components/navbar.js';
import { init as footerInit } from './components/footer.js';
import { init as notificationsInit } from './components/notifications.js';
import { connectRealtime } from './services/realtime.js';

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

function routeKey(pathname) {
  if (!pathname || pathname === '/') return '/index.html';
  try {
    const clean = decodeURIComponent(pathname).replace(/\\/g, '/');
    if (clean.endsWith('/index.html')) return '/index.html';
    if (clean.endsWith('/')) return '/index.html';
    return clean;
  } catch (_) {
    return pathname;
  }
}

function markPageReady(detail = {}) {
  const root = document.documentElement;
  root.classList.remove('hshs-booting');
  root.classList.add('hshs-ready');
  const boot = document.getElementById('hshs-boot');
  if (boot) {
    boot.classList.add('is-off');
    setTimeout(() => boot.remove(), 380);
  }
  window.dispatchEvent(new CustomEvent('app:page:loaded', { detail }));
}

function ensureMobilePageStyles() {
  if (document.getElementById('hshsMobileJsPageStyles')) return;
  const link = document.createElement('link');
  link.id = 'hshsMobileJsPageStyles';
  link.rel = 'stylesheet';
  link.href = '/css/mobile-js-pages.css?v=260903c';
  document.head.appendChild(link);
}

function safeInit(fn, label) {
  try { if (typeof fn === 'function') fn(); }
  catch (e) { console.warn(label + ' failed', e); }
}

const App = {
  rootId: 'app-root',
  root: null,
  linkHandlerBound: false,

  init() {
    this.root = document.getElementById(this.rootId);
    if (!this.root) {
      this.root = document.createElement('main');
      this.root.id = this.rootId;
      this.root.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.root);
    }
    ensureMobilePageStyles();
    safeInit(loaderInit, 'loader init');
    safeInit(navbarInit, 'navbar init');
    safeInit(footerInit, 'footer init');
    safeInit(notificationsInit, 'notifications init');
    safeInit(connectRealtime, 'realtime connect');
    this.bindLinkIntercepts();
    window.addEventListener('popstate', () => this.loadRoute(location.pathname + location.search, { replaceState: true }));
    this.loadRoute(location.pathname + location.search, { replaceState: true }).catch(() => {
      markPageReady({ path: location.pathname, failed: true });
    });
    setTimeout(() => {
      if (document.documentElement.classList.contains('hshs-booting')) markPageReady({ timeout: true });
    }, 2800);
  },

  async loadRoute(urlPath, { replaceState = false } = {}) {
    const url = new URL(urlPath || '/', location.origin);
    const key = routeKey(url.pathname);
    const modulePath = ROUTES[key] || ROUTES['/' + key.replace(/^\//, '')];
    if (!modulePath) {
      this.render404(url.pathname);
      markPageReady({ path: key, missing: true });
      return;
    }
    try {
      showLoader();
      const m = await import(`./${modulePath}`);
      const html = typeof m.render === 'function'
        ? await m.render()
        : (typeof m.default === 'function' ? await m.default() : (m.html || ''));
      this.root.innerHTML = html || '<div class="empty-state"><h1>Page is empty</h1></div>';
      if (typeof m.init === 'function') await m.init({ root: this.root, path: key, search: url.search });
      safeInit(navbarInit, 'navbar init');
      safeInit(footerInit, 'footer init');
      safeInit(notificationsInit, 'notifications init');
      markPageReady({ path: key, search: url.search });
      const target = key + url.search;
      if (replaceState) history.replaceState({ path: target }, '', target);
      else if (location.pathname + location.search !== target) history.pushState({ path: target }, '', target);
    } catch (err) {
      console.error('Router error:', err);
      this.renderError();
      markPageReady({ path: key, error: true });
    } finally {
      hideLoader();
    }
  },

  render404(pathname) {
    const safe = String(pathname || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
    this.root.innerHTML = `<section class="page-container hshs-page"><div class="empty-state"><i class="fas fa-map-signs"></i><h1>Page not found</h1><p>We couldn't find <strong>${safe}</strong>.</p><a class="btn btn-primary" href="/index.html">Back home</a></div></section>`;
  },

  renderError() {
    this.root.innerHTML = '<section class="page-container hshs-page"><div class="empty-state"><i class="fas fa-triangle-exclamation"></i><h1>Something went wrong</h1><p>HSHS World could not load this page. Please try again.</p><button class="btn btn-primary" onclick="location.reload()">Retry</button></div></section>';
  },

  bindLinkIntercepts() {
    if (this.linkHandlerBound) return;
    this.linkHandlerBound = true;
    document.addEventListener('click', ev => {
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      const a = ev.target.closest?.('a');
      if (!a || !a.getAttribute('href')) return;
      let url;
      try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      const pathname = routeKey(url.pathname);
      if (!ROUTES[pathname]) return;
      ev.preventDefault();
      this.loadRoute(pathname + url.search);
    });
  },

  showLoader,
  hideLoader
};

window.App = App;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
else setTimeout(() => App.init(), 0);
export default App;
