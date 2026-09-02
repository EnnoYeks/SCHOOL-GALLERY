(function () {
    if (window.__hshsNotify) return;
    window.__hshsNotify = true;
    function store() { return window.HshsStore; }
    function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]; }); }
    function iconFor(type) {
        var map = { friend_request: 'fa-user-plus', friend_accept: 'fa-user-check', message: 'fa-comment-dots', like: 'fa-heart', mention: 'fa-comment', follow: 'fa-user-plus', system: 'fa-bell' };
        return map[type] || 'fa-bell';
    }
    function relative(ts) { var d = Date.now() - (ts || 0); if (d < 60000) return 'Just now'; if (d < 3600000) return Math.floor(d / 60000) + 'm'; if (d < 86400000) return Math.floor(d / 3600000) + 'h'; return Math.floor(d / 86400000) + 'd'; }
    function updateBadge() {
        var s = store(), badge = document.getElementById('notificationBadge'); if (!badge || !s) return;
        var n = (s.unreadNotifications && typeof s.unreadNotifications === 'function') ? s.unreadNotifications() : 0; badge.textContent = n > 99 ? '99+' : String(n); badge.style.display = n > 0 ? 'flex' : 'none'; badge.classList.toggle('is-on', n > 0);
    }
    function renderList() {
        try {
            var list = document.getElementById('notificationsList'), s = store(); if (!list || !s) return;
            var rows = (s.listNotifications && s.listNotifications(30)) || [];
            if (!rows.length) { list.innerHTML = '<p class="empty-state hshs-notify-empty">No notifications yet</p>'; return; }
            list.innerHTML = '';
            rows.forEach(function (n) {
                try {
                    var item = document.createElement('div');
                    item.className = 'hshs-notify-item' + (n.read ? '' : ' unread');
                    item.setAttribute('data-nid', n.id);
                    var ico = document.createElement('span'); ico.className = 'hshs-notify-ico'; ico.innerHTML = '<i class="fas ' + escapeHtml(iconFor(n.type)) + '"></i>';
                    var body = document.createElement('div'); body.className = 'hshs-notify-body';
                    var title = document.createElement('strong'); title.innerHTML = escapeHtml(n.title || 'Notification');
                    var msg = document.createElement('div'); msg.className = 'hshs-notify-msg'; msg.innerHTML = escapeHtml(n.message || (n.data && n.data.text) || '');
                    var ts = document.createElement('small'); ts.className = 'hshs-notify-time'; ts.textContent = relative(n.createdAt || Date.now());
                    body.appendChild(title); body.appendChild(msg); body.appendChild(ts);
                    item.appendChild(ico); item.appendChild(body);
                    if (n.type === 'friend_request' && n.data && n.data.requestId && !n.read) {
                        var actions = document.createElement('div'); actions.className = 'hshs-notify-actions';
                        var a = document.createElement('button'); a.type = 'button'; a.setAttribute('data-accept', n.data.requestId); a.textContent = 'Accept';
                        var d = document.createElement('button'); d.type = 'button'; d.setAttribute('data-decline', n.data.requestId); d.textContent = 'Decline';
                        actions.appendChild(a); actions.appendChild(d); item.appendChild(actions);
                    }
                    list.appendChild(item);
                } catch (e) { /* skip row errors */ }
            });
            var clear = document.createElement('button'); clear.type = 'button'; clear.className = 'hshs-notify-clear'; clear.id = 'hshsMarkAllRead'; clear.textContent = 'Mark all read';
            list.appendChild(clear);
            // wire actions
            list.querySelectorAll('[data-accept]').forEach(function (btn) { btn.onclick = function (e) { e.stopPropagation(); var s = store(); if (!s || !s.acceptFriend) return; try { s.acceptFriend(btn.getAttribute('data-accept')); if (s.markNotificationRead) s.markNotificationRead(btn.closest('.hshs-notify-item').getAttribute('data-nid')); } catch (err) {} updateBadge(); renderList(); }; });
            list.querySelectorAll('[data-decline]').forEach(function (btn) { btn.onclick = function (e) { e.stopPropagation(); var s = store(); if (!s || !s.declineFriend) return; try { s.declineFriend(btn.getAttribute('data-decline')); if (s.markNotificationRead) s.markNotificationRead(btn.closest('.hshs-notify-item').getAttribute('data-nid')); } catch (err) {} updateBadge(); renderList(); }; });
            if (clear) clear.onclick = function () { var s = store(); if (!s || !s.markAllNotificationsRead) return; try { s.markAllNotificationsRead(); } catch (err) {} renderList(); updateBadge(); };
            list.querySelectorAll('.hshs-notify-item').forEach(function (item) { item.onclick = function () { var s = store(); if (!s || !s.markNotificationRead) return; try { s.markNotificationRead(item.getAttribute('data-nid')); } catch (err) {} updateBadge(); item.classList.remove('unread'); }; });
        } catch (e) { /* ignore render errors */ }
    }
    function wireBell() {
        try {
            var icon = document.querySelector('.notification-icon'), dropdown = document.getElementById('notificationDropdown'); if (!icon || !dropdown || icon.__hshsBound) return;
            icon.__hshsBound = true; icon.addEventListener('click', function (e) { e.stopPropagation(); dropdown.classList.toggle('active'); if (dropdown.classList.contains('active')) renderList(); });
        } catch (e) { /* ignore */ }
    }
    function ensureShell() {
        try {
            var icon = document.querySelector('.notification-icon'); if (!icon) return;
            if (!document.getElementById('notificationBadge')) { var badge = document.createElement('span'); badge.className = 'notification-badge'; badge.id = 'notificationBadge'; badge.style.display = 'none'; icon.appendChild(badge); }
            if (!document.getElementById('notificationDropdown')) { var dd = document.createElement('div'); dd.className = 'notification-dropdown'; dd.id = 'notificationDropdown'; dd.innerHTML = '<div class="notification-dropdown-inner"><h3>Notifications</h3><div id="notificationsList" class="notifications-list"></div></div>'; document.body.appendChild(dd); }
        } catch (e) { /* ignore */ }
    }
    function presenceTick() { var s = store(); if (s && s.heartbeat) try { s.heartbeat(); } catch (e) {} }
    function boot() { ensureShell(); wireBell(); updateBadge(); presenceTick(); }
    window.__hshsRefreshNotify = function () { updateBadge(); var dd = document.getElementById('notificationDropdown'); if (dd && dd.classList.contains('active')) renderList(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    document.addEventListener('hshs:page', boot); document.addEventListener('hshs:notify', function () { window.__hshsRefreshNotify(); }); setInterval(presenceTick, 25000);
})();
