(function () {
    if (window.__hshsTt) return;
    var hideTimer = 0;

    function addCss() {
        if (document.getElementById('hshs-tt-css')) return;
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-tt.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-tt.css' : 'css/hshs-tt.css');
        var link = document.createElement('link');
        link.id = 'hshs-tt-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    function html(size) {
        return '<span class="hshs-tt' + (size ? ' ' + size : '') + '" aria-hidden="true"><i></i><i></i></span>';
    }
    function overlay() {
        var box = document.getElementById('hshs-tt-overlay');
        if (box) return box;
        box = document.createElement('div');
        box.id = 'hshs-tt-overlay';
        box.innerHTML = html('lg');
        (document.body || document.documentElement).appendChild(box);
        return box;
    }
    function show() {
        overlay().classList.add('is-on');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, 1600);
    }
    function hide() {
        clearTimeout(hideTimer);
        var box = document.getElementById('hshs-tt-overlay');
        if (box) box.classList.remove('is-on');
    }
    function dress(el) {
        if (!el || el.dataset.hshsTt === '1') return;
        if (el.closest && (el.closest('#hshs-boot') || el.closest('.hshs-page-skel'))) return;
        if (el.querySelector && el.querySelector('.hshs-tt')) {
            el.dataset.hshsTt = '1';
            return;
        }
        el.dataset.hshsTt = '1';
        el.classList.add('hshs-tt-host');
        el.insertAdjacentHTML('afterbegin', html());
        var icon = el.querySelector('i.fa-spinner, i.fa-circle-notch, i.fa-spin');
        if (icon && icon.parentNode) icon.style.display = 'none';
    }
    function scan(root) {
        var scope = root || document;
        if (!scope.querySelectorAll) return;
        scope.querySelectorAll('.fa-spinner, .fa-circle-notch, .loading-spinner, .hshs-loader-spin').forEach(dress);
    }
    function boot() {
        addCss();
        overlay();
        scan(document);
    }

    window.__hshsTt = { show: show, hide: hide, html: html, scan: scan };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('hshs:page', function () { hide(); scan(document.getElementById('hshs-page')); });
})();
