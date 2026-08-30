(function () {
    function addSwipeCss() {
        if (document.getElementById('hshs-page-swipe-css')) return;
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/page-swipe.css')
            : 'css/page-swipe.css';
        var link = document.createElement('link');
        link.id = 'hshs-page-swipe-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    var ORDER = ['index.html','gallery.html','spotlight.html','buzz.html','photos.html','videos.html','trending.html','polls.html','memories.html','about.html','contat.html','profile.html','settings.html'];
    function fileName(href) {
        try { return (new URL(href, location.href).pathname.split('/').pop() || 'index.html').toLowerCase(); }
        catch (e) { return 'index.html'; }
    }
    function guessDirection(url) {
        var from = ORDER.indexOf(fileName(location.href));
        var to = ORDER.indexOf(fileName(url));
        if (from === -1 || to === -1 || from === to) return null;
        return to > from ? 'next' : 'previous';
    }

    function wrap() {
        if (!window.__hshsNavigate || window.__hshsNavigate.__motion) return false;
        var raw = window.__hshsNavigate;
        window.__hshsNavigate = function (url, fromHistory, direction) {
            direction = direction || guessDirection(url);
            var root = document.getElementById('hshs-page');
            var slide = direction === 'next' || direction === 'previous';
            if (slide) document.body.classList.add('hshs-swiping');
            if (root && slide) {
                root.style.transition = 'transform 260ms cubic-bezier(.32,.72,.15,1), opacity 200ms ease';
                root.style.transform = 'translate3d(' + (direction === 'next' ? '-16%' : '16%') + ',0,0)';
                root.style.opacity = '0.4';
            }
            var result = raw(url, fromHistory);
            Promise.resolve(result).then(function () {
                if (root) {
                    root.style.transition = 'none';
                    root.style.transform = 'translate3d(' + (direction === 'next' ? '14%' : direction === 'previous' ? '-14%' : '0') + ',0,0)';
                    root.style.opacity = '0.65';
                    requestAnimationFrame(function () {
                        root.style.transition = 'transform 320ms cubic-bezier(.22,.8,.2,1), opacity 240ms ease';
                        root.style.transform = 'translate3d(0,0,0)';
                        root.style.opacity = '1';
                    });
                }
                document.body.classList.remove('hshs-swiping');
                if (window.syncHshsTheme) window.syncHshsTheme();
            });
            return result;
        };
        window.__hshsNavigate.__motion = true;
        return true;
    }

    addSwipeCss();
    if (!wrap()) {
        var n = 0;
        var timer = setInterval(function () {
            if (wrap() || ++n > 80) clearInterval(timer);
        }, 40);
    }
    document.addEventListener('DOMContentLoaded', function () {
        if (window.syncHshsTheme) window.syncHshsTheme();
    });
})();
