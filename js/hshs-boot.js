(function () {
    if (window.__hshsBoot) return;
    window.__hshsBoot = true;

    var seen = {};
    var parts = {
        css: 0,
        dom: 0,
        shell: 0,
        fonts: 0,
        images: 0,
        page: 0
    };
    var weight = { css: 18, dom: 12, shell: 20, fonts: 10, images: 28, page: 12 };
    var done = false;
    var started = Date.now();
    var labelEl, fillEl, catEl, pctEl;

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
        if (catEl) catEl.style.transform = 'translateX(' + (pct / 100) * 232 + 'px)';
        if (pctEl) pctEl.textContent = pct + '%';
        if (labelEl && note) labelEl.textContent = note;
    }

    function catSvg() {
        return '<svg viewBox="0 0 86 64" aria-hidden="true">' +
            '<ellipse class="tail" cx="68" cy="46" rx="10" ry="16" fill="#2b2b2f"/>' +
            '<ellipse cx="44" cy="40" rx="22" ry="16" fill="#2b2b2f"/>' +
            '<circle cx="30" cy="28" r="13" fill="#2b2b2f"/>' +
            '<polygon points="20,20 22,8 28,18" fill="#2b2b2f"/>' +
            '<polygon points="32,18 38,8 40,20" fill="#2b2b2f"/>' +
            '<circle class="blink" cx="26" cy="27" r="2.2" fill="#fff"/>' +
            '<circle class="blink" cx="34" cy="27" r="2.2" fill="#fff"/>' +
            '<circle cx="26.3" cy="27.3" r=".8" fill="#111"/>' +
            '<circle cx="34.3" cy="27.3" r=".8" fill="#111"/>' +
            '<path d="M18 38 C16 46 22 50 28 48" fill="#2b2b2f"/>' +
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
        catEl = document.getElementById('hshsBootCat');
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
        document.head.appendChild(link);
    }

    function watchCss() {
        var links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        if (!links.length) { setPart('css', 1, 'Styles ready'); return; }
        var left = links.length;
        var marked = 0;
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
        setTimeout(function () { setPart('css', 1, 'Styles ready'); }, 4000);
    }

    function watchImages(scope) {
        var root = scope || document;
        var imgs = Array.from(root.querySelectorAll('img')).filter(function (img) {
            return !img.closest('#hshs-boot');
        });
        if (!imgs.length) { setPart('images', 1, 'Pictures ready'); return Promise.resolve(); }
        var left = imgs.length;
        var marked = 0;
        return new Promise(function (resolve) {
            function one() {
                marked += 1;
                setPart('images', marked / left, 'Loading pictures');
                if (marked >= left) {
                    setPart('images', 1, 'Pictures ready');
                    resolve();
                }
            }
            imgs.forEach(function (img) {
                if (img.complete && img.naturalWidth) { one(); return; }
                img.addEventListener('load', one, { once: true });
                img.addEventListener('error', one, { once: true });
            });
            setTimeout(function () {
                setPart('images', 1, 'Pictures ready');
                resolve();
            }, 6000);
        });
    }

    function finish() {
        if (done) return;
        done = true;
        parts.css = parts.dom = parts.shell = parts.fonts = parts.images = parts.page = 1;
        paint('Ready');
        var wait = Math.max(0, 420 - (Date.now() - started));
        setTimeout(function () {
            document.documentElement.classList.remove('hshs-booting');
            document.documentElement.classList.add('hshs-ready');
            var boot = document.getElementById('hshs-boot');
            if (boot) {
                boot.classList.add('is-off');
                setTimeout(function () { if (boot.parentNode) boot.remove(); }, 380);
            }
            try { sessionStorage.setItem('hshs-booted', '1'); } catch (e) {}
        }, wait);
    }

    function pageSkeleton() {
        return '<div class="hshs-page-skel">' +
            '<div class="sk-hero"></div>' +
            '<div class="sk-line"></div><div class="sk-line short"></div>' +
            '<div class="sk-grid"><div class="sk-card"></div><div class="sk-card"></div></div>' +
            '</div>';
    }

    window.__hshsBootMark = setPart;
    window.__hshsPageSkeleton = pageSkeleton;
    window.__hshsWaitImages = watchImages;

    ensureCss();
    mountSplash();
    watchCss();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setPart('dom', 1, 'Page structure ready');
            mountSplash();
        });
    } else {
        setPart('dom', 1, 'Page structure ready');
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { setPart('fonts', 1, 'Text ready'); });
    } else {
        setPart('fonts', 1, 'Text ready');
    }
    setTimeout(function () { setPart('fonts', 1, 'Text ready'); }, 2500);

    var shellTries = 0;
    var shellTimer = setInterval(function () {
        if (window.__hshsMobileShell || ++shellTries > 80) {
            clearInterval(shellTimer);
            setPart('shell', 1, 'App shell ready');
        }
    }, 50);

    watchImages(document).then(function () {
        setPart('page', 1, 'Content ready');
    });

    window.addEventListener('load', function () {
        setPart('css', 1);
        setPart('dom', 1);
        setPart('fonts', 1);
        setPart('images', 1);
        setPart('page', 1, 'Finishing');
        setPart('shell', Math.max(parts.shell, 0.8));
        setTimeout(function () { setPart('shell', 1, 'Ready'); }, 200);
    });

    setTimeout(function () {
        setPart('css', 1);
        setPart('dom', 1);
        setPart('shell', 1);
        setPart('fonts', 1);
        setPart('images', 1);
        setPart('page', 1, 'Ready');
    }, 9000);
})();
