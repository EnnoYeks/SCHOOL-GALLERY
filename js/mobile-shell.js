// ============================================
// HSHS MOBILE SHELL + in-app page swap
// Navbar and tab bar stay put. Only page content changes.
// ============================================

(function () {
    if (window.__hshsMobileShell) return;
    window.__hshsMobileShell = true;

    const PAGE_FILES = [
        'gallery.html', 'photos.html', 'videos.html', 'trending.html',
        'spotlight.html', 'polls.html', 'memories.html', 'about.html',
        'contat.html', 'contact.html', 'profile.html', 'settings.html', 'admin.html'
    ];

    const SHARED_SCRIPT = /config\.js|db\.js|utils\.js|particles\.js|theme\.js|navigation\.js|mobile-navigation\.js|mobile-shell\.js|search\.js/;
    const loadedCss = new Set();
    const loadedPageScripts = new Set();

    function currentFile() {
        return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    }

    function inSubfolderNow() {
        const file = currentFile();
        return /\/index\//i.test(location.pathname) || (PAGE_FILES.includes(file) && file !== 'index.html');
    }

    function homeHref() {
        return inSubfolderNow() ? '../index.html' : 'index.html';
    }

    function sub(name) {
        return inSubfolderNow() ? name : 'index/' + name;
    }

    function routes() {
        return {
            PRIMARY: [
                { id: 'home', href: homeHref(), icon: 'fa-home', label: 'Home', match: ['index.html', ''] },
                { id: 'gallery', href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] },
                { id: 'spotlight', href: sub('spotlight.html'), icon: 'fa-star', label: 'Spotlight', match: ['spotlight.html'] },
                { id: 'trending', href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', match: ['trending.html'] }
            ],
            MORE: [
                { href: sub('photos.html'), icon: 'fa-camera', label: 'Photos', match: ['photos.html'] },
                { href: sub('videos.html'), icon: 'fa-play', label: 'Videos', match: ['videos.html'] },
                { href: sub('polls.html'), icon: 'fa-square-poll-vertical', label: 'Polls', match: ['polls.html'] },
                { href: sub('memories.html'), icon: 'fa-clock-rotate-left', label: 'Memories', match: ['memories.html'] },
                { href: sub('about.html'), icon: 'fa-circle-info', label: 'About', match: ['about.html'] },
                { href: sub('contat.html'), icon: 'fa-envelope', label: 'Contact', match: ['contat.html', 'contact.html'] },
                { href: sub('profile.html'), icon: 'fa-user', label: 'Profile', match: ['profile.html'] },
                { href: sub('settings.html'), icon: 'fa-gear', label: 'Settings', match: ['settings.html'] },
                { href: sub('admin.html'), icon: 'fa-shield-halved', label: 'Admin', match: ['admin.html'] }
            ],
            DESKTOP: [
                { href: homeHref(), icon: 'fa-home', label: 'Home', match: ['index.html', ''] },
                { href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] },
                { href: sub('photos.html'), icon: 'fa-photo-film', label: 'Photos', match: ['photos.html'] },
                { href: sub('videos.html'), icon: 'fa-video', label: 'Videos', match: ['videos.html'] },
                { href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', match: ['trending.html'] },
                { href: sub('spotlight.html'), icon: 'fa-star', label: 'Spotlight', match: ['spotlight.html'] },
                { href: sub('polls.html'), icon: 'fa-poll', label: 'Polls', match: ['polls.html'] },
                { href: sub('memories.html'), icon: 'fa-history', label: 'Memories', match: ['memories.html'] }
            ]
        };
    }

    function isActive(item) {
        const file = currentFile();
        if (file === 'index.html' || file === '') return item.match.includes('index.html') || item.match.includes('');
        return item.match.includes(file);
    }

    function injectCss() {
        if (document.getElementById('hshs-mobile-shell-css')) return;
        const guess = Array.from(document.querySelectorAll('script[src]'))
            .map((s) => s.getAttribute('src') || '')
            .find((s) => s.includes('navigation.js') && !s.includes('mobile-navigation'));
        const cssHref = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/mobile-shell.css')
            : (inSubfolderNow() ? '../css/mobile-shell.css' : 'css/mobile-shell.css');
        const link = document.createElement('link');
        link.id = 'hshs-mobile-shell-css';
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
    }

    function syncDesktopNav() {
        const nav = document.querySelector('.navbar .nav-links');
        if (!nav) return;
        const DESKTOP = routes().DESKTOP;
        nav.innerHTML = DESKTOP.map((item) => `
            <a href="${item.href}" class="nav-link${isActive(item) ? ' active' : ''}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    }

    function markActive() {
        const file = currentFile();
        const moreFiles = ['photos.html','videos.html','polls.html','memories.html','about.html','contat.html','contact.html','profile.html','settings.html','admin.html'];
        document.querySelectorAll('.mobile-tabbar a').forEach((a) => {
            const tab = a.getAttribute('data-tab');
            let on = false;
            if (tab === 'home') on = file === 'index.html' || file === '';
            else if (tab === 'more') on = moreFiles.includes(file);
            else on = file === tab + '.html';
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
    }

    function buildBar() {
        if (document.querySelector('.mobile-tabbar')) return;
        document.body.classList.add('has-mobile-shell');
        const r = routes();
        const moreActive = r.MORE.some(isActive);

        const bar = document.createElement('nav');
        bar.className = 'mobile-tabbar';
        bar.setAttribute('aria-label', 'Primary');
        bar.innerHTML = r.PRIMARY.map((item) => `
            <a href="${item.href}" class="${isActive(item) ? 'active' : ''}" data-tab="${item.id}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('') + `
            <a href="#more" class="${moreActive ? 'active' : ''}" data-tab="more" id="openMoreSheet">
                <i class="fas fa-ellipsis"></i>
                <span>More</span>
            </a>
        `;

        const backdrop = document.createElement('div');
        backdrop.className = 'more-backdrop';
        backdrop.id = 'moreBackdrop';

        const sheet = document.createElement('aside');
        sheet.className = 'more-sheet';
        sheet.id = 'moreSheet';
        sheet.innerHTML = `
            <h3>All pages</h3>
            <p>Jump to any section</p>
            <div class="more-grid">
                ${r.MORE.map((item) => `
                    <a href="${item.href}" class="${isActive(item) ? 'active' : ''}">
                        <i class="fas ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `).join('')}
            </div>
        `;

        document.body.appendChild(bar);
        document.body.appendChild(backdrop);
        document.body.appendChild(sheet);

        document.getElementById('openMoreSheet').addEventListener('click', function (e) {
            e.preventDefault();
            sheet.classList.add('open');
            backdrop.classList.add('open');
        });
        backdrop.addEventListener('click', closeMore);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMore();
        });
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
            document.querySelector('.more-backdrop')
        ]);
        const move = [];
        Array.from(document.body.children).forEach(function (el) {
            if (keep.has(el) || el.id === 'hshs-page' || el.tagName === 'SCRIPT') return;
            move.push(el);
        });
        const navbar = document.querySelector('.navbar');
        if (navbar && navbar.parentNode) navbar.parentNode.insertBefore(root, navbar.nextSibling);
        else document.body.appendChild(root);
        move.forEach(function (el) { root.appendChild(el); });
        return root;
    }

    function extractPage(doc) {
        const keepNames = ['animated-bg', 'navbar', 'mobile-tabbar', 'more-sheet', 'more-backdrop', 'hshs-page'];
        const box = document.createElement('div');
        Array.from(doc.body.children).forEach(function (el) {
            const cls = el.className ? String(el.className) : '';
            const skip = el.tagName === 'SCRIPT'
                || el.id === 'hshs-page'
                || keepNames.some(function (name) { return cls.indexOf(name) !== -1; });
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

    async function navigate(url, fromHistory) {
        const next = new URL(url, location.href);
        if (next.origin !== location.origin) { location.href = next.href; return; }
        if (next.hash === '#more') return;

        const root = wrapPage();
        root.classList.add('is-swapping');
        try {
            const res = await fetch(next.href, { credentials: 'same-origin' });
            if (!res.ok) throw new Error('fetch failed');
            const html = await res.text();
            if (!fromHistory) history.pushState({ url: next.href }, '', next.href);
            const doc = new DOMParser().parseFromString(html, 'text/html');
            adoptCss(doc);
            const incoming = extractPage(doc);
            root.innerHTML = incoming.innerHTML;
            document.title = doc.title || document.title;
            closeMore();
            syncDesktopNav();
            markActive();
            wireHomeButtons();
            runPageScripts(doc);
            window.scrollTo(0, 0);
        } catch (err) {
            location.href = next.href;
        } finally {
            root.classList.remove('is-swapping');
        }
    }

    function isInternalAppLink(anchor) {
        if (!anchor || !anchor.getAttribute) return false;
        const raw = anchor.getAttribute('href');
        if (!raw || raw.charAt(0) === '#') return false;
        if (anchor.target === '_blank') return false;
        let next;
        try { next = new URL(anchor.href, location.href); } catch (e) { return false; }
        if (next.origin !== location.origin) return false;
        const name = next.pathname.split('/').pop().toLowerCase();
        return name === '' || name === 'index.html' || name.endsWith('.html');
    }

    function wireHomeButtons() {
        function bind(id, dest) {
            const el = document.getElementById(id);
            if (!el) return;
            el.onclick = function (e) {
                e.preventDefault();
                navigate(dest);
            };
        }
        bind('exploreBtn', sub('gallery.html'));
        bind('learnMoreBtn', sub('about.html'));
        bind('uploadBtn', sub('photos.html'));
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.onclick = function (e) {
                e.preventDefault();
                navigate(homeHref());
            };
        }
    }

    function wireSpa() {
        document.addEventListener('click', function (e) {
            const a = e.target.closest('a');
            if (!isInternalAppLink(a)) return;
            e.preventDefault();
            navigate(a.href);
        });
        window.addEventListener('popstate', function () {
            navigate(location.href, true);
        });
    }

    function boot() {
        injectCss();
        document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) {
            if (l.href) loadedCss.add(l.href);
        });
        syncDesktopNav();
        buildBar();
        wrapPage();
        wireHomeButtons();
        wireSpa();
        markActive();
        history.replaceState({ url: location.href }, '', location.href);
    }

    window.__hshsNavigate = navigate;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
