// ============================================
// HSHS PAGE-TO-PAGE HORIZONTAL SWIPE
// Instagram Stories-style visual transition.
// Keeps vertical content/video swiping untouched.
// ============================================

(function () {
    if (window.__hshsPageSwipe) return;
    window.__hshsPageSwipe = true;

    const SWIPE_THRESHOLD = 55;
    const HORIZONTAL_RATIO = 1.25;
    const PREVIEW_DISTANCE = 24;
    const MAX_DRAG = 110;

    const PAGES = [
        'index.html',
        'index/gallery.html',
        'index/buzz.html',
        'index/photos.html',
        'index/videos.html',
        'index/trending.html',
        'index/spotlight.html',
        'index/polls.html',
        'index/memories.html',
        'index/about.html',
        'index/contat.html',
        'index/profile.html'
    ];

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let dragging = false;
    let currentDelta = 0;

    function canonicalPath(path) {
        path = (path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
        if (!path || path === 'index') return 'index.html';
        if (path === 'index/index.html') return 'index.html';
        if (path === 'index/contact.html') return 'index/contat.html';
        if (path === 'index/clips.html' || path === 'index/shorts.html') return 'index/buzz.html';
        return path;
    }

    function currentIndex() {
        return PAGES.indexOf(canonicalPath(location.pathname));
    }

    function isIgnoredTarget(target) {
        if (!target || !target.closest) return false;
        return !!target.closest(
            'a, button, input, textarea, select, option, video, audio, iframe, ' +
            '[contenteditable="true"], [data-swipe-ignore], .mobile-tabbar, ' +
            '.more-sheet, .more-backdrop, .search-results, .search-container'
        );
    }

    function pageRoot() {
        return document.getElementById('hshs-page') || document.body;
    }

    function resetDrag() {
        const root = pageRoot();
        root.style.transform = '';
        root.style.transition = 'transform 220ms cubic-bezier(.22,.8,.2,1)';
        root.classList.remove('hshs-swipe-dragging');
        dragging = false;
        currentDelta = 0;
        setTimeout(() => { root.style.transition = ''; }, 240);
    }

    function showTransition(direction) {
        const root = pageRoot();
        root.classList.add('hshs-swipe-transition');
        root.style.setProperty('--hshs-swipe-direction', direction);
    }

    function goTo(index, direction) {
        if (index < 0 || index >= PAGES.length) {
            resetDrag();
            return;
        }

        const path = PAGES[index];
        const links = Array.from(document.querySelectorAll('a[href]'));
        const target = links.find(function (link) {
            try {
                const url = new URL(link.href, location.href);
                return canonicalPath(url.pathname) === path;
            } catch (e) {
                return false;
            }
        });

        showTransition(direction);

        // Give the outgoing page a tiny moment to visibly slide before the
        // existing HSHS mobile shell performs its normal page swap.
        setTimeout(function () {
            if (target) target.click();
            else window.location.href = '/' + path;
        }, 90);
    }

    function onTouchStart(event) {
        if (!event.touches || event.touches.length !== 1 || isIgnoredTarget(event.target)) {
            tracking = false;
            return;
        }

        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
        dragging = false;
        currentDelta = 0;
    }

    function onTouchMove(event) {
        if (!tracking || !event.touches || event.touches.length !== 1) return;

        const touch = event.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        // Once the gesture is clearly vertical, abandon it completely so
        // Buzz/Videos retain their normal vertical scrolling behavior.
        if (!dragging && Math.abs(deltaY) > Math.abs(deltaX) * HORIZONTAL_RATIO) {
            tracking = false;
            return;
        }

        if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY) * HORIZONTAL_RATIO) return;

        const index = currentIndex();
        if (index === -1) return;

        // Do not drag past the first/last page.
        if ((deltaX > 0 && index === 0) || (deltaX < 0 && index === PAGES.length - 1)) return;

        dragging = true;
        currentDelta = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, deltaX * 0.55));

        const root = pageRoot();
        root.classList.add('hshs-swipe-dragging');
        root.style.transition = 'none';
        root.style.transform = `translate3d(${currentDelta}px, 0, 0)`;
    }

    function onTouchEnd(event) {
        if (!tracking || !event.changedTouches || event.changedTouches.length !== 1) return;
        tracking = false;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const index = currentIndex();

        if (index === -1 || Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY) * HORIZONTAL_RATIO) {
            resetDrag();
            return;
        }

        const direction = deltaX < 0 ? 'next' : 'previous';
        const targetIndex = direction === 'next' ? index + 1 : index - 1;

        if (targetIndex < 0 || targetIndex >= PAGES.length) {
            resetDrag();
            return;
        }

        const root = pageRoot();
        root.style.transition = 'transform 180ms cubic-bezier(.32,.72,0,1)';
        root.style.transform = `translate3d(${deltaX < 0 ? -window.innerWidth * 0.18 : window.innerWidth * 0.18}px, 0, 0)`;

        goTo(targetIndex, direction);
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
})();
