(function () {
    if (window.__hshsBoot) return;
    window.__hshsBoot = true;

    var MIN_BOOT = 280;
    var parts = { css: 0, dom: 0, shell: 0, fonts: 0, images: 0, page: 0 };
    var weight = { css: 18, dom: 12, shell: 20, fonts: 10, images: 28, page: 12 };
    var done = false;
    var started = Date.now();
    var labelEl, fillEl, pctEl;

    function total() {
        var n = 0;
        Object.keys(parts).forEach(function (k) { n += parts[k] * weight[k]; });
        return Math.max(2, Math.min(100, Math.round(n)));
    }
    function setPart(name, value, note) {
        if (done) return;
        parts[name] = Math.max(parts[name], Math.min(1, value));
        paint(note);
        if (ready()) finish();
    }
    function ready() {
        return parts.css >= 1 && parts.dom >= 1 && parts.shell >= 1 && parts.fonts >= 1 && parts.images >= 1 && parts.page >= 1;
    }
    function paint(note) {
        var pct = total();
        if (fillEl) fillEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        if (labelEl && note) labelEl.textContent = note;
    }
    function catSvg() {
        return '<svg viewBox="0 0 120 100" aria-hidden="true">' +
            '<g class="tail"><path d="M78 52 C98 48 108 72 94 88 C88 94 78 88 82 78 C86 68 88 62 78 60" fill="#2a2a2e"/></g>' +
            '<ellipse class="body" cx="62" cy="56" rx="26" ry="17" fill="#2a2a2e"/>' +
            '<g class="head">' +
            '<circle cx="44" cy="36" r="16" fill="#2a2a2e"/>' +
            '<path d="M32 28 L29 12 L43 24Z" fill="#2a2a2e"/>' +
            '<path d="M46 24 L59 12 L56 28Z" fill="#2a2a2e"/>' +
            '<ellipse cx="40" cy="35" rx="3.3" ry="3.7" fill="#fff"/>' +
            '<ellipse cx="50" cy="35" rx="3.3" ry="3.7" fill="#fff"/>' +
            '<circle cx="40.5" cy="35.5" r="1.15" fill="#2a2a2e"/>' +
            '<circle cx="50.5" cy="35.5" r="1.15" fill="#2a2a2e"/>' +
            '</g>' +
            '<path d="M36 54 C28 56 24 62 30 64 C38 66 44 62 46 58" fill="#2a2a2e"/>' +
            '</svg>';
    }
    function mountSplash() {
        if (document.getElementById('hshs-boot')) return;
        document.documentElement.classList.add('hshs-booting');
        document.documentElement.classList.remove('hshs-ready');
        var box = document.createElement('div');
        box.id = 'hshs-boot';
        box.innerHTML =
            '<div class="hshs-boot-stage">' +
            '<div class="hshs-boot-track-wrap">' +
            '<div class="hshs-boot-cat" id="hshsBootCat">' + catSvg() + '</div>' +
            '<div class="hshs-boot-track"><div class="hshs-boot-fill" id="hshsBootFill"></div></div>' +
            '</div>' +
            '<div class="hshs-boot-copy"><strong>HSHS World</strong>' +
            '<small><span id="hshsBootNote">Opening school pages</span> · <span id="hshsBootPct">2%</span></small>' +
            '</div></div>';
        (document.body || document.documentElement).appendChild(box);
        fillEl = document.getElementById('hshsBootFill');
        labelEl = document.getElementById('hshsBootNote');
        pctEl = document.getElementById('hshsBootPct');
        paint('Opening school pages');
    }
    function ensureCss() {
        if (document.getElementById('hshs-boot-css')) return;
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-boot.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-boot.css' : 'css/hshs-boot.css');
        var link = document.createElement('link');
        link.id = 'hshs-boot-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.insertBefore(link, document.head.firstChild);
    }
    function watchCss() {
        var links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        if (!links.length) { setPart('css', 1, 'Styles ready'); return; }
        var left = links.length, marked = 0;
        function one() {
            marked += 1;
            setPart('css', marked / left, 'Loading styles');
            if (marked >= left) setPart('css', 1, 'Styles ready');
        }
        links.forEach(function (link) {
            if (link.sheet) { one(); return; }
            link.addEventListener('load', one, { once: true });
            link.addEventListener('error', one, { once: true });
        });
        setTimeout(function () { setPart('css', 1, 'Styles ready'); }, 2500);
    }
    function watchImages(scope) {
        var root = scope || document;
        var imgs = Array.from(root.querySelectorAll('img')).filter(function (img) {
            return !img.closest('#hshs-boot');
        });
        if (!imgs.length) { setPart('images', 1, 'Pictures ready'); return Promise.resolve(); }
        var left = imgs.length, marked = 0;
        return new Promise(function (resolve) {
            function one() {
                marked += 1;
                setPart('images', marked / left, 'Loading pictures');
                if (marked >= left) { setPart('images', 1, 'Pictures ready'); resolve(); }
            }
            imgs.forEach(function (img) {
                if (img.complete && img.naturalWidth) { one(); return; }
                img.addEventListener('load', one, { once: true });
                img.addEventListener('error', one, { once: true });
            });
            setTimeout(function () { setPart('images', 1, 'Pictures ready'); resolve(); }, 3500);
        });
    }
    function finish() {
        if (done) return;
        done = true;
        parts.css = parts.dom = parts.shell = parts.fonts = parts.images = parts.page = 1;
        paint('Ready');
        var wait = Math.max(0, MIN_BOOT - (Date.now() - started));
        setTimeout(function () {
            document.documentElement.classList.remove('hshs-booting');
            document.documentElement.classList.add('hshs-ready');
            var boot = document.getElementById('hshs-boot');
            if (boot) {
                boot.classList.add('is-off');
                setTimeout(function () { if (boot.parentNode) boot.remove(); }, 280);
            }
        }, wait);
    }
    function repeat(html, n) {
        var out = '';
        for (var i = 0; i < n; i++) out += html;
        return out;
    }
    function pageSkeleton(file) {
        file = (file || '').toLowerCase();
        var tabs = '<div class="sk-tabs"><i></i><i></i><i></i><i></i></div>';
        var playGrid = '<div class="sk-play-grid">' + repeat('<article class="sk-play"><span class="sk-play-btn"></span></article>', 4) + '</div>';
        var playList = '<div class="sk-play-list">' + repeat('<div class="sk-play-row"><div class="thumb"></div><div><div class="sk-line"></div><div class="sk-line s"></div></div></div>', 4) + '</div>';
        var photos = '<div class="sk-photo-grid">' + repeat('<article class="sk-photo"></article>', 6) + '</div>';
        var rows = repeat('<div class="sk-row"></div>', 4);
        if (file.indexOf('videos') !== -1) return '<div class="hshs-page-skel"><div class="sk-hero"></div>' + tabs + playGrid + playList + '</div>';
        if (file.indexOf('buzz') !== -1 || file.indexOf('clips') !== -1) return '<div class="hshs-page-skel"><div class="sk-buzz"></div></div>';
        if (file.indexOf('gallery') !== -1 || file.indexOf('photos') !== -1) return '<div class="hshs-page-skel">' + tabs + photos + '</div>';
        if (file.indexOf('spotlight') !== -1 || file.indexOf('polls') !== -1 || file.indexOf('memories') !== -1) return '<div class="hshs-page-skel"><div class="sk-hero"></div>' + rows + '</div>';
        if (file.indexOf('profile') !== -1) return '<div class="hshs-page-skel"><div class="sk-avatar"></div>' + rows + '</div>';
        return '<div class="hshs-page-skel"><div class="sk-hero"></div><div class="sk-stats"><div class="sk-stat"></div><div class="sk-stat"></div><div class="sk-stat"></div><div class="sk-stat"></div></div>' + photos + '</div>';
    }
    window.__hshsBootMark = setPart;
    window.__hshsPageSkeleton = pageSkeleton;
    window.__hshsWaitImages = watchImages;
    window.__hshsMinSkel = 0;
    window.__hshsHold = function () { return Promise.resolve(); };

    ensureCss();
    mountSplash();
    watchCss();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setPart('dom', 1, 'Page structure ready');
            mountSplash();
        });
    } else setPart('dom', 1, 'Page structure ready');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setPart('fonts', 1, 'Text ready'); });
    else setPart('fonts', 1, 'Text ready');
    setTimeout(function () { setPart('fonts', 1, 'Text ready'); }, 1800);
    var shellTries = 0;
    var shellTimer = setInterval(function () {
        if (window.__hshsMobileShell || ++shellTries > 80) {
            clearInterval(shellTimer);
            setPart('shell', 1, 'App shell ready');
        }
    }, 50);
    watchImages(document).then(function () { setPart('page', 1, 'Content ready'); });
    window.addEventListener('load', function () {
        setPart('css', 1); setPart('dom', 1); setPart('fonts', 1);
        setPart('images', 1); setPart('page', 1, 'Ready');
        setPart('shell', 1, 'Ready');
    });
    setTimeout(function () {
        setPart('css', 1); setPart('dom', 1); setPart('shell', 1);
        setPart('fonts', 1); setPart('images', 1); setPart('page', 1, 'Ready');
    }, 8000);
})();
