(function () {
    if (window.__hshsSearchBtn) return;
    window.__hshsSearchBtn = true;

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
            document.body.classList.toggle('search-open');
            var input = document.getElementById('searchInput');
            if (document.body.classList.contains('search-open') && input) {
                setTimeout(function () { input.focus(); }, 40);
            }
        });
    }

    function closeSearch(e) {
        if (e && e.target && (e.target.closest('#hshsSearchBtn') || e.target.closest('.search-container'))) return;
        document.body.classList.remove('search-open');
    }

    function boot() {
        placeButton();
        document.addEventListener('click', closeSearch);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') document.body.classList.remove('search-open');
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
