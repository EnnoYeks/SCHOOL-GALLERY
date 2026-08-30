(function () {
    function store() { return window.HshsStore; }
    function toast(msg, type) {
        if (window.Utils && Utils.showToast) Utils.showToast(msg, type || 'info');
        else alert(msg);
    }
    function $(id) { return document.getElementById(id); }

    function render() {
        if (!$('profileRoot')) return;
        var user = store() && store().currentUser();
        $('guestBox').style.display = user ? 'none' : 'block';
        $('memberBox').style.display = user ? 'block' : 'none';
        if (!user) return;
        $('pName').textContent = user.name;
        $('pMeta').textContent = (user.classYear || 'Student') + (user.house ? ' • ' + user.house : '');
        $('pBio').textContent = user.bio || 'No bio yet.';
        $('pHandle').textContent = '@' + user.username;
        var mine = store().posts({ authorId: user.id });
        $('pPosts').textContent = mine.length;
        $('pFollowers').textContent = user.followers || 0;
        $('pFollowing').textContent = user.following || 0;
        $('editName').value = user.name;
        $('editClass').value = user.classYear || '';
        $('editHouse').value = user.house || '';
        $('editBio').value = user.bio || '';
        var grid = $('myPosts');
        if (!mine.length) {
            grid.innerHTML = '<p class="empty-state">No posts yet. Add one below.</p>';
            return;
        }
        grid.innerHTML = mine.map(function (p) {
            return '<article class="p-card" data-id="' + p.id + '">' +
                '<img src="' + p.image + '" alt="">' +
                '<div><b>' + p.title + '</b><small>' + (p.likes || 0) + ' likes • ' + (p.category || '') + '</small>' +
                '<button type="button" class="p-del" data-del="' + p.id + '">Remove</button></div></article>';
        }).join('');
    }

    function bind() {
        if (!$('profileRoot') || $('profileRoot').dataset.wired) return;
        $('profileRoot').dataset.wired = '1';
        $('signupForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var res = store().signup({
                name: $('suName').value,
                username: $('suUser').value,
                passcode: $('suPass').value,
                classYear: $('suClass').value,
                house: $('suHouse').value,
                bio: $('suBio').value
            });
            if (!res.ok) return toast(res.error, 'error');
            toast('Account ready. Welcome to HSHS World.', 'success');
            render();
        });
        $('loginForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var res = store().login($('liUser').value, $('liPass').value);
            if (!res.ok) return toast(res.error, 'error');
            toast('Signed in.', 'success');
            render();
        });
        $('editForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var res = store().updateProfile({
                name: $('editName').value,
                classYear: $('editClass').value,
                house: $('editHouse').value,
                bio: $('editBio').value
            });
            if (!res.ok) return toast(res.error, 'error');
            toast('Profile saved.', 'success');
            render();
        });
        $('postForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var res = store().addPost({
                title: $('npTitle').value,
                description: $('npDesc').value,
                category: $('npCat').value,
                type: $('npType').value,
                image: $('npImage').value
            });
            if (!res.ok) return toast(res.error, 'error');
            $('npTitle').value = '';
            $('npDesc').value = '';
            toast('Post added.', 'success');
            render();
        });
        $('myPosts').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-del]');
            if (!btn) return;
            var res = store().deletePost(btn.getAttribute('data-del'));
            if (!res.ok) return toast(res.error, 'error');
            toast('Post removed.', 'success');
            render();
        });
        var out = $('pLogout');
        if (out) out.addEventListener('click', function () {
            store().logout();
            toast('Signed out.', 'info');
            render();
        });
        document.querySelectorAll('.auth-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.auth-tab').forEach(function (t) { t.classList.remove('on'); });
                tab.classList.add('on');
                $('signupForm').style.display = tab.getAttribute('data-tab') === 'signup' ? 'grid' : 'none';
                $('loginForm').style.display = tab.getAttribute('data-tab') === 'login' ? 'grid' : 'none';
            });
        });
    }

    function start() {
        if (!store() || !$('profileRoot')) return;
        bind();
        render();
    }
    window.initHshsProfile = start;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    document.addEventListener('hshs-store-change', start);
})();
