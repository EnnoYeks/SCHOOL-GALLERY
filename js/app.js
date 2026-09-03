import './compat/adapter.js';
import { init as loaderInit, show as showLoader, hide as hideLoader } from './components/loader.js';
import { init as navbarInit } from './components/navbar.js';
import { init as footerInit } from './components/footer.js';
import { init as notificationsInit } from './components/notifications.js';
import { connectRealtime } from './services/realtime.js';
/* router-enabled app.js (migration) — extended routes + component hooks */

function loadStylesAndWait(files, timeout = 10000) {
  const results = [];
  const promises = files.map(href => {
    const start = performance.now();
    // If a stylesheet with the exact href exists or a stylesheet with same path is already in document.styleSheets, resolve immediately
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      const dur = performance.now() - start;
      results.push({ href, status: 'already-linked', duration: dur });
      return Promise.resolve(href);
    }
    const alreadyLoaded = Array.from(document.styleSheets).some(s => s.href && s.href.includes(href.split('?')[0]));
    if (alreadyLoaded) {
      const dur = performance.now() - start;
      results.push({ href, status: 'already-loaded', duration: dur });
      return Promise.resolve(href);
    }

    return new Promise(resolve => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; const dur = performance.now() - start; results.push({ href, status: 'loaded', duration: dur }); resolve(href); } };
      l.onload = done;
      l.onerror = () => { results.push({ href, status: 'error', duration: performance.now() - start }); done(); };
      document.head.appendChild(l);
      // safety timeout
      setTimeout(() => { if (!resolved) { results.push({ href, status: 'timeout', duration: performance.now() - start }); done(); } }, timeout);
    });
  });

  return Promise.all(promises).then((res) => {
    // expose diagnostics
    try {
      window.__hshs_styles_report = results.slice();
      console.info('HSHS styles load report:');
      console.table(window.__hshs_styles_report.map(r => ({ href: r.href, status: r.status, duration_ms: Math.round(r.duration) })));
    } catch (e) { /* ignore */ }
    return res;
  });
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
  '/index/contat.html': 'pages/contat.js'
};

const App = {
  rootId: 'app-root',
  root: null,

  async init() {
    const styleFiles = [
      'css/hshs-no-flicker.css?v=260902c',
      'css/style.css?v=260902c',
      'css/animations.css?v=260902c',
      'css/responsive.css?v=260902c'
    ];

    // Ensure loader is available so we can show a visual while waiting for styles
    try { loaderInit(); } catch (e) { console.warn('loader init failed', e); }
    try { showLoader(); } catch (e) { /* ignore */ }

    // Wait for styles to load (or timeout) before initializing other components
    try {
      await loadStylesAndWait(styleFiles, 10000);
    } catch (e) { console.warn('style load wait failed', e); }

    this.root = document.getElementById(this.rootId);
    if (!this.root) {
      this.root = document.createElement('main');
      this.root.id = this.rootId;
      this.root.setAttribute('aria-live', 'polite');
      const nav = document.querySelector('nav.navbar');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(this.root, nav.nextSibling);
      else document.body.insertBefore(this.root, document.body.firstChild);
    }

    // Initialize shared components that rely on styles
    try { navbarInit(); } catch (e) { console.warn('navbar init failed', e); }
    try { footerInit(); } catch (e) { console.warn('footer init failed', e); }
    try { notificationsInit(); } catch (e) { console.warn('notifications init failed', e); }
    try { connectRealtime(); } catch (e) { console.warn('realtime connect failed', e); }

    this.injectHideStyles();
    this.bindLinkIntercepts();
    window.addEventListener('popstate', () => {
      const path = location.pathname === '/' ? '/index.html' : location.pathname;
      this.loadRoute(path, { replaceState: true });
    });

    const startPath = location.pathname === '/' ? '/index.html' : location.pathname;
    this.loadRoute(startPath, { replaceState: true }).catch(() => {});
  },

  injectHideStyles() {
    if (document.getElementById('app-legacy-hide-style')) return;
    const style = document.createElement('style');
    style.id = 'app-legacy-hide-style';
    style.textContent = `\n      .legacy-hidden { display: none !important; opacity: 0 !important; visibility: hidden !important; }\n      html.hshs-loading { cursor: progress; }\n    `;
    document.head.appendChild(style);
  },

  async loadRoute(path, { replaceState = false } = {}) {
    const key = (path === '/' || path === '') ? '/index.html' : path;
    const modulePath = ROUTES[key];
    if (!modulePath) return Promise.reject(new Error('no-route'));

    try {
      showLoader();
      const m = await import(`./${modulePath}`);
      let html = '';
      if (m.render && typeof m.render === 'function') html = await m.render();
      else if (m.default && typeof m.default === 'function') html = await m.default();
      else if (typeof m.default === 'string') html = m.default;
      else if (typeof m.html === 'string') html = m.html;

      if (html) this.root.innerHTML = html;

      try {
        // If the page init returns a promise, await it so loader stays until page wiring completes
        if (m.init && typeof m.init === 'function') await m.init({ root: this.root, path });
        else if (m.default && m.default.init && typeof m.default.init === 'function') await m.default.init({ root: this.root, path });
      } catch (e) { console.warn('page module init error', e); }

      // Let shared components re-run any page-specific wiring
      try { navbarInit(); } catch (e) { /* ignore */ }
      try { footerInit(); } catch (e) { /* ignore */ }
      try { notificationsInit(); } catch (e) { /* ignore */ }

      window.dispatchEvent(new CustomEvent('app:page:loaded', { detail: { path } }));
      if (replaceState) history.replaceState({}, '', path); else history.pushState({}, '', path);
      return Promise.resolve();
    } catch (err) {
      console.error('router loadRoute error', err);
      // Try static fallback
      try {
        const fallbackFetch = await fetch(key.startsWith('/') ? key.slice(1) : key, { cache: 'no-store' });
        if (fallbackFetch.ok) {
          const htmlText = await fallbackFetch.text();
          const parsed = new DOMParser().parseFromString(htmlText, 'text/html');
          const newRoot = parsed.querySelector('main') || parsed.body;
          if (newRoot) {
            this.root.innerHTML = newRoot.innerHTML;
            try { navbarInit(); } catch (e) {}
            try { footerInit(); } catch (e) {}
            try { notificationsInit(); } catch (e) {}
            window.dispatchEvent(new CustomEvent('app:page:loaded', { detail: { path } }));
            if (replaceState) history.replaceState({}, '', path); else history.pushState({}, '', path);
            return Promise.resolve();
          }
        }
      } catch (fallbackErr) {
        console.warn('fallback fetch failed', fallbackErr);
      }

      window.location.href = path;
      return Promise.reject(err);
    } finally { hideLoader(); }
  },

  bindLinkIntercepts() {
    document.addEventListener('click', (ev) => {
      if (ev.defaultPrevented) return;
      const a = ev.target.closest && ev.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
      if (!ROUTES[pathname]) return;
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      ev.preventDefault();
      this.loadRoute(pathname + url.search);
    });
  },

  showLoader() { showLoader(); },
  hideLoader() { hideLoader(); }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
else setTimeout(() => App.init(), 0);

export default App;
