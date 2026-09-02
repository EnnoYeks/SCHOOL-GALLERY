(function () {
    if (window.__hshsBoot) return;
    window.__hshsBoot = true;

    var MIN_BOOT = 2800;
    var parts = { css: 0, dom: 0, shell: 0, fonts: 0, images: 0, page: 0, site: 0 };
    var done = false;
    var started = Date.now();
    var labelEl;
    var notes = ['Detecting device', 'Loading styles', 'Preparing pages', 'Opening HSHS World'];

    function setPart(name, value, note) {
        if (done) return;
        parts[name] = Math.max(parts[name], Math.min(1, value));
        if (labelEl && note) labelEl.textContent = note;
        if (coreReady()) finish();
    }
    function coreReady() {
        return parts.css >= 1 && parts.dom >= 1 && parts.shell >= 1 && parts.fonts >= 1 && parts.page >= 1;
    }
    function badgeSvg() {
        return '<svg viewBox="0 0 200 200" aria-hidden="true">' +
            '<path d="M38 96 C36 128 58 158 100 176 C142 158 164 128 162 96 C158 74 148 58 138 48 C126 62 100 68 100 68 C100 68 74 62 62 48 C52 58 42 74 38 96Z" fill="#c9a227"/>' +
            '<path d="M44 96 C42 126 62 154 100 170 C138 154 158 126 156 96 C152 76 143 62 134 52 C123 64 100 70 100 70 C100 70 77 64 66 52 C57 62 48 76 44 96Z" fill="#8b6914"/>' +
            '<path d="M72 34 C86 50 100 54 100 54 C100 54 114 50 128 34 C150 48 164 78 160 108 C156 138 132 160 100 176 C68 160 44 138 40 108 C36 78 50 48 72 34Z" fill="#d4af37"/>' +
            '<path d="M76 40 C88 54 100 58 100 58 C100 58 112 54 124 40 C144 52 156 78 152 106 C148 134 126 154 100 168 C74 154 52 134 48 106 C44 78 56 52 76 40Z" fill="#0b1a3a"/>' +
            '<path d="M100 58 L100 112 L50 112 C48 86 62 58 100 58Z" fill="#163a7a"/>' +
            '<path d="M100 58 L150 112 L100 112Z" fill="#b42318"/>' +
            '<path d="M50 112 L150 112 L150 118 C138 148 118 160 100 168 C82 160 62 148 50 118Z" fill="#f4efe4"/>' +
            '<path d="M68 138 L86 118 L100 128 L114 118 L132 138 L100 160Z" fill="#1d4ed8"/>' +
            '<circle cx="100" cy="122" r="10" fill="#eab308"/>' +
            '<g fill="#fbbf24">' +
            '<rect x="98" y="104" width="4" height="10" rx="1"/>' +
            '<rect x="98" y="128" width="4" height="8" rx="1"/>' +
            '<rect x="86" y="120" width="10" height="4" rx="1"/>' +
            '<rect x="104" y="120" width="10" height="4" rx="1"/>' +
            '</g>' +
            '<polygon points="82,82 88,94 76,90" fill="#f8fafc"/>' +
            '<polygon points="82,76 86,82 78,82" fill="#f8fafc"/>' +
            '<g fill="#f8fafc">' +
            '<rect x="118" y="78" width="18" height="14" rx="1"/>' +
            '<rect x="116" y="76" width="22" height="3" rx="1"/>' +
            '<rect x="126" y="78" width="2" height="14" fill="#cbd5e1"/>' +
            '</g>' +
            '</svg>';
    }
    function mountSplash() {
        document.documentElement.classList.add('hshs-booting');
        var box = document.getElementById('hshs-boot');
        if (!box) {
            box = document.createElement('div');
            box.id = 'hshs-boot';
            (document.body || document.documentElement).appendChild(box);
        }
        if (!box.querySelector('.hshs-boot-card')) {
            box.innerHTML =
                '<div class="hshs-boot-card">' +
                '<div class="hshs-boot-badge">' + badgeSvg() + '</div>' +
                '<div class="hshs-boot-dots" aria-hidden="true"><i></i><i></i><i></i></div>' +
                '<p class="hshs-boot-note" id="hshsBootNote">Detecting device</p>' +
                '</div>';
        }
        labelEl = document.getElementById('hshsBootNote');
        var mobile = window.matchMedia('(max-width: 1024px)').matches;
        document.documentElement.classList.toggle('hshs-device-mobile', mobile);
        document.documentElement.classList.toggle('hshs-device-desktop', !mobile);
        if (labelEl) labelEl.textContent = mobile ? 'Phone layout ready' : 'Desktop layout ready';
        setTimeout(function () { if (labelEl) labelEl.textContent = 'Loading styles'; }, 500);
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
        setTimeout(function () { setPart('css', 1, 'Styles ready'); }, 1600);
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
            setTimeout(function () { setPart('images', 1, 'Pictures ready'); resolve(); }, 2200);
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
                setPart('site', marked / left, 'Preparing pages');
            }).catch(function () {
                marked += 1;
                setPart('site', marked / left, 'Preparing pages');
            });
        })).then(function () { setPart('site', 1, 'Pages ready'); });
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
        if (window.__hshsTt) window.__hshsTt.hide();
    }
    function finish() {
        if (done) return;
        done = true;
        Object.keys(parts).forEach(function (k) { parts[k] = 1; });
        if (labelEl) labelEl.textContent = 'Opening HSHS World';
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
    setTimeout(function () { setPart('fonts', 1, 'Text ready'); }, 1400);
    var shellTries = 0;
    var shellTimer = setInterval(function () {
        if (window.__hshsMobileShell || ++shellTries > 40) {
            clearInterval(shellTimer);
            setPart('shell', 1, 'App ready');
        }
    }, 50);
    watchImages(document).then(function () { setPart('page', 1, 'Content ready'); });
    window.addEventListener('load', function () {
        setPart('css', 1); setPart('dom', 1); setPart('fonts', 1);
        setPart('images', 1); setPart('page', 1, 'Opening HSHS World');
        setPart('shell', 1);
    });
    setTimeout(function () {
        setPart('css', 1); setPart('dom', 1); setPart('shell', 1);
        setPart('fonts', 1); setPart('images', 1); setPart('page', 1); setPart('site', 1);
        if (!done) finish();
        else reveal();
    }, 5200);
})();
