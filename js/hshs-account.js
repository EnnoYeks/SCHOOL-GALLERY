(function () {
    if (window.__hshsAccount) return;
    window.__hshsAccount = true;

    function fileName() {
        return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    }
    function inSub() {
        return /\/index\//i.test(location.pathname);
    }
    function sub(name) {
        return inSub() ? name : 'index/' + name;
    }
    function store() { return window.HshsStore; }
    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[ch];
        });
    }
    function ago(ts) {
        var d = Date.now() - Number(ts || Date.now());
        if (d < 60000) return 'Just now';
        if (d < 3600000) return Math.floor(d / 60000) + ' min ago';
        if (d < 86400000) return Math.floor(d / 3600000) + ' hr ago';
        if (d < 172800000) return 'Yesterday';
        return Math.floor(d / 86400000) + ' days ago';
    }
    function guestPic() {
        return 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
            '<circle cx="32" cy="32" r="32" fill="#1d4ed8"/>' +
            '<circle cx="32" cy="24" r="10" fill="white"/>' +
            '<path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white"/>' +
            '</svg>'
        );
    }
    function me() {
        var user = store() && store().currentUser ? store().currentUser() : null;
        var p = {};
        try { p = JSON.parse(localStorage.getItem('userProfile') || 'null') || {}; } catch (e) {}
        return {
            name: (user && user.name) || p.fullName || 'Guest student',
            email: p.email || ((user && user.username) ? user.username + '@hshs.ac.ug' : 'student@hshs.ac.ug'),
            role: (user && user.role) || p.role || 'HSHS Student',
            photo: (user && user.avatar) || p.profilePhoto || guestPic()
        };
    }
    function saveKey() {
        var uid = store() && store().currentUser && store().currentUser() ? store().currentUser().id : 'guest';
        return 'hshsWorldSaves:' + uid;
    }
    function readSaves() {
        try { return JSON.parse(localStorage.getItem(saveKey()) || '[]'); } catch (e) { return []; }
    }
    function writeSaves(ids) {
        localStorage.setItem(saveKey(), JSON.stringify(ids));
    }
    function toggleSave(postId) {
        var ids = readSaves();
        var i = ids.indexOf(postId);
        if (i >= 0) ids.splice(i, 1);
        else ids.unshift(postId);
        writeSaves(ids);
        return i < 0;
    }
    function postsByIds(ids) {
        var s = store();
        var all = s && s.listPosts ? s.listPosts() : [];
        return ids.map(function (id) {
            return all.find(function (p) { return p.id === id; });
        }).filter(Boolean);
    }
    function interactedPosts() {
        var s = store();
        if (!s) return [];
        var st = s.getState();
        var uid = st.sessionUserId || 'guest';
        var liked = (st.likes || []).filter(function (k) { return k.indexOf(uid + ':') === 0; })
            .map(function (k) { return k.split(':')[1]; });
        var commented = (st.comments || []).filter(function (c) {
            var author = (s.currentUser() || {}).name;
            return author && c.author === author;
        }).map(function (c) { return c.postId; });
        var ids = [];
        liked.concat(commented).forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); });
        return postsByIds(ids).map(function (p) {
            var likedThis = liked.indexOf(p.id) !== -1;
            var commentedThis = commented.indexOf(p.id) !== -1;
            p._action = likedThis && commentedThis ? 'You liked and commented' : (commentedThis ? 'You commented' : 'You liked');
            return p;
        });
    }
    function postCard(p, extra) {
        return (
            '<article class="hshs-post-card">' +
            '<div class="who">' + escapeHtml(p.author || 'HSHS World') + '</div>' +
            '<div class="meta">' + escapeHtml(extra || p.category || 'Post') + ' · ' + ago(p.createdAt) + '</div>' +
            '<p>' + escapeHtml(p.title || '') + (p.description ? ' — ' + escapeHtml(p.description) : '') + '</p>' +
            (p.image || p.imageUrl ? '<img class="hshs-post-media" src="' + escapeHtml(p.image || p.imageUrl) + '" alt="">' : '') +
            '</article>'
        );
    }
    function emptyBox(title, copy) {
        return '<div class="hshs-empty"><div style="font-size:28px">☆</div><h4>' + escapeHtml(title) + '</h4><p>' + escapeHtml(copy) + '</p></div>';
    }
    function fillMorePage() {
        var info = me();
        var name = document.getElementById('morePageName');
        var email = document.getElementById('morePageEmail');
        var role = document.getElementById('morePageRole');
        var pic = document.getElementById('morePagePic');
        if (name) name.textContent = info.name;
        if (email) email.textContent = info.email;
        if (role) role.textContent = info.role;
        if (pic) pic.src = info.photo || guestPic();
    }
    function renderSaved() {
        var box = document.getElementById('hshsSavedList');
        if (!box) return;
        var posts = postsByIds(readSaves());
        box.innerHTML = posts.length
            ? posts.map(function (p) { return postCard(p, 'Saved'); }).join('')
            : emptyBox('No saved posts yet', 'Star a school post and it will land here.');
    }
    function renderInteracted() {
        var box = document.getElementById('hshsInteractedList');
        if (!box) return;
        var posts = interactedPosts();
        box.innerHTML = posts.length
            ? posts.map(function (p) { return postCard(p, p._action); }).join('')
            : emptyBox('No interactions yet', 'Likes and comments you make will show here.');
    }
    function notifIcon(type) {
        if (type === 'friend_request' || type === 'friend_accept') return 'fa-user-group';
        if (type === 'comment' || type === 'mentions') return 'fa-comment';
        if (type === 'like') return 'fa-heart';
        return 'fa-bell';
    }
    function renderNotifs(filter) {
        var box = document.getElementById('hshsNotifList');
        if (!box) return;
        var s = store();
        var list = s && s.listNotifications ? s.listNotifications(40) : [];
        if (filter === 'mentions') list = list.filter(function (n) { return /mention|comment/i.test(n.type || ''); });
        if (filter === 'school') list = list.filter(function (n) { return /school|event|featured|poll/i.test((n.type || '') + ' ' + (n.title || '')); });
        if (!list.length) {
            box.innerHTML = emptyBox('No notifications', 'School alerts and replies will show here.');
            return;
        }
        box.innerHTML = list.map(function (n) {
            return (
                '<article class="hshs-notif-card' + (n.read ? '' : ' unread') + '" data-nid="' + escapeHtml(n.id) + '">' +
                '<div class="hshs-notif-ico"><i class="fas ' + notifIcon(n.type) + '"></i></div>' +
                '<div><p><b>' + escapeHtml(n.title || 'Update') + '</b><br>' + escapeHtml(n.message || '') + '</p>' +
                '<time>' + ago(n.createdAt) + '</time></div></article>'
            );
        }).join('');
        box.querySelectorAll('[data-nid]').forEach(function (el) {
            el.addEventListener('click', function () {
                if (s && s.markNotificationRead) s.markNotificationRead(el.getAttribute('data-nid'));
                el.classList.remove('unread');
                syncBadge();
            });
        });
    }
    function syncBadge() {
        var s = store();
        var n = s && s.unreadNotifications ? s.unreadNotifications() : 0;
        document.querySelectorAll('#notificationBadge').forEach(function (badge) {
            badge.textContent = n;
            badge.style.display = n > 0 ? 'flex' : 'none';
        });
    }
    function wireSavedTabs() {
        document.querySelectorAll('[data-saved-tab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-saved-tab]').forEach(function (b) { b.classList.remove('on'); });
                btn.classList.add('on');
                var saved = document.getElementById('hshsSavedList');
                var inter = document.getElementById('hshsInteractedList');
                if (saved) saved.hidden = btn.getAttribute('data-saved-tab') !== 'saved';
                if (inter) inter.hidden = btn.getAttribute('data-saved-tab') !== 'interacted';
            });
        });
    }
    function wireNotifTabs() {
        document.querySelectorAll('[data-notif-tab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-notif-tab]').forEach(function (b) { b.classList.remove('on'); });
                btn.classList.add('on');
                renderNotifs(btn.getAttribute('data-notif-tab'));
            });
        });
        var mark = document.getElementById('hshsMarkRead');
        if (mark) {
            mark.onclick = function () {
                if (store() && store().markAllNotificationsRead) store().markAllNotificationsRead();
                renderNotifs((document.querySelector('[data-notif-tab].on') || {}).getAttribute('data-notif-tab') || 'all');
                syncBadge();
            };
        }
    }
    function wrapNavigate() {
        if (!window.__hshsNavigate || window.__hshsNavigate.__accountWrapped) return;
        var orig = window.__hshsNavigate;
        function wrapped(url, fromHistory) {
            try {
                var next = new URL(url, location.href);
                var file = (next.pathname.split('/').pop() || '').toLowerCase();
                var extra = ['more.html', 'saved.html', 'notifications.html'];
                if (extra.indexOf(file) !== -1 && next.pathname.indexOf('/index/') === -1) {
                    next.pathname = (location.pathname.indexOf('/index/') !== -1)
                        ? location.pathname.replace(/[^/]+$/, file)
                        : '/index/' + file;
                    url = next.href;
                }
            } catch (e) {}
            return orig(url, fromHistory);
        }
        wrapped.__accountWrapped = true;
        window.__hshsNavigate = wrapped;
    }
    function retargetMore() {
        var more = document.getElementById('openMoreSheet');
        if (!more) return;
        more.setAttribute('href', sub('more.html'));
        more.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.__hshsCloseMore) window.__hshsCloseMore();
            if (window.__hshsNavigate) window.__hshsNavigate(sub('more.html'));
            else location.href = sub('more.html');
        };
        var grid = document.querySelector('#moreSheet .more-grid');
        if (grid && !grid.getAttribute('data-account-links')) {
            grid.setAttribute('data-account-links', '1');
            grid.insertAdjacentHTML('afterbegin',
                '<a href="' + sub('notifications.html') + '" data-tone="sky"><span class="ico"><i class="fas fa-bell"></i></span><span>Alerts</span></a>' +
                '<a href="' + sub('saved.html') + '" data-tone="gold"><span class="ico"><i class="fas fa-star"></i></span><span>Saved</span></a>' +
                '<a href="' + sub('more.html') + '" data-tone="navy"><span class="ico"><i class="fas fa-ellipsis"></i></span><span>Account</span></a>'
            );
        }
        document.querySelectorAll('.mobile-tabbar a[data-tab="more"]').forEach(function (a) {
            var file = fileName();
            a.classList.toggle('active', ['more.html', 'saved.html', 'notifications.html', 'profile.html', 'settings.html'].indexOf(file) !== -1);
        });
    }
    function wireTopBar() {
        var bell = document.querySelector('.notification-icon');
        if (bell && !bell.__hshsAccountBound) {
            bell.__hshsAccountBound = true;
            bell.addEventListener('click', function (e) {
                if (window.innerWidth > 1024) return;
                e.preventDefault();
                e.stopPropagation();
                if (window.__hshsNavigate) window.__hshsNavigate(sub('notifications.html'));
                else location.href = sub('notifications.html');
            }, true);
        }
        var profile = document.querySelector('.profile-icon');
        if (profile && !profile.__hshsAccountBound) {
            profile.__hshsAccountBound = true;
            profile.addEventListener('click', function (e) {
                if (window.innerWidth > 1024) return;
                e.preventDefault();
                e.stopPropagation();
                if (window.__hshsNavigate) window.__hshsNavigate(sub('more.html'));
                else location.href = sub('more.html');
            }, true);
        }
    }
    function wireSettingsTheme() {
        var account = document.getElementById('accountTab');
        if (!account || document.getElementById('hshsAccountTheme')) return;
        var row = document.createElement('div');
        row.className = 'hshs-theme-row';
        row.id = 'hshsAccountTheme';
        row.innerHTML =
            '<div><b>Appearance</b><div style="color:var(--text-secondary);font-size:.8rem">Theme lives in account settings</div></div>' +
            '<div class="hshs-theme-picks">' +
            '<button type="button" class="hshs-theme-pick" data-theme-pick="dark">Dark</button>' +
            '<button type="button" class="hshs-theme-pick" data-theme-pick="light">Light</button>' +
            '</div>';
        account.insertBefore(row, account.firstChild);
        function paint() {
            var cur = window.__hshsReadTheme ? window.__hshsReadTheme() : 'light';
            row.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
                btn.classList.toggle('on', btn.getAttribute('data-theme-pick') === cur);
            });
        }
        row.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var next = btn.getAttribute('data-theme-pick');
                try { localStorage.setItem('theme', JSON.stringify(next)); } catch (e) {}
                if (window.syncHshsTheme) window.syncHshsTheme();
                paint();
            });
        });
        paint();
        if (location.hash === '#theme' || location.hash === '#privacy') {
            var tab = location.hash.replace('#', '');
            var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
            if (btn) btn.click();
        }
    }
    function boot() {
        wrapNavigate();
        retargetMore();
        ['more.html', 'saved.html', 'notifications.html'].forEach(function (f) {
            var cache = window.__hshsPageCache = window.__hshsPageCache || {};
            if (cache[f]) return;
            var href = new URL(sub(f), location.href).href;
            fetch(href, { credentials: 'same-origin' }).then(function (res) {
                return res.ok ? res.text() : null;
            }).then(function (html) {
                if (!html) return;
                cache[href] = html;
                cache[f] = html;
            }).catch(function () {});
        });
        fillMorePage();
        renderSaved();
        renderInteracted();
        renderNotifs('all');
        wireSavedTabs();
        wireNotifTabs();
        wireTopBar();
        wireSettingsTheme();
        syncBadge();
    }

    window.__hshsToggleSave = toggleSave;
    window.__hshsIsSaved = function (id) { return readSaves().indexOf(id) !== -1; };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('hshs:page', boot);
    document.addEventListener('hshs:notify', syncBadge);
})();
