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
        var links = [
            { rel: 'icon', type: 'image/png', href: BADGE },
            { rel: 'shortcut icon', type: 'image/png', href: BADGE },
            { rel: 'apple-touch-icon', href: BADGE }
        ];
        links.forEach(function (item) {
            var id = 'hshs-icon-' + item.rel.replace(/\s+/g, '-');
            var el = document.getElementById(id);
            if (!el) {
                el = document.createElement('link');
                el.id = id;
                document.head.appendChild(el);
            }
            el.rel = item.rel;
            if (item.type) el.type = item.type;
            el.href = item.href;
        });
        var theme = document.querySelector('meta[name="theme-color"]');
        if (!theme) {
            theme = document.createElement('meta');
            theme.setAttribute('name', 'theme-color');
            document.head.appendChild(theme);
        }
        theme.setAttribute('content', '#12306b');
    }

    function dressLogo() {
        var logo = document.querySelector('.logo');
        if (!logo) return;
        if (!logo.querySelector('.brand-copy')) {
            var mark = document.createElement('span');
            mark.className = 'brand-mark';
            mark.innerHTML = '<img src="' + BADGE + '" alt="Hawthorne Scribner High School badge">';
            var copy = document.createElement('span');
            copy.className = 'brand-copy';
            copy.innerHTML = '<strong>HSHS World</strong>';
            logo.innerHTML = '';
            logo.appendChild(mark);
            logo.appendChild(copy);
        } else {
            var mark = logo.querySelector('.brand-mark');
            if (mark && !mark.querySelector('img')) {
                mark.innerHTML = '<img src="' + BADGE + '" alt="Hawthorne Scribner High School badge">';
            }
            var strong = logo.querySelector('.brand-copy strong');
            var small = logo.querySelector('.brand-copy small');
            if (strong) strong.textContent = 'HSHS World';
            if (small) small.remove();
        }
        logo.setAttribute('title', APP);
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
        img.classList.add('hshs-avatar');
        img.alt = 'Profile';
        if (!img.getAttribute('src') || /placeholder|via\.placeholder/i.test(img.getAttribute('src') || '')) {
            img.src = 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
                '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
                '<stop offset="0" stop-color="#1d4ed8"/><stop offset="1" stop-color="#eab308"/></linearGradient></defs>' +
                '<circle cx="32" cy="32" r="32" fill="url(#g)"/>' +
                '<circle cx="32" cy="24" r="10" fill="white" fill-opacity=".92"/>' +
                '<path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white" fill-opacity=".92"/>' +
                '</svg>'
            );
        }
        wrap.setAttribute('role', 'button');
        wrap.setAttribute('aria-label', 'Profile');
        if (!wrap.dataset.wired) {
            wrap.dataset.wired = '1';
            wrap.addEventListener('click', function (e) {
                if (e.target.closest('.profile-dropdown a')) return;
                var dest = wrap.querySelector('a[href*="profile"]');
                if (dest && window.__hshsNavigate) {
                    e.preventDefault();
                    window.__hshsNavigate(dest.href);
                }
            });
        }
    }

    function cleanText(node) {
        if (!node || node.nodeType !== 3) return;
        if (node.parentNode && node.parentNode.closest && node.parentNode.closest('.brand-copy')) return;
        var next = node.nodeValue
            .replace(/ENNOYEKS School Gallery/gi, APP)
            .replace(/ENNOYEKS School/gi, APP)
            .replace(/ENNOYEKS Student/gi, 'HSHS Student')
            .replace(/ENNOYEKS/gi, 'HSHS')
            .replace(/HSHS School Gallery/gi, APP)
            .replace(/HSHS International/gi, APP);
        if (next !== node.nodeValue) node.nodeValue = next;
    }

    function walk(root) {
        if (!document.body) return;
        var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1 };
        var tree = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (n) {
                var p = n.parentNode;
                if (!p || skip[p.tagName]) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var node;
        while ((node = tree.nextNode())) cleanText(node);
    }

    function dressTitle() {
        var t = document.title || '';
        t = t.replace(/HSHS International/gi, APP)
            .replace(/HSHS School Gallery/gi, APP)
            .replace(/ENNOYEKS School Gallery/gi, APP)
            .replace(/ENNOYEKS/gi, 'HSHS');
        if (!/HSHS World/i.test(t)) {
            var page = t.split('|')[0].split('-')[0].trim();
            t = page && page.toLowerCase() !== 'hshs world' ? page + ' | ' + APP : APP;
        }
        document.title = t;
    }

    function dressHero() {
        var title = document.querySelector('.hero-title');
        if (title) title.textContent = 'HSHS WORLD';
        var sub = document.querySelector('.hero-subtitle');
        if (sub && /capture moments/i.test(sub.textContent)) {
            sub.textContent = 'Your school. One world. Photos, Vibe, Buzz and memories.';
        }
        var quote = document.getElementById('quoteAuthor');
        if (quote && /ENNOYEKS/i.test(quote.textContent)) quote.textContent = APP;
        document.querySelectorAll('.footer-section h4').forEach(function (h) {
            if (/HSHS Gallery|School Gallery|ENNOYEKS/i.test(h.textContent)) h.textContent = APP;
        });
    }

    function start() {
        dressThemeCss();
        dressFavicon();
        dressLogo();
        dressProfile();
        dressTitle();
        dressHero();
        walk(document.body);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    setInterval(start, 2000);
})();
