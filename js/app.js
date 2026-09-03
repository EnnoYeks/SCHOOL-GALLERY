import './compat/adapter.js';
import { init as loaderInit, show as showLoader, hide as hideLoader } from './components/loader.js';
import { init as navbarInit } from './components/navbar.js';
import { init as footerInit } from './components/footer.js';
import { init as notificationsInit } from './components/notifications.js';
import { connectRealtime } from './services/realtime.js';

const ROUTES = {
  '/': 'pages/home.js', '/index.html': 'pages/home.js', '/index/gallery.html': 'pages/gallery.js',
  '/index/photos.html': 'pages/photos.js', '/index/videos.html': 'pages/videos.js', '/index/trending.html': 'pages/trending.js',
  '/index/spotlight.html': 'pages/spotlight.js', '/index/polls.html': 'pages/polls.js', '/index/memories.html': 'pages/memories.js',
  '/index/profile.html': 'pages/profile.js', '/index/settings.html': 'pages/settings.js', '/index/admin.html': 'pages/admin.js',
  '/index/buzz.html': 'pages/buzz.js', '/index/saved.html': 'pages/saved.js', '/index/more.html': 'pages/more.js',
  '/index/clips.html': 'pages/clips.js', '/index/notifications.html': 'pages/notifications.js', '/index/about.html': 'pages/about.js',
  '/index/contact.html': 'pages/contact.js', '/index/contat.html': 'pages/contat.js'
};

const App = {
  rootId: 'app-root', root: null, linkHandlerBound: false,
  init() {
    this.root = document.getElementById(this.rootId);
    if (!this.root) { this.root = document.createElement('main'); this.root.id = this.rootId; this.root.setAttribute('aria-live', 'polite'); document.body.appendChild(this.root); }
    try { loaderInit(); } catch (e) { console.warn('loader init failed', e); }
    try { navbarInit(); } catch (e) { console.warn('navbar init failed', e); }
    try { footerInit(); } catch (e) { console.warn('footer init failed', e); }
    try { notificationsInit(); } catch (e) { console.warn('notifications init failed', e); }
    try { connectRealtime(); } catch (e) { console.warn('realtime connect failed', e); }
    this.bindLinkIntercepts();
    window.addEventListener('popstate', () => this.loadRoute(location.pathname, { replaceState: true }));
    this.loadRoute(location.pathname, { replaceState: true }).catch(() => {});
  },
  async loadRoute(pathname, { replaceState = false } = {}) {
    const key = (!pathname || pathname === '/') ? '/index.html' : pathname;
    const modulePath = ROUTES[key];
    if (!modulePath) { this.render404(pathname); return; }
    try {
      showLoader();
      const m = await import(`./${modulePath}`);
      const html = typeof m.render === 'function' ? await m.render() : (typeof m.default === 'function' ? await m.default() : (m.html || ''));
      this.root.innerHTML = html || '<div class="empty-state"><h1>Page is empty</h1></div>';
      if (typeof m.init === 'function') await m.init({ root: this.root, path: key });
      try { navbarInit(); } catch (e) {}
      try { footerInit(); } catch (e) {}
      try { notificationsInit(); } catch (e) {}
      window.dispatchEvent(new CustomEvent('app:page:loaded', { detail: { path: key } }));
      if (replaceState) history.replaceState({}, '', key); else if (location.pathname !== key) history.pushState({}, '', key);
    } catch (err) {
      console.error('Router error:', err);
      this.renderError(err);
      throw err;
    } finally { hideLoader(); }
  },
  render404(pathname) { this.root.innerHTML = `<section class="page-container hshs-page"><div class="empty-state"><i class="fas fa-map-signs"></i><h1>Page not found</h1><p>We couldn't find <strong>${String(pathname || '').replace(/[<>]/g, '')}</strong>.</p><a class="btn btn-primary" href="/">Back home</a></div></section>`; },
  renderError() { this.root.innerHTML = '<section class="page-container hshs-page"><div class="empty-state"><i class="fas fa-triangle-exclamation"></i><h1>Something went wrong</h1><p>HSHS World could not load this page. Please try again.</p><button class="btn btn-primary" onclick="location.reload()">Retry</button></div></section>'; },
  bindLinkIntercepts() {
    if (this.linkHandlerBound) return; this.linkHandlerBound = true;
    document.addEventListener('click', ev => {
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
      const a = ev.target.closest?.('a'); if (!a) return;
      const url = new URL(a.href, location.href); if (url.origin !== location.origin) return;
      const pathname = url.pathname === '/' ? '/index.html' : url.pathname; if (!ROUTES[pathname]) return;
      ev.preventDefault(); this.loadRoute(pathname);
    });
  },
  showLoader, hideLoader
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init()); else setTimeout(() => App.init(), 0);
export default App;
