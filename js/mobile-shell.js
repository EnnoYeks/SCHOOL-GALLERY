// ============================================
// HSHS MOBILE SHELL + in-app page swap
// ============================================

(function () {
    if (window.__hshsMobileShell) return;
    window.__hshsMobileShell = true;

    const PAGE_FILES = [
        'gallery.html', 'photos.html', 'videos.html', 'trending.html',
        'spotlight.html', 'polls.html', 'memories.html', 'about.html',
        'contat.html', 'contact.html', 'profile.html', 'settings.html', 'admin.html',
        'clips.html', 'shorts.html', 'buzz.html', 'chat.html'
    ];

    const SHARED_SCRIPT = /config\.js|db\.js|utils\.js|particles\.js|theme\.js|navigation\.js|mobile-navigation\.js|mobile-shell\.js|search\.js|mobile-search-btn\.js|hshs-boot\.js|hshs-swipe\.js|hshs-store\.js|hshs-upload\.js|hshs-motion\.js|gallery-transitions\.js|page-swipe\.js|hshs-tt\.js/;
    const loadedCss = new Set();
    const loadedPageScripts = new Set();
    const pageCache = window.__hshsPageCache = window.__hshsPageCache || {};
    const GUEST_PIC = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="32" fill="#1d4ed8"/>' +
        '<circle cx="32" cy="24" r="10" fill="white"/>' +
        '<path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white"/>' +
        '</svg>'
    );

    function currentFile() {
        return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    }
    function fileKey(url) {
        if (window.__hshsFileKey) return window.__hshsFileKey(url);
        try {
            var f = (new URL(url, location.href).pathname.split('/').pop() || 'index.html').toLowerCase();
            if (!f) f = 'index.html';
            if (f === 'clips.html' || f === 'shorts.html') f = 'buzz.html';
            if (f === 'contact.html') f = 'contat.html';
            return f;
        } catch (e) { return url; }
    }

    function canonicalize(url) {
        const next = new URL(url, location.href);
        let file = (next.pathname.split('/').pop() || '').toLowerCase();
        if (file === 'contact.html') {
            next.pathname = next.pathname.replace(/contact\.html$/i, 'contat.html');
            file = 'contat.html';
        }
        if (file === 'shorts.html' || file === 'clips.html') {
            next.pathname = next.pathname.replace(/(shorts|clips)\.html$/i, 'buzz.html');
            file = 'buzz.html';
        }
        if (file === 'index.html' && /\/index\//i.test(next.pathname)) {
            next.pathname = '/index.html';
        }
        const nested = ['gallery.html','photos.html','videos.html','trending.html','spotlight.html','polls.html','memories.html','about.html','contat.html','profile.html','settings.html','admin.html','clips.html','buzz.html','chat.html'];
        if (nested.indexOf(file) !== -1 && next.pathname.indexOf('/index/') === -1) {
            next.pathname = '/index/' + file;
        }
        return next;
    }

    function fixBadLinks(root) {
        const scope = root || document;
        scope.querySelectorAll('a[href]').forEach(function (a) {
            const raw = a.getAttribute('href');
            if (!raw || raw.charAt(0) === '#' || raw.indexOf('mailto:') === 0) return;
            if (/^https?:/i.test(raw) && raw.indexOf(location.origin) !== 0) return;
            try {
                const next = canonicalize(raw);
                if (next.origin !== location.origin) return;
                const dest = next.pathname + next.search + next.hash;
                if (dest && dest !== raw) a.setAttribute('href', dest);
            } catch (e) {}
        });
    }

    function inSubfolderNow() {
        const file = currentFile();
        return /\/index\//i.test(location.pathname) || (PAGE_FILES.includes(file) && file !== 'index.html');
    }
    function homeHref() { return inSubfolderNow() ? '../index.html' : 'index.html'; }
    function sub(name) { return inSubfolderNow() ? name : 'index/' + name; }
    function isAdmin() {
        try { return !!localStorage.getItem('adminToken'); } catch (e) { return false; }
    }
    function guestMe() {
        var p = {};
        try {
            if (window.profileManager && typeof window.profileManager.getProfile === 'function') {
                p = window.profileManager.getProfile() || {};
            }
        } catch (e) {}
        try {
            var stored = JSON.parse(localStorage.getItem('userProfile') || 'null');
            if (stored) p = Object.assign({}, p, stored);
        } catch (e) {}
        try {
            var settings = JSON.parse(localStorage.getItem('userSettings') || 'null');
            if (settings && settings.account) p = Object.assign({}, settings.account, p);
        } catch (e) {}
        var photo = p.profilePhoto || '';
        if (!photo || /placeholder/i.test(photo)) photo = GUEST_PIC;
        var klass = p.className && p.className !== 'N/A' ? p.className : 'Hawthorne Scribner';
        var role = p.role ? String(p.role) : 'Student';
        return {
            name: p.fullName || 'Guest student',
            line: role.charAt(0).toUpperCase() + role.slice(1) + ' · ' + klass,
            photo: photo
        };
    }
    function fillMoreMe() {
        var me = guestMe();
        var name = document.getElementById('moreMeName');
        var line = document.getElementById('moreMeLine');
        var pic = document.getElementById('moreMePic');
        if (name) name.textContent = me.name;
        if (line) line.textContent = me.line;
        if (pic) pic.src = me.photo;
    }

    function routes() {
        const more = [
            { href: sub('chat.html'), icon: 'fa-comments', label: 'Chat', tone: 'sky', match: ['chat.html'] },
            { href: sub('spotlight.html'), icon: 'fa-trophy', label: 'Spotlight', tone: 'gold', match: ['spotlight.html'] },
            { href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', tone: 'ember', match: ['trending.html'] },
            { href: sub('photos.html'), icon: 'fa-camera', label: 'Photos', tone: 'teal', match: ['photos.html'] },
            { href: sub('videos.html'), icon: 'fa-play', label: 'Vibe', tone: 'navy', match: ['videos.html'] },
            { href: sub('polls.html'), icon: 'fa-square-poll-vertical', label: 'Polls', tone: 'leaf', match: ['polls.html'] },
            { href: sub('memories.html'), icon: 'fa-clock-rotate-left', label: 'Memories', tone: 'lilac', match: ['memories.html'] },
            { href: sub('about.html'), icon: 'fa-graduation-cap', label: 'About', tone: 'navy', match: ['about.html'] },
            { href: sub('contat.html'), icon: 'fa-envelope', label: 'Contact', tone: 'cyan', match: ['contat.html', 'contact.html'] },
            { href: sub('settings.html'), icon: 'fa-gear', label: 'Settings', tone: 'slate', match: ['settings.html'] }
        ];
        if (isAdmin()) {
            more.push({ href: sub('admin.html'), icon: 'fa-user-shield', label: 'Staff', tone: 'gold', match: ['admin.html'] });
        }
        return {
            PRIMARY: [
                { id: 'home', href: homeHref(), icon: 'fa-house', label: 'Home', match: ['index.html', ''] },
                { id: 'buzz', href: sub('buzz.html'), icon: 'fa-bolt', label: 'Buzz', match: ['buzz.html', 'clips.html', 'shorts.html'] },
                { id: 'gallery', href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] }
            ],
            MORE: more,
            DESKTOP: [
                { href: homeHref(), icon: 'fa-house', label: 'Home', match: ['index.html', ''] },
                { href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] },
                { href: sub('chat.html'), icon: 'fa-comments', label: 'Chat', match: ['chat.html'] },
                { href: sub('buzz.html'), icon: 'fa-bolt', label: 'Buzz', match: ['buzz.html', 'clips.html'] },
                { href: sub('photos.html'), icon: 'fa-camera', label: 'Photos', match: ['photos.html'] },
                { href: sub('videos.html'), icon: 'fa-play', label: 'Vibe', match: ['videos.html'] },
                { href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', match: ['trending.html'] },
                { href: sub('spotlight.html'), icon: 'fa-trophy', label: 'Spotlight', match: ['spotlight.html'] },
                { href: sub('polls.html'), icon: 'fa-square-poll-vertical', label: 'Polls', match: ['polls.html'] },
                { href: sub('memories.html'), icon: 'fa-clock-rotate-left', label: 'Memories', match: ['memories.html'] }
            ]
        };
    }

    function isActive(item) {
        const file = currentFile();
        if (file === 'index.html' || file === '') return item.match.includes('index.html') || item.match.includes('');
        return item.match.includes(file);
    }

    function injectCss() {
        const guess = Array.from(document.querySelectorAll('script[src]'))
            .map((s) => s.getAttribute('src') || '')
            .find((s) => s.includes('navigation.js') && !s.includes('mobile-navigation'));
        const base = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/')
            : (inSubfolderNow() ? '../css/' : 'css/');
        function addLink(id, file) {
            if (document.getElementById(id)) return;
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = base + file;
            document.head.insertBefore(link, document.head.firstChild);
        }
        addLink('hshs-boot-css', 'hshs-boot.css');
        addLink('hshs-tt-css', 'hshs-tt.css');
        addLink('hshs-mobile-shell-css', 'mobile-shell.css');
        addLink('hshs-more-css', 'hshs-more.css');
        addLink('hshs-swipe-css', 'hshs-swipe.css');
        addLink('hshs-motion-css', 'gallery-transitions.css');
        addLink('hshs-page-swipe-css', 'page-swipe.css');
    }
    injectCss();

    function syncDesktopNav() {
        const nav = document.querySelector('.navbar .nav-links');
        if (!nav) return;
        nav.innerHTML = routes().DESKTOP.map((item) => `
            <a href="${item.href}" class="nav-link${isActive(item) ? ' active' : ''}">
                <i class="fas ${item.icon}"></i><span>${item.label}</span>
            </a>
        `).join('');
    }

    function markActive() {
        const file = currentFile();
        const moreFiles = ['photos.html','videos.html','polls.html','memories.html','about.html','contat.html','contact.html','profile.html','settings.html','trending.html','spotlight.html','chat.html','admin.html'];
        document.querySelectorAll('.mobile-tabbar a').forEach((a) => {
            const tab = a.getAttribute('data-tab');
            if (!tab || tab === 'upload') return;
            let on = false;
            if (tab === 'home') on = file === 'index.html' || file === '';
            else if (tab === 'more') on = moreFiles.includes(file);
            else on = file === tab + '.html' || (tab === 'buzz' && (file === 'clips.html' || file === 'shorts.html'));
            a.classList.toggle('active', on);
        });
        document.querySelectorAll('.more-grid a').forEach((a) => {
            const href = (a.getAttribute('href') || '').split('/').pop();
            a.classList.toggle('active', href === file || (file === 'contact.html' && href === 'contat.html'));
        });
        document.querySelectorAll('.navbar .nav-link').forEach((a) => {
            const href = (a.getAttribute('href') || '').split('/').pop();
            const on = href === file || ((file === 'index.html' || file === '') && href === 'index.html');
            a.classList.toggle('active', on);
        });
    }

    function closeMore() {
        const sheet = document.getElementById('moreSheet');
        const backdrop = document.getElementById('moreBackdrop');
        if (sheet) sheet.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        document.body.classList.remove('more-open');
    }
    function openMore() {
        fillMoreMe();
        const sheet = document.getElementById('moreSheet');
        const backdrop = document.getElementById('moreBackdrop');
        if (sheet) sheet.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        document.body.classList.add('more-open');
    }
    function toggleMore() {
        const sheet = document.getElementById('moreSheet');
        if (sheet && sheet.classList.contains('open')) closeMore();
        else openMore();
    }

    function bootPageWidgets() {
        if (typeof window.initHshsClips === 'function') window.initHshsClips();
        if (typeof window.startVideos === 'function') window.startVideos();
        if (typeof window.initHshsChat === 'function' && document.getElementById('hshsChatPage')) window.initHshsChat();
    }

    function rebuildMoreGrid() {
        const grid = document.querySelector('#moreSheet .more-grid');
        if (!grid) return;
        const r = routes();
        grid.innerHTML = r.MORE.map((item) =>
            `<a href="${item.href}" data-tone="${item.tone}" class="${isActive(item) ? 'active' : ''}"><span class="ico"><i class="fas ${item.icon}"></i></span><span>${item.label}</span></a>`
        ).join('');
    }

    function buildBar() {
        if (document.querySelector('.mobile-tabbar')) return;
        document.body.classList.add('has-mobile-shell', 'hshs-nav-slim');
        const r = routes();
        const moreActive = r.MORE.some(isActive) || currentFile() === 'profile.html';
        const bar = document.createElement('nav');
        bar.className = 'mobile-tabbar';
        bar.setAttribute('aria-label', 'Primary');

        bar.innerHTML =
            `<a href="${r.PRIMARY[0].href}" class="${isActive(r.PRIMARY[0]) ? 'active' : ''}" data-tab="home">` +
            `<i class="fas fa-house"></i><span>Home</span></a>` +
            `<a href="${r.PRIMARY[1].href}" class="${isActive(r.PRIMARY[1]) ? 'active' : ''}" data-tab="buzz">` +
            `<i class="fas fa-bolt"></i><span>Buzz</span></a>` +
            `<button type="button" class="tab-upload" data-tab="upload" id="openUploadStudio" aria-label="Upload">` +
            `<span class="tab-upload-btn"><i class="fas fa-plus"></i></span></button>` +
            `<a href="${r.PRIMARY[2].href}" class="${isActive(r.PRIMARY[2]) ? 'active' : ''}" data-tab="gallery">` +
            `<i class="fas fa-images"></i><span>Gallery</span></a>` +
            `<a href="#more" class="${moreActive ? 'active' : ''}" data-tab="more" id="openMoreSheet">` +
            `<i class="fas fa-ellipsis"></i><span>More</span></a>`;

        const backdrop = document.createElement('div');
        backdrop.className = 'more-backdrop';
        backdrop.id = 'moreBackdrop';
        const sheet = document.createElement('aside');
        sheet.className = 'more-sheet';
        sheet.id = 'moreSheet';
        sheet.innerHTML =
            `<div class="more-handle" aria-hidden="true"></div>` +
            `<button type="button" class="more-close" id="closeMoreSheet" aria-label="Close">×</button>` +
            `<a class="more-me" href="${sub('profile.html')}" id="moreMeCard">` +
            `<img class="more-me-pic" id="moreMePic" alt="Your profile">` +
            `<span class="more-me-copy"><strong id="moreMeName">Guest student</strong>` +
            `<small id="moreMeLine">Student · Hawthorne Scribner</small></span>` +
            `<span class="more-me-go">View profile</span></a>` +
            `<p class="more-kicker">All pages</p>` +
            `<div class="more-grid"></div>`;
        document.body.appendChild(bar);
        document.body.appendChild(backdrop);
        document.body.appendChild(sheet);
        rebuildMoreGrid();
        fillMoreMe();

        document.getElementById('openUploadStudio').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeMore();
            if (window.__hshsOpenUpload) window.__hshsOpenUpload();
        });
        document.getElementById('openMoreSheet').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMore();
        });
        document.getElementById('closeMoreSheet').addEventListener('click', function (e) {
            e.preventDefault();
            closeMore();
        });
        backdrop.addEventListener('click', closeMore);
        sheet.addEventListener('click', function (e) {
            if (e.target.closest('.more-grid a') || e.target.closest('.more-me')) closeMore();
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMore(); });
    }

    function wrapPage() {
        let root = document.getElementById('hshs-page');
        if (root) return root;
        root = document.createElement('div');
        root.id = 'hshs-page';
        const keep = new Set([
            document.querySelector('.animated-bg'),
            document.querySelector('.navbar'),
            document.querySelector('.mobile-tabbar'),
            document.querySelector('.more-sheet'),
            document.querySelector('.more-backdrop'),
            document.getElementById('hshs-boot'),
            document.getElementById('hshs-cube-stage'),
            document.getElementById('hshsUploadStudio'),
            document.getElementById('hshs-tt-overlay')
        ]);
        const move = [];
        Array.from(document.body.children).forEach(function (el) {
            if (keep.has(el) || el.id === 'hshs-page' || el.id === 'hshs-boot' || el.tagName === 'SCRIPT') return;
            move.push(el);
        });
        const navbar = document.querySelector('.navbar');
        if (navbar && navbar.parentNode) navbar.parentNode.insertBefore(root, navbar.nextSibling);
        else document.body.appendChild(root);
        move.forEach(function (el) { root.appendChild(el); });
        return root;
    }

    function extractPage(doc) {
        const keepNames = ['animated-bg', 'navbar', 'mobile-tabbar', 'more-sheet', 'more-backdrop', 'hshs-page', 'hshs-cube'];
        const box = document.createElement('div');
        Array.from(doc.body.children).forEach(function (el) {
            const cls = el.className ? String(el.className) : '';
            const skip = el.tagName === 'SCRIPT' || el.id === 'hshs-page' || el.id === 'hshs-boot' || el.id === 'hshsUploadStudio' || el.id === 'hshs-tt-overlay' || keepNames.some(function (name) { return cls.indexOf(name) !== -1; });
            if (!skip) box.appendChild(el.cloneNode(true));
        });
        return box;
    }

    function adoptCss(doc) {
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href || href.indexOf('font-awesome') !== -1) return;
            const abs = new URL(href, location.href).href;
            if (loadedCss.has(abs)) return;
            const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(function (l) { return l.href === abs; });
            if (exists) { loadedCss.add(abs); return; }
            const neu = document.createElement('link');
            neu.rel = 'stylesheet';
            neu.href = href;
            document.head.appendChild(neu);
            loadedCss.add(abs);
        });
    }

    function runPageScripts(doc) {
        doc.querySelectorAll('script[src]').forEach(function (old) {
            const src = old.getAttribute('src') || '';
            if (SHARED_SCRIPT.test(src)) return;
            const abs = new URL(src, location.href).href;
            const key = abs + ':' + currentFile();
            if (loadedPageScripts.has(key)) return;
            const neu = document.createElement('script');
            if (old.type) neu.type = old.type;
            neu.src = src;
            document.body.appendChild(neu);
            loadedPageScripts.add(key);
        });
    }

    function applyPage(html, url, fromHistory) {
        closeMore();
        if (!fromHistory) history.pushState({ url: url }, '', url);
        const doc = new DOMParser().parseFromString(html, 'text/html');
        adoptCss(doc);
        const root = wrapPage();
        root.innerHTML = extractPage(doc).innerHTML;
        fixBadLinks(root);
        document.title = doc.title || document.title;
        syncDesktopNav();
        markActive();
        wireHomeButtons();
        runPageScripts(doc);
        setTimeout(bootPageWidgets, 40);
        window.scrollTo(0, 0);
        document.dispatchEvent(new Event('hshs:page'));
    }

    function cachedHtml(url) {
        const key = fileKey(url);
        return pageCache[key] || pageCache[url] || null;
    }

    async function navigate(url, fromHistory) {
        const next = canonicalize(url);
        if (next.origin !== location.origin) { location.href = next.href; return; }
        if (next.hash === '#more') { toggleMore(); return; }
        const file = (next.pathname.split('/').pop() || '').toLowerCase();
        if (file === 'admin.html') { location.href = next.href; return; }
        const root = wrapPage();
        const cached = cachedHtml(next.href) || cachedHtml(file);
        if (cached) {
            pageCache[fileKey(next.href)] = cached;
            applyPage(cached, next.href, fromHistory);
            return;
        }
        if (window.__hshsTt) window.__hshsTt.show();
        if (window.__hshsPageSkeleton) root.innerHTML = window.__hshsPageSkeleton(file);
        try {
            const res = await fetch(next.href, { credentials: 'same-origin' });
            if (!res.ok) throw new Error('fetch failed');
            const html = await res.text();
            pageCache[next.href] = html;
            pageCache[fileKey(next.href)] = html;
            applyPage(html, next.href, fromHistory);
        } catch (err) {
            location.href = next.href;
        } finally {
            if (window.__hshsTt) window.__hshsTt.hide();
        }
    }

    function isInternalAppLink(anchor) {
        if (!anchor || !anchor.getAttribute) return false;
        const raw = anchor.getAttribute('href');
        if (!raw || raw.charAt(0) === '#') return false;
        if (anchor.target === '_blank') return false;
        let next;
        try { next = canonicalize(anchor.href); } catch (e) { return false; }
        if (next.origin !== location.origin) return false;
        const name = next.pathname.split('/').pop().toLowerCase();
        if (name === 'admin.html') return false;
        return name === '' || name === 'index.html' || name.endsWith('.html');
    }

    function wireHomeButtons() {
        function bind(id, dest) {
            const el = document.getElementById(id);
            if (!el) return;
            el.onclick = function (e) { e.preventDefault(); navigate(dest); };
        }
        bind('exploreBtn', sub('gallery.html'));
        bind('learnMoreBtn', sub('about.html'));
        bind('uploadBtn', sub('photos.html'));
        bind('uploadVideoBtn', sub('photos.html'));
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.onclick = function (e) { e.preventDefault(); navigate(homeHref()); };
        }
    }

    function wireSpa() {
        document.addEventListener('click', function (e) {
            const a = e.target.closest('a');
            if (!isInternalAppLink(a)) return;
            e.preventDefault();
            closeMore();
            navigate(a.href);
        });
        window.addEventListener('popstate', function () { closeMore(); navigate(location.href, true); });
    }

    function boot() {
        injectCss();
        document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) { if (l.href) loadedCss.add(l.href); });
        syncDesktopNav();
        buildBar();
        // Snapshot the original page HTML BEFORE wrapping into #hshs-page.
        // This lets SPA return-to-Home reconstruct from the existing static structure
        // instead of an empty post-wrap tree or a forced network fetch.
        try {
            var snap = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
            var f = currentFile() || 'index.html';
            if (!pageCache[f]) pageCache[f] = snap;
            if (!pageCache[fileKey(location.href)]) pageCache[fileKey(location.href)] = snap;
            if ((f === 'index.html' || f === '') && !pageCache['index.html']) pageCache['index.html'] = snap;
        } catch (e) {}
        wrapPage();
        fixBadLinks(document);
        wireHomeButtons();
        wireSpa();
        markActive();
        bootPageWidgets();
        history.replaceState({ url: location.href }, '', location.href);
        if (window.__hshsBootMark) window.__hshsBootMark('shell', 1, 'App shell ready');
    }

    window.__hshsNavigate = navigate;
    window.__hshsCloseMore = closeMore;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
