(function (global) {
  'use strict';
  var PAGE = 'more';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  function isPage() {
    try { if (global.HshsRegistry && global.HshsRegistry.activeRoute) return global.HshsRegistry.activeRoute().name === PAGE; } catch (e) {}
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'more.html' || file === 'more';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function loadCss(href) {
    if (document.querySelector('link[data-hshs-more-css="' + href + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base() + href + '?v=260907h1';
    l.setAttribute('data-hshs-more-css', href);
    document.head.appendChild(l);
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c];
    });
  }
  function signedAccount() {
    var live = null;
    try { if (global.HshsPeople && global.HshsPeople.me) live = global.HshsPeople.me(); } catch (e) {}
    var auth = null;
    try { auth = global.hshsAuthUser && !global.hshsAuthUser.isAnonymous ? global.hshsAuthUser : null; } catch (e) {}
    if (!auth) {
      try { auth = global.auth && global.auth.currentUser && !global.auth.currentUser.isAnonymous ? global.auth.currentUser : null; } catch (e) {}
    }
    if (!auth) {
      try { auth = global.firebase && global.firebase.auth && global.firebase.auth().currentUser; } catch (e) {}
      if (auth && auth.isAnonymous) auth = null;
    }
    var p = {};
    try { p = JSON.parse(localStorage.getItem('userProfile') || 'null') || {}; } catch (e) {}
    var signed = !!(live || auth || (p && p.uid && (p.email || p.fullName || p.name || p.username)));
    if (!signed) return null;
    var name = (live && (live.name || live.fullName)) || (auth && (auth.displayName || auth.name)) || p.fullName || p.name || p.username || 'HSHS Student';
    var email = (live && live.email) || (auth && auth.email) || p.email || '';
    var username = (live && live.username) || p.username || '';
    var role = (live && live.role) || p.role || 'Student';
    var klass = (live && live.classYear) || p.classYear || '';
    var photo = (live && (live.photoURL || live.avatar)) || (auth && auth.photoURL) || p.photoURL || p.profilePhoto || p.avatar || '';
    if (!photo) {
      var nav = document.getElementById('profileImg');
      var src = nav && nav.getAttribute('src') || '';
      if (src && src.indexOf('data:image/svg') !== 0 && src.indexOf('placeholder') === -1) photo = src;
    }
    return {
      name: name,
      email: email || (username ? '@' + String(username).replace(/^@/, '') : 'Signed in'),
      role: role + (klass ? ' · ' + klass : ''),
      photo: photo
    };
  }
  function hydrateProfile() {
    var name = document.getElementById('morePageName');
    var email = document.getElementById('morePageEmail');
    if (!name || !email) return;
    var info = signedAccount();
    var role = document.getElementById('morePageRole');
    var pic = document.getElementById('morePagePic');
    var badge = document.getElementById('morePageStatus');
    var card = document.getElementById('morePageMe');
    if (!info) {
      name.textContent = 'Not signed in';
      email.textContent = 'Browsing as guest';
      if (role) role.textContent = 'Guest';
      if (badge) {
        badge.className = 'hshs-session-badge is-guest';
        badge.innerHTML = '<i class="fas fa-user"></i> Guest';
      }
      if (card) card.classList.remove('is-signed-in');
      return;
    }
    name.textContent = info.name;
    email.textContent = info.email;
    if (role) role.textContent = info.role;
    if (pic) {
      pic.innerHTML = info.photo
        ? '<img src="' + escapeHtml(info.photo) + '" alt="">'
        : '<b>' + escapeHtml(String(info.name || '?').charAt(0).toUpperCase()) + '</b>';
    }
    if (badge) {
      badge.className = 'hshs-session-badge is-in';
      badge.innerHTML = '<i class="fas fa-circle-check"></i> Signed in';
    }
    if (card) card.classList.add('is-signed-in');
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (!tpl) return;
    global.HshsRender.mountHTML ? global.HshsRender.mountHTML(root, tpl) : root.innerHTML = tpl;
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    loadCss('css/hshs-more.css');
    loadCss('css/hshs-hub.css');
    hydrateProfile();
  }
  function boot() {
    var go = function () { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); };
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    document.addEventListener('hshs:page', function () { if (isPage()) setTimeout(go, 0); });
    document.addEventListener('hshs:auth', function () { if (isPage()) hydrateProfile(); });
    document.addEventListener('hshs:profile', function () { if (isPage()) hydrateProfile(); });
    [80, 350, 900, 1800].forEach(function (ms) { setTimeout(function () { if (isPage()) hydrateProfile(); }, ms); });
  }
  global.HshsMore = { mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
