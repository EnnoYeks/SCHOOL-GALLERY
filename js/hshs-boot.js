(function () {
    if (window.__hshsBoot) return;
    window.__hshsBoot = true;

    var MIN_BOOT = 2400;
    var BADGE = 'https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png';
    var parts = { css: 0, dom: 0, shell: 0, fonts: 0, images: 0, page: 0, site: 0 };
    var done = false;
    var started = Date.now();

    function setPart(name, value) {
        if (done) return;
        parts[name] = Math.max(parts[name], Math.min(1, value));
        if (coreReady()) finish();
    }
    function coreReady() {
        return parts.css >= 1 && parts.dom >= 1 && parts.shell >= 1 && parts.fonts >= 1 && parts.page >= 1;
    }
    function mountSplash() {
        document.documentElement.classList.add('hshs-booting');
        var box = document.getElementById('hshs-boot');
        if (!box) {
            box = document.createElement('div');
            box.id = 'hshs-boot';
            (document.body || document.documentElement).appendChild(box);
        }
        box.innerHTML =
            '<div class="hshs-boot-card">' +
            '<img class="hshs-boot-badge" src="' + BADGE + '" alt="">' +
            '<div class="hshs-boot-dots" aria-hidden="true"><i></i><i></i><i></i></div>' +
            '</div>';
        var mobile = window.matchMedia('(max-width: 1024px)').matches;
        document.documentElement.classList.toggle('hshs-device-mobile', mobile);
        document.documentElement.classList.toggle('hshs-device-desktop', !mobile);
        var cover = document.getElementById('hshs-tt-overlay');
        if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
    }
    function ensureCss() {
        if (document.getElementById('hshs-boot-css')) return;
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-boot.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-boot.css' : 'css/hshs-boot.css');
        if (href.indexOf('?') === -1 && window.__hshsAssetVer) href += '?v=' + window.__hshsAssetVer;
        var link = document.createElement('link');
        link.id = 'hshs-boot-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.insertBefore(link, document.head.firstChild);
    }
    function watchCss() {
        var links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        if (!links.length) { setPart('css', 1); return; }
        var left = links.length, marked = 0;
        function one() {
            marked += 1;
            if (marked >= left) setPart('css', 1);
            else setPart('css', marked / left);
        }
        links.forEach(function (link) {
            if (link.sheet) { one(); return; }
            link.addEventListener('load', one, { once: true });
            link.addEventListener('error', one, { once: true });
        });
        setTimeout(function () { setPart('css', 1); }, 1400);
    }
    function watchImages(scope) {
        var root = scope || document;
        var imgs = Array.from(root.querySelectorAll('img')).filter(function (img) {
            return !img.closest('#hshs-boot');
        });
        if (!imgs.length) { setPart('images', 1); return Promise.resolve(); }
        var left = imgs.length, marked = 0;
        return new Promise(function (resolve) {
            function one() {
                marked += 1;
                if (marked >= left) { setPart('images', 1); resolve(); }
                else setPart('images', marked / left);
            }
            imgs.forEach(function (img) {
                if (img.complete && img.naturalWidth) { one(); return; }
                img.addEventListener('load', one, { once: true });
                img.addEventListener('error', one, { once: true });
            });
            setTimeout(function () { setPart('images', 1); resolve(); }, 1800);
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
                setPart('site', marked / left);
            }).catch(function () {
                marked += 1;
                setPart('site', marked / left);
            });
        })).then(function () { setPart('site', 1); });
    }
    function reveal() {
        window.__hshsBootDone = true;
        document.documentElement.classList.remove('hshs-booting');
        document.documentElement.classList.add('hshs-ready');
        var boot = document.getElementById('hshs-boot');
        if (boot) {
            boot.classList.add('is-off');
            setTimeout(function () { if (boot.parentNode) boot.remove(); }, 380);
        }
        var cover = document.getElementById('hshs-tt-overlay');
        if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
    }
    function finish() {
        if (done) return;
        done = true;
        Object.keys(parts).forEach(function (k) { parts[k] = 1; });
        var wait = Math.max(0, MIN_BOOT - (Date.now() - started));
        setTimeout(reveal, wait);
    }
    function pageSkeleton(file) {
        file = (file || '').toLowerCase();
        function repeat(html, n) {
            var out = '';
            for (var i = 0; i < n; i++) out += html;
            return out;
        }
        if (file.indexOf('buzz') !== -1 || file.indexOf('clips') !== -1) return '<div class="hshs-page-skel"><div class="sk-buzz"></div></div>';
        if (file.indexOf('gallery') !== -1 || file.indexOf('photos') !== -1) return '<div class="hshs-page-skel"><div class="sk-photo-grid">' + repeat('<article class="sk-photo"></article>', 6) + '</div></div>';
        return '<div class="hshs-page-skel"><div class="sk-hero"></div>' + repeat('<div class="sk-row"></div>', 4) + '</div>';
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
            setPart('dom', 1);
            mountSplash();
            prefetchSite();
        });
    } else {
        setPart('dom', 1);
        prefetchSite();
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setPart('fonts', 1); });
    else setPart('fonts', 1);
    setTimeout(function () { setPart('fonts', 1); }, 1200);
    var shellTries = 0;
    var shellTimer = setInterval(function () {
        if (window.__hshsMobileShell || ++shellTries > 40) {
            clearInterval(shellTimer);
            setPart('shell', 1);
        }
    }, 50);
    watchImages(document).then(function () { setPart('page', 1); });
    window.addEventListener('load', function () {
        setPart('css', 1); setPart('dom', 1); setPart('fonts', 1);
        setPart('images', 1); setPart('page', 1);
        setPart('shell', 1);
    });
    setTimeout(function () {
        setPart('css', 1); setPart('dom', 1); setPart('shell', 1);
        setPart('fonts', 1); setPart('images', 1); setPart('page', 1); setPart('site', 1);
        if (!done) finish();
        else reveal();
    }, 4500);
})();
