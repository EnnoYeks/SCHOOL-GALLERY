// ============================================
// HSHS PAGE-TO-PAGE HORIZONTAL SWIPE
// Keeps vertical content/video swiping untouched.
// ============================================

(function () {
    if (window.__hshsPageSwipe) return;
    window.__hshsPageSwipe = true;

    const SWIPE_THRESHOLD = 70;
    const HORIZONTAL_RATIO = 1.2;

    // Main public page order. Settings/Admin stay out of swipe navigation.
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

    function canonicalPath(path) {
        path = (path || '').toLowerCase().replace(/^\/+|\/+$/g, '');
        if (!path || path === 'index') return 'index.html';
        if (path === 'index/index.html') return 'index.html';
        if (path === 'index/contact.html') return 'index/contat.html';
        if (path === 'index/clips.html' || path === 'index/shorts.html') return 'index/buzz.html';
        return path;
    }

    function currentIndex() {
        const path = canonicalPath(location.pathname);
        return PAGES.indexOf(path);
    }

    function isIgnoredTarget(target) {
        if (!target || !target.closest) return false;

        return !!target.closest(
            'a, button, input, textarea, select, option, video, audio, iframe, ' +
            '[contenteditable="true"], [data-swipe-ignore], .mobile-tabbar, ' +
            '.more-sheet, .more-backdrop, .search-results, .search-container'
        );
    }

    function goTo(index) {
        if (index < 0 || index >= PAGES.length) return;

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

        // Clicking the existing navigation link lets the HSHS mobile shell
        // handle the page swap, loader, history and scripts exactly as normal.
        if (target) {
            target.click();
            return;
        }

        // Safe fallback if a route is not currently represented in the DOM.
        window.location.href = '/' + path;
    }

    function onTouchStart(event) {
        if (!event.touches || event.touches.length !== 1) {
            tracking = false;
            return;
        }

        const touch = event.touches[0];
        if (isIgnoredTarget(event.target)) {
            tracking = false;
            return;
        }

        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
    }

    function onTouchEnd(event) {
        if (!tracking || !event.changedTouches || event.changedTouches.length !== 1) return;
        tracking = false;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        // Deliberately require a clearly horizontal gesture. This is the key
        // protection for Buzz/Videos and every other vertical scrolling area.
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY) * HORIZONTAL_RATIO) return;

        const index = currentIndex();
        if (index === -1) return;

        // Left = next page, right = previous page.
        if (deltaX < 0) goTo(index + 1);
        else goTo(index - 1);
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
})();
