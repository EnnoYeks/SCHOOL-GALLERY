(function () {
    if (window.__hshsBoot) return;
    window.__hshsBoot = true;

    var MIN_BOOT = 4000;
    var parts = { css: 0, dom: 0, shell: 0, fonts: 0, images: 0, page: 0, site: 0 };
    var weight = { css: 12, dom: 8, shell: 14, fonts: 8, images: 18, page: 10, site: 30 };
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
        return parts.css >= 1 && parts.dom >= 1 && parts.shell >= 1 && parts.fonts >= 1 && parts.images >= 1 && parts.page >= 1 && parts.site >= 1;
    }
    function paint(note) {
        var pct = total();
        if (fillEl) fillEl.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        if (labelEl && note) labelEl.textContent = note;
    }
    function catSvg() {
        return '<svg viewBox="0 0 120 100" aria-hidden="true">' +
            '<g class="tail"><path d="M78 52 C98 48 108 72 94 88 C88 94 78 88 82 78 C86 68 88 62 78 60" fill="#1a1a1e"/></g>' +
            '<ellipse class="body" cx="62" cy="56" rx="26" ry="17" fill="#1a1a1e"/>' +
            '<g class="head">' +
            '<circle cx="44" cy="36" r="16" fill="#1a1a1e"/>' +
            '<path d="M32 28 L29 12 L43 24Z" fill="#1a1a1e"/>' +
            '<path d="M46 24 L59 12 L56 28Z" fill="#1a1a1e"/>' +
            '<ellipse cx="40" cy="35" rx="3.3" ry="3.7" fill="#f4efe4"/>' +
            '<ellipse cx="50" cy="35" rx="3.3" ry="3.7" fill="#f4efe4"/>' +
            '<circle cx="40.5" cy="35.5" r="1.15" fill="#1a1a1e"/>' +
            '<circle cx="50.5" cy="35.5" r="1.15" fill="#1a1a1e"/>' +
            '</g>' +
            '<path d="M36 54 C28 56 24 62 30 64 C38 66 44 62 46 58" fill="#1a1a1e"/>' +
            '</svg>';
    }
    function campusSvg() {
        function win(x, y) {
            return '<rect x="' + x + '" y="' + y + '" width="10" height="14" rx="1"/>';
        }
        var windows = '';
        var cols = [52, 78, 104, 130, 156, 236, 262, 288, 380, 410, 440, 470, 500, 600, 710, 740, 770, 800, 900, 930, 960, 1060, 1090, 1120];
        cols.forEach(function (x, i) {
            windows += win(x, i % 3 === 0 ? 148 : 168);
            if (i % 2 === 0) windows += win(x, 188);
        });
        return '<svg viewBox="0 0 1200 280" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
            '<rect y="218" width="1200" height="62" fill="#061028"/>' +
            '<g fill="#0a1733">' +
            '<rect x="40" y="120" width="160" height="110"/>' +
            '<rect x="220" y="90" width="120" height="140"/>' +
            '<polygon points="220,90 280,48 340,90"/>' +
            '<rect x="360" y="130" width="200" height="100"/>' +
            '<rect x="580" y="70" width="90" height="160"/>' +
            '<rect x="690" y="110" width="170" height="120"/>' +
            '<rect x="880" y="95" width="140" height="135"/>' +
            '<polygon points="880,95 950,52 1020,95"/>' +
            '<rect x="1040" y="125" width="130" height="105"/>' +
            '</g>' +
            '<g fill="#eab308" opacity=".88">' + windows + '</g>' +
            '</svg>';
    }
    function mountSplash() {
        if (document.getElementById('hshs-boot')) return;
        document.documentElement.classList.add('hshs-booting');
        document.documentElement.classList.remove('hshs-ready');
        var box = document.createElement('div');
        box.id = 'hshs-boot';
        box.innerHTML =
            '<div class="hshs-boot-sky" aria-hidden="true">' +
            '<div class="hshs-boot-stars"></div>' +
            '<div class="hshs-boot-aurora a"></div>' +
            '<div class="hshs-boot-aurora b"></div>' +
            '<div class="hshs-boot-aurora c"></div>' +
            '<div class="hshs-boot-campus">' + campusSvg() + '</div>' +
            '<div class="hshs-boot-memories">' +
            '<figure class="hshs-boot-polaroid p1"><i></i></figure>' +
            '<figure class="hshs-boot-polaroid p2"><i></i></figure>' +
            '<figure class="hshs-boot-polaroid p3"><i></i></figure>' +
            '<figure class="hshs-boot-polaroid p4"><i></i></figure>' +
            '</div>' +
            '<div class="hshs-boot-grain"></div>' +
            '</div>' +
            '<div class="hshs-boot-stage">' +
            '<p class="hshs-boot-kicker">Hawthorne Scribner</p>' +
            '<div class="hshs-boot-track-wrap">' +
            '<div class="hshs-boot-cat" id="hshsBootCat">' + catSvg() + '</div>' +
            '<div class="hshs-boot-track"><div class="hshs-boot-fill" id="hshsBootFill"></div></div>' +
            '</div>' +
            '<div class="hshs-boot-copy"><strong>HSHS World</strong>' +
            '<small><span id="hshsBootNote">Opening the courtyard</span> · <span id="hshsBootPct">2%</span></small>' +
            '</div></div>';
        (document.body || document.documentElement).appendChild(box);
        fillEl = document.getElementById('hshsBootFill');
        labelEl = document.getElementById('hshsBootNote');
        pctEl = document.getElementById('hshsBootPct');
        paint('Opening the courtyard');
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
            setPart('css', marked / left, 'Gathering memories');
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
                setPart('images', marked / left, 'Warming the lights');
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
    function fileKey(href) {
        try {
            var f = (new URL(href, location.href).pathname.split('/').pop() || 'index.html').toLowerCase();
            if (!f) f = 'index.html';
            if (f === 'clips.html' || f === 'shorts.html') f = 'buzz.html';
            if (f === 'contact.html') f = 'contat.html';
            return f;
        } catch (e) { return href; }
    }
    function prefetchSite() {
        var cache = window.__hshsPageCache = window.__hshsPageCache || {};
        var nested = ['gallery.html','spotlight.html','buzz.html','photos.html','videos.html','trending.html','polls.html','memories.html','about.html','profile.html','settings.html','contat.html'];
        var inSub = location.pathname.indexOf('/index/') !== -1;
        var list = nested.map(function (f) {
            return new URL(inSub ? f : ('index/' + f), location.href).href;
        });
        list.push(new URL(inSub ? '../index.html' : 'index.html', location.href).href);
        var left = list.length, marked = 0;
        return Promise.all(list.map(function (href) {
            return fetch(href, { credentials: 'same-origin' }).then(function (res) {
                if (!res.ok) throw new Error('skip');
                return res.text();
            }).then(function (html) {
                cache[href] = html;
                cache[fileKey(href)] = html;
                marked += 1;
                setPart('site', marked / left, 'Loading pages');
            }).catch(function () {
                marked += 1;
                setPart('site', marked / left, 'Loading pages');
            });
        })).then(function () { setPart('site', 1, 'Site ready'); });
    }
    function finish() {
        if (done) return;
        done = true;
        Object.keys(parts).forEach(function (k) { parts[k] = 1; });
        paint('Ready');
        var wait = Math.max(0, MIN_BOOT - (Date.now() - started));
        setTimeout(function () {
            document.documentElement.classList.remove('hshs-booting');
            document.documentElement.classList.add('hshs-ready');
            var boot = document.getElementById('hshs-boot');
            if (boot) {
                boot.classList.add('is-off');
                setTimeout(function () { if (boot.parentNode) boot.remove(); }, 420);
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
    window.__hshsFileKey = fileKey;

    ensureCss();
    mountSplash();
    watchCss();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setPart('dom', 1, 'Page structure ready');
            mountSplash();
            prefetchSite();
        });
    } else {
        setPart('dom', 1, 'Page structure ready');
        prefetchSite();
    }
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
        setPart('fonts', 1); setPart('images', 1); setPart('page', 1); setPart('site', 1, 'Ready');
    }, 12000);
})();
