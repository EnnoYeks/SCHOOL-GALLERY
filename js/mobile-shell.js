// ============================================
// HSHS MOBILE SHELL + legacy-page compatibility
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

    function currentFile() {
        return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    }
    function inSubfolderNow() {
        return /\/index\//i.test(location.pathname) || (PAGE_FILES.includes(currentFile()) && currentFile() !== 'index.html');
    }
    function homeHref() { return inSubfolderNow() ? '../index.html' : 'index.html'; }
    function sub(name) { return inSubfolderNow() ? name : 'index/' + name; }
    function isAdmin() {
        try { return !!localStorage.getItem('adminToken'); } catch (e) { return false; }
    }
    function routes() {
        const more = [
            { href: sub('chat.html'), icon: 'fa-comments', label: 'Chat', match: ['chat.html'] },
            { href: sub('spotlight.html'), icon: 'fa-trophy', label: 'Spotlight', match: ['spotlight.html'] },
            { href: sub('trending.html'), icon: 'fa-fire', label: 'Trending', match: ['trending.html'] },
            { href: sub('photos.html'), icon: 'fa-camera', label: 'Photos', match: ['photos.html'] },
            { href: sub('videos.html'), icon: 'fa-play', label: 'Vibe', match: ['videos.html'] },
            { href: sub('polls.html'), icon: 'fa-square-poll-vertical', label: 'Polls', match: ['polls.html'] },
            { href: sub('memories.html'), icon: 'fa-clock-rotate-left', label: 'Memories', match: ['memories.html'] },
            { href: sub('about.html'), icon: 'fa-graduation-cap', label: 'About', match: ['about.html'] },
            { href: sub('contat.html'), icon: 'fa-envelope', label: 'Contact', match: ['contat.html', 'contact.html'] },
            { href: sub('settings.html'), icon: 'fa-gear', label: 'Settings', match: ['settings.html'] }
        ];
        if (isAdmin()) more.push({ href: sub('admin.html'), icon: 'fa-user-shield', label: 'Staff', match: ['admin.html'] });
        return {
            PRIMARY: [
                { href: homeHref(), icon: 'fa-house', label: 'Home', match: ['index.html', ''] },
                { href: sub('buzz.html'), icon: 'fa-bolt', label: 'Buzz', match: ['buzz.html', 'clips.html', 'shorts.html'] },
                { href: sub('gallery.html'), icon: 'fa-images', label: 'Gallery', match: ['gallery.html'] }
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
        const guess = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src') || '').find(s => s.includes('navigation.js') && !s.includes('mobile-navigation'));
        const base = guess ? guess.replace(/js\/navigation\.js.*$/, 'css/') : (inSubfolderNow() ? '../css/' : 'css/');
        function addLink(id, file) {
            if (document.getElementById(id)) return;
            const link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; link.href = base + file;
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
    function fillMoreMe() {
        const p = (() => { try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); } catch (_) { return {}; } })();
        const name = document.getElementById('moreMeName'); if (name) name.textContent = p.fullName || 'Guest student';
        const line = document.getElementById('moreMeLine'); if (line) line.textContent = (p.role || 'Student') + ' · Hawthorne Scribner';
    }
    function buildBar() {
        if (!window.matchMedia('(max-width: 1024px)').matches || document.querySelector('.mobile-tabbar')) return;
        document.body.classList.add('has-mobile-shell', 'hshs-nav-slim');
        const r = routes();
        const bar = document.createElement('nav'); bar.className = 'mobile-tabbar'; bar.setAttribute('aria-label', 'Primary');
        bar.innerHTML = `<a href="${r.PRIMARY[0].href}" class="${isActive(r.PRIMARY[0]) ? 'active' : ''}" data-tab="home"><i class="fas fa-house"></i><span>Home</span></a><a href="${r.PRIMARY[1].href}" class="${isActive(r.PRIMARY[1]) ? 'active' : ''}" data-tab="buzz"><i class="fas fa-bolt"></i><span>Buzz</span></a><button type="button" class="tab-upload" data-tab="upload" id="openUploadStudio" aria-label="Upload"><span class="tab-upload-btn"><i class="fas fa-plus"></i></span></button><a href="${r.PRIMARY[2].href}" class="${isActive(r.PRIMARY[2]) ? 'active' : ''}" data-tab="gallery"><i class="fas fa-images"></i><span>Gallery</span></a><a href="#more" class="" data-tab="more" id="openMoreSheet"><i class="fas fa-ellipsis"></i><span>More</span></a>`;
        const backdrop = document.createElement('div'); backdrop.className = 'more-backdrop'; backdrop.id = 'moreBackdrop';
        const sheet = document.createElement('aside'); sheet.className = 'more-sheet'; sheet.id = 'moreSheet';
        sheet.innerHTML = `<div class="more-handle" aria-hidden="true"></div><button type="button" class="more-close" id="closeMoreSheet" aria-label="Close">×</button><a class="more-me" href="${sub('profile.html')}" id="moreMeCard"><span class="more-me-copy"><strong id="moreMeName">Guest student</strong><small id="moreMeLine">Student · Hawthorne Scribner</small></span><span class="more-me-go">View profile</span></a><p class="more-kicker">All pages</p><div class="more-grid"></div>`;
        document.body.appendChild(bar); document.body.appendChild(backdrop); document.body.appendChild(sheet);
        const grid = sheet.querySelector('.more-grid');
        grid.innerHTML = r.MORE.map(item => `<a href="${item.href}"><span class="ico"><i class="fas ${item.icon}"></i></span><span>${item.label}</span></a>`).join('');
        fillMoreMe();
        document.getElementById('openUploadStudio')?.addEventListener('click', e => { e.preventDefault(); window.__hshsOpenUpload?.(); });
        document.getElementById('openMoreSheet')?.addEventListener('click', e => { e.preventDefault(); sheet.classList.toggle('open'); backdrop.classList.toggle('open'); });
        document.getElementById('closeMoreSheet')?.addEventListener('click', () => { sheet.classList.remove('open'); backdrop.classList.remove('open'); });
        backdrop.addEventListener('click', () => { sheet.classList.remove('open'); backdrop.classList.remove('open'); });
    }
    function syncDesktopNav() {
        const nav = document.querySelector('.navbar .nav-links');
        if (!nav) return;
        nav.innerHTML = routes().DESKTOP.map(item => `<a href="${item.href}" class="nav-link${isActive(item) ? ' active' : ''}"><i class="fas ${item.icon}"></i><span>${item.label}</span></a>`).join('');
    }
    function boot() {
        injectCss();
        if (window.__hshsJsApp) {
            syncDesktopNav();
            buildBar();
            return;
        }
        // Legacy compatibility path only. The JS app router owns navigation when present.
        syncDesktopNav();
        buildBar();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
