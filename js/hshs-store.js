(function () {
    if (window.HshsStore) return;
    var KEY = 'hshsWorldStore_v1';
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
    function load() {
        try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
    }
    function save(state) {
        localStorage.setItem(KEY, JSON.stringify(state));
        window.__hshsState = state;
        return state;
    }
    function seed() {
        var users = [
            { id: 'u-demo', name: 'Amina Namukasa', classYear: 'S4', role: 'Student', bio: 'Sports and school events. Proud HSHS World member.', avatar: '', pin: pinHash('1234'), createdAt: now() - 86400000 * 20 },
            { id: 'u-prefect', name: 'Joel Wambede', classYear: 'S6', role: 'Prefect', bio: 'Helping keep school moments on HSHS World.', avatar: '', pin: pinHash('2468'), createdAt: now() - 86400000 * 40 }
        ];
        var posts = [
            { id: 'p1', type: 'photo', title: 'Sports Day 2026', description: 'Track finals on the main field.', category: 'sports', image: PICS[0], imageUrl: PICS[0], thumbnailUrl: PICS[0], author: 'Amina Namukasa', authorId: 'u-demo', likes: 42, views: 310, comments: 6, shares: 4, createdAt: now() - 86400000 * 2 },
            { id: 'p2', type: 'photo', title: 'Morning Assembly', description: 'House announcements and the school anthem.', category: 'events', image: PICS[1], imageUrl: PICS[1], thumbnailUrl: PICS[1], author: 'Joel Wambede', authorId: 'u-prefect', likes: 28, views: 190, comments: 3, shares: 2, createdAt: now() - 86400000 * 1 },
            { id: 'p3', type: 'photo', title: 'Science Fair', description: 'Robotics and chemistry stands in the hall.', category: 'academics', image: PICS[3], imageUrl: PICS[3], thumbnailUrl: PICS[3], author: 'Amina Namukasa', authorId: 'u-demo', likes: 61, views: 420, comments: 9, shares: 7, createdAt: now() - 86400000 * 5 },
            { id: 'p4', type: 'video', title: 'HSHS Sports Day 2026', description: 'Best moments from the field.', category: 'sports', image: PICS[0], imageUrl: PICS[0], thumbnailUrl: PICS[0], author: 'Sports Club', authorId: 'u-demo', likes: 180, views: 2400, comments: 24, duration: '04:35', featured: true, createdAt: now() - 86400000 * 2 },
            { id: 'p5', type: 'video', title: 'Graduation Ceremony', description: 'S6 send-off in the main hall.', category: 'events', image: PICS[2], imageUrl: PICS[2], thumbnailUrl: PICS[2], author: 'Prefects', authorId: 'u-prefect', likes: 210, views: 2600, comments: 41, duration: '04:18', featured: true, createdAt: now() - 86400000 * 3 }
        ];
        return save({
            users: users,
            sessionUserId: 'u-demo',
            posts: posts,
            likes: [],
            comments: [
                { id: 'c1', postId: 'p1', author: 'Joel Wambede', text: 'What a race!', createdAt: now() - 3600000 }
            ]
        });
    }
    function state() {
        var s = load();
        if (!s || !s.users || !s.posts) s = seed();
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

    var api = {
        ready: true,
        getState: state,
        currentUser: function () { return userById(state().sessionUserId); },
        listUsers: function () { return state().users.slice(); },
        signup: function (data) {
            var s = state();
            var name = String(data.name || '').trim();
            var pin = String(data.pin || '').trim();
            if (name.length < 2) return { ok: false, error: 'Enter your school name.' };
            if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'Use a 4-digit school PIN.' };
            if (s.users.some(function (u) { return u.name.toLowerCase() === name.toLowerCase(); })) {
                return { ok: false, error: 'That name already has an account. Switch instead.' };
            }
            var user = {
                id: id('u'),
                name: name,
                classYear: data.classYear || 'S1',
                role: data.role || 'Student',
                bio: data.bio || 'New HSHS World member.',
                avatar: data.avatar || '',
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
            var user = s.users.find(function (u) { return u.name.toLowerCase() === String(name || '').trim().toLowerCase(); });
            if (!user || user.pin !== pinHash(pin)) return { ok: false, error: 'Name or PIN did not match.' };
            s.sessionUserId = user.id;
            save(s);
            return { ok: true, user: user };
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
            ['name', 'classYear', 'role', 'bio', 'avatar'].forEach(function (k) {
                if (patch[k] !== undefined) user[k] = patch[k];
            });
            save(s);
            return { ok: true, user: user };
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
