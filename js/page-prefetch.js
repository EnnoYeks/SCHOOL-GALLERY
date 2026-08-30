// ============================================
// HSHS PAGE PREFETCH
// Warm page HTML in the background so navigation
// and swipe transitions can reveal an already-fetched page.
// ============================================

(function () {
    if (window.__hshsPagePrefetch) return;
    window.__hshsPagePrefetch = true;

    const PAGE_URLS = [
        '/index.html',
        '/index/gallery.html',
        '/index/spotlight.html',
        '/index/buzz.html',
        '/index/photos.html',
        '/index/videos.html',
        '/index/trending.html',
        '/index/polls.html',
        '/index/memories.html',
        '/index/about.html',
        '/index/contat.html',
        '/index/profile.html',
        '/index/settings.html'
    ];

    const cache = new Map();
    const pending = new Map();
    const nativeFetch = window.fetch.bind(window);

    function canonical(url) {
        try {
            const u = new URL(url, location.href);
            if (u.origin !== location.origin) return null;
            if (u.pathname.endsWith('/contact.html')) {
                u.pathname = u.pathname.replace(/contact\.html$/i, 'contat.html');
            }
            if (u.pathname.endsWith('/clips.html') || u.pathname.endsWith('/shorts.html')) {
                u.pathname = u.pathname.replace(/(clips|shorts)\.html$/i, 'buzz.html');
            }
            return u.href;
        } catch (e) {
            return null;
        }
    }

    async function fetchAndCache(url) {
        const key = canonical(url);
        if (!key) return null;
        if (cache.has(key)) return cache.get(key);
        if (pending.has(key)) return pending.get(key);

        const task = nativeFetch(key, {
            credentials: 'same-origin',
            cache: 'force-cache'
        }).then(async function (response) {
            if (!response.ok) return null;
            const text = await response.text();
            cache.set(key, text);
            return text;
        }).catch(function () {
            return null;
        }).finally(function () {
            pending.delete(key);
        });

        pending.set(key, task);
        return task;
    }

    // mobile-shell.js calls fetch() normally. Intercept only HTML page GETs
    // so a prefetched page can be returned instantly from memory.
    window.fetch = function (input, init) {
        const method = (init && init.method) || (input && input.method) || 'GET';
        const rawUrl = typeof input === 'string' ? input : (input && input.url);
        const key = method.toUpperCase() === 'GET' ? canonical(rawUrl) : null;

        if (key && /\.html(?:[?#].*)?$/i.test(new URL(key).pathname)) {
            if (cache.has(key)) {
                return Promise.resolve(new Response(cache.get(key), {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
                }));
            }

            return fetchAndCache(key).then(function (text) {
                if (text === null) return nativeFetch(input, init);
                return new Response(text, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
                });
            });
        }

        return nativeFetch(input, init);
    };

    window.__hshsPrefetch = function (url) {
        return fetchAndCache(url);
    };

    function warmAllPages() {
        const current = canonical(location.href);
        const queue = PAGE_URLS.filter(function (url) {
            return canonical(url) !== current;
        });

        let cursor = 0;
        const workers = Math.min(3, queue.length);

        function worker() {
            if (cursor >= queue.length) return;
            const url = queue[cursor++];
            fetchAndCache(url).finally(function () {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(worker, { timeout: 1200 });
                } else {
                    setTimeout(worker, 80);
                }
            });
        }

        for (let i = 0; i < workers; i++) worker();
    }

    // Do not compete with the first paint. Start warming pages once the
    // current screen is usable, then continue quietly in the background.
    function start() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(warmAllPages, { timeout: 1800 });
        } else {
            setTimeout(warmAllPages, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
