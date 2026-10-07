(function () {
    if (window.HshsRoute) return;
    var ALIAS = { vibe: 'buzz', clips: 'buzz', shorts: 'buzz', studio: 'videos', contat: 'contact', '': 'home', index: 'home', 'index.html': 'home' };
    function name() {
        var file = (location.pathname.split('/').pop() || '').toLowerCase().replace(/\.html$/, '');
        return ALIAS[file] || file || 'home';
    }
    window.HshsRoute = {
        name: name,
        is: function (page) {
            var want = ALIAS[page] || page;
            return name() === want || document.documentElement.getAttribute('data-hshs-page') === want;
        },
        reveal: function () {
            if (typeof window.__hshsRevealPage === 'function') window.__hshsRevealPage();
            document.documentElement.classList.add('hshs-ready');
            document.documentElement.classList.remove('hshs-booting');
        }
    };
})();
(function () {
    if (window.__hshsBoot) return;
    window.__hshsBoot = true;
    function reveal() {
        if (window.HshsPaint) window.HshsPaint.now();
        document.documentElement.classList.add('hshs-ready');
        document.documentElement.classList.remove('hshs-booting');
        window.__hshsBootDone = true;
        var boot = document.getElementById('hshs-boot');
        if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    }
    reveal();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reveal);
})();
