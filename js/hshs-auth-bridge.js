/**
 * HSHS Auth bridge — wires login into shell, profile, upload authorId
 */
(function () {
  if (window.__hshsAuthBridge) return;
  window.__hshsAuthBridge = true;

  (function loadAuthApi() {
    if (window.HshsAuthApi || document.getElementById('hshs-auth-api-mod')) return;
    var s = document.createElement('script');
    s.id = 'hshs-auth-api-mod';
    s.type = 'module';
    var base = '';
    try {
      var n = document.querySelector('script[src*="navigation.js"]');
      if (n && n.src) base = n.src.replace(/js\/navigation\.js.*/, 'js/');
    } catch (e) {}
    s.src = (base || 'js/') + 'hshs-auth-api.js?v=260911auth2';
    document.head.appendChild(s);
  })();

  function inSub() {
    return /\/index\//i.test(location.pathname);
  }
  function loginHref() {
    return inSub() ? 'login.html' : 'index/login.html';
  }
  function homeHref() {
    return inSub() ? '../index.html' : 'index.html';
  }

  function profile() {
    try {
      return window.hshsProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
    } catch (e) {
      return null;
    }
  }

  function isRealUser() {
    var u = window.hshsAuthUser;
    if (u && !u.isAnonymous) return true;
    var p = profile();
    return !!(p && p.uid && p.email && !p.isAnonymous);
  }

  function currentUid() {
    if (window.hshsAuthUser && window.hshsAuthUser.uid) return window.hshsAuthUser.uid;
    var p = profile();
    return (p && p.uid) || window.hshsUid || null;
  }

  function goLogin(next) {
    var url = loginHref();
    if (next) url += (url.indexOf('?') >= 0 ? '&' : '?') + 'next=' + encodeURIComponent(next);
    if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(url);
    else location.href = url;
  }

  function stampAuthorOnPayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    var uid = currentUid();
    var p = profile() || {};
    payload.authorId = uid || payload.authorId || '';
    payload.author = p.fullName || payload.author || 'HSHS Student';
    payload.authorUsername = p.username || payload.authorUsername || '';
    payload.studentId = p.studentId || payload.studentId || '';
    payload.classTag = payload.classTag || p.classYear || 'Campus';
    return payload;
  }

  function patchStore() {
    var s = window.HshsStore;
    if (!s || s.__authBridged) return;
    if (typeof s.addLocal === 'function') {
      var orig = s.addLocal.bind(s);
      s.addLocal = function (payload) {
        return orig(stampAuthorOnPayload(payload));
      };
    }
    s.__authBridged = true;
  }

  function patchDb() {
    var db = window.db;
    if (!db || db.__authBridged) return;
    ['createPost', 'createPhoto', 'createVideo'].forEach(function (fn) {
      if (typeof db[fn] !== 'function') return;
      var orig = db[fn].bind(db);
      db[fn] = function (payload) {
        return orig(stampAuthorOnPayload(payload || {}));
      };
    });
    db.__authBridged = true;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

  function ensureAuthRow() {
    var sheet = document.getElementById('moreSheet');
    if (!sheet) return;
    var existing = document.getElementById('hshsAuthRow');
    if (existing) existing.remove();

    var row = document.createElement('div');
    row.id = 'hshsAuthRow';
    row.style.cssText = 'padding:12px 14px 4px;';

    if (isRealUser()) {
      var p = profile() || {};
      row.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:16px;background:linear-gradient(135deg,#102a62,#12306e);border:1px solid rgba(255,255,255,.08)">' +
        '<div style="flex:1;min-width:0">' +
        '<strong style="display:block;color:#fff;font-size:.95rem">' + escapeHtml(p.fullName || 'Student') + '</strong>' +
        '<small style="color:#8b97b3">' + escapeHtml((p.classYear || '') + (p.username ? ' · @' + p.username : '')) + '</small>' +
        '</div>' +
        '<button type="button" id="hshsSignOutBtn" style="border:0;border-radius:10px;padding:8px 12px;font-weight:800;font-size:.72rem;background:#1a2748;color:#d6e2ff;cursor:pointer">Sign out</button>' +
        '</div>';
    } else {
      row.innerHTML =
        '<a href="' + loginHref() + '" id="hshsSignInLink" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-radius:16px;text-decoration:none;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:#fff;font-weight:800">' +
        '<span><i class="fas fa-right-to-bracket"></i> Sign in / Create account</span>' +
        '<i class="fas fa-chevron-right"></i></a>';
    }

    var me = sheet.querySelector('.more-me');
    if (me && me.parentNode) me.parentNode.insertBefore(row, me.nextSibling);
    else sheet.insertBefore(row, sheet.firstChild);

    var out = document.getElementById('hshsSignOutBtn');
    if (out) {
      out.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        signOutFlow();
      });
    }
    var link = document.getElementById('hshsSignInLink');
    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        goLogin(location.pathname + location.search);
      });
    }

    if (me && isRealUser()) {
      var p2 = profile() || {};
      var name = document.getElementById('moreMeName');
      var line = document.getElementById('moreMeLine');
      if (name) name.textContent = p2.fullName || 'Student';
      if (line) line.textContent = (p2.role || 'Student') + (p2.classYear ? ' · ' + p2.classYear : '');
    }
  }

  async function signOutFlow() {
    try {
      if (window.HshsAuthApi && window.HshsAuthApi.signOutUser) {
        await window.HshsAuthApi.signOutUser();
      }
    } catch (e) {}
    try {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('hshsUid');
    } catch (e) {}
    window.hshsProfile = null;
    window.hshsAuthUser = null;
    ensureAuthRow();
    if (typeof window.__hshsNavigate === 'function') window.__hshsNavigate(homeHref());
    else location.href = homeHref();
  }

  function gateUploadClick(e) {
    if (isRealUser()) return;
    if (sessionStorage.getItem('hshsAuthNudge') === '1') return;
    sessionStorage.setItem('hshsAuthNudge', '1');
    var go = confirm('Sign in so your posts stay linked to your student account?\n\nOK = Sign in\nCancel = Continue as guest');
    if (go) {
      e.preventDefault();
      e.stopPropagation();
      goLogin(location.pathname + location.search);
    }
  }

  function wireUploadGate() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('#openUploadStudio, .tab-upload, [data-open-studio], .js-open-studio, a[href="#upload"]');
      if (!t) return;
      gateUploadClick(e);
    }, true);
  }

  function wireProfileIcon() {
    var profileEl = document.querySelector('.profile-icon');
    if (!profileEl || profileEl.__authBridgeBound) return;
    profileEl.__authBridgeBound = true;
    profileEl.addEventListener('click', function (e) {
      if (isRealUser()) return;
      if (window.innerWidth > 1024) return;
      e.preventDefault();
      e.stopPropagation();
      goLogin(location.pathname);
    }, true);
  }

  function boot() {
    patchStore();
    patchDb();
    ensureAuthRow();
    wireUploadGate();
    wireProfileIcon();
  }

  document.addEventListener('hshs:auth', function () { ensureAuthRow(); });
  document.addEventListener('hshs:profile', function () { ensureAuthRow(); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('#openMoreSheet, [data-tab="more"]')) {
      setTimeout(ensureAuthRow, 50);
    }
  });

  var n = 0;
  var iv = setInterval(function () {
    boot();
    if (++n > 30) clearInterval(iv);
  }, 300);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.HshsAuthBridge = {
    isRealUser: isRealUser,
    goLogin: goLogin,
    currentUid: currentUid,
    stampAuthorOnPayload: stampAuthorOnPayload,
    ensureAuthRow: ensureAuthRow
  };
})();
