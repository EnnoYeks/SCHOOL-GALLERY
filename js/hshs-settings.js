(function () {
    if (window.__hshsSettingsPage) return;
    window.__hshsSettingsPage = true;

    var PREF_KEY = 'hshsWorldPrefs_v1';
    var PROFILE_KEY = 'userProfile';
    var DEFAULT_PREFS = {
        publicProfile: true,
        showActivity: true,
        allowMessages: true,
        showClass: true,
        showLikes: true,
        notifyLikes: true,
        notifyComments: true,
        notifyMentions: true,
        notifyFriends: true,
        notifySchool: true,
        accent: 'navy'
    };
    var ACCENTS = {
        navy: { '--primary-color': '#1d4ed8', '--secondary-color': '#c9a227', '--accent-color': '#eab308' },
        ocean: { '--primary-color': '#0ea5e9', '--secondary-color': '#6366f1', '--accent-color': '#22d3ee' },
        forest: { '--primary-color': '#059669', '--secondary-color': '#0f766e', '--accent-color': '#f59e0b' }
    };

    function store() { return window.HshsStore; }
    function toast(msg, ok) {
        var box = document.getElementById('hshsToast');
        if (!box) {
            box = document.createElement('div');
            box.id = 'hshsToast';
            document.body.appendChild(box);
        }
        box.textContent = msg;
        box.className = 'hshs-toast ' + (ok === false ? 'bad' : 'ok');
        box.classList.add('show');
        clearTimeout(box._t);
        box._t = setTimeout(function () { box.classList.remove('show'); }, 2200);
    }
    function prefs() {
        try { return Object.assign({}, DEFAULT_PREFS, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); }
        catch (e) { return Object.assign({}, DEFAULT_PREFS); }
    }
    function savePrefs(next) {
        var all = Object.assign(prefs(), next || {});
        localStorage.setItem(PREF_KEY, JSON.stringify(all));
        return all;
    }
    function localProfile() {
        try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; }
        catch (e) { return {}; }
    }
    function writeLocalProfile(p) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    }
    function me() {
        var user = store() && store().currentUser ? store().currentUser() : null;
        var p = localProfile();
        return {
            id: user && user.id,
            name: (user && user.name) || p.fullName || '',
            username: (user && user.username) || p.username || '',
            email: p.email || '',
            classYear: (user && user.classYear) || p.className || 'S1',
            role: (user && user.role) || p.role || 'Student',
            bio: (user && user.bio) || p.bio || '',
            photo: (user && user.avatar) || p.profilePhoto || ''
        };
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
    function applyAccent(name) {
        var theme = ACCENTS[name] || ACCENTS.navy;
        Object.keys(theme).forEach(function (k) {
            document.documentElement.style.setProperty(k, theme[k]);
        });
        document.querySelectorAll('[data-accent]').forEach(function (btn) {
            btn.classList.toggle('on', btn.getAttribute('data-accent') === name);
        });
    }
    function paintTheme() {
        var cur = window.__hshsReadTheme ? window.__hshsReadTheme() : 'light';
        document.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
            btn.classList.toggle('on', btn.getAttribute('data-theme-pick') === cur);
        });
    }
    function fillHero() {
        var info = me();
        var name = document.getElementById('setHeroName');
        var user = document.getElementById('setHeroUser');
        var meta = document.getElementById('setHeroMeta');
        var pic = document.getElementById('setHeroPic');
        if (name) name.textContent = info.name || 'Create your account';
        if (user) user.textContent = info.username ? '@' + info.username : '@yourname';
        if (meta) meta.textContent = (info.classYear || 'Class') + ' · ' + (info.role || 'Student');
        if (pic) pic.src = info.photo || guestPic();
        var signed = document.getElementById('setSignedState');
        var guest = document.getElementById('setGuestState');
        if (signed) signed.hidden = !info.id;
        if (guest) guest.hidden = !!info.id;
    }
    function fillForm() {
        var info = me();
        var map = {
            setFullName: info.name,
            setUsername: info.username,
            setEmail: info.email,
            setClass: info.classYear,
            setRole: info.role,
            setBio: info.bio
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el && map[id]) el.value = map[id];
        });
        var p = prefs();
        document.querySelectorAll('[data-pref]').forEach(function (el) {
            var key = el.getAttribute('data-pref');
            el.checked = !!p[key];
        });
        applyAccent(p.accent || 'navy');
        paintTheme();
    }
    function saveAccount(e) {
        if (e) e.preventDefault();
        var name = (document.getElementById('setFullName') || {}).value || '';
        var username = (document.getElementById('setUsername') || {}).value || '';
        var email = (document.getElementById('setEmail') || {}).value || '';
        var classYear = (document.getElementById('setClass') || {}).value || 'S1';
        var role = (document.getElementById('setRole') || {}).value || 'Student';
        var bio = (document.getElementById('setBio') || {}).value || '';
        name = name.trim();
        username = username.trim().replace(/^@/, '').toLowerCase();
        if (name.length < 2) return toast('Enter your full name.', false);
        if (username.length < 3) return toast('Username needs at least 3 letters.', false);
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Enter a valid email.', false);
        writeLocalProfile({
            fullName: name,
            username: username,
            email: email,
            className: classYear,
            role: role,
            bio: bio,
            profilePhoto: me().photo || ''
        });
        if (store() && store().currentUser && store().currentUser()) {
            var res = store().updateProfile({
                name: name,
                username: username,
                classYear: classYear,
                role: role,
                bio: bio
            });
            if (!res.ok) return toast(res.error || 'Could not save.', false);
        }
        fillHero();
        toast('Account saved on this device.');
    }
    function createAccount(e) {
        if (e) e.preventDefault();
        if (!store()) return toast('Store is not ready yet.', false);
        var name = ((document.getElementById('newFullName') || {}).value || '').trim();
        var username = ((document.getElementById('newUsername') || {}).value || '').trim().replace(/^@/, '');
        var pin = ((document.getElementById('newPin') || {}).value || '').trim();
        var classYear = (document.getElementById('newClass') || {}).value || 'S1';
        var res = store().signup({ name: name, username: username, pin: pin, classYear: classYear, role: 'Student' });
        if (!res.ok) return toast(res.error || 'Could not create account.', false);
        writeLocalProfile(Object.assign(localProfile(), {
            fullName: res.user.name,
            username: res.user.username,
            className: res.user.classYear,
            role: res.user.role,
            bio: res.user.bio
        }));
        fillHero();
        fillForm();
        toast('Account created. Welcome to HSHS World.');
    }
    function switchAccount(e) {
        if (e) e.preventDefault();
        if (!store()) return toast('Store is not ready yet.', false);
        var name = ((document.getElementById('loginName') || {}).value || '').trim();
        var pin = ((document.getElementById('loginPin') || {}).value || '').trim();
        var res = store().login(name, pin);
        if (!res.ok) return toast(res.error || 'Could not switch.', false);
        writeLocalProfile(Object.assign(localProfile(), {
            fullName: res.user.name,
            username: res.user.username,
            className: res.user.classYear,
            role: res.user.role,
            bio: res.user.bio,
            profilePhoto: res.user.avatar || ''
        }));
        fillHero();
        fillForm();
        toast('Signed in as @' + res.user.username);
    }
    function signOut() {
        if (store() && store().logout) store().logout();
        fillHero();
        toast('Signed out on this device.');
    }
    function pickPhoto(file) {
        if (!file || !file.type || file.type.indexOf('image') !== 0) return toast('Choose a photo.', false);
        var reader = new FileReader();
        reader.onload = function () {
            var url = reader.result;
            var p = localProfile();
            p.profilePhoto = url;
            writeLocalProfile(p);
            if (store() && store().currentUser && store().currentUser()) {
                store().updateProfile({ avatar: url });
            }
            var pic = document.getElementById('setHeroPic');
            if (pic) pic.src = url;
            toast('Photo updated on this device.');
        };
        reader.readAsDataURL(file);
    }
    function setTab(name) {
        document.querySelectorAll('.hshs-set-tab').forEach(function (btn) {
            btn.classList.toggle('on', btn.getAttribute('data-set-tab') === name);
        });
        document.querySelectorAll('.hshs-set-pane').forEach(function (pane) {
            pane.classList.toggle('on', pane.id === name + 'Tab');
        });
        if (location.hash !== '#' + name) {
            try { history.replaceState(null, '', '#' + name); } catch (e) {}
        }
    }
    function boot() {
        if (!document.getElementById('hshsSettingsRoot')) return;
        fillHero();
        fillForm();
        document.querySelectorAll('.hshs-set-tab').forEach(function (btn) {
            btn.addEventListener('click', function () { setTab(btn.getAttribute('data-set-tab')); });
        });
        var hash = (location.hash || '#account').replace('#', '');
        if (['account', 'privacy', 'notifications', 'theme'].indexOf(hash) === -1) hash = 'account';
        setTab(hash);

        var save = document.getElementById('setSaveAccount');
        if (save) save.addEventListener('click', saveAccount);
        var create = document.getElementById('setCreateAccount');
        if (create) create.addEventListener('click', createAccount);
        var login = document.getElementById('setLoginAccount');
        if (login) login.addEventListener('click', switchAccount);
        var out = document.getElementById('setSignOut');
        if (out) out.addEventListener('click', signOut);

        var file = document.getElementById('setPhotoFile');
        var cam = document.getElementById('setPhotoBtn');
        if (cam && file) cam.addEventListener('click', function () { file.click(); });
        if (file) file.addEventListener('change', function () { pickPhoto(file.files && file.files[0]); });

        document.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var next = btn.getAttribute('data-theme-pick');
                try { localStorage.setItem('theme', JSON.stringify(next)); } catch (e) {}
                if (window.syncHshsTheme) window.syncHshsTheme();
                paintTheme();
                toast(next === 'dark' ? 'Dark theme on.' : 'Light theme on.');
            });
        });
        document.querySelectorAll('[data-accent]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var name = btn.getAttribute('data-accent');
                savePrefs({ accent: name });
                applyAccent(name);
                toast('Accent updated.');
            });
        });
        document.querySelectorAll('[data-pref]').forEach(function (el) {
            el.addEventListener('change', function () {
                var patch = {};
                patch[el.getAttribute('data-pref')] = !!el.checked;
                savePrefs(patch);
                toast('Saved.');
            });
        });
        document.querySelectorAll('[data-wait="firebase"]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                toast('This waits for school login.', false);
            });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('hshs:page', boot);
})();
