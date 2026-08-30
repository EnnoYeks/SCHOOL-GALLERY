(function () {
    if (window.__hshsPageSwipe) return;
    window.__hshsPageSwipe = true;

    const SWIPE_THRESHOLD = 64;
    const HORIZONTAL_RATIO = 1.35;
    const MAX_DRAG = 140;

    const PAGES = [
        'index.html',
        'index/gallery.html',
        'index/spotlight.html',
        'index/buzz.html',
        'index/photos.html',
        'index/videos.html',
        'index/trending.html',
        'index/polls.html',
        'index/memories.html',
        'index/about.html',
        'index/contat.html',
        'index/profile.html'
    ];

    let startX = 0, startY = 0, tracking = false, dragging = false;

    function canonicalPath(path) {
        path = (path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
        if (!path || path === 'index') return 'index.html';
        if (path === 'index/index.html') return 'index.html';
        if (path === 'index/contact.html') return 'index/contat.html';
        if (path === 'index/clips.html' || path === 'index/shorts.html') return 'index/buzz.html';
        return path;
    }
    function currentIndex() { return PAGES.indexOf(canonicalPath(location.pathname)); }
    function pageRoot() { return document.getElementById('hshs-page') || document.body; }
    function isIgnored(target) {
        return !!(target && target.closest && target.closest(
            'a,button,input,textarea,select,video,audio,iframe,[contenteditable="true"],.mobile-tabbar,.more-sheet,.more-backdrop,.clip-feed,.clip-sheet'
        ));
    }
    function resetDrag() {
        const root = pageRoot();
        root.style.transition = 'transform 220ms cubic-bezier(.22,.8,.2,1)';
        root.style.transform = '';
        setTimeout(function () { root.style.transition = ''; }, 240);
    }
    function hrefFor(path) {
        return path.indexOf('index/') === 0 && /\/index\//.test(location.pathname)
            ? path.replace(/^index\//, '')
            : (path === 'index.html' && /\/index\//.test(location.pathname) ? '../index.html' : '/' + path.replace(/^\//, ''));
    }
    function goTo(index, direction) {
        if (index < 0 || index >= PAGES.length) { resetDrag(); return; }
        const href = hrefFor(PAGES[index]);
        if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(href, false, direction);
        else location.href = href;
    }

    document.addEventListener('touchstart', function (event) {
        if (!event.touches || event.touches.length !== 1 || isIgnored(event.target)) { tracking = false; return; }
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        tracking = true;
        dragging = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (event) {
        if (!tracking || !event.touches || event.touches.length !== 1) return;
        const dx = event.touches[0].clientX - startX;
        const dy = event.touches[0].clientY - startY;
        if (!dragging && Math.abs(dy) > Math.abs(dx) * HORIZONTAL_RATIO) { tracking = false; return; }
        if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * HORIZONTAL_RATIO) return;
        const index = currentIndex();
        if (index === -1) return;
        if ((dx > 0 && index === 0) || (dx < 0 && index === PAGES.length - 1)) return;
        dragging = true;
        const root = pageRoot();
        root.style.transition = 'none';
        root.style.transform = 'translate3d(' + Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx * 0.42)) + 'px,0,0)';
    }, { passive: true });

    document.addEventListener('touchend', function (event) {
        if (!tracking || !event.changedTouches) return;
        tracking = false;
        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;
        const index = currentIndex();
        if (index === -1 || Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy) * HORIZONTAL_RATIO) {
            resetDrag();
            return;
        }
        const direction = dx < 0 ? 'next' : 'previous';
        goTo(direction === 'next' ? index + 1 : index - 1, direction);
    }, { passive: true });
})();
