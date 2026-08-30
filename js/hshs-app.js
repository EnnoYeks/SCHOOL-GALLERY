(function () {
    function store() { return window.HshsStore; }
    function fillHome() {
        if (!store()) return;
        var s = store().stats();
        var map = { totalPhotos: s.photos, totalVideos: s.videos, totalStudents: s.students, totalLikes: s.likes };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
        var grid = document.getElementById('featuredGrid');
        if (grid && !grid.dataset.filled) {
            var featured = store().featured(4);
            if (featured.length) {
                grid.dataset.filled = '1';
                grid.innerHTML = featured.map(function (p) {
                    return '<article class="featured-card"><img class="featured-card-image" src="' + p.image + '" alt="">' +
                        '<div class="featured-card-content"><div class="featured-card-title">' + p.title + '</div>' +
                        '<div class="featured-card-meta"><span>' + (p.author || '') + '</span><span>' + (p.likes || 0) + ' likes</span></div></div></article>';
                }).join('');
            }
        }
        var trend = document.getElementById('trendingToday');
        if (trend && !trend.dataset.filled) {
            var top = store().trending(3);
            if (top.length) {
                trend.dataset.filled = '1';
                trend.innerHTML = top.map(function (p) {
                    return '<div class="trending-item"><div class="trending-item-title">' + p.title + '</div>' +
                        '<div class="trending-item-meta">' + (p.likes || 0) + ' likes • ' + (p.category || '') + '</div></div>';
                }).join('');
            }
        }
    }
    function wireButtons() {
        document.addEventListener('click', function (e) {
            var logout = e.target.closest('.dropdown-item.logout');
            if (logout && store()) {
                e.preventDefault();
                store().logout();
                if (window.Utils && Utils.showToast) Utils.showToast('Signed out', 'info');
                if (window.initHshsProfile) window.initHshsProfile();
            }
        });
    }
    function start() {
        fillHome();
        wireButtons();
        if (window.initHshsProfile) window.initHshsProfile();
    }
    window.initHshsApp = start;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    document.addEventListener('hshs-store-change', fillHome);
})();
