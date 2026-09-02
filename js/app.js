/* js/app.js — Phase 1 safe mount + router (migration/js-app-architecture)
   - Creates a safe #app-root mount at runtime (no index.html edits required)
   - Hydrates legacy content into #app-root only after a successful mount
   - Intercepts internal navigation for index/* pages (conservative)
   - Emits app:page:loaded after injecting new content so existing modules can reattach
   - Emits app:hydrated once legacy content is successfully hidden
*/

const App = {
  rootId: 'app-root',
  root: null,
  legacyNodes: [],

  init() {
    // Create mount point if missing
    this.root = document.getElementById(this.rootId);
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.id = this.rootId;
      this.root.setAttribute('aria-live', 'polite');
      // Place the mountpoint after the main navigation if present, otherwise at top of body
      const nav = document.querySelector('nav.navbar');
      if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(this.root, nav.nextSibling);
      } else {
        document.body.insertBefore(this.root, document.body.firstChild);
      }
    }

    this.injectLegacyHideStyles();
    this.bindLinkIntercepts();
    window.addEventListener('popstate', () => {
      const url = window.location.pathname + window.location.search;
      this.loadUrl(url, { replaceState: true });
    });

    // Hydrate legacy DOM into #app-root by cloning the region between nav and footer
    // We clone first so original DOM remains until we successfully attach behaviors
    this.hydrateLegacySafely();

    // Keep small accessibility hint
    this.root.setAttribute('data-app-mounted', 'true');
  },

  injectLegacyHideStyles() {
    if (document.getElementById('app-legacy-hide-style')) return;
    const style = document.createElement('style');
    style.id = 'app-legacy-hide-style';
    style.textContent = `
      /* Hidden legacy content after successful hydration */
      .legacy-hidden { display: none !important; opacity: 0 !important; visibility: hidden !important; }
      /* Small loading marker */
      html.hshs-loading { cursor: progress; }
    `;
    document.head.appendChild(style);
  },

  hydrateLegacySafely() {
    try {
      const nav = document.querySelector('nav.navbar');
      const footer = document.querySelector('footer.footer');
      const nodesToClone = [];
      if (nav) {
        // collect siblings after nav up to footer (exclusive)
        let node = nav.nextSibling;
        while (node && node.nodeType === Node.TEXT_NODE) node = node.nextSibling;
        while (node && node !== footer) {
          nodesToClone.push(node);
          node = node.nextSibling;
        }
      } else {
        // fallback: clone all top-level sections and main
        document.querySelectorAll('body > section, body > main').forEach(n => nodesToClone.push(n));
      }

      // clone nodes into app root
      nodesToClone.forEach(n => {
        try {
          const clone = n.cloneNode(true);
          this.root.appendChild(clone);
        } catch (err) {
          console.warn('App hydrate clone failed for', n, err);
        }
      });

      // store originals for later hiding when ready
      this.legacyNodes = nodesToClone;

      // Let other modules initialize on the cloned markup. Give a short delay to allow other scripts
      // that run on DOMContentLoaded to finish wiring up. Then validate and hide legacy originals.
      setTimeout(() => {
        try {
          // dispatch event so existing modules can re-run initialization on cloned DOM
          window.dispatchEvent(new CustomEvent('app:hydration:ready', { detail: { root: this.root } }));

          // Mark originals as legacy-hidden only after hydration event was emitted.
          this.legacyNodes.forEach(n => {
            if (n && n.classList) n.classList.add('legacy-hidden');
          });

          // Notify listeners that legacy content has been hidden
          window.dispatchEvent(new CustomEvent('app:hydrated', { detail: { root: this.root } }));
        } catch (err) {
          console.error('App hydration finalization failed', err);
        }
      }, 300);

    } catch (err) {
      console.error('hydrateLegacySafely failed', err);
    }
  },

  bindLinkIntercepts() {
    document.addEventListener('click', (ev) => {
      if (ev.defaultPrevented) return;
      const a = ev.target.closest && ev.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href) return;

      // Conservative check: same-origin and internal index/ path or root path
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return; // external

      const pathname = url.pathname;
      // Intercept only index-based pages (index/...). Also root and /index.html
      const shouldIntercept = pathname === '/' || pathname.endsWith('/index.html') || pathname.startsWith('/index/');
      if (!shouldIntercept) return;

      // allow open-in-new-tab
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;

      ev.preventDefault();
      this.loadUrl(pathname + url.search);
    });
  },

  async loadUrl(path, { replaceState = false } = {}) {
    try {
      this.showLoader();
      const candidate = (path === '/' || path === '' || path.endsWith('/')) ? (path.endsWith('/') ? path + 'index.html' : '/index.html') : path;
      const fetchPath = candidate.startsWith('/') ? candidate.slice(1) : candidate;
      const resp = await fetch(fetchPath, { cache: 'no-store' });
      if (!resp.ok) {
        console.warn('App: fetch failed', fetchPath, resp.status);
        window.location.href = path; // fallback
        return;
      }
      const html = await resp.text();
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const newRoot = parsed.querySelector('#app-root') || parsed.querySelector('main') || parsed.body;
      if (!newRoot) {
        console.warn('App: no mountable region found in fetched page', fetchPath);
        window.location.href = path; // fallback
        return;
      }

      // Replace our app root content
      this.root.innerHTML = newRoot.innerHTML;

      // Dispatch event so other modules can re-run their init on the inserted markup
      window.dispatchEvent(new CustomEvent('app:page:loaded', { detail: { path } }));

      if (replaceState) history.replaceState({}, '', path);
      else history.pushState({}, '', path);

    } catch (err) {
      console.error('App.loadUrl error', err);
      window.location.href = path; // fallback
    } finally {
      this.hideLoader();
    }
  },

  showLoader() { document.documentElement.classList.add('hshs-loading'); },
  hideLoader() { document.documentElement.classList.remove('hshs-loading'); }
};

// Auto-init on DOMContentLoaded but tolerant if already initialized
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  // already loaded
  setTimeout(() => App.init(), 0);
}

export default App;
