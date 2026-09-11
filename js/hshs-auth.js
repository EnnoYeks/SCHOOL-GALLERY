(function () {
  if (window.__hshsAuthModule) return;
  window.__hshsAuthModule = true;

  var PROFILE_KEY = 'userProfile';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function msg(el, text, ok) {
    if (!el) return;
    el.textContent = text || '';
    el.className = 'hshs-auth-msg' + (text ? (ok ? ' is-ok' : ' is-error') : '');
  }

  function friendlyError(err) {
    var code = (err && err.code) || '';
    var map = {
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Contact school admin.',
      'auth/user-not-found': 'No account found. Check your details or create one.',
      'auth/wrong-password': 'Incorrect password. Try again or reset it.',
      'auth/invalid-credential': 'Incorrect login details. Check and try again.',
      'auth/email-already-in-use': 'That email is already registered. Sign in instead.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled yet in Firebase.'
    };
    return map[code] || (err && err.message) || 'Something went wrong. Please try again.';
  }

  function saveLocalProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem('hshsUid', profile.uid || '');
    } catch (e) {}
    try {
      if (window.HshsStore && typeof window.HshsStore.setUser === 'function') {
        window.HshsStore.setUser(profile);
      }
    } catch (e) {}
    window.hshsProfile = profile;
    document.dispatchEvent(new CustomEvent('hshs:profile', { detail: { profile: profile } }));
  }

  function readLocalProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { return null; }
  }

  async function ensureApi() {
    for (var i = 0; i < 40; i++) {
      if (window.HshsAuthApi) return window.HshsAuthApi;
      await new Promise(function (r) { setTimeout(r, 50); });
    }
    throw new Error('Auth is still loading. Refresh and try again.');
  }

  async function resolveEmailFromLogin(method, identifier) {
    var id = String(identifier || '').trim();
    if (!id) throw new Error('Enter your login details.');
    if (method === 'email') {
      if (id.indexOf('@') === -1) throw new Error('Enter a valid email address.');
      return id.toLowerCase();
    }
    var api = await ensureApi();
    var field = method === 'studentId' ? 'studentId' : 'username';
    var found = await api.lookupUserField(field, id);
    if (!found || !found.email) {
      throw new Error(method === 'studentId'
        ? 'No student found with that ID. Check the ID or sign up.'
        : 'No account with that username. Check spelling or sign up.');
    }
    return String(found.email).toLowerCase();
  }

  async function afterAuth(user) {
    var api = await ensureApi();
    var profile = await api.loadOrCreateProfile(user);
    saveLocalProfile(profile);
    return profile;
  }

  function redirectAfterAuth() {
    var next = new URLSearchParams(location.search).get('next');
    var dest = next || (location.pathname.indexOf('/index/') !== -1 ? '../index.html' : 'index.html');
    if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(dest);
    else location.href = dest;
  }

  function setMode(mode) {
    $all('[data-auth-mode]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-auth-mode') === mode);
    });
    var login = $('#authLoginPanel');
    var signup = $('#authSignupPanel');
    if (login) login.hidden = mode !== 'login';
    if (signup) signup.hidden = mode !== 'signup';
    msg($('#authMsg'), '');
    if (mode === 'signup') setSignupStep(1);
  }

  function setLoginMethod(method) {
    $all('[data-login-method]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-login-method') === method);
    });
    $all('[data-method-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-method-panel') !== method;
    });
    var hint = $('#loginMethodHint');
    if (hint) {
      hint.textContent = method === 'email'
        ? 'Use the email you registered with.'
        : method === 'studentId'
          ? 'Use your school student ID and account password.'
          : 'Use the username you chose at signup.';
    }
  }

  var signupStep = 1;
  function setSignupStep(step) {
    signupStep = step;
    $all('[data-signup-step]').forEach(function (el) {
      var n = Number(el.getAttribute('data-signup-step'));
      el.hidden = n !== step;
    });
    $all('.hshs-signup-steps span').forEach(function (dot, i) {
      dot.classList.toggle('is-on', i + 1 === step);
      dot.classList.toggle('is-done', i + 1 < step);
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    var form = e.target;
    var methodBtn = $('[data-login-method].is-on');
    var method = methodBtn ? methodBtn.getAttribute('data-login-method') : 'email';
    var identifier = '';
    if (method === 'email') identifier = ($('#loginEmail') || {}).value || '';
    if (method === 'studentId') identifier = ($('#loginStudentId') || {}).value || '';
    if (method === 'username') identifier = ($('#loginUsername') || {}).value || '';
    var password = ($('#loginPassword') || {}).value || '';
    var submit = form.querySelector('[type="submit"]');
    var box = $('#authMsg');
    if (!password || password.length < 6) {
      msg(box, 'Password must be at least 6 characters.');
      return;
    }
    if (submit) submit.disabled = true;
    msg(box, '');
    try {
      var email = await resolveEmailFromLogin(method, identifier);
      var api = await ensureApi();
      var cred = await api.signInWithEmail(email, password);
      await afterAuth(cred.user);
      msg(box, 'Welcome back — loading your campus…', true);
      setTimeout(redirectAfterAuth, 500);
    } catch (err) {
      msg(box, friendlyError(err));
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    var box = $('#authMsg');
    var submit = e.target.querySelector('[type="submit"]');

    if (signupStep === 1) {
      var fullName = ($('#suFullName') || {}).value || '';
      var studentId = ($('#suStudentId') || {}).value || '';
      var classYear = ($('#suClassYear') || {}).value || '';
      if (fullName.trim().length < 3) return msg(box, 'Enter your full name.');
      if (studentId.trim().length < 2) return msg(box, 'Enter your student ID.');
      if (!classYear) return msg(box, 'Select your class / year.');
      msg(box, '');
      setSignupStep(2);
      return;
    }

    if (signupStep === 2) {
      var email = (($('#suEmail') || {}).value || '').trim().toLowerCase();
      var username = (($('#suUsername') || {}).value || '').trim().toLowerCase();
      if (!email || email.indexOf('@') === -1) return msg(box, 'Enter a valid email.');
      if (!/^[a-z0-9._]{3,24}$/.test(username)) {
        return msg(box, 'Username: 3–24 chars, letters, numbers, . or _ only.');
      }
      msg(box, '');
      setSignupStep(3);
      return;
    }

    var password = ($('#suPassword') || {}).value || '';
    var confirm = ($('#suPassword2') || {}).value || '';
    if (password.length < 6) return msg(box, 'Password must be at least 6 characters.');
    if (password !== confirm) return msg(box, 'Passwords do not match.');

    if (submit) submit.disabled = true;
    msg(box, '');
    try {
      var api = await ensureApi();
      var payload = {
        fullName: (($('#suFullName') || {}).value || '').trim(),
        studentId: (($('#suStudentId') || {}).value || '').trim(),
        classYear: ($('#suClassYear') || {}).value || 'Campus',
        email: (($('#suEmail') || {}).value || '').trim().toLowerCase(),
        username: (($('#suUsername') || {}).value || '').trim().toLowerCase()
      };
      var takenId = await api.lookupUserField('studentId', payload.studentId);
      if (takenId) throw new Error('That student ID is already linked to an account.');
      var takenUser = await api.lookupUserField('username', payload.username);
      if (takenUser) throw new Error('That username is taken. Choose another.');

      var cred = await api.signUpWithEmail(payload.email, password);
      var profile = await api.saveProfile(cred.user, payload);
      saveLocalProfile(profile);
      msg(box, 'Account created — welcome to HSHS World!', true);
      setTimeout(redirectAfterAuth, 700);
    } catch (err) {
      msg(box, friendlyError(err));
      if (String(err.message || '').indexOf('username') !== -1 || String(err.message || '').indexOf('student ID') !== -1) {
        setSignupStep(2);
      }
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  function wirePasswordToggles() {
    $all('[data-toggle-password]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-toggle-password');
        var input = document.getElementById(id);
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
      });
    });
  }

  function mount() {
    if (!$('#hshsAuthRoot')) return;
    document.body.classList.add('hshs-auth-body');

    $all('[data-auth-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () { setMode(btn.getAttribute('data-auth-mode')); });
    });
    $all('[data-login-method]').forEach(function (btn) {
      btn.addEventListener('click', function () { setLoginMethod(btn.getAttribute('data-login-method')); });
    });
    var loginForm = $('#authLoginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    var signupForm = $('#authSignupForm');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    var back = $('#signupBack');
    if (back) back.addEventListener('click', function () {
      if (signupStep > 1) setSignupStep(signupStep - 1);
      else setMode('login');
    });
    wirePasswordToggles();
    setMode('login');
    setLoginMethod('email');

    var existing = readLocalProfile();
    if (existing && existing.uid && existing.email && !existing.isAnonymous) {
      var skip = $('#authAlreadyIn');
      if (skip) {
        skip.hidden = false;
        skip.innerHTML = 'Signed in as <strong>' + (existing.fullName || existing.email) + '</strong> · <a href="../index.html">Continue to HSHS World</a>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  window.HshsAuthUI = { setMode: setMode, afterAuth: afterAuth, saveLocalProfile: saveLocalProfile };
})();
