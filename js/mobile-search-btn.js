(function () {
    if (window.__hshsSearchBtn) return;
    window.__hshsSearchBtn = true;

    function searchUrl() {
        var inIndex = location.pathname.indexOf('/index/') !== -1;
        return (inIndex ? '' : 'index/') + 'search.html';
    }

    function placeButton() {
        var actions = document.querySelector('.nav-actions');
        if (!actions || document.getElementById('hshsSearchBtn')) return;
        var btn = document.createElement('button');
        btn.id = 'hshsSearchBtn';
        btn.className = 'hshs-search-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Search');
        btn.innerHTML = '<i class="fas fa-magnifying-glass"></i>';
        actions.insertBefore(btn, actions.firstChild);
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var dest = searchUrl();
            try {
                if (typeof window.__hshsNavigate === 'function') {
                    window.__hshsNavigate(dest);
                    return;
                }
            } catch (err) {}
            location.href = dest;
        });
    }

    function boot() {
        placeButton();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
