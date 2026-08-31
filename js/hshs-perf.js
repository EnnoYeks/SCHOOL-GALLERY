(function () {
    if (window.__hshsPerf) return;
    window.__hshsPerf = true;
    if (!document.getElementById('hshs-perf-css')) {
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-perf.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-perf.css' : 'css/hshs-perf.css');
        var link = document.createElement('link');
        link.id = 'hshs-perf-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    function lightenImages(root) {
        Array.from((root || document).querySelectorAll('img')).forEach(function (img) {
            if (!img.hasAttribute('loading')) img.loading = 'lazy';
            if (!img.hasAttribute('decoding')) img.decoding = 'async';
            img.draggable = false;
        });
    }
    lightenImages(document);
    document.addEventListener('DOMContentLoaded', function () { lightenImages(document); });
    window.__hshsLightenImages = lightenImages;
    document.addEventListener('visibilitychange', function () {
        if (document.hidden && window.particleSystem && particleSystem.pause) particleSystem.pause();
        else if (!document.hidden && window.particleSystem && particleSystem.resume) particleSystem.resume();
    });
})();
