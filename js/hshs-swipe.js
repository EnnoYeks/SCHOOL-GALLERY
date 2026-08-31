(function () {
    if (window.__hshsSwipe) return;
    window.__hshsSwipe = true;
    if (!window.matchMedia('(max-width: 1024px)').matches) return;

    var ORDER = ['index.html','gallery.html','spotlight.html','buzz.html','photos.html','videos.html','trending.html','polls.html','memories.html'];
    var startX = 0, startY = 0, lastX = 0, lastT = 0, vx = 0;
    var tracking = false, locked = false, axis = null;

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
    function fileOf() {
        return (location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
    }
    function indexOf() {
        var f = fileOf();
        if (f === '' || f === 'index.html') return 0;
        if (f === 'clips.html' || f === 'shorts.html') f = 'buzz.html';
        var i = ORDER.indexOf(f);
        return i < 0 ? 0 : i;
    }
    function hrefFor(file) {
        var now = fileOf();
        var inSub = location.pathname.indexOf('/index/') !== -1 || (now !== 'index.html' && now !== '');
        if (file === 'index.html') return inSub ? '../index.html' : 'index.html';
        return inSub ? file : 'index/' + file;
    }
    function neighbor(dir) {
        var i = indexOf() + dir;
        if (i < 0 || i >= ORDER.length) return null;
        return { file: ORDER[i], href: hrefFor(ORDER[i]), label: ORDER[i].replace('.html','').replace('index','Home').replace('videos','Vibe') };
    }
    function stage() {
        var page = document.getElementById('hshs-page');
        if (!page) return null;
        var wrap = document.getElementById('hshs-cube-stage');
        if (!wrap) {
            wrap = document.createElement('div');
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
        return {
            wrap: document.getElementById('hshs-cube-stage'),
            cube: document.getElementById('hshs-cube'),
            next: document.getElementById('hshs-cube-next')
        };
    }
    function blocked(e) {
        if (document.body.classList.contains('search-open')) return true;
        if (document.getElementById('moreSheet') && document.getElementById('moreSheet').classList.contains('open')) return true;
        if (e.target.closest && (e.target.closest('.video-player-modal') || e.target.closest('.clip-sheet') || e.target.closest('.mobile-tabbar') || e.target.closest('.navbar'))) return true;
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
        tracking = true; locked = false; axis = null;
        startX = lastX = t.clientX; startY = t.clientY; lastT = Date.now(); vx = 0;
        var s = stage();
        if (s) { s.cube.classList.add('is-dragging'); s.cube.classList.remove('is-settle'); }
    }
    function onMove(e) {
        if (!tracking) return;
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (!axis) {
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
            axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
            if (axis === 'y') { tracking = false; return; }
        }
        if (axis !== 'x') return;
        e.preventDefault();
        locked = true;
        var now = Date.now();
        vx = (t.clientX - lastX) / Math.max(8, now - lastT);
        lastX = t.clientX; lastT = now;
        var w = window.innerWidth || 360;
        var deg = Math.max(-78, Math.min(78, (dx / w) * 82));
        var dir = dx < 0 ? 1 : -1;
        var n = neighbor(dir);
        var s = stage();
        if (s && s.next) s.next.textContent = n ? n.label.toUpperCase() : '';
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
        var should = n && (Math.abs(dx) > w * 0.28 || Math.abs(vx) > 0.55);
        if (!should) {
            setCube(0, false);
            return;
        }
        setCube(dir > 0 ? -90 : 90, false);
        setTimeout(function () {
            if (window.__hshsNavigate) window.__hshsNavigate(n.href);
            setTimeout(function () { setCube(0, false); }, 30);
        }, 420);
    }
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
