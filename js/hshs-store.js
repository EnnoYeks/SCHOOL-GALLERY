(function () {
    if (window.HshsStore) return;
    var KEY = 'hshsWorldStore_v2';
    var ONLINE_MS = 45000;
    var PICS = [
        'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=900&q=70',
        'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=70',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70',
        'https://images.unsplash.com/photo-1577896852618-01fff3891965?auto=format&fit=crop&w=900&q=70',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=70'
    ];

    function now() { return Date.now(); }
    function id(prefix) { return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9); }
    function slugify(name) {
        return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 18) || 'student';
    }
    function load() {
        try {
            var v2 = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (v2) return v2;
            var v1 = JSON.parse(localStorage.getItem('hshsWorldStore_v1') || 'null');
            if (v1) { migrate(v1); localStorage.setItem(KEY, JSON.stringify(v1)); return v1; }
            return null;
        } catch (e) { return null; }
    }
    function migrate(s) {
        s.follows = s.follows || [];
        s.friendRequests = s.friendRequests || [];
        s.friends = s.friends || [];
        s.notifications = s.notifications || [];
        s.likes = s.likes || [];
        s.saves = s.saves || [];
        s.comments = s.comments || [];
        s.users = (s.users || []).map(function (u) {
            u.username = u.username || slugify(u.name);
            u.bio = u.bio || 'HSHS World member.';
            u.avatar = u.avatar || '';
            u.chatTheme = u.chatTheme || 'ocean';
            u.bubbleStyle = u.bubbleStyle || 'rounded';
            u.lastSeen = u.lastSeen || now() - Math.floor(Math.random() * 600000);
            if (u.pin) delete u.pin;
            return u;
        });
        return s;
    }
    function save(state) {
        localStorage.setItem(KEY, JSON.stringify(state));
        window.__hshsState = state;
        return state;
    }
    function seed() {
        var users = [
            { id: 'u-demo', name: 'Amina Namukasa', username: 'amina_s4', classYear: 'S4', role: 'Student', bio: 'Sports, track days, and school vibes.', avatar: '', chatTheme: 'ocean', bubbleStyle: 'rounded', lastSeen: now(), createdAt: now() - 86400000 * 20 },
            { id: 'u-prefect', name: 'Joel Wambede', username: 'joel_pref', classYear: 'S6', role: 'Prefect', bio: 'Prefect desk. Keep it school-safe.', avatar: '', chatTheme: 'grape', bubbleStyle: 'rounded', lastSeen: now() - 20000, createdAt: now() - 86400000 * 40 },
            { id: 'u-sports', name: 'Sports Club', username: 'hshs_sports', classYear: 'Campus', role: 'Club', bio: 'Match days, drills, and house spirit.', avatar: '', chatTheme: 'mint', bubbleStyle: 'soft', lastSeen: now() - 120000, createdAt: now() - 86400000 * 50 },
            { id: 'u-choir', name: 'Choir Desk', username: 'hshs_choir', classYear: 'Music', role: 'Club', bio: 'Rehearsals and assembly anthems.', avatar: '', chatTheme: 'sunset', bubbleStyle: 'soft', lastSeen: now() - 300000, createdAt: now() - 86400000 * 55 },
            { id: 'u-lab', name: 'Science Lab', username: 'stem_lab', classYear: 'STEM', role: 'Department', bio: 'Experiments, fairs, and lab notes.', avatar: '', chatTheme: 'slate', bubbleStyle: 'square', lastSeen: now() - 900000, createdAt: now() - 86400000 * 60 },
            { id: 'u-house', name: 'House Captains', username: 'house_caps', classYear: 'Houses', role: 'Leadership', bio: 'House points and spirit days.', avatar: '', chatTheme: 'rose', bubbleStyle: 'rounded', lastSeen: now() - 45000, createdAt: now() - 86400000 * 62 },
            { id: 'u-maya', name: 'Maya Okello', username: 'maya_lens', classYear: 'S5', role: 'Student', bio: 'Photography club. Capturing campus light.', avatar: '', chatTheme: 'ocean', bubbleStyle: 'soft', lastSeen: now() - 8000, createdAt: now() - 86400000 * 12 },
            { id: 'u-brian', name: 'Brian Kato', username: 'brian_k', classYear: 'S3', role: 'Student', bio: 'Football and Friday vibes.', avatar: '', chatTheme: 'mint', bubbleStyle: 'rounded', lastSeen: now() - 180000, createdAt: now() - 86400000 * 8 }
        ];
        var posts = [
            { id: 'p1', type: 'photo', title: 'Sports Day 2026', description: 'Track finals on the main field.', category: 'sports', classTag: 'S4', image: PICS[0], imageUrl: PICS[0], thumbnailUrl: PICS[0], author: 'Amina Namukasa', authorId: 'u-demo', likes: 42, views: 310, comments: 6, shares: 4, createdAt: now() - 86400000 * 2 },
            { id: 'p2', type: 'photo', title: 'Morning Assembly', description: 'House announcements and the school anthem.', category: 'events', classTag: 'Campus', image: PICS[1], imageUrl: PICS[1], thumbnailUrl: PICS[1], author: 'Joel Wambede', authorId: 'u-prefect', likes: 28, views: 190, comments: 3, shares: 2, createdAt: now() - 86400000 * 1 },
            { id: 'p3', type: 'photo', title: 'Science Fair', description: 'Robotics and chemistry stands in the hall.', category: 'academics', classTag: 'S4', image: PICS[3], imageUrl: PICS[3], thumbnailUrl: PICS[3], author: 'Amina Namukasa', authorId: 'u-demo', likes: 61, views: 420, comments: 9, shares: 7, createdAt: now() - 86400000 * 5 },
            { id: 'p4', type: 'video', title: 'HSHS Sports Day 2026', description: 'Best moments from the field.', category: 'sports', classTag: 'Campus', image: PICS[0], imageUrl: PICS[0], thumbnailUrl: PICS[0], author: 'Sports Club', authorId: 'u-sports', likes: 180, views: 2400, comments: 24, duration: '04:35', featured: true, createdAt: now() - 86400000 * 2 },
            { id: 'p5', type: 'video', title: 'Graduation Ceremony', description: 'S6 send-off in the main hall.', category: 'events', classTag: 'S6', image: PICS[2], imageUrl: PICS[2], thumbnailUrl: PICS[2], author: 'Prefects', authorId: 'u-prefect', likes: 210, views: 2600, comments: 41, duration: '04:18', featured: true, createdAt: now() - 86400000 * 3 }
        ];
        return save({
            users: users,
            sessionUserId: null,
            posts: posts,
            follows: [
                { followerId: 'u-demo', followingId: 'u-prefect', createdAt: now() - 86400000 },
                { followerId: 'u-demo', followingId: 'u-sports', createdAt: now() - 86400000 * 2 }
            ],
            friendRequests: [
                { id: 'fr-seed1', fromId: 'u-maya', toId: 'u-demo', status: 'pending', createdAt: now() - 900000 }
            ],
            friends: [
                { a: 'u-demo', b: 'u-prefect', createdAt: now() - 86400000 * 3 }
            ],
            notifications: [
                { id: 'n-seed1', userId: 'u-demo', type: 'friend_request', title: 'Friend request', message: 'Maya Okello (@maya_lens) wants to be friends', data: { requestId: 'fr-seed1', fromId: 'u-maya' }, read: false, createdAt: now() - 900000 }
            ],
            likes: [],
            saves: [],
            comments: [{ id: 'c1', postId: 'p1', author: 'Joel Wambede', text: 'What a race!', createdAt: now() - 3600000 }]
        });
    }
    function state() {
        var s = load();
        if (!s || !s.users || !s.posts) s = seed();
        else migrate(s);
        if (!s.follows) s.follows = [];
        if (!s.friendRequests) s.friendRequests = [];
        if (!s.friends) s.friends = [];
        if (!s.notifications) s.notifications = [];
        if (!s.likes) s.likes = [];
        if (!s.saves) s.saves = [];
        if (!s.comments) s.comments = [];
        window.__hshsState = s;
        return s;
    }
    function score(item) {
        var ageHours = Math.max(1, (now() - new Date(item.createdAt).getTime()) / 3600000);
        return ((item.likes || 0) * 3) + ((item.comments || 0) * 2) + ((item.views || 0) * 0.05) + (item.featured ? 40 : 0) - (ageHours * 0.4);
    }
    function userById(uid) { return state().users.find(function (u) { return u.id === uid; }) || null; }
    function ensureUsername(user) {
        if (user && !user.username) user.username = slugify(user.name);
        return user;
    }
    function pairKey(a, b) { return [a, b].sort().join('__');
    }
    function pushNotify(userId, type, title, message, data) {
        var s = state();
        s.notifications.unshift({
            id: id('n'),
            userId: userId,
            type: type,
            title: title,
            message: message,
            data: data || {},
            read: false,
            createdAt: now()
        });
        s.notifications = s.notifications.slice(0, 80);
        save(s);
        try { document.dispatchEvent(new Event('hshs:notify')); } catch (e) {}
    }

    var api = {
        ready: true,
        getState: state,
        currentUser: function () { return ensureUsername(userById(state().sessionUserId)); },
        listUsers: function () { return state().users.slice().map(ensureUsername); },
        getUser: function (uid) { return ensureUsername(userById(uid)); },
        getUserByUsername: function (username) {
            var u = state().users.find(function (x) {
                return String(x.username || '').toLowerCase() === String(username || '').toLowerCase();
            });
            return ensureUsername(u);
        },
        searchPeople: function (q) {
            q = String(q || '').toLowerCase().trim().replace(/^@/, '');
            var me = state().sessionUserId;
            return api.listUsers().filter(function (u) {
                if (u.id === me) return false;
                if (!q) return true;
                return (u.name + ' ' + (u.username || '') + ' ' + (u.role || '') + ' ' + (u.classYear || '') + ' ' + (u.bio || '')).toLowerCase().indexOf(q) !== -1;
            });
        },
        usersByClass: function (klass) {
            var k = String(klass || '').toLowerCase();
            return api.listUsers().filter(function (u) {
                return String(u.classYear || '').toLowerCase() === k;
            });
        },
        // Local demo helpers only — real auth is Firebase email/password or Google
        signup: function (data) {
            var s = state();
            var name = String(data.name || '').trim();
            var username = slugify(data.username || name);
            if (name.length < 2) return { ok: false, error: 'Enter your name.' };
            if (s.users.some(function (u) { return u.name.toLowerCase() === name.toLowerCase(); })) {
                return { ok: false, error: 'That name already has an account. Switch instead.' };
            }
            if (s.users.some(function (u) { return String(u.username || '').toLowerCase() === username; })) {
                username = username + Math.floor(Math.random() * 90 + 10);
            }
            var user = {
                id: id('u'), name: name, username: username, classYear: data.classYear || 'S1',
                role: data.role || 'Student', bio: data.bio || 'New HSHS World member.', avatar: data.avatar || '',
                chatTheme: data.chatTheme || 'ocean', bubbleStyle: data.bubbleStyle || 'rounded',
                lastSeen: now(), createdAt: now()
            };
            s.users.push(user);
            s.sessionUserId = user.id;
            save(s);
            return { ok: true, user: user };
        },
        login: function () {
            return { ok: false, error: 'Use email/password or Google sign-in on the login page.' };
        },
        switchUser: function (uid) {
            var s = state();
            if (!userById(uid)) return { ok: false, error: 'Account not found.' };
            s.sessionUserId = uid;
            var u = userById(uid);
            if (u) u.lastSeen = now();
            save(s);
            return { ok: true, user: u };
        },
        logout: function () {
            var s = state();
            s.sessionUserId = null;
            save(s);
        },
        updateProfile: function (patch) {
            var s = state();
            var user = userById(s.sessionUserId);
            if (!user) return { ok: false, error: 'Sign in first.' };
            if (patch.username !== undefined) {
                var un = slugify(patch.username);
                if (un.length < 3) return { ok: false, error: 'Username needs at least 3 letters.' };
                if (s.users.some(function (u) { return u.id !== user.id && String(u.username || '').toLowerCase() === un; })) {
                    return { ok: false, error: 'That username is taken.' };
                }
                user.username = un;
            }
            ['name', 'classYear', 'role', 'bio', 'avatar', 'chatTheme', 'bubbleStyle'].forEach(function (k) {
                if (patch[k] !== undefined) user[k] = patch[k];
            });
            save(s);
            return { ok: true, user: user };
        },
        heartbeat: function () {
            var s = state();
            var user = userById(s.sessionUserId);
            if (!user) return;
            user.lastSeen = now();
            save(s);
        },
        isOnline: function (uid) {
            var u = userById(uid);
            if (!u || !u.lastSeen) return false;
            return (now() - u.lastSeen) < ONLINE_MS;
        },
        presenceLabel: function (uid) {
            if (api.isOnline(uid)) return 'Online';
            var u = userById(uid);
            if (!u || !u.lastSeen) return 'Offline';
            var d = now() - u.lastSeen;
            if (d < 3600000) return 'Active ' + Math.max(1, Math.floor(d / 60000)) + 'm ago';
            if (d < 86400000) return 'Active ' + Math.floor(d / 3600000) + 'h ago';
            return 'Offline';
        },
        isFollowing: function (targetId) {
            var me = state().sessionUserId;
            if (!me || !targetId) return false;
            return state().follows.some(function (f) { return f.followerId === me && f.followingId === targetId; });
        },
        toggleFollow: function (targetId) {
            var s = state();
            var me = s.sessionUserId;
            if (!me) return { ok: false, error: 'Sign in first.', following: false };
            if (!userById(targetId) || targetId === me) return { ok: false, error: 'Invalid user.', following: false };
            var i = s.follows.findIndex(function (f) { return f.followerId === me && f.followingId === targetId; });
            if (i >= 0) {
                s.follows.splice(i, 1);
                save(s);
                return { ok: true, following: false, counts: api.followCounts(targetId) };
            }
            s.follows.push({ followerId: me, followingId: targetId, createdAt: now() });
            save(s);
            return { ok: true, following: true, counts: api.followCounts(targetId) };
        },
        followCounts: function (uid) {
            var s = state();
            return {
                followers: s.follows.filter(function (f) { return f.followingId === uid; }).length,
                following: s.follows.filter(function (f) { return f.followerId === uid; }).length,
                friends: s.friends.filter(function (f) { return f.a === uid || f.b === uid; }).length
            };
        },
        friendsOf: function (uid) {
            return state().friends.filter(function (f) {
                return f.a === uid || f.b === uid;
            }).map(function (f) {
                return userById(f.a === uid ? f.b : f.a);
            }).filter(Boolean).map(ensureUsername);
        },
        isFriend: function (uid) {
            var me = state().sessionUserId;
            if (!me || !uid) return false;
            var key = pairKey(me, uid);
            return state().friends.some(function (f) { return pairKey(f.a, f.b) === key; });
        },
        friendStatus: function (uid) {
            var me = state().sessionUserId;
            if (!me || !uid || me === uid) return 'self';
            if (api.isFriend(uid)) return 'friends';
            var s = state();
            var outgoing = s.friendRequests.find(function (r) { return r.fromId === me && r.toId === uid && r.status === 'pending'; });
            if (outgoing) return 'outgoing';
            var incoming = s.friendRequests.find(function (r) { return r.fromId === uid && r.toId === me && r.status === 'pending'; });
            if (incoming) return 'incoming';
            return 'none';
        },
        requestFriend: function (targetId) {
            var s = state();
            var me = s.sessionUserId;
            var target = userById(targetId);
            var meUser = userById(me);
            if (!me || !target || !meUser) return { ok: false, error: 'Sign in first.' };
            if (me === targetId) return { ok: false, error: 'That is you.' };
            if (api.isFriend(targetId)) return { ok: true, status: 'friends' };
            var existing = s.friendRequests.find(function (r) {
                return r.status === 'pending' && ((r.fromId === me && r.toId === targetId) || (r.fromId === targetId && r.toId === me));
            });
            if (existing) {
                if (existing.fromId === targetId) return api.acceptFriend(existing.id);
                return { ok: true, status: 'outgoing', request: existing };
            }
            var req = { id: id('fr'), fromId: me, toId: targetId, status: 'pending', createdAt: now() };
            s.friendRequests.unshift(req);
            save(s);
            pushNotify(targetId, 'friend_request', 'Friend request', meUser.name + ' (@' + (meUser.username || 'user') + ') wants to be friends', { requestId: req.id, fromId: me });
            return { ok: true, status: 'outgoing', request: req };
        },
        acceptFriend: function (requestId) {
            return { ok: false, error: 'Use the notifications UI.' };
        },
        listPosts: function () { return state().posts.slice().sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); }); },
        postsByUser: function (uid) {
            return state().posts.filter(function (p) { return p.authorId === uid; });
        },
        listNotifications: function (max) {
            max = max || 40;
            var me = state().sessionUserId;
            return state().notifications.filter(function (n) { return !me || n.userId === me; }).slice(0, max);
        },
        unreadNotifications: function () {
            var me = state().sessionUserId;
            return state().notifications.filter(function (n) { return (!me || n.userId === me) && !n.read; }).length;
        },
        markNotificationRead: function (nid) {
            var s = state();
            var n = s.notifications.find(function (x) { return x.id === nid; });
            if (n) { n.read = true; save(s); }
        },
        markAllNotificationsRead: function () {
            var s = state();
            var me = s.sessionUserId;
            s.notifications.forEach(function (n) {
                if (!me || n.userId === me) n.read = true;
            });
            save(s);
        }
    };
    window.HshsStore = api;
    state();
})();
