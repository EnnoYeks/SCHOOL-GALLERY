(function () {
    if (window.__hshsPageSwipe) return;
    window.__hshsPageSwipe = true;

    const SWIPE_THRESHOLD = 72;
    const VELOCITY_THRESHOLD = 0.45;
    const HORIZONTAL_RATIO = 1.15;
    const MAX_DRAG_RATIO = 0.92;

    const PAGES = [
        'index.html', 'index/gallery.html', 'index/spotlight.html',
        'index/buzz.html', 'index/photos.html', 'index/videos.html',
        'index/trending.html', 'index/polls.html', 'index/memories.html',
        'index/about.html', 'index/contat.html', 'index/profile.html',
        'index/settings.html'
    ];

    let startX = 0, startY = 0, startTime = 0;
    let tracking = false, dragging = false, locked = false;

    function canonicalPath(path) {
        path = (path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
        if (!path || path === 'index' || path === 'index/index.html') return 'index.html';
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

    function hrefFor(path) {
        return path.indexOf('index/') === 0 && /\/index\//.test(location.pathname)
            ? path.replace(/^index\//, '')
            : (path === 'index.html' && /\/index\//.test(location.pathname)
                ? '../index.html'
                : '/' + path.replace(/^\//, ''));
    }

    function prefetch(index) {
        if (index < 0 || index >= PAGES.length) return;
        if (typeof window.__hshsPrefetch === 'function') {
            window.__hshsPrefetch(hrefFor(PAGES[index]));
        }
    }

    function resetDrag() {
        const root = pageRoot();
        root.style.transition = 'transform 260ms cubic-bezier(.22,.8,.2,1)';
        root.style.transform = 'translate3d(0,0,0)';
        setTimeout(function () {
            root.style.transition = '';
            root.style.transform = '';
            document.body.classList.remove('hshs-swipe-dragging');
        }, 270);
    }

    function goTo(index, direction) {
        if (index < 0 || index >= PAGES.length) {
            resetDrag();
            return;
        }

        const root = pageRoot();
        const width = window.innerWidth || document.documentElement.clientWidth || 1;
        const target = direction === 'next' ? -width : width;
        const href = hrefFor(PAGES[index]);

        document.body.classList.add('hshs-swipe-committing');
        root.style.transition = 'transform 260ms cubic-bezier(.22,.8,.2,1)';
        root.style.transform = 'translate3d(' + target + 'px,0,0)';

        setTimeout(function () {
            if (typeof window.__hshsNavigate === 'function') {
                window.__hshsNavigate(href, false, direction);
            } else {
                location.href = href;
            }
            setTimeout(function () {
                document.body.classList.remove('hshs-swipe-committing');
            }, 80);
        }, 230);
    }

    document.addEventListener('touchstart', function (event) {
        if (locked || !event.touches || event.touches.length !== 1 || isIgnored(event.target)) {
            tracking = false;
            return;
        }
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startTime = performance.now();
        tracking = true;
        dragging = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (event) {
        if (!tracking || !event.touches || event.touches.length !== 1) return;

        const dx = event.touches[0].clientX - startX;
        const dy = event.touches[0].clientY - startY;

        if (!dragging && Math.abs(dy) > Math.abs(dx) * HORIZONTAL_RATIO) {
            tracking = false;
            return;
        }
        if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy) * HORIZONTAL_RATIO) return;

        const index = currentIndex();
        if (index === -1) {
            tracking = false;
            return;
        }

        const goingNext = dx < 0;
        const targetIndex = goingNext ? index + 1 : index - 1;
        if (targetIndex < 0 || targetIndex >= PAGES.length) return;

        dragging = true;
        document.body.classList.add('hshs-swipe-dragging');

        // The finger decides the direction immediately, so warm that page now.
        prefetch(targetIndex);
        prefetch(goingNext ? targetIndex + 1 : targetIndex - 1);

        // 1:1 finger-following, with only a tiny edge resistance.
        const width = window.innerWidth || document.documentElement.clientWidth || 1;
        const limited = Math.max(
            -width * MAX_DRAG_RATIO,
            Math.min(width * MAX_DRAG_RATIO, dx * 0.96)
        );

        const root = pageRoot();
        root.style.transition = 'none';
        root.style.transform = 'translate3d(' + limited + 'px,0,0)';
    }, { passive: true });

    document.addEventListener('touchend', function (event) {
        if (!tracking || !event.changedTouches) return;
        tracking = false;

        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;
        const elapsed = Math.max(1, performance.now() - startTime);
        const velocity = Math.abs(dx) / elapsed;
        const index = currentIndex();

        if (index === -1 || Math.abs(dx) <= Math.abs(dy) * HORIZONTAL_RATIO) {
            resetDrag();
            return;
        }

        const direction = dx < 0 ? 'next' : 'previous';
        const targetIndex = direction === 'next' ? index + 1 : index - 1;
        if (targetIndex < 0 || targetIndex >= PAGES.length) {
            resetDrag();
            return;
        }

        // Long swipe or quick flick = commit. Otherwise snap back smoothly.
        if (Math.abs(dx) < SWIPE_THRESHOLD && velocity < VELOCITY_THRESHOLD) {
            resetDrag();
            return;
        }

        locked = true;
        goTo(targetIndex, direction);
        setTimeout(function () { locked = false; }, 540);
    }, { passive: true });

    document.addEventListener('touchcancel', function () {
        if (!tracking) return;
        tracking = false;
        resetDrag();
    }, { passive: true });
})();
