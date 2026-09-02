(function () {
    if (window.__hshsNotify) return;
    window.__hshsNotify = true;
    function store() { return window.HshsStore; }
    function escapeHtml(s) { return String(s || '').replace(/[&<>\"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[ch]; }); }
    function iconFor(type) {
        var map = { friend_request: 'fa-user-plus', friend_accept: 'fa-user-check', message: 'fa-comment-dots', like: 'fa-heart', mention: 'fa-comment', follow: 'fa-user-plus', system: 'fa-bell' };
        return map[type] || 'fa-bell';
    }
    function relative(ts) { var d = Date.now() - (ts || 0); if (d < 60000) return 'Just now'; if (d < 3600000) return Math.floor(d / 60000) + 'm'; if (d < 86400000) return Math.floor(d / 3600000) + 'h'; return Math.floor(d / 86400000) + 'd'; }
    function updateBadge() {
        var s = store(), badge = document.getElementById('notificationBadge'); if (!badge || !s) return;
        var n = s.unreadNotifications ? s.unreadNotifications() : 0; badge.textContent = n > 99 ? '99+' : String(n); badge.style.display = n > 0 ? 'flex' : 'none'; badge.classList.toggle('is-on', n > 0);
    }
    function renderList() {
        var list = document.getElementById('notificationsList'), s = store(); if (!list || !s) return;
        var rows = s.listNotifications ? s.listNotifications(30) : [];
        if (!rows.length) { list.innerHTML = '<p class="empty-state hshs-notify-empty">No notifications yet</p>'; return; }
        list.innerHTML = rows.map(function (n) {
            var actions = '';
            if (n.type === 'friend_request' && n.data && n.data.requestId && !n.read) actions = '<div class="hshs-notify-actions"><button type="button" data-accept="' + n.data.requestId + '" data-nid="' + n.id + '">Accept</button><button type="button" class="ghost" data-decline="' + n.data.requestId + '" data-nid="' + n.id + '">Decline</button></div>';
            return '<div class="hshs-notify-item' + (n.read ? '' : ' unread') + '" data-nid="' + n.id + '"><span class="hshs-notify-ico"><i class="fas ' + iconFor(n.type) + '"></i></span><div class="hshs-notify-body"><strong>' + escapeHtml(n.title) + '</strong><p>' + escapeHtml(n.message) + '</p><small>' + relative(n.createdAt) + '</small>' + actions + '</div></div>';
        }).join('') + '<button type="button" class="hshs-notify-clear" id="hshsMarkAllRead">Mark all read</button>';
        list.querySelectorAll('[data-accept]').forEach(function (btn) { btn.onclick = function (e) { e.stopPropagation(); s.acceptFriend(btn.getAttribute('data-accept')); s.markNotificationRead(btn.getAttribute('data-nid')); renderList(); updateBadge(); }; });
        list.querySelectorAll('[data-decline]').forEach(function (btn) { btn.onclick = function (e) { e.stopPropagation(); s.declineFriend(btn.getAttribute('data-decline')); s.markNotificationRead(btn.getAttribute('data-nid')); renderList(); updateBadge(); }; });
        var clear = document.getElementById('hshsMarkAllRead'); if (clear) clear.onclick = function () { s.markAllNotificationsRead(); renderList(); updateBadge(); };
        list.querySelectorAll('.hshs-notify-item').forEach(function (item) { item.onclick = function () { s.markNotificationRead(item.getAttribute('data-nid')); updateBadge(); item.classList.remove('unread'); }; });
    }
    function wireBell() {
        var icon = document.querySelector('.notification-icon'), dropdown = document.getElementById('notificationDropdown'); if (!icon || !dropdown || icon.__hshsBound) return;
        icon.__hshsBound = true; icon.addEventListener('click', function (e) { e.stopPropagation(); dropdown.classList.toggle('active'); if (dropdown.classList.contains('active')) renderList(); });
    }
    function ensureShell() {
        var icon = document.querySelector('.notification-icon'); if (!icon) return;
        if (!document.getElementById('notificationBadge')) { var badge = document.createElement('span'); badge.className = 'notification-badge'; badge.id = 'notificationBadge'; badge.style.display = 'none'; icon.appendChild(badge); }
        if (!document.getElementById('notificationDropdown')) { var dd = document.createElement('div'); dd.className = 'notification-dropdown'; dd.id = 'notificationDropdown'; dd.innerHTML = '<div class="notifications-list" id="notificationsList"><p class="empty-state">No notifications</p></div>'; icon.appendChild(dd); }
        if (!document.getElementById('notificationsList')) { var list = document.createElement('div'); list.className = 'notifications-list'; list.id = 'notificationsList'; document.getElementById('notificationDropdown').appendChild(list); }
    }
    function presenceTick() { var s = store(); if (s && s.heartbeat) s.heartbeat(); }
    function boot() { ensureShell(); wireBell(); updateBadge(); presenceTick(); }
    window.__hshsRefreshNotify = function () { updateBadge(); var dd = document.getElementById('notificationDropdown'); if (dd && dd.classList.contains('active')) renderList(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    document.addEventListener('hshs:page', boot); document.addEventListener('hshs:notify', function () { window.__hshsRefreshNotify(); }); setInterval(presenceTick, 25000);
})();
