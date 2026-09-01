(function () {
    if (window.__hshsSocial) return;
    window.__hshsSocial = true;

    function store() { return window.HshsStore; }

    function initials(name) {
        return String(name || '?').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[ch];
        });
    }

    function profileHref(user) {
        var inSub = location.pathname.indexOf('/index/') !== -1;
        var base = inSub ? 'profile.html' : 'index/profile.html';
        return base + '?u=' + encodeURIComponent(user.username || user.id);
    }

    function chatHref(user) {
        var inSub = location.pathname.indexOf('/index/') !== -1;
        var base = inSub ? 'chat.html' : 'index/chat.html';
        return base + '?with=' + encodeURIComponent(user.id);
    }

    function friendLabel(status) {
        if (status === 'friends') return 'Friends';
        if (status === 'outgoing') return 'Requested';
        if (status === 'incoming') return 'Accept';
        return 'Add friend';
    }

    function peopleCard(user) {
        var s = store();
        if (!s || !user) return '';
        var counts = s.followCounts(user.id);
        var st = s.friendStatus ? s.friendStatus(user.id) : 'none';
        var online = s.isOnline ? s.isOnline(user.id) : false;
        return (
            '<article class="hshs-people-card" data-uid="' + user.id + '">' +
            '<a class="hshs-people-main" href="' + profileHref(user) + '">' +
            '<span class="hshs-people-avatar">' +
            (user.avatar ? '<img src="' + escapeHtml(user.avatar) + '" alt="">' : initials(user.name)) +
            '<i class="hshs-online-dot' + (online ? '' : ' off') + '"></i></span>' +
            '<span class="hshs-people-meta">' +
            '<strong>' + escapeHtml(user.name) + '</strong>' +
            '<small>@' + escapeHtml(user.username || 'user') + ' · ' + escapeHtml(user.role || 'Student') + '</small>' +
            '<em>' + counts.friends + ' friends · ' + counts.followers + ' followers</em>' +
            '</span></a>' +
            '<div class="hshs-people-actions">' +
            '<button type="button" class="hshs-follow-btn' + (st === 'friends' || st === 'outgoing' ? ' is-on' : '') + '" data-friend="' + user.id + '">' +
            friendLabel(st) + '</button>' +
            '<a class="hshs-chat-btn" href="' + chatHref(user) + '" title="Chat" aria-label="Chat with ' + escapeHtml(user.name) + '">' +
            '<i class="fas fa-comment-dots"></i></a>' +
            '</div></article>'
        );
    }

    function bindPeopleActions(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-friend]').forEach(function (btn) {
            btn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                var s = store();
                if (!s || !s.requestFriend) return;
                var uid = btn.getAttribute('data-friend');
                var st = s.friendStatus(uid);
                var res;
                if (st === 'incoming') {
                    var req = (s.getState().friendRequests || []).find(function (r) {
                        return r.fromId === uid && r.toId === s.currentUser().id && r.status === 'pending';
                    });
                    res = req ? s.acceptFriend(req.id) : s.requestFriend(uid);
                } else if (st === 'friends') {
                    return;
                } else {
                    res = s.requestFriend(uid);
                }
                if (!res || !res.ok) {
                    alert((res && res.error) || 'Could not send request');
                    return;
                }
                var next = s.friendStatus(uid);
                btn.classList.toggle('is-on', next === 'friends' || next === 'outgoing');
                btn.textContent = friendLabel(next);
                document.dispatchEvent(new Event('hshs:notify'));
            };
        });
        scope.querySelectorAll('[data-follow]').forEach(function (btn) {
            btn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                var s = store();
                if (!s) return;
                var res = s.toggleFollow(btn.getAttribute('data-follow'));
                if (!res.ok) { alert(res.error || 'Could not follow'); return; }
                btn.classList.toggle('is-on', res.following);
                btn.textContent = res.following ? 'Following' : 'Follow';
            };
        });
    }

    function enhanceSearchDropdown() {
        var input = document.getElementById('searchInput');
        var box = document.getElementById('searchResults');
        if (!input || !box || input.__hshsPeopleBound) return;
        input.__hshsPeopleBound = true;

        var timer = null;
        function run(q) {
            var s = store();
            if (!s) return;
            q = String(q || '').trim();
            if (!q) { box.classList.remove('active'); return; }
            var people = s.searchPeople(q).slice(0, 6);
            var posts = (s.search(q) || []).slice(0, 4);
            if (!people.length && !posts.length) {
                box.innerHTML = '<div class="hshs-search-empty">No people or posts for "' + escapeHtml(q) + '"</div>';
                box.classList.add('active');
                return;
            }
            var html = '';
            if (people.length) {
                html += '<div class="hshs-search-section">People</div>';
                people.forEach(function (u) { html += peopleCard(u); });
            }
            if (posts.length) {
                html += '<div class="hshs-search-section">Posts</div>';
                posts.forEach(function (p) {
                    html += '<div class="hshs-search-post"><strong>' + escapeHtml(p.title) + '</strong><small>' + escapeHtml(p.author || '') + '</small></div>';
                });
            }
            box.innerHTML = html;
            box.classList.add('active');
            bindPeopleActions(box);
        }

        input.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () { run(input.value); }, 220);
        });
        input.addEventListener('focus', function () {
            if (input.value.trim()) run(input.value);
        });
    }

    function renderProfilePage() {
        var root = document.getElementById('hshsProfileRoot');
        if (!root || !store()) return;
        var s = store();
        var params = new URLSearchParams(location.search);
        var key = params.get('u') || params.get('id');
        var me = s.currentUser();
        var user = null;
        if (key) user = s.getUserByUsername(key) || s.getUser(key);
        if (!user) user = me;
        if (!user) {
            root.innerHTML = '<div class="hshs-profile-empty">Sign in to view profiles.</div>';
            return;
        }

        var isMe = me && me.id === user.id;
        var counts = s.followCounts(user.id);
        var posts = s.postsByUser(user.id);
        var st = !isMe && s.friendStatus ? s.friendStatus(user.id) : 'self';
        var online = s.isOnline ? s.isOnline(user.id) : false;
        var presence = s.presenceLabel ? s.presenceLabel(user.id) : (online ? 'Online' : 'Offline');

        root.innerHTML =
            '<div class="hshs-profile-hero theme-' + escapeHtml(user.chatTheme || 'ocean') + '">' +
            '<div class="hshs-profile-cover"></div>' +
            '<div class="hshs-profile-sheet">' +
            '<div class="hshs-profile-avatar">' + (user.avatar ? '<img src="' + escapeHtml(user.avatar) + '" alt="">' : initials(user.name)) +
            '<i class="hshs-online-dot' + (online ? '' : ' off') + '"></i></div>' +
            '<h1>' + escapeHtml(user.name) + '</h1>' +
            '<p class="hshs-profile-handle">@' + escapeHtml(user.username || 'user') + ' · ' + escapeHtml(user.role || 'Student') + (user.classYear ? ' · ' + escapeHtml(user.classYear) : '') + '</p>' +
            '<div class="hshs-profile-presence' + (online ? '' : ' off') + '"><i class="fas fa-circle"></i> ' + escapeHtml(presence) + '</div>' +
            '<p class="hshs-profile-bio">' + escapeHtml(user.bio || '') + '</p>' +
            '<div class="hshs-profile-stats">' +
            '<div><b>' + posts.length + '</b><span>Posts</span></div>' +
            '<div><b>' + counts.friends + '</b><span>Friends</span></div>' +
            '<div><b>' + counts.followers + '</b><span>Followers</span></div>' +
            '</div>' +
            '<div class="hshs-profile-actions">' +
            (isMe
                ? '<button type="button" class="hshs-btn" id="hshsEditProfileBtn"><i class="fas fa-pen"></i> Edit profile</button>' +
                  '<a class="hshs-btn ghost" href="' + (location.pathname.indexOf('/index/') !== -1 ? 'chat.html' : 'index/chat.html') + '"><i class="fas fa-comments"></i> Messages</a>'
                : '<button type="button" class="hshs-btn' + (st === 'friends' || st === 'outgoing' ? ' secondary' : '') + '" data-friend="' + user.id + '">' + friendLabel(st) + '</button>' +
                  '<a class="hshs-btn ghost" href="' + chatHref(user) + '"><i class="fas fa-comment-dots"></i> Chat</a>') +
            '</div></div></div>' +

            (isMe ? editPanelHtml(user) : '') +

            '<section class="hshs-profile-section">' +
            '<h2>Posts</h2>' +
            '<div class="hshs-profile-grid">' +
            (posts.length ? posts.map(function (p) {
                return '<article class="hshs-profile-post"><img src="' + escapeHtml(p.image || p.imageUrl || '') + '" alt=""><div><strong>' + escapeHtml(p.title) + '</strong><small><i class="fas fa-heart"></i> ' + (p.likes || 0) + '</small></div></article>';
            }).join('') : '<p class="hshs-profile-empty">No posts yet.</p>') +
            '</div></section>';

        bindPeopleActions(root);
        var editBtn = document.getElementById('hshsEditProfileBtn');
        var panel = document.getElementById('hshsEditPanel');
        if (editBtn && panel) editBtn.onclick = function () { panel.hidden = !panel.hidden; };
        var form = document.getElementById('hshsEditForm');
        if (form) {
            form.onsubmit = function (e) {
                e.preventDefault();
                var res = s.updateProfile({
                    name: form.name.value,
                    username: form.username.value,
                    bio: form.bio.value,
                    classYear: form.classYear.value,
                    role: form.role.value,
                    chatTheme: form.chatTheme.value,
                    bubbleStyle: form.bubbleStyle.value
                });
                if (!res.ok) { alert(res.error); return; }
                renderProfilePage();
            };
        }
    }

    function editPanelHtml(user) {
        return (
            '<div class="hshs-edit-panel" id="hshsEditPanel" hidden>' +
            '<form id="hshsEditForm">' +
            '<label>Display name<input name="name" value="' + escapeHtml(user.name) + '" required></label>' +
            '<label>Username<input name="username" value="' + escapeHtml(user.username || '') + '" required></label>' +
            '<label>Bio<textarea name="bio" rows="3">' + escapeHtml(user.bio || '') + '</textarea></label>' +
            '<div class="hshs-edit-row">' +
            '<label>Class<input name="classYear" value="' + escapeHtml(user.classYear || '') + '"></label>' +
            '<label>Role<input name="role" value="' + escapeHtml(user.role || '') + '"></label>' +
            '</div>' +
            '<div class="hshs-edit-row">' +
            '<label>Chat theme<select name="chatTheme">' +
            ['ocean','grape','mint','sunset','rose','slate'].map(function (t) {
                return '<option value="' + t + '"' + ((user.chatTheme || 'ocean') === t ? ' selected' : '') + '>' + t + '</option>';
            }).join('') + '</select></label>' +
            '<label>Bubbles<select name="bubbleStyle">' +
            ['rounded','soft','square'].map(function (t) {
                return '<option value="' + t + '"' + ((user.bubbleStyle || 'rounded') === t ? ' selected' : '') + '>' + t + '</option>';
            }).join('') + '</select></label>' +
            '</div>' +
            '<button type="submit" class="hshs-btn">Save profile</button>' +
            '</form></div>'
        );
    }

    function boot() {
        enhanceSearchDropdown();
        renderProfilePage();
    }

    window.initHshsSocial = boot;
    window.hshsPeopleCard = peopleCard;
    window.hshsBindPeopleActions = bindPeopleActions;
    window.hshsChatHref = chatHref;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('hshs:page', boot);
})();
