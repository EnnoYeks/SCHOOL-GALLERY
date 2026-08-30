(function () {
    var KEY = 'hshsWorldStore_v1';
    var SESSION = 'hshsWorldSession';

    function id() {
        return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }
    function now() { return Date.now(); }
    function hash(text) {
        var s = String(text || '');
        var h = 5381;
        for (var i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
        return 'h' + (h >>> 0).toString(16);
    }
    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return seed();
    }
    function save(state) {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
        window.__hshsState = state;
        document.dispatchEvent(new CustomEvent('hshs-store-change'));
    }
    function seed() {
        var a = { id: 'u-sports', name: 'Sports Club', username: 'sports', classYear: 'Club', house: 'All', bio: 'Match days and field moments.', pass: hash('hshs123'), createdAt: now() - 86400000 * 10, followers: 48, following: 12 };
        var b = { id: 'u-science', name: 'Science Club', username: 'science', classYear: 'Club', house: 'All', bio: 'Labs, fairs and experiments.', pass: hash('hshs123'), createdAt: now() - 86400000 * 9, followers: 36, following: 10 };
        var c = { id: 'u-prefects', name: 'Prefects', username: 'prefects', classYear: 'Leadership', house: 'All', bio: 'Assemblies and school life.', pass: hash('hshs123'), createdAt: now() - 86400000 * 8, followers: 61, following: 20 };
        var posts = [
            { id: 'p1', type: 'photo', title: 'Sports Day 2026', description: 'Track finals on the main field.', category: 'sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=900&q=70', authorId: a.id, author: a.name, likes: 180, comments: 14, views: 2400, shares: 8, saves: 11, createdAt: now() - 86400000 * 2 },
            { id: 'p2', type: 'photo', title: 'Science Fair Highlights', description: 'Projects from every class.', category: 'academics', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70', authorId: b.id, author: b.name, likes: 96, comments: 9, views: 1800, shares: 5, saves: 7, createdAt: now() - 86400000 * 5 },
            { id: 'p3', type: 'photo', title: 'Morning Assembly', description: 'Flags, hymn and notices.', category: 'events', image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=70', authorId: c.id, author: c.name, likes: 64, comments: 6, views: 980, shares: 3, saves: 4, createdAt: now() - 86400000 * 1 },
            { id: 'p4', type: 'video', title: 'Graduation Ceremony 2024', description: 'Caps in the air.', category: 'events', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70', authorId: c.id, author: c.name, likes: 210, comments: 22, views: 2600, shares: 12, saves: 18, createdAt: now() - 86400000 * 3 },
            { id: 'p5', type: 'photo', title: 'Robotics Club Showcase', description: 'Bots on the lab floor.', category: 'academics', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=70', authorId: b.id, author: b.name, likes: 73, comments: 8, views: 1100, shares: 4, saves: 6, createdAt: now() - 86400000 * 4 }
        ];
        var state = { users: [a, b, c], posts: posts, comments: [], likes: {}, session: null };
        save(state);
        return state;
    }

    var state = load();
    if (!state.users || !state.posts) state = seed();

    function sessionUser() {
        var sid = state.session || localStorage.getItem(SESSION);
        if (!sid) return null;
        return state.users.find(function (u) { return u.id === sid; }) || null;
    }
    function score(post) {
        var ageHours = Math.max(1, (now() - (post.createdAt || now())) / 3600000);
        var recency = 48 / ageHours;
        return (post.likes || 0) * 3 + (post.comments || 0) * 2 + (post.views || 0) * 0.05 + recency;
    }

    var api = {
        hash: hash,
        currentUser: sessionUser,
        users: function () { return state.users.slice(); },
        posts: function (filter) {
            var list = state.posts.slice();
            if (filter && filter.type) list = list.filter(function (p) { return p.type === filter.type; });
            if (filter && filter.category && filter.category !== 'all') list = list.filter(function (p) { return p.category === filter.category; });
            if (filter && filter.authorId) list = list.filter(function (p) { return p.authorId === filter.authorId; });
            list.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
            return list;
        },
        trending: function (limit) {
            return state.posts.slice().sort(function (a, b) { return score(b) - score(a); }).slice(0, limit || 6);
        },
        featured: function (limit) {
            return api.trending(limit || 4);
        },
        stats: function () {
            var photos = state.posts.filter(function (p) { return p.type !== 'video'; }).length;
            var videos = state.posts.filter(function (p) { return p.type === 'video'; }).length;
            var likes = state.posts.reduce(function (n, p) { return n + (p.likes || 0); }, 0);
            return { photos: photos, videos: videos, students: state.users.length, likes: likes, posts: state.posts.length };
        },
        search: function (q) {
            q = String(q || '').toLowerCase().trim();
            if (!q) return [];
            return state.posts.filter(function (p) {
                return [p.title, p.description, p.author, p.category].join(' ').toLowerCase().indexOf(q) !== -1;
            });
        },
        signup: function (data) {
            var name = String(data.name || '').trim();
            var username = String(data.username || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
            var pass = String(data.passcode || '');
            if (name.length < 2) return { ok: false, error: 'Enter your name.' };
            if (username.length < 3) return { ok: false, error: 'Username needs 3 letters or more.' };
            if (pass.length < 4) return { ok: false, error: 'Passcode needs 4 characters.' };
            if (state.users.some(function (u) { return u.username === username; })) return { ok: false, error: 'That username is taken.' };
            var user = {
                id: id(), name: name, username: username,
                classYear: String(data.classYear || 'Student'),
                house: String(data.house || ''),
                bio: String(data.bio || 'New HSHS World member.'),
                pass: hash(pass), createdAt: now(), followers: 0, following: 0, photo: ''
            };
            state.users.push(user);
            state.session = user.id;
            localStorage.setItem(SESSION, user.id);
            save(state);
            return { ok: true, user: user };
        },
        login: function (username, passcode) {
            username = String(username || '').trim().toLowerCase();
            var user = state.users.find(function (u) { return u.username === username; });
            if (!user || user.pass !== hash(passcode)) return { ok: false, error: 'Wrong username or passcode.' };
            state.session = user.id;
            localStorage.setItem(SESSION, user.id);
            save(state);
            return { ok: true, user: user };
        },
        logout: function () {
            state.session = null;
            localStorage.removeItem(SESSION);
            save(state);
        },
        updateProfile: function (patch) {
            var user = sessionUser();
            if (!user) return { ok: false, error: 'Sign in first.' };
            ['name', 'classYear', 'house', 'bio', 'photo'].forEach(function (k) {
                if (patch[k] !== undefined) user[k] = String(patch[k]);
            });
            save(state);
            return { ok: true, user: user };
        },
        addPost: function (data) {
            var user = sessionUser();
            if (!user) return { ok: false, error: 'Sign in to post.' };
            var title = String(data.title || '').trim();
            if (!title) return { ok: false, error: 'Add a title.' };
            var post = {
                id: id(),
                type: data.type === 'video' ? 'video' : 'photo',
                title: title,
                description: String(data.description || ''),
                category: String(data.category || 'events'),
                image: String(data.image || 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=70'),
                authorId: user.id,
                author: user.name,
                likes: 0, comments: 0, views: 1, shares: 0, saves: 0,
                createdAt: now()
            };
            state.posts.unshift(post);
            save(state);
            return { ok: true, post: post };
        },
        deletePost: function (postId) {
            var user = sessionUser();
            if (!user) return { ok: false, error: 'Sign in first.' };
            var post = state.posts.find(function (p) { return p.id === postId; });
            if (!post) return { ok: false, error: 'Post not found.' };
            if (post.authorId !== user.id) return { ok: false, error: 'You can only remove your own posts.' };
            state.posts = state.posts.filter(function (p) { return p.id !== postId; });
            save(state);
            return { ok: true };
        },
        toggleLike: function (postId) {
            var user = sessionUser();
            var key = (user ? user.id : 'guest') + ':' + postId;
            var post = state.posts.find(function (p) { return p.id === postId; });
            if (!post) return { ok: false };
            state.likes = state.likes || {};
            if (state.likes[key]) {
                delete state.likes[key];
                post.likes = Math.max(0, (post.likes || 0) - 1);
            } else {
                state.likes[key] = true;
                post.likes = (post.likes || 0) + 1;
            }
            save(state);
            return { ok: true, likes: post.likes, on: !!state.likes[key] };
        },
        liked: function (postId) {
            var user = sessionUser();
            var key = (user ? user.id : 'guest') + ':' + postId;
            return !!(state.likes && state.likes[key]);
        },
        addComment: function (postId, text) {
            var user = sessionUser();
            if (!user) return { ok: false, error: 'Sign in to comment.' };
            text = String(text || '').trim();
            if (!text) return { ok: false, error: 'Write a comment.' };
            var post = state.posts.find(function (p) { return p.id === postId; });
            if (!post) return { ok: false, error: 'Post not found.' };
            state.comments.push({ id: id(), postId: postId, author: user.name, authorId: user.id, text: text, createdAt: now() });
            post.comments = (post.comments || 0) + 1;
            save(state);
            return { ok: true };
        },
        commentsFor: function (postId) {
            return state.comments.filter(function (c) { return c.postId === postId; });
        }
    };

    window.HshsStore = api;
    window.db = window.db || {};
    window.db.getPosts = async function (limit, offset) {
        var list = api.posts();
        offset = offset || 0;
        return list.slice(offset, offset + (limit || 20));
    };
    window.db.getPhotos = async function (limit, offset) {
        var list = api.posts({ type: 'photo' });
        offset = offset || 0;
        return list.slice(offset, offset + (limit || 20));
    };
    window.db.getVideos = async function (limit, offset) {
        var list = api.posts({ type: 'video' });
        offset = offset || 0;
        return list.slice(offset, offset + (limit || 12));
    };
    window.db.search = async function (query) { return api.search(query); };
    window.db.getAnalytics = async function () {
        var s = api.stats();
        return { totalPosts: s.posts, totalPhotos: s.photos, totalVideos: s.videos };
    };
})();
