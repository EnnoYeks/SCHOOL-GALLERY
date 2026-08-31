(function () {
    if (window.__hshsSwipe) return;
    window.__hshsSwipe = true;
    if (!window.matchMedia('(max-width: 1024px)').matches) return;

    var ORDER = ['index.html','gallery.html','spotlight.html','buzz.html','photos.html','videos.html','trending.html','polls.html','memories.html'];
    var startX = 0, startY = 0, lastX = 0, lastT = 0, vx = 0;
    var tracking = false, axis = null, primed = null;

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
    function sizeCube() {
        var w = window.innerWidth || 360;
        document.documentElement.style.setProperty('--cube-z', (w / 2) + 'px');
    }
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
    function neighbor(dir) {
        var i = indexOf() + dir;
        if (i < 0 || i >= ORDER.length) return null;
        return { file: ORDER[i], href: new URL(hrefFor(ORDER[i]), location.href).href, label: ORDER[i].replace('.html','').replace('index','home').replace('videos','vibe') };
    }
    function extract(html) {
        try {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var box = document.createElement('div');
            Array.from(doc.body.children).forEach(function (el) {
                var cls = el.className ? String(el.className) : '';
                var id = el.id || '';
                if (el.tagName === 'SCRIPT') return;
                if (/animated-bg|navbar|mobile-tabbar|more-sheet|more-backdrop|hshs-boot|hshs-cube/.test(cls + ' ' + id)) return;
                box.appendChild(el.cloneNode(true));
            });
            return box.innerHTML;
        } catch (e) { return ''; }
    }
    function fillFace(n) {
        var s = stage();
        if (!s || !n) return;
        s.next.classList.toggle('is-left', n.dir < 0);
        var cache = window.__hshsPageCache || {};
        var html = cache[n.href] || cache[n.file];
        if (html) s.next.innerHTML = extract(html);
        else if (window.__hshsPageSkeleton) s.next.innerHTML = window.__hshsPageSkeleton(n.file);
        else s.next.innerHTML = '<div class="hshs-page-skel"><div class="sk-hero"></div></div>';
    }
    function stage() {
        var page = document.getElementById('hshs-page');
        if (!page) return null;
        if (!document.getElementById('hshs-cube-stage')) {
            var wrap = document.createElement('div');
            wrap.id = 'hshs-cube-stage';
            page.parentNode.insertBefore(wrap, page);
            var cube = document.createElement('div');
            cube.id = 'hshs-cube';
            wrap.appendChild(cube);
            cube.appendChild(page);
            var next = document.createElement('div');
            next.id = 'hshs-cube-next';
            cube.appendChild(next);
        }
        sizeCube();
        return {
            wrap: document.getElementById('hshs-cube-stage'),
            cube: document.getElementById('hshs-cube'),
            next: document.getElementById('hshs-cube-next')
        };
    }
    function blocked(e) {
        if (document.body.classList.contains('search-open')) return true;
        if (document.getElementById('moreSheet') && document.getElementById('moreSheet').classList.contains('open')) return true;
        if (e.target.closest && e.target.closest('.video-player-modal, .clip-sheet, .mobile-tabbar, .navbar, input, textarea')) return true;
        return false;
    }
    function setCube(deg, dragging) {
        var s = stage();
        if (!s) return;
        s.cube.classList.toggle('is-dragging', !!dragging);
        s.cube.classList.toggle('is-settle', !dragging);
        s.cube.style.transform = 'rotateY(' + deg + 'deg)';
    }
    function onStart(e) {
        if (blocked(e)) return;
        var t = e.touches ? e.touches[0] : e;
        tracking = true; axis = null; primed = null;
        startX = lastX = t.clientX; startY = t.clientY; lastT = Date.now(); vx = 0;
        stage();
    }
    function onMove(e) {
        if (!tracking) return;
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (!axis) {
            if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
            axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
            if (axis === 'y') { tracking = false; return; }
        }
        if (axis !== 'x') return;
        e.preventDefault();
        var now = Date.now();
        vx = (t.clientX - lastX) / Math.max(8, now - lastT);
        lastX = t.clientX; lastT = now;
        var dir = dx < 0 ? 1 : -1;
        var n = neighbor(dir);
        if (n && (!primed || primed.href !== n.href)) {
            primed = { href: n.href, file: n.file, dir: dir };
            fillFace(primed);
        }
        var w = window.innerWidth || 360;
        var deg = Math.max(-88, Math.min(88, (dx / w) * 90));
        setCube(deg, true);
    }
    function onEnd() {
        if (!tracking) return;
        tracking = false;
        if (axis !== 'x') { setCube(0, false); return; }
        var dx = lastX - startX;
        var w = window.innerWidth || 360;
        var dir = dx < 0 ? 1 : -1;
        var n = neighbor(dir);
        var should = n && (Math.abs(dx) > w * 0.26 || Math.abs(vx) > 0.5);
        if (!should) { setCube(0, false); return; }
        setCube(dir > 0 ? -90 : 90, false);
        setTimeout(function () {
            if (window.__hshsNavigate) window.__hshsNavigate(n.href);
            requestAnimationFrame(function () { setCube(0, false); });
        }, 520);
    }
    function boot() {
        addCss();
        sizeCube();
        stage();
        window.addEventListener('resize', sizeCube, { passive: true });
        document.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
