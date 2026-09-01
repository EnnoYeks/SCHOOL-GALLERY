(function () {
    var APP = 'HSHS World';
    var BADGE = 'https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png';

    function dressThemeCss() {
        if (document.getElementById('hshs-theme-css')) return;
        var guess = Array.from(document.querySelectorAll('script[src]'))
            .map(function (s) { return s.getAttribute('src') || ''; })
            .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-theme.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-theme.css' : 'css/hshs-theme.css');
        var link = document.createElement('link');
        link.id = 'hshs-theme-css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    function dressFavicon() {
        if (document.getElementById('hshs-icon-icon')) return;
        [{ rel: 'icon', type: 'image/png', href: BADGE }, { rel: 'apple-touch-icon', href: BADGE }].forEach(function (item) {
            var id = 'hshs-icon-' + item.rel.replace(/\s+/g, '-');
            var el = document.getElementById(id);
            if (!el) { el = document.createElement('link'); el.id = id; document.head.appendChild(el); }
            el.rel = item.rel;
            if (item.type) el.type = item.type;
            el.href = item.href;
        });
    }
    function sizeBadge(logo) {
        var mark = logo.querySelector('.brand-mark');
        var img = logo.querySelector('.brand-mark img');
        if (mark) { mark.style.width = '42px'; mark.style.height = '42px'; mark.style.flex = '0 0 42px'; }
        if (img) {
            img.width = 42; img.height = 42; img.decoding = 'async'; img.loading = 'eager';
            img.style.width = '42px'; img.style.height = '42px'; img.style.objectFit = 'contain'; img.style.display = 'block';
        }
    }
    function dressLogo() {
        var logo = document.querySelector('.logo');
        if (!logo) return;
        if (!logo.querySelector('.brand-copy')) {
            var mark = document.createElement('span');
            mark.className = 'brand-mark';
            mark.innerHTML = '<img src="' + BADGE + '" alt="Hawthorne Scribner High School badge" width="42" height="42" decoding="async">';
            var copy = document.createElement('span');
            copy.className = 'brand-copy';
            copy.innerHTML = '<strong>HSHS World</strong><small>Campus social</small>';
            logo.innerHTML = '';
            logo.appendChild(mark);
            logo.appendChild(copy);
        } else if (!logo.querySelector('.brand-copy small')) {
            var c = logo.querySelector('.brand-copy');
            if (c) c.innerHTML = '<strong>HSHS World</strong><small>Campus social</small>';
        }
        sizeBadge(logo);
        logo.setAttribute('title', APP);
    }
    function dressTopBar() {
        var nav = document.querySelector('.navbar-container');
        if (!nav) return;
        nav.classList.add('hshs-topbar');
        var actions = nav.querySelector('.nav-actions');
        if (actions) actions.classList.add('hshs-top-actions');
    }
    function dressProfile() {
        var img = document.getElementById('profileImg');
        var wrap = document.querySelector('.profile-icon');
        if (!wrap) return;
        wrap.classList.add('hshs-profile');
        if (!img) {
            img = document.createElement('img');
            img.id = 'profileImg';
            img.className = 'profile-img hshs-avatar';
            img.alt = 'Profile';
            wrap.insertBefore(img, wrap.firstChild);
        }
        if (!img.getAttribute('src') || /placeholder|via\.placeholder/i.test(img.getAttribute('src') || '')) {
            img.src = 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
                '<circle cx="32" cy="32" r="32" fill="#1d4ed8"/>' +
                '<circle cx="32" cy="24" r="10" fill="white"/>' +
                '<path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white"/>' +
                '</svg>'
            );
        }
    }
    function start() {
        dressThemeCss();
        dressFavicon();
        dressLogo();
        dressTopBar();
        dressProfile();
        if (!/HSHS World/i.test(document.title || '')) document.title = 'HSHS World';
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    document.addEventListener('hshs:page', start);
})();
