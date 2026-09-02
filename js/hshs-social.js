(function () {
    if (window.__hshsSocial) return;
    window.__hshsSocial = true;

    function store() { return window.HshsStore; }

    function initials(name) {
        return String(name || '?').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function inSub() {
        return location.pathname.indexOf('/index/') !== -1;
    }

    function pageHref(file) {
        return inSub() ? file : ('index/' + file);
    }

    function profileHref(user) {
        return pageHref('profile.html') + '?u=' + encodeURIComponent(user.username || user.id);
    }

    function chatHref(user) {
        return pageHref('chat.html') + '?with=' + encodeURIComponent(user.id);
    }

    function galleryHref(post) {
        var dest = (post && post.type === 'video') ? 'videos.html' : 'gallery.html';
        return pageHref(dest) + (post && post.id ? ('#post-' + post.id) : '');
    }

    function friendLabel(status) {
        if (status === 'friends') return 'Friends';
        if (status === 'outgoing') return 'Requested';
        if (status === 'incoming') return 'Accept';
        return 'Add friend';
    }

    var APP_PAGES = [
        { q: 'gallery photos feed', label: 'Gallery', file: 'gallery.html', icon: 'fa-images', hint: 'Campus feed' },
        { q: 'photos stills album', label: 'Photos', file: 'photos.html', icon: 'fa-camera', hint: 'Photo library' },
        { q: 'vibe videos video', label: 'Vibe', file: 'videos.html', icon: 'fa-play', hint: 'School videos' },
        { q: 'buzz clips shorts', label: 'Buzz', file: 'buzz.html', icon: 'fa-bolt', hint: 'Short clips' },
        { q: 'chat messages rooms', label: 'Chat', file: 'chat.html', icon: 'fa-comments', hint: 'School-safe rooms' },
        { q: 'trending hot', label: 'Trending', file: 'trending.html', icon: 'fa-fire', hint: 'What is hot' },
        { q: 'spotlight feature', label: 'Spotlight', file: 'spotlight.html', icon: 'fa-trophy', hint: 'Featured students' },
        { q: 'polls vote', label: 'Polls', file: 'polls.html', icon: 'fa-square-poll-vertical', hint: 'School polls' },
        { q: 'memories history', label: 'Memories', file: 'memories.html', icon: 'fa-clock-rotate-left', hint: 'On this day' },
        { q: 'profile me account', label: 'Profile', file: 'profile.html', icon: 'fa-user', hint: 'Your profile' },
        { q: 'notifications alerts', label: 'Notifications', file: 'notifications.html', icon: 'fa-bell', hint: 'Activity' },
        { q: 'settings', label: 'Settings', file: 'settings.html', icon: 'fa-gear', hint: 'Preferences' }
    ];

    function searchPages(q) {
        q = String(q || '').toLowerCase().trim();
        if (!q) return [];
        return APP_PAGES.filter(function (p) {
            return (p.q + ' ' + p.label + ' ' + p.hint).toLowerCase().indexOf(q) !== -1;
        }).slice(0, 5);
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
            '<small>@' + escapeHtml(user.username || 'user') + ' · ' + escapeHtml(user.classYear || user.role || 'Student') + '</small>' +
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
                if (document.getElementById('hshsProfileRoot')) renderProfilePage();
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
            var posts = (s.search(q) || []).slice(0, 5);
            var pages = searchPages(q);
            if (!people.length && !posts.length && !pages.length) {
                box.innerHTML = '<div class="hshs-search-empty">No students, posts, or pages for "' + escapeHtml(q) + '"</div>';
                box.classList.add('active');
                return;
            }
            var html = '';
            if (people.length) {
                html += '<div class="hshs-search-section">Students</div>';
                people.forEach(function (u) { html += peopleCard(u); });
            }
            if (posts.length) {
                html += '<div class="hshs-search-section">Photos & Buzz</div>';
                posts.forEach(function (p) {
                    var kind = p.type === 'video' ? 'Buzz / Vibe' : 'Photo';
                    html += '<a class="hshs-search-post" href="' + galleryHref(p) + '">' +
                        (p.image || p.imageUrl ? '<img src="' + escapeHtml(p.image || p.imageUrl) + '" alt="">' : '<i class="fas fa-image"></i>') +
                        '<span><strong>' + escapeHtml(p.title) + '</strong>' +
                        '<small>' + escapeHtml(p.author || '') + (p.classTag ? ' · ' + escapeHtml(p.classTag) : '') + ' · ' + kind + '</small></span></a>';
                });
            }
            if (pages.length) {
                html += '<div class="hshs-search-section">Pages</div>';
                pages.forEach(function (p) {
                    html += '<a class="hshs-search-page" href="' + pageHref(p.file) + '">' +
                        '<i class="fas ' + p.icon + '"></i>' +
                        '<span><strong>' + escapeHtml(p.label) + '</strong><small>' + escapeHtml(p.hint) + '</small></span></a>';
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
        document.addEventListener('click', function (e) {
            if (e.target === input || box.contains(e.target)) return;
            box.classList.remove('active');
        });
    }

    function compressAvatar(file, maxSide, quality) {
        maxSide = maxSide || 320;
        quality = quality || 0.82;
        return new Promise(function (resolve, reject) {
            createImageBitmap(file).then(function (bitmap) {
                var scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
                var canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(bitmap.width * scale));
                canvas.height = Math.max(1, Math.round(bitmap.height * scale));
                canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            }).catch(reject);
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
            root.innerHTML = '<div class="hshs-profile-empty">Sign in to view profiles. Create a local account from Settings or the More sheet.</div>';
            return;
        }

        var isMe = me && me.id === user.id;
        var counts = s.followCounts(user.id);
        var posts = s.postsByUser(user.id);
        var friends = s.friendsOf ? s.friendsOf(user.id) : [];
        var st = !isMe && s.friendStatus ? s.friendStatus(user.id) : 'self';
        var online = s.isOnline ? s.isOnline(user.id) : false;
        var presence = s.presenceLabel ? s.presenceLabel(user.id) : (online ? 'Online' : 'Offline');

        root.innerHTML =
            '<div class="hshs-profile-hero theme-' + escapeHtml(user.chatTheme || 'ocean') + '">' +
            '<div class="hshs-profile-cover"></div>' +
            '<div class="hshs-profile-sheet">' +
            '<div class="hshs-profile-avatar" id="hshsProfileAvatar">' +
            (user.avatar ? '<img src="' + escapeHtml(user.avatar) + '" alt="">' : initials(user.name)) +
            '<i class="hshs-online-dot' + (online ? '' : ' off') + '"></i></div>' +
            '<h1>' + escapeHtml(user.name) + '</h1>' +
            '<p class="hshs-profile-handle">@' + escapeHtml(user.username || 'user') +
            ' · ' + escapeHtml(user.role || 'Student') +
            (user.classYear ? ' · ' + escapeHtml(user.classYear) : '') + '</p>' +
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
                  '<a class="hshs-btn ghost" href="' + pageHref('chat.html') + '"><i class="fas fa-comments"></i> Messages</a>'
                : '<button type="button" class="hshs-btn' + (st === 'friends' || st === 'outgoing' ? ' secondary' : '') + '" data-friend="' + user.id + '">' + friendLabel(st) + '</button>' +
                  '<button type="button" class="hshs-btn ghost" data-follow="' + user.id + '">' + (s.isFollowing(user.id) ? 'Following' : 'Follow') + '</button>' +
                  '<a class="hshs-btn ghost" href="' + chatHref(user) + '"><i class="fas fa-comment-dots"></i> Chat</a>') +
            '</div></div></div>' +

            (isMe ? editPanelHtml(user) : '') +

            '<section class="hshs-profile-section">' +
            '<h2>Friends</h2>' +
            '<div class="hshs-friends-row">' +
            (friends.length
                ? friends.map(function (f) {
                    return '<a class="hshs-friend-chip" href="' + profileHref(f) + '" title="@' + escapeHtml(f.username || '') + '">' +
                        '<span class="av">' + (f.avatar ? '<img src="' + escapeHtml(f.avatar) + '" alt="">' : initials(f.name)) + '</span>' +
                        '<span class="nm">' + escapeHtml(f.name.split(' ')[0]) + '</span></a>';
                }).join('')
                : '<p class="hshs-profile-empty">No friends yet — search students and send a request.</p>') +
            '</div></section>' +

            '<section class="hshs-profile-section">' +
            '<h2>Posts</h2>' +
            '<div class="hshs-profile-grid">' +
            (posts.length ? posts.map(function (p) {
                return '<a class="hshs-profile-post" href="' + galleryHref(p) + '">' +
                    '<img src="' + escapeHtml(p.image || p.imageUrl || '') + '" alt="">' +
                    '<div><strong>' + escapeHtml(p.title) + '</strong>' +
                    '<small><i class="fas fa-heart"></i> ' + (p.likes || 0) +
                    (p.classTag ? ' · ' + escapeHtml(p.classTag) : '') + '</small></div></a>';
            }).join('') : '<p class="hshs-profile-empty">No posts yet. Tap + to share a campus moment.</p>') +
            '</div></section>';

        bindPeopleActions(root);
        var editBtn = document.getElementById('hshsEditProfileBtn');
        var panel = document.getElementById('hshsEditPanel');
        if (editBtn && panel) editBtn.onclick = function () { panel.hidden = !panel.hidden; };
        var form = document.getElementById('hshsEditForm');
        if (form) {
            form.onsubmit = function (e) {
                e.preventDefault();
                var patch = {
                    name: form.name.value,
                    username: form.username.value,
                    bio: form.bio.value,
                    classYear: form.classYear.value,
                    role: form.role.value,
                    chatTheme: form.chatTheme.value,
                    bubbleStyle: form.bubbleStyle.value
                };
                if (form.dataset.avatarData) patch.avatar = form.dataset.avatarData;
                var res = s.updateProfile(patch);
                if (!res.ok) { alert(res.error); return; }
                renderProfilePage();
            };
            var avInput = document.getElementById('hshsAvatarFile');
            var avPreview = document.getElementById('hshsAvatarPreview');
            if (avInput) {
                avInput.onchange = function () {
                    var f = avInput.files && avInput.files[0];
                    if (!f) return;
                    compressAvatar(f).then(function (dataUrl) {
                        form.dataset.avatarData = dataUrl;
                        if (avPreview) {
                            avPreview.innerHTML = '<img src="' + dataUrl + '" alt="">';
                        }
                    }).catch(function () {
                        alert('Could not read that photo.');
                    });
                };
            }
        }
    }

    function editPanelHtml(user) {
        return (
            '<div class="hshs-edit-panel" id="hshsEditPanel" hidden>' +
            '<form id="hshsEditForm">' +
            '<label class="hshs-avatar-pick">Photo' +
            '<div class="hshs-avatar-preview" id="hshsAvatarPreview">' +
            (user.avatar ? '<img src="' + escapeHtml(user.avatar) + '" alt="">' : initials(user.name)) +
            '</div>' +
            '<input type="file" id="hshsAvatarFile" accept="image/*" hidden>' +
            '<button type="button" class="hshs-btn ghost" onclick="document.getElementById(\'hshsAvatarFile\').click()">Choose photo</button>' +
            '</label>' +
            '<label>Display name<input name="name" value="' + escapeHtml(user.name) + '" required></label>' +
            '<label>Username<input name="username" value="' + escapeHtml(user.username || '') + '" required></label>' +
            '<label>Bio<textarea name="bio" rows="3">' + escapeHtml(user.bio || '') + '</textarea></label>' +
            '<div class="hshs-edit-row">' +
            '<label>Class<select name="classYear">' +
            ['S1','S2','S3','S4','S5','S6','Campus','Staff'].map(function (c) {
                return '<option value="' + c + '"' + ((user.classYear || '') === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') +
            '</select></label>' +
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

    function loadEngage() {
        if (document.getElementById('hshs-engage-js')) return;
        var current = '';
        var list = document.querySelectorAll('script[src*="navigation.js"]');
        for (var i = 0; i < list.length; i++) {
            if (list[i].src.indexOf('mobile-navigation') === -1) current = list[i].src;
        }
        if (!current) return;
        var ver = window.__hshsAssetVer || '260902k';
        function bust(url) { return url.replace(/(\?.*)?$/, '') + '?v=' + ver; }
        if (!document.getElementById('hshs-engage-css')) {
            var link = document.createElement('link');
            link.id = 'hshs-engage-css';
            link.rel = 'stylesheet';
            link.href = bust(current.replace(/js\/navigation\.js(\?.*)?$/, 'css/hshs-engage.css'));
            document.head.appendChild(link);
        }
        var s = document.createElement('script');
        s.id = 'hshs-engage-js';
        s.src = bust(current.replace(/navigation\.js(\?.*)?$/, 'hshs-engage.js'));
        document.head.appendChild(s);
    }

    function boot() {
        loadEngage();
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
