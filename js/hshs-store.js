(function () {
    if (window.HshsStore) return;
    var KEY = 'hshsWorldStore_v2';
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
    function pinHash(pin) {
        var n = String(pin || '');
        var h = 7;
        for (var i = 0; i < n.length; i++) h = ((h * 31) + n.charCodeAt(i)) >>> 0;
        return 'p' + h.toString(16);
    }
    function slugify(name) {
        return String(name || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 18) || 'student';
    }
    function load() {
        try {
            var v2 = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (v2) return v2;
            var v1 = JSON.parse(localStorage.getItem('hshsWorldStore_v1') || 'null');
            if (v1) {
                migrate(v1);
                localStorage.setItem(KEY, JSON.stringify(v1));
                return v1;
            }
            return null;
        } catch (e) { return null; }
    }
    function migrate(s) {
        s.follows = s.follows || [];
        s.users = (s.users || []).map(function (u) {
            u.username = u.username || slugify(u.name);
            u.bio = u.bio || 'HSHS World member.';
            u.avatar = u.avatar || '';
            u.chatTheme = u.chatTheme || 'ocean';
            u.bubbleStyle = u.bubbleStyle || 'rounded';
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
            { id: 'u-demo', name: 'Amina Namukasa', username: 'amina_s4', classYear: 'S4', role: 'Student', bio: 'Sports, track days, and school vibes. \ud83c\udfc3', avatar: '', pin: pinHash('1234'), chatTheme: 'ocean', bubbleStyle: 'rounded', createdAt: now() - 86400000 * 20 },
            { id: 'u-prefect', name: 'Joel Wambede', username: 'joel_pref', classYear: 'S6', role: 'Prefect', bio: 'Prefect desk. Keep it school-safe.', avatar: '', pin: pinHash('2468'), chatTheme: 'grape', bubbleStyle: 'rounded', createdAt: now() - 86400000 * 40 },
            { id: 'u-sports', name: 'Sports Club', username: 'hshs_sports', classYear: 'Campus', role: 'Club', bio: 'Match days, drills, and house spirit.', avatar: '', pin: pinHash('1111'), chatTheme: 'mint', bubbleStyle: 'soft', createdAt: now() - 86400000 * 50 },
            { id: 'u-choir', name: 'Choir Desk', username: 'hshs_choir', classYear: 'Music', role: 'Club', bio: 'Rehearsals and assembly anthems.', avatar: '', pin: pinHash('2222'), chatTheme: 'sunset', bubbleStyle: 'soft', createdAt: now() - 86400000 * 55 },
            { id: 'u-lab', name: 'Science Lab', username: 'stem_lab', classYear: 'STEM', role: 'Department', bio: 'Experiments, fairs, and lab notes.', avatar: '', pin: pinHash('3333'), chatTheme: 'slate', bubbleStyle: 'square', createdAt: now() - 86400000 * 60 },
            { id: 'u-house', name: 'House Captains', username: 'house_caps', classYear: 'Houses', role: 'Leadership', bio: 'House points and spirit days.', avatar: '', pin: pinHash('4444'), chatTheme: 'rose', bubbleStyle: 'rounded', createdAt: now() - 86400000 * 62 },
            { id: 'u-maya', name: 'Maya Okello', username: 'maya_lens', classYear: 'S5', role: 'Student', bio: 'Photography club. Capturing campus light.', avatar: '', pin: pinHash('5555'), chatTheme: 'ocean', bubbleStyle: 'soft', createdAt: now() - 86400000 * 12 },
            { id: 'u-brian', name: 'Brian Kato', username: 'brian_k', classYear: 'S3', role: 'Student', bio: 'Football and Friday vibes.', avatar: '', pin: pinHash('6666'), chatTheme: 'mint', bubbleStyle: 'rounded', createdAt: now() - 86400000 * 8 }
        ];
        var posts = [
            { id: 'p1', type: 'photo', title: 'Sports Day 2026', description: 'Track finals on the main field.', category: 'sports', image: PICS[0], imageUrl: PICS[0], thumbnailUrl: PICS[0], author: 'Amina Namukasa', authorId: 'u-demo', likes: 42, views: 310, comments: 6, shares: 4, createdAt: now() - 86400000 * 2 },
            { id: 'p2', type: 'photo', title: 'Morning Assembly', description: 'House announcements and the school anthem.', category: 'events', image: PICS[1], imageUrl: PICS[1], thumbnailUrl: PICS[1], author: 'Joel Wambede', authorId: 'u-prefect', likes: 28, views: 190, comments: 3, shares: 2, createdAt: now() - 86400000 * 1 },
            { id: 'p3', type: 'photo', title: 'Science Fair', description: 'Robotics and chemistry stands in the hall.', category: 'academics', image: PICS[3], imageUrl: PICS[3], thumbnailUrl: PICS[3], author: 'Amina Namukasa', authorId: 'u-demo', likes: 61, views: 420, comments: 9, shares: 7, createdAt: now() - 86400000 * 5 },
            { id: 'p4', type: 'video', title: 'HSHS Sports Day 2026', description: 'Best moments from the field.', category: 'sports', image: PICS[0], imageUrl: PICS[0], thumbnailUrl: PICS[0], author: 'Sports Club', authorId: 'u-sports', likes: 180, views: 2400, comments: 24, duration: '04:35', featured: true, createdAt: now() - 86400000 * 2 },
            { id: 'p5', type: 'video', title: 'Graduation Ceremony', description: 'S6 send-off in the main hall.', category: 'events', image: PICS[2], imageUrl: PICS[2], thumbnailUrl: PICS[2], author: 'Prefects', authorId: 'u-prefect', likes: 210, views: 2600, comments: 41, duration: '04:18', featured: true, createdAt: now() - 86400000 * 3 }
        ];
        return save({
            users: users,
            sessionUserId: 'u-demo',
            posts: posts,
            follows: [
                { followerId: 'u-demo', followingId: 'u-prefect', createdAt: now() - 86400000 },
                { followerId: 'u-demo', followingId: 'u-sports', createdAt: now() - 86400000 * 2 },
                { followerId: 'u-maya', followingId: 'u-demo', createdAt: now() - 3600000 },
                { followerId: 'u-brian', followingId: 'u-demo', createdAt: now() - 7200000 }
            ],
            likes: [],
            comments: [
                { id: 'c1', postId: 'p1', author: 'Joel Wambede', text: 'What a race!', createdAt: now() - 3600000 }
            ]
        });
    }
    function state() {
        var s = load();
        if (!s || !s.users || !s.posts) s = seed();
        else migrate(s);
        if (!s.follows) s.follows = [];
        window.__hshsState = s;
        return s;
    }
    function score(item) {
        var ageHours = Math.max(1, (now() - new Date(item.createdAt).getTime()) / 3600000);
        return ((item.likes || 0) * 3) + ((item.comments || 0) * 2) + ((item.views || 0) * 0.05) + (item.featured ? 40 : 0) - (ageHours * 0.4);
    }
    function userById(uid) {
        return state().users.find(function (u) { return u.id === uid; }) || null;
    }
    function ensureUsername(user) {
        if (user && !user.username) user.username = slugify(user.name);
        return user;
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
        signup: function (data) {
            var s = state();
            var name = String(data.name || '').trim();
            var pin = String(data.pin || '').trim();
            var username = slugify(data.username || name);
            if (name.length < 2) return { ok: false, error: 'Enter your school name.' };
            if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'Use a 4-digit school PIN.' };
            if (s.users.some(function (u) { return u.name.toLowerCase() === name.toLowerCase(); })) {
                return { ok: false, error: 'That name already has an account. Switch instead.' };
            }
            if (s.users.some(function (u) { return String(u.username || '').toLowerCase() === username; })) {
                username = username + Math.floor(Math.random() * 90 + 10);
            }
            var user = {
                id: id('u'),
                name: name,
                username: username,
                classYear: data.classYear || 'S1',
                role: data.role || 'Student',
                bio: data.bio || 'New HSHS World member.',
                avatar: data.avatar || '',
                chatTheme: data.chatTheme || 'ocean',
                bubbleStyle: data.bubbleStyle || 'rounded',
                pin: pinHash(pin),
                createdAt: now()
            };
            s.users.push(user);
            s.sessionUserId = user.id;
            save(s);
            return { ok: true, user: user };
        },
        login: function (name, pin) {
            var s = state();
            var q = String(name || '').trim().toLowerCase().replace(/^@/, '');
            var user = s.users.find(function (u) {
                return u.name.toLowerCase() === q || String(u.username || '').toLowerCase() === q;
            });
            if (!user || user.pin !== pinHash(pin)) return { ok: false, error: 'Name, username, or PIN did not match.' };
            s.sessionUserId = user.id;
            save(s);
            return { ok: true, user: ensureUsername(user) };
        },
        switchUser: function (uid) {
            var s = state();
            if (!userById(uid)) return { ok: false, error: 'Account not found.' };
            s.sessionUserId = uid;
            save(s);
            return { ok: true, user: userById(uid) };
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
                following: s.follows.filter(function (f) { return f.followerId === uid; }).length
            };
        },
        followersOf: function (uid) {
            return state().follows.filter(function (f) { return f.followingId === uid; }).map(function (f) { return userById(f.followerId); }).filter(Boolean);
        },
        followingOf: function (uid) {
            return state().follows.filter(function (f) { return f.followerId === uid; }).map(function (f) { return userById(f.followingId); }).filter(Boolean);
        },
        listPosts: function () { return state().posts.slice().sort(function (a, b) { return b.createdAt - a.createdAt; }); },
        listPhotos: function () {
            return api.listPosts().filter(function (p) { return p.type !== 'video'; }).map(function (p) {
                return Object.assign({}, p, { image: p.image || p.imageUrl });
            });
        },
        listVideos: function () {
            return api.listPosts().filter(function (p) { return p.type === 'video'; });
        },
        myPosts: function () {
            var uid = state().sessionUserId;
            return api.listPosts().filter(function (p) { return p.authorId === uid; });
        },
        postsByUser: function (uid) {
            return api.listPosts().filter(function (p) { return p.authorId === uid; });
        },
        addPost: function (data) {
            var s = state();
            var user = userById(s.sessionUserId);
            if (!user) return { ok: false, error: 'Create an account first.' };
            var title = String(data.title || '').trim();
            if (!title) return { ok: false, error: 'Give the post a title.' };
            var post = {
                id: id('p'),
                type: data.type === 'video' ? 'video' : 'photo',
                title: title,
                description: data.description || '',
                category: data.category || 'events',
                image: data.image || PICS[Math.floor(Math.random() * PICS.length)],
                author: user.name,
                authorId: user.id,
                likes: 0, views: 1, comments: 0, shares: 0,
                destinations: data.destinations || [],
                filter: data.filter,
                soundId: data.soundId,
                duration: data.duration || '00:30',
                createdAt: now()
            };
            post.imageUrl = post.image;
            post.thumbnailUrl = post.image;
            s.posts.unshift(post);
            save(s);
            return { ok: true, post: post };
        },
        deletePost: function (postId) {
            var s = state();
            var user = userById(s.sessionUserId);
            var post = s.posts.find(function (p) { return p.id === postId; });
            if (!user || !post || post.authorId !== user.id) return { ok: false, error: 'You can only remove your own posts.' };
            s.posts = s.posts.filter(function (p) { return p.id !== postId; });
            save(s);
            return { ok: true };
        },
        toggleLike: function (itemId) {
            var s = state();
            var uid = s.sessionUserId || 'guest';
            var key = uid + ':' + itemId;
            var i = s.likes.indexOf(key);
            var post = s.posts.find(function (p) { return p.id === itemId; });
            if (!post) return { ok: false, liked: false, likes: 0 };
            if (i >= 0) { s.likes.splice(i, 1); post.likes = Math.max(0, (post.likes || 0) - 1); }
            else { s.likes.push(key); post.likes = (post.likes || 0) + 1; }
            save(s);
            return { ok: true, liked: i < 0, likes: post.likes };
        },
        addComment: function (postId, text) {
            var s = state();
            var user = userById(s.sessionUserId);
            var clean = String(text || '').trim();
            if (!clean) return { ok: false, error: 'Write a short school-safe comment.' };
            var row = { id: id('c'), postId: postId, author: user ? user.name : 'Guest', text: clean, createdAt: now() };
            s.comments.unshift(row);
            var post = s.posts.find(function (p) { return p.id === postId; });
            if (post) post.comments = (post.comments || 0) + 1;
            save(s);
            return { ok: true, comment: row };
        },
        search: function (q) {
            q = String(q || '').toLowerCase().trim();
            if (!q) return api.listPosts();
            return api.listPosts().filter(function (p) {
                return (p.title + ' ' + (p.description || '') + ' ' + (p.author || '') + ' ' + (p.category || '')).toLowerCase().indexOf(q) !== -1;
            });
        },
        trending: function (n) {
            return api.listPosts().slice().sort(function (a, b) { return score(b) - score(a); }).slice(0, n || 6);
        },
        featured: function (n) {
            var list = api.listPosts().filter(function (p) { return p.featured || (p.likes || 0) > 20; });
            if (!list.length) list = api.trending(n);
            return list.slice(0, n || 4);
        },
        analytics: function () {
            var posts = state().posts;
            return {
                totalPosts: posts.length,
                totalPhotos: posts.filter(function (p) { return p.type !== 'video'; }).length,
                totalVideos: posts.filter(function (p) { return p.type === 'video'; }).length,
                totalStudents: state().users.length,
                totalLikes: posts.reduce(function (sum, p) { return sum + (p.likes || 0); }, 0)
            };
        }
    };
    window.HshsStore = api;
    state();
})();
