(function () {
  if (window.__hshsSettingsPage) return;
  window.__hshsSettingsPage = true;

  var PREF_KEY = 'hshsWorldPrefs_v1';
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

  function $(id) { return document.getElementById(id); }

  function prefs() {
    try { return Object.assign({}, DEFAULT_PREFS, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); }
    catch (e) { return Object.assign({}, DEFAULT_PREFS); }
  }
  function savePrefs(next) {
    var all = Object.assign(prefs(), next || {});
    localStorage.setItem(PREF_KEY, JSON.stringify(all));
    return all;
  }

  function realUser() {
    var u = window.hshsAuthUser || (window.auth && window.auth.currentUser) || null;
    if (!u || u.isAnonymous) return null;
    return u;
  }

  function profile() {
    return window.hshsProfile || null;
  }

  function guestPic() {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1d4ed8"/><circle cx="32" cy="24" r="10" fill="white"/><path d="M14 54c4-12 14-18 18-18s14 6 18 18" fill="white"/></svg>'
    );
  }

  function status(id, text, ok) {
    var el = $(id);
    if (!el) return;
    el.textContent = text || '';
    el.className = 'hshs-set-status' + (text ? (ok ? ' is-ok' : ' is-err') : '');
  }

  function hideToastBanners() {
    var box = document.getElementById('hshsToast');
    if (box) {
      box.classList.remove('show');
      box.textContent = '';
    }
  }

  function applyAccent(name) {
    var theme = ACCENTS[name] || ACCENTS.navy;
    Object.keys(theme).forEach(function (k) {
      document.documentElement.style.setProperty(k, theme[k]);
    });
    document.querySelectorAll('[data-accent]').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.accent === name);
    });
  }

  function paintTheme() {
    var cur = window.__hshsReadTheme ? window.__hshsReadTheme() : 'light';
    document.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.themePick === cur);
    });
  }

  function titleCaseRole(role) {
    var r = String(role || 'Student');
    return r.charAt(0).toUpperCase() + r.slice(1);
  }

  function fillHero() {
    var user = realUser();
    var p = profile() || {};
    var name = (p.fullName || p.name || (user && user.displayName) || '').trim();
    var username = (p.username || '').replace(/^@/, '');
    var klass = p.classYear || 'Campus';
    var role = titleCaseRole(p.role || 'Student');
    var photo = p.photoURL || p.avatar || (user && user.photoURL) || '';
    var nm = $('setHeroName');
    var handle = $('setHeroUser');
    var meta = $('setHeroMeta');
    var pic = $('setHeroPic');
    if (nm) nm.textContent = user ? (name || 'HSHS Student') : 'Guest';
    if (handle) handle.textContent = user ? (username ? '@' + username : (user.email || 'Signed in')) : 'Sign in to save your campus profile';
    if (meta) meta.textContent = user ? (klass + ' · ' + role) : 'HSHS World';
    if (pic) pic.src = photo || guestPic();
    var signed = $('setSignedState');
    var guest = $('setGuestState');
    if (signed) signed.hidden = !user;
    if (guest) guest.hidden = !!user;
  }

  function fillForm() {
    var user = realUser();
    var p = profile() || {};
    var map = {
      setFullName: p.fullName || p.name || (user && user.displayName) || '',
      setUsername: (p.username || '').replace(/^@/, ''),
      setEmail: p.email || (user && user.email) || '',
      setClass: p.classYear || 'Campus',
      setRole: titleCaseRole(p.role || 'Student'),
      setBio: p.bio || ''
    };
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (el) el.value = map[id];
    });
    var pr = prefs();
    document.querySelectorAll('[data-pref]').forEach(function (el) {
      el.checked = !!pr[el.dataset.pref];
    });
    applyAccent(pr.accent || 'navy');
    paintTheme();
  }

  function waitApi() {
    return new Promise(function (resolve, reject) {
      var n = 0;
      (function tick() {
        if (window.HshsAuthApi) return resolve(window.HshsAuthApi);
        if (++n > 60) return reject(new Error('Auth is still loading. Refresh and try again.'));
        setTimeout(tick, 80);
      })();
    });
  }

  function friendlyError(err) {
    var code = (err && err.code) || '';
    var raw = (err && err.message) || '';
    var map = {
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found. Check your details or create one.',
      'auth/wrong-password': 'Incorrect password. Try again or reset it.',
      'auth/invalid-credential': 'Incorrect login details. Check and try again.',
      'auth/email-already-in-use': 'That email is already registered. Sign in instead.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/popup-closed-by-user': 'Google sign-in was closed.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled yet.'
    };
    return map[code] || raw || 'Something went wrong. Please try again.';
  }

  async function resolveEmail(identifier) {
    var id = String(identifier || '').trim();
    if (!id) throw new Error('Enter your email or username.');
    if (id.indexOf('@') !== -1) return id.toLowerCase();
    var api = await waitApi();
    var found = await api.lookupUserField('username', id.toLowerCase());
    if (!found || !found.email) throw new Error('No account with that username.');
    return String(found.email).toLowerCase();
  }

  function showAuthBox(name) {
    var login = $('setLoginBox');
    var signup = $('setSignupBox');
    var reset = $('setResetBox');
    if (login) login.hidden = name !== 'login';
    if (signup) signup.hidden = name !== 'signup';
    if (reset) reset.hidden = name !== 'reset';
    document.querySelectorAll('[data-set-auth]').forEach(function (btn) {
      btn.classList.toggle('on', btn.getAttribute('data-set-auth') === name);
    });
    status('setGuestMsg', '');
  }

  async function saveAccount(e) {
    if (e) e.preventDefault();
    var user = realUser();
    if (!user) {
      status('setAccountMsg', 'Sign in first.', false);
      return;
    }
    var name = (($('setFullName') || {}).value || '').trim();
    var username = (($('setUsername') || {}).value || '').trim().replace(/^@/, '').toLowerCase();
    var classYear = (($('setClass') || {}).value || 'Campus');
    var role = (($('setRole') || {}).value || 'Student');
    var bio = (($('setBio') || {}).value || '').trim();
    if (name.length < 2) return status('setAccountMsg', 'Enter your full name.', false);
    if (username.length < 3) return status('setAccountMsg', 'Username needs at least 3 letters.', false);
    status('setAccountMsg', 'Saving…', true);
    try {
      var api = await waitApi();
      await api.saveProfile(user, {
        fullName: name,
        username: username,
        classYear: classYear,
        role: role.toLowerCase(),
        bio: bio
      });
      fillHero();
      fillForm();
      status('setAccountMsg', 'Profile saved.', true);
      setTimeout(function () { status('setAccountMsg', ''); }, 1600);
    } catch (err) {
      status('setAccountMsg', friendlyError(err), false);
    }
  }

  async function signInEmail() {
    var identifier = (($('setLoginId') || {}).value || '').trim();
    var password = (($('setLoginPassword') || {}).value || '');
    if (!password || password.length < 6) return status('setGuestMsg', 'Password must be at least 6 characters.', false);
    status('setGuestMsg', 'Signing in…', true);
    try {
      var email = await resolveEmail(identifier);
      var api = await waitApi();
      var cred = await api.signInWithEmail(email, password);
      await api.loadOrCreateProfile(cred.user);
      fillHero();
      fillForm();
      status('setGuestMsg', '');
    } catch (err) {
      status('setGuestMsg', friendlyError(err), false);
    }
  }

  async function createAccount() {
    var fullName = (($('setNewName') || {}).value || '').trim();
    var username = (($('setNewUser') || {}).value || '').trim().toLowerCase().replace(/^@/, '');
    var email = (($('setNewEmail') || {}).value || '').trim().toLowerCase();
    var password = (($('setNewPass') || {}).value || '');
    var confirm = (($('setNewPass2') || {}).value || '');
    if (fullName.length < 3) return status('setGuestMsg', 'Enter your full name.', false);
    if (!/^[a-z0-9._]{3,24}$/.test(username)) return status('setGuestMsg', 'Username: 3–24 letters, numbers, . or _.', false);
    if (!email || email.indexOf('@') === -1) return status('setGuestMsg', 'Enter a valid email.', false);
    if (password.length < 6) return status('setGuestMsg', 'Password must be at least 6 characters.', false);
    if (password !== confirm) return status('setGuestMsg', 'Passwords do not match.', false);
    status('setGuestMsg', 'Creating your account…', true);
    window.__hshsSigningUp = true;
    try {
      var api = await waitApi();
      if (await api.isUsernameTaken(username)) throw new Error('That username is taken. Choose another.');
      var cred = await api.signUpWithEmail(email, password);
      await api.saveProfile(cred.user, { fullName: fullName, username: username, email: email });
      fillHero();
      fillForm();
      status('setGuestMsg', '');
    } catch (err) {
      status('setGuestMsg', friendlyError(err), false);
    } finally {
      window.__hshsSigningUp = false;
    }
  }

  async function googleSignIn() {
    status('setGuestMsg', 'Opening Google…', true);
    try {
      var api = await waitApi();
      var cred = await api.signInWithGoogle();
      await api.loadOrCreateProfile(cred.user);
      fillHero();
      fillForm();
      status('setGuestMsg', '');
    } catch (err) {
      status('setGuestMsg', friendlyError(err), false);
    }
  }

  async function sendReset(fromAccount) {
    var email = fromAccount
      ? ((($('setEmail') || {}).value) || (realUser() && realUser().email) || '')
      : (($('setResetEmail') || {}).value || '');
    email = String(email || '').trim().toLowerCase();
    var box = fromAccount ? 'setAccountMsg' : 'setGuestMsg';
    if (!email || email.indexOf('@') === -1) return status(box, 'Enter the email on your account.', false);
    status(box, 'Sending reset link…', true);
    try {
      var api = await waitApi();
      await api.sendPasswordReset(email);
      status(box, 'If that email has an account, a reset link is on the way.', true);
    } catch (err) {
      status(box, friendlyError(err), false);
    }
  }

  async function signOut() {
    try {
      var api = await waitApi();
      await api.signOutUser();
    } catch (e) {}
    fillHero();
    fillForm();
    showAuthBox('login');
    status('setGuestMsg', '');
    status('setAccountMsg', '');
  }

  function pickPhoto(file) {
    if (!file || !file.type || file.type.indexOf('image') !== 0) {
      status('setAccountMsg', 'Choose a photo.', false);
      return;
    }
    var user = realUser();
    if (!user) {
      status('setGuestMsg', 'Sign in before changing your photo.', false);
      return;
    }
    function applyUrl(url) {
      var pic = $('setHeroPic');
      if (pic) pic.src = url;
      waitApi().then(function (api) {
        return api.saveProfile(user, { photoURL: url, avatar: url });
      }).then(function () {
        fillHero();
        status('setAccountMsg', 'Photo updated.', true);
        setTimeout(function () { status('setAccountMsg', ''); }, 1600);
      }).catch(function (err) {
        status('setAccountMsg', friendlyError(err), false);
      });
    }
    if (window.HshsStorage && window.HshsStorage.upload) {
      window.HshsStorage.upload(file, { kind: 'photo' }).then(function (res) {
        applyUrl((res && res.url) || '');
      }).catch(function () {
        readLocal(file, applyUrl);
      });
      return;
    }
    readLocal(file, applyUrl);
  }

  function readLocal(file, cb) {
    var reader = new FileReader();
    reader.onload = function () { cb(String(reader.result || '')); };
    reader.readAsDataURL(file);
  }

  function setTab(name) {
    document.querySelectorAll('.hshs-set-tab').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.setTab === name);
    });
    document.querySelectorAll('.hshs-set-pane').forEach(function (pane) {
      pane.classList.toggle('on', pane.id === name + 'Tab');
    });
    if (location.hash !== '#' + name) {
      try { history.replaceState(null, '', '#' + name); } catch (e) {}
    }
  }

  function bindOnce(el, ev, fn) {
    if (!el || el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener(ev, fn);
  }

  function boot() {
    var root = $('hshsSettingsRoot');
    if (!root) return;
    hideToastBanners();
    fillHero();
    fillForm();
    if (root.__bound) return;
    root.__bound = true;

    document.querySelectorAll('.hshs-set-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { setTab(btn.dataset.setTab); });
    });
    var hash = (location.hash || '#account').replace('#', '');
    if (['account', 'privacy', 'notifications', 'theme'].indexOf(hash) < 0) hash = 'account';
    setTab(hash);

    bindOnce($('setSaveAccount'), 'click', saveAccount);
    bindOnce($('setCreateAccount'), 'click', createAccount);
    bindOnce($('setLoginBtn'), 'click', signInEmail);
    bindOnce($('setGoogleBtn'), 'click', googleSignIn);
    bindOnce($('setSignOut'), 'click', signOut);
    bindOnce($('setSendReset'), 'click', function () { sendReset(true); });
    bindOnce($('setResetBtn'), 'click', function () { sendReset(false); });
    bindOnce($('setOpenReset'), 'click', function () { showAuthBox('reset'); });
    bindOnce($('setBackLogin'), 'click', function () { showAuthBox('login'); });

    document.querySelectorAll('[data-set-auth]').forEach(function (btn) {
      btn.addEventListener('click', function () { showAuthBox(btn.getAttribute('data-set-auth')); });
    });

    var file = $('setPhotoFile');
    var cam = $('setPhotoBtn');
    bindOnce(cam, 'click', function () { if (file) file.click(); });
    bindOnce(file, 'change', function () { pickPhoto(file.files && file.files[0]); });

    document.querySelectorAll('[data-theme-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.dataset.themePick;
        try { localStorage.setItem('theme', JSON.stringify(next)); } catch (e) {}
        if (window.syncHshsTheme) window.syncHshsTheme();
        paintTheme();
        hideToastBanners();
      });
    });
    document.querySelectorAll('[data-accent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.dataset.accent;
        savePrefs({ accent: name });
        applyAccent(name);
        hideToastBanners();
      });
    });
    document.querySelectorAll('[data-pref]').forEach(function (el) {
      el.addEventListener('change', function () {
        var patch = {};
        patch[el.dataset.pref] = !!el.checked;
        savePrefs(patch);
        hideToastBanners();
      });
    });

    ['setLoginPassword', 'setNewPass', 'setNewPass2'].forEach(function (id) {
      var input = $(id);
      if (!input) return;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (id === 'setLoginPassword') signInEmail();
          else createAccount();
        }
      });
    });
  }

  window.initHshsSettings = boot;
  document.addEventListener('hshs:auth', function () {
    if ($('hshsSettingsRoot')) {
      fillHero();
      fillForm();
    }
  });
  document.addEventListener('hshs:profile', function () {
    if ($('hshsSettingsRoot')) {
      fillHero();
      fillForm();
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:page', boot);
})();
