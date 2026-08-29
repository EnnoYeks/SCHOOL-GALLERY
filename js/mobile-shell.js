// ============================================
// HSHS MOBILE SHELL
// Bottom tabs: Home, Gallery, Spotlight, Trending, More
// More sheet: Photos, Videos, Polls, Memories, About, Contact, Profile, Settings, Admin
// Fits existing pages and path styles (root vs /index/).
// ============================================

(function () {
    if (window.__hshsMobileShell) return;
    window.__hshsMobileShell = true;

    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const inSubfolder = /\/index\//i.test(location.pathname) || [
        'gallery.html', 'photos.html', 'videos.html', 'trending.html',
        'spotlight.html', 'polls.html', 'memories.html', 'about.html',
        'contat.html', 'contact.html', 'profile.html', 'settings.html', 'admin.html'
    ].includes(file) && file !== 'index.html';

    const home = inSubfolder ? '../index.html' : 'index.html';
    const sub = (name) => inSubfolder ? name : 'index/' + name;

    const PRIMARY = [
        { id: 'home', href: home, icon: 'fa-home', label: 'Home', match: ['index.html', ''] },
        { id: 'gallery', href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] },
        { id: 'spotlight', href: sub('spotlight.html'), icon: 'fa-star', label: 'Spotlight', match: ['spotlight.html'] },
        { id: 'trending', href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', match: ['trending.html'] }
    ];

    const MORE = [
        { href: sub('photos.html'), icon: 'fa-camera', label: 'Photos', match: ['photos.html'] },
        { href: sub('videos.html'), icon: 'fa-play', label: 'Videos', match: ['videos.html'] },
        { href: sub('polls.html'), icon: 'fa-square-poll-vertical', label: 'Polls', match: ['polls.html'] },
        { href: sub('memories.html'), icon: 'fa-clock-rotate-left', label: 'Memories', match: ['memories.html'] },
        { href: sub('about.html'), icon: 'fa-circle-info', label: 'About', match: ['about.html'] },
        { href: sub('contat.html'), icon: 'fa-envelope', label: 'Contact', match: ['contat.html', 'contact.html'] },
        { href: sub('profile.html'), icon: 'fa-user', label: 'Profile', match: ['profile.html'] },
        { href: sub('settings.html'), icon: 'fa-gear', label: 'Settings', match: ['settings.html'] },
        { href: sub('admin.html'), icon: 'fa-shield-halved', label: 'Admin', match: ['admin.html'] }
    ];

    const DESKTOP = [
        { href: home, icon: 'fa-home', label: 'Home', match: ['index.html', ''] },
        { href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] },
        { href: sub('photos.html'), icon: 'fa-photo-film', label: 'Photos', match: ['photos.html'] },
        { href: sub('videos.html'), icon: 'fa-video', label: 'Videos', match: ['videos.html'] },
        { href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', match: ['trending.html'] },
        { href: sub('spotlight.html'), icon: 'fa-star', label: 'Spotlight', match: ['spotlight.html'] },
        { href: sub('polls.html'), icon: 'fa-poll', label: 'Polls', match: ['polls.html'] },
        { href: sub('memories.html'), icon: 'fa-history', label: 'Memories', match: ['memories.html'] }
    ];

    function isActive(item) {
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
            : (inSubfolder ? '../css/mobile-shell.css' : 'css/mobile-shell.css');
        const link = document.createElement('link');
        link.id = 'hshs-mobile-shell-css';
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
    }

    function syncDesktopNav() {
        const nav = document.querySelector('.navbar .nav-links');
        if (!nav) return;
        nav.innerHTML = DESKTOP.map((item) => `
            <a href="${item.href}" class="nav-link${isActive(item) ? ' active' : ''}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    }

    function buildBar() {
        if (document.querySelector('.mobile-tabbar')) return;
        document.body.classList.add('has-mobile-shell');

        const bar = document.createElement('nav');
        bar.className = 'mobile-tabbar';
        bar.setAttribute('aria-label', 'Primary');
        const moreActive = MORE.some(isActive);
        bar.innerHTML = PRIMARY.map((item) => `
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
                ${MORE.map((item) => `
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

        function closeMore() {
            sheet.classList.remove('open');
            backdrop.classList.remove('open');
        }
        function openMore(e) {
            if (e) e.preventDefault();
            sheet.classList.add('open');
            backdrop.classList.add('open');
        }

        document.getElementById('openMoreSheet').addEventListener('click', openMore);
        backdrop.addEventListener('click', closeMore);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMore();
        });
    }

    function wireHomeButtons() {
        const explore = document.getElementById('exploreBtn');
        if (explore) explore.addEventListener('click', () => { location.href = sub('gallery.html'); });
        const learn = document.getElementById('learnMoreBtn');
        if (learn) learn.addEventListener('click', () => { location.href = sub('about.html'); });
        const upload = document.getElementById('uploadBtn');
        if (upload) upload.addEventListener('click', () => { location.href = sub('photos.html'); });
    }

    function boot() {
        injectCss();
        syncDesktopNav();
        buildBar();
        wireHomeButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
