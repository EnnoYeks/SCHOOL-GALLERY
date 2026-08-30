(function (root) {
    var KEY = 'hshsWorldStore_v1';
    var SESSION = 'hshsWorldSession';

    function hashPin(value) {
        var s = String(value || '') + '|hshs-world';
        var h = 2166136261;
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(16);
    }

    function uid(prefix) {
        return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function now() { return Date.now(); }

    function emptyState() {
        return { users: [], posts: [], photos: [], videos: [], likes: {}, comments: {}, follows: {} };
    }

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                return Object.assign(emptyState(), parsed);
            }
        } catch (e) {}
        var seeded = seed(emptyState());
        save(seeded);
        return seeded;
    }

    function save(state) {
        localStorage.setItem(KEY, JSON.stringify(state));
        return state;
    }

    function seed(state) {
        var demo = [
            { title: 'Sports Day 2026', category: 'sports', type: 'photo', author: 'Sports Club', likes: 48, comments: 6, views: 220 },
            { title: 'Morning Assembly', category: 'events', type: 'photo', author: 'Prefects', likes: 31, comments: 4, views: 160 },
            { title: 'Science Fair Highlights', category: 'academics', type: 'video', author: 'Science Club', likes: 27, comments: 5, views: 190 },
            { title: 'Class Outing', category: 'events', type: 'photo', author: 'S4 East', likes: 22, comments: 3, views: 120 },
            { title: 'Choir Practice', category: 'arts', type: 'photo', author: 'Music Club', likes: 18, comments: 2, views: 90 }
        ];
        var images = [
            'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=70',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=70'
        ];
        demo.forEach(function (item, i) {
            var post = {
                id: 'seed-' + i,
                title: item.title,
                description: item.title + ' at Hawthorne Scribner High School.',
                category: item.category,
                type: item.type,
                author: item.author,
                authorId: 'school',
                image: images[i],
                thumbnailUrl: images[i],
                likes: item.likes,
                comments: item.comments,
                views: item.views,
                shares: 2 + i,
                saves: 1,
                createdAt: now() - (i + 1) * 86400000,
                featured: i < 2,
                hidden: false
            };
            state.posts.push(post);
            if (item.type === 'video') state.videos.push(Object.assign({}, post, { duration: '03:12' }));
            else state.photos.push(post);
        });
        return state;
    }

    function score(item) {
        var ageHours = Math.max(1, (now() - Number(item.createdAt || now())) / 3600000);
        var recency = 48 / ageHours;
        return (item.likes || 0) * 3 + (item.comments || 0) * 4 + (item.views || 0) * 0.15 + recency + (item.featured ? 12 : 0);
    }

    var Store = {
        read: load,
        score: score,
        currentUser: function () {
            var id = localStorage.getItem(SESSION);
            if (!id) return null;
            return load().users.find(function (u) { return u.id === id; }) || null;
        },
        setSession: function (id) {
            if (id) localStorage.setItem(SESSION, id);
            else localStorage.removeItem(SESSION);
        },
        users: function () { return load().users.slice(); },
        signup: function (data) {
            var state = load();
            var name = String(data.name || '').trim();
            var handle = String(data.handle || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
            var pin = String(data.pin || '');
            if (name.length < 2) throw new Error('Enter your school name.');
            if (handle.length < 3) throw new Error('Pick a username of at least 3 letters.');
            if (pin.length < 4) throw new Error('Use a PIN of at least 4 digits.');
            if (state.users.some(function (u) { return u.handle === handle; })) throw new Error('That username is already taken.');
            var user = {
                id: uid('user'),
                name: name,
                handle: handle,
                className: String(data.className || '').trim(),
                bio: String(data.bio || '').trim(),
                pinHash: hashPin(pin),
                photo: '',
                createdAt: now(),
                followers: 0,
                following: 0
            };
            state.users.push(user);
            save(state);
            Store.setSession(user.id);
            return user;
        },
        login: function (handle, pin) {
            var state = load();
            var user = state.users.find(function (u) { return u.handle === String(handle || '').trim().toLowerCase(); });
            if (!user || user.pinHash !== hashPin(pin)) throw new Error('Wrong username or PIN.');
            Store.setSession(user.id);
            return user;
        },
        logout: function () { Store.setSession(null); },
        updateProfile: function (patch) {
            var me = Store.currentUser();
            if (!me) throw new Error('Sign in first.');
            var state = load();
            state.users = state.users.map(function (u) {
                if (u.id !== me.id) return u;
                return Object.assign({}, u, {
                    name: patch.name != null ? String(patch.name).trim() : u.name,
                    className: patch.className != null ? String(patch.className).trim() : u.className,
                    bio: patch.bio != null ? String(patch.bio).trim() : u.bio,
                    photo: patch.photo != null ? patch.photo : u.photo
                });
            });
            save(state);
            return Store.currentUser();
        },
        addPost: function (data) {
            var me = Store.currentUser();
            if (!me) throw new Error('Sign in to post.');
            var state = load();
            var post = {
                id: uid('post'),
                title: String(data.title || 'Untitled').trim(),
                description: String(data.description || '').trim(),
                category: data.category || 'events',
                type: data.type || 'photo',
                author: me.name,
                authorId: me.id,
                authorAvatar: me.photo,
                image: data.image || '',
                thumbnailUrl: data.image || '',
                likes: 0,
                comments: 0,
                views: 1,
                shares: 0,
                saves: 0,
                createdAt: now(),
                featured: false,
                hidden: false
            };
            state.posts.unshift(post);
            if (post.type === 'video') state.videos.unshift(post);
            else state.photos.unshift(post);
            save(state);
            return post;
        },
        hidePost: function (id) {
            var me = Store.currentUser();
            var state = load();
            state.posts = state.posts.map(function (p) {
                if (p.id === id && me && p.authorId === me.id) p.hidden = !p.hidden;
                return p;
            });
            save(state);
        },
        deletePost: function (id) {
            var me = Store.currentUser();
            var state = load();
            var post = state.posts.find(function (p) { return p.id === id; });
            if (!post || !me || post.authorId !== me.id) throw new Error('You can only delete your posts.');
            state.posts = state.posts.filter(function (p) { return p.id !== id; });
            state.photos = state.photos.filter(function (p) { return p.id !== id; });
            state.videos = state.videos.filter(function (p) { return p.id !== id; });
            save(state);
        },
        toggleLike: function (id) {
            var me = Store.currentUser();
            var key = (me ? me.id : 'guest') + ':' + id;
            var state = load();
            var liked = !!state.likes[key];
            state.likes[key] = !liked;
            function bump(list) {
                return list.map(function (p) {
                    if (p.id === id) p.likes = Math.max(0, (p.likes || 0) + (liked ? -1 : 1));
                    return p;
                });
            }
            state.posts = bump(state.posts);
            state.photos = bump(state.photos);
            state.videos = bump(state.videos);
            save(state);
            return !liked;
        },
        listPosts: function (opts) {
            opts = opts || {};
            var items = load().posts.filter(function (p) { return !p.hidden; });
            if (opts.authorId) items = items.filter(function (p) { return p.authorId === opts.authorId; });
            if (opts.category && opts.category !== 'all') items = items.filter(function (p) { return p.category === opts.category; });
            if (opts.sort === 'trending') items.sort(function (a, b) { return score(b) - score(a); });
            else if (opts.sort === 'popular') items.sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); });
            else items.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
            return items;
        },
        listPhotos: function () { return Store.listPosts({}).filter(function (p) { return p.type !== 'video'; }); },
        listVideos: function () { return load().videos.filter(function (p) { return !p.hidden; }); },
        search: function (query) {
            var q = String(query || '').toLowerCase();
            if (!q) return [];
            return Store.listPosts({}).filter(function (p) {
                return [p.title, p.description, p.author, p.category].join(' ').toLowerCase().indexOf(q) !== -1;
            });
        },
        stats: function () {
            var state = load();
            var likes = state.posts.reduce(function (n, p) { return n + (p.likes || 0); }, 0);
            return {
                totalPosts: state.posts.filter(function (p) { return !p.hidden; }).length,
                totalPhotos: state.photos.length,
                totalVideos: state.videos.length,
                totalStudents: Math.max(state.users.length, 1),
                totalLikes: likes
            };
        }
    };

    root.HshsStore = Store;
})(window);
