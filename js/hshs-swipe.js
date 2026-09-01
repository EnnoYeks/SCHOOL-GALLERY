(function () {
    if (window.__hshsSwipe) return;
    window.__hshsSwipe = true;
    if (!window.matchMedia('(max-width: 1024px)').matches) return;

    var ORDER = ['index.html','gallery.html','spotlight.html','buzz.html','photos.html','videos.html','trending.html','polls.html','memories.html','chat.html'];
    var startX = 0, startY = 0, lastX = 0, lastT = 0, vx = 0;
    var tracking = false, axis = null, primed = null, pendingNav = null, dir = 1;
    var x = 0, v = 0, target = 0, running = false;

    function addCss() {
        if (document.getElementById('hshs-swipe-css')) return;
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-swipe.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-swipe.css' : 'css/hshs-swipe.css');
        var link = document.createElement('link');
        link.id = 'hshs-swipe-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    function width() { return (window.innerWidth || 360); }
    function fileOf() {
        var f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (!f || f === 'index.html') return 'index.html';
        if (f === 'clips.html' || f === 'shorts.html') return 'buzz.html';
        return f;
    }
    function indexOf() {
        var i = ORDER.indexOf(fileOf());
        return i < 0 ? 0 : i;
    }
    function hrefFor(file) {
        var inSub = location.pathname.indexOf('/index/') !== -1 || fileOf() !== 'index.html';
        if (file === 'index.html') return inSub ? '../index.html' : 'index.html';
        return inSub ? file : 'index/' + file;
    }
    function neighbor(d) {
        var i = indexOf() + d;
        if (i < 0 || i >= ORDER.length) return null;
        return { file: ORDER[i], href: new URL(hrefFor(ORDER[i]), location.href).href, dir: d };
    }
    function extract(html) {
        try {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var box = document.createElement('div');
            Array.from(doc.body.children).forEach(function (el) {
                var cls = el.className ? String(el.className) : '';
                var id = el.id || '';
                if (el.tagName === 'SCRIPT') return;
                if (/animated-bg|navbar|mobile-tabbar|more-sheet|more-backdrop|hshs-boot|hshs-cube|hshs-swipe/.test(cls + ' ' + id)) return;
                box.appendChild(el.cloneNode(true));
            });
            return box.innerHTML;
        } catch (e) { return ''; }
    }
    function fillNext(n) {
        var s = stage();
        if (!s || !n) return;
        var cache = window.__hshsPageCache || {};
        var html = cache[n.href] || cache[n.file];
        if (html) s.next.innerHTML = extract(html);
        else if (window.__hshsPageSkeleton) s.next.innerHTML = window.__hshsPageSkeleton(n.file);
        else s.next.innerHTML = '';
    }
    function stage() {
        var page = document.getElementById('hshs-page');
        if (!page) return null;
        var wrap = document.getElementById('hshs-swipe-stage');
        if (!wrap) {
            var old = document.getElementById('hshs-cube-stage');
            wrap = document.createElement('div');
            wrap.id = 'hshs-swipe-stage';
            if (old && old.parentNode) {
                old.parentNode.insertBefore(wrap, old);
                if (page.parentNode) page.parentNode.removeChild(page);
                old.parentNode.removeChild(old);
            } else {
                page.parentNode.insertBefore(wrap, page);
            }
            wrap.appendChild(page);
            var next = document.createElement('div');
            next.id = 'hshs-swipe-next';
            wrap.appendChild(next);
        }
        return {
            wrap: wrap,
            page: document.getElementById('hshs-page'),
            next: document.getElementById('hshs-swipe-next')
        };
    }
    function blocked(e) {
        if (!document.documentElement.classList.contains('hshs-ready')) return true;
        if (document.body.classList.contains('search-open')) return true;
        if (document.body.classList.contains('upload-open')) return true;
        if (document.getElementById('moreSheet') && document.getElementById('moreSheet').classList.contains('open')) return true;
        if (e.target.closest && e.target.closest(
            '.video-player-modal, .clip-sheet, .mobile-tabbar, .navbar, input, textarea, ' +
            '.category-filter, .filter-bar, .vibe-tabs, .video-tabs, .trending-filters, ' +
            '.tab-btn, [role="tablist"], .story-bar, .photos-search, .content-filter, ' +
            '.category-btn, .filter-btn, .vibe-tab, .video-tab, .hshs-upload-studio, ' +
            '.hshs-thread-compose, .hshs-rec-bar, #hshsVoiceBtn'
        )) return true;
        return false;
    }
    function paint() {
        var s = stage();
        if (!s) return;
        var w = width();
        var p = Math.min(1, Math.abs(x) / w);
        var scale = 1 - p * 0.04;
        s.page.style.transform = 'translate3d(' + x + 'px,0,0) scale(' + scale + ')';
        s.next.style.transform = 'translate3d(' + (x + dir * w) + 'px,0,0)';
        s.next.style.opacity = String(0.55 + p * 0.45);
    }
    function finishNav() {
        if (!pendingNav) return;
        var href = pendingNav;
        pendingNav = null;
        x = 0; v = 0; target = 0;
        paint();
        if (window.__hshsNavigate) window.__hshsNavigate(href);
        requestAnimationFrame(function () {
            x = 0; v = 0; target = 0;
            var s = stage();
            if (s) {
                s.page.style.transform = '';
                s.next.style.transform = 'translate3d(' + width() + 'px,0,0)';
                s.next.innerHTML = '';
            }
        });
    }
    function tick() {
        if (running) return;
        running = true;
        var last = performance.now();
        function frame(now) {
            var dt = Math.min(0.032, (now - last) / 1000);
            last = now;
            if (window.HshsSpring && !(window.HshsSpring.reduced && window.HshsSpring.reduced())) {
                var next = window.HshsSpring.step({ x: x, v: v }, target, dt, 180, 26, 1);
                x = next.x; v = next.v;
                paint();
                if (next.rest) {
                    running = false;
                    x = target; v = 0; paint();
                    if (Math.abs(target) > width() * 0.5) finishNav();
                    return;
                }
                requestAnimationFrame(frame);
                return;
            }
            x = target; v = 0; running = false; paint();
            if (Math.abs(target) > width() * 0.5) finishNav();
        }
        requestAnimationFrame(frame);
    }
    function onStart(e) {
        if (blocked(e)) return;
        var t = e.touches ? e.touches[0] : e;
        tracking = true; axis = null; primed = null;
        startX = lastX = t.clientX; startY = t.clientY; lastT = Date.now(); vx = 0;
        running = false;
        stage();
    }
    function onMove(e) {
        if (!tracking) return;
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (!axis) {
            if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
            axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
            if (axis === 'y') { tracking = false; return; }
        }
        if (axis !== 'x') return;
        e.preventDefault();
        var now = Date.now();
        vx = (t.clientX - lastX) / Math.max(8, now - lastT);
        lastX = t.clientX; lastT = now;
        dir = dx < 0 ? 1 : -1;
        var n = neighbor(dir);
        if (!n) {
            x = dx * 0.28;
            paint();
            return;
        }
        if (!primed || primed.href !== n.href) {
            primed = n;
            fillNext(n);
        }
        var w = width();
        x = Math.max(-w, Math.min(w, dx));
        paint();
    }
    function onEnd() {
        if (!tracking) return;
        tracking = false;
        if (axis !== 'x') { pendingNav = null; target = 0; tick(); return; }
        var w = width();
        var n = neighbor(dir);
        var should = n && (Math.abs(x) > w * 0.28 || Math.abs(vx) > 0.45);
        v = vx * 1000;
        if (!should) { pendingNav = null; target = 0; tick(); return; }
        pendingNav = n.href;
        target = dir > 0 ? -w : w;
        tick();
    }
    document.addEventListener('hshs:page', function () {
        x = 0; v = 0; target = 0; pendingNav = null; running = false;
        var s = stage();
        if (s) {
            s.page.style.transform = '';
            s.next.style.transform = 'translate3d(' + width() + 'px,0,0)';
        }
    });
    function boot() {
        addCss();
        stage();
        document.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
