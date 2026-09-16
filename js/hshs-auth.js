(function () {
  if (window.__hshsAuthModule) return;
  window.__hshsAuthModule = true;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function msg(el, text, ok) {
    if (!el) return;
    el.textContent = text || '';
    el.className = 'hshs-auth-msg' + (text ? (ok ? ' is-ok' : ' is-error') : '');
  }

  function friendlyError(err) {
    var code = (err && err.code) || '';
    var raw = (err && err.message) || '';
    if (code === 'permission-denied' || /insufficient permissions/i.test(raw)) {
      return 'Could not save your profile. Try a different username, or sign in again after rules are updated.';
    }
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
      'auth/operation-not-allowed': 'This sign-in method is not enabled yet in Firebase.'
    };
    return map[code] || raw || 'Something went wrong. Please try again.';
  }

  async function ensureApi() {
    for (var i = 0; i < 50; i++) {
      if (window.HshsAuthApi) return window.HshsAuthApi;
      await new Promise(function (r) { setTimeout(r, 60); });
    }
    throw new Error('Auth is still loading. Refresh and try again.');
  }

  function redirectAfterAuth() {
    var next = new URLSearchParams(location.search).get('next');
    var dest = next || (location.pathname.indexOf('/index/') !== -1 ? '../index.html' : 'index.html');
    if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(dest);
    else location.href = dest;
  }

  function showPanel(name) {
    var login = $('#authLoginForm');
    var signup = $('#authSignupForm');
    var reset = $('#authResetForm');
    if (login) login.hidden = name !== 'login';
    if (signup) signup.hidden = name !== 'signup';
    if (reset) reset.hidden = name !== 'reset';
    $all('[data-auth-mode]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-auth-mode') === name);
    });
    msg($('#authMsg'), '');
  }

  async function resolveEmail(identifier) {
    var id = String(identifier || '').trim();
    if (!id) throw new Error('Enter your email or username.');
    if (id.indexOf('@') !== -1) return id.toLowerCase();
    var api = await ensureApi();
    var found = await api.lookupUserField('username', id.toLowerCase());
    if (!found || !found.email) throw new Error('No account with that username.');
    return String(found.email).toLowerCase();
  }

  async function afterAuth(user, extra) {
    var api = await ensureApi();
    var profile = await api.loadOrCreateProfile(user, extra || {});
    if (profile) api.persistProfileLocal(profile);
    return profile;
  }

  async function checkUsernameLive() {
    var input = $('#suUsername');
    var hint = $('#usernameHint');
    if (!input) return true;
    var username = String(input.value || '').trim().toLowerCase();
    if (!hint) {
      hint = document.createElement('small');
      hint.id = 'usernameHint';
      hint.className = 'hshs-auth-hint';
      input.closest('.hshs-field').appendChild(hint);
    }
    if (!username) {
      hint.textContent = '';
      return false;
    }
    if (!/^[a-z0-9._]{3,24}$/.test(username)) {
      hint.textContent = 'Use 3–24 letters, numbers, . or _.';
      hint.style.color = '#fecaca';
      return false;
    }
    hint.textContent = 'Checking username…';
    hint.style.color = '#8b9bb8';
    try {
      var api = await ensureApi();
      var taken = await api.isUsernameTaken(username);
      if (taken) {
        hint.textContent = 'That username is taken. Choose another.';
        hint.style.color = '#fecaca';
        return false;
      }
      hint.textContent = '@' + username + ' is available.';
      hint.style.color = '#a7f3d0';
      return true;
    } catch (e) {
      hint.textContent = '';
      return true;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    var form = e.target;
    var box = $('#authMsg');
    var submit = form.querySelector('[type="submit"]');
    var identifier = ($('#loginId') || {}).value || '';
    var password = ($('#loginPassword') || {}).value || '';
    if (!password || password.length < 6) return msg(box, 'Password must be at least 6 characters.');
    if (submit) submit.disabled = true;
    msg(box, 'Signing in…', true);
    try {
      var email = await resolveEmail(identifier);
      var api = await ensureApi();
      var cred = await api.signInWithEmail(email, password);
      await afterAuth(cred.user);
      msg(box, 'Welcome back — opening HSHS World…', true);
      setTimeout(redirectAfterAuth, 400);
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
    var fullName = (($('#suFullName') || {}).value || '').trim();
    var username = (($('#suUsername') || {}).value || '').trim().toLowerCase();
    var email = (($('#suEmail') || {}).value || '').trim().toLowerCase();
    var password = ($('#suPassword') || {}).value || '';
    var confirm = ($('#suPassword2') || {}).value || '';
    if (fullName.length < 3) return msg(box, 'Enter your full name.');
    if (!/^[a-z0-9._]{3,24}$/.test(username)) return msg(box, 'Username: 3–24 letters, numbers, . or _.');
    if (!email || email.indexOf('@') === -1) return msg(box, 'Enter a valid email.');
    if (password.length < 6) return msg(box, 'Password must be at least 6 characters.');
    if (password !== confirm) return msg(box, 'Passwords do not match.');
    if (submit) submit.disabled = true;
    msg(box, 'Checking username…', true);
    window.__hshsSigningUp = true;
    try {
      var api = await ensureApi();
      if (await api.isUsernameTaken(username)) {
        throw new Error('That username is taken. Choose another.');
      }
      msg(box, 'Creating your account…', true);
      var cred = await api.signUpWithEmail(email, password);
      await api.saveProfile(cred.user, { fullName: fullName, username: username, email: email });
      msg(box, 'Account created — welcome to HSHS World!', true);
      setTimeout(redirectAfterAuth, 500);
    } catch (err) {
      msg(box, friendlyError(err));
    } finally {
      window.__hshsSigningUp = false;
      if (submit) submit.disabled = false;
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    var box = $('#authMsg');
    var submit = e.target.querySelector('[type="submit"]');
    var email = (($('#resetEmail') || {}).value || '').trim().toLowerCase();
    if (!email || email.indexOf('@') === -1) return msg(box, 'Enter the email on your account.');
    if (submit) submit.disabled = true;
    msg(box, 'Sending reset link…', true);
    try {
      var api = await ensureApi();
      await api.sendPasswordReset(email);
      msg(box, 'If that email has an account, a reset link is on the way.', true);
    } catch (err) {
      msg(box, friendlyError(err));
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  async function handleGoogle() {
    var box = $('#authMsg');
    var btn = $('#googleSignIn');
    if (btn) btn.disabled = true;
    msg(box, 'Opening Google…', true);
    try {
      var api = await ensureApi();
      var cred = await api.signInWithGoogle();
      await afterAuth(cred.user);
      msg(box, 'Signed in with Google.', true);
      setTimeout(redirectAfterAuth, 400);
    } catch (err) {
      msg(box, friendlyError(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function mount() {
    if (!$('#hshsAuthRoot')) return;
    document.body.classList.add('hshs-auth-body');
    $all('[data-auth-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () { showPanel(btn.getAttribute('data-auth-mode')); });
    });
    var loginForm = $('#authLoginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    var signupForm = $('#authSignupForm');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    var resetForm = $('#authResetForm');
    if (resetForm) resetForm.addEventListener('submit', handleReset);
    var google = $('#googleSignIn');
    if (google) google.addEventListener('click', handleGoogle);
    var openReset = $('#openReset');
    if (openReset) openReset.addEventListener('click', function (e) { e.preventDefault(); showPanel('reset'); });
    var back = $('#backToLogin');
    if (back) back.addEventListener('click', function (e) { e.preventDefault(); showPanel('login'); });
    var userInput = $('#suUsername');
    if (userInput) {
      var t;
      userInput.addEventListener('blur', checkUsernameLive);
      userInput.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(checkUsernameLive, 400);
      });
    }
    $all('[data-toggle-password]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-toggle-password'));
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
      });
    });
    showPanel('login');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
