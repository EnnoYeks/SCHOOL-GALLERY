(function () {
    function dressLogo() {
        var logo = document.querySelector('.logo');
        if (!logo) return;
        if (!logo.querySelector('.brand-copy')) {
            var icon = logo.querySelector('i') || document.createElement('i');
            icon.className = 'fas fa-graduation-cap';
            var mark = document.createElement('span');
            mark.className = 'brand-mark';
            mark.appendChild(icon);
            var copy = document.createElement('span');
            copy.className = 'brand-copy';
            copy.innerHTML = '<strong>HSHS</strong><small>International</small>';
            logo.innerHTML = '';
            logo.appendChild(mark);
            logo.appendChild(copy);
        } else {
            var strong = logo.querySelector('.brand-copy strong');
            var small = logo.querySelector('.brand-copy small');
            if (strong) strong.textContent = 'HSHS';
            if (small) small.textContent = 'International';
        }
        logo.setAttribute('title', 'HSHS International');
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
                '<stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>' +
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

    function start() {
        dressLogo();
        dressProfile();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    setInterval(start, 1500);
})();
