(function (global) {
  'use strict';
  var PAGE = 'more';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;

  function isPage() {
    try {
      if (global.HshsRegistry && global.HshsRegistry.activeRoute) return global.HshsRegistry.activeRoute().name === PAGE;
    } catch (e) {}
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'more.html' || file === 'more';
  }

  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }

  function loadCss(href) {
    if (document.querySelector('link[data-hshs-more-css="' + href + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base() + href + '?v=260906m1';
    l.setAttribute('data-hshs-more-css', href);
    document.head.appendChild(l);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function getUser() {
    try {
      var u = global.firebase && global.firebase.auth ? global.firebase.auth().currentUser : null;
      if (u) return u;
    } catch (e) {}
    try {
      var a = global.HshsAuth && global.HshsAuth.currentUser;
      if (a) return a;
    } catch (e) {}
    return null;
  }

  function hydrateProfile() {
    var user = getUser();
    var name = document.getElementById('morePageName');
    var email = document.getElementById('morePageEmail');
    if (!name || !email) return;
    if (!user) return;
    name.textContent = user.displayName || 'HSHS Student';
    email.textContent = user.email || 'Your HSHS profile';
    var pic = document.getElementById('morePagePic');
    if (pic && user.photoURL) {
      pic.innerHTML = '<img src="' + escapeHtml(user.photoURL) + '" alt="" loading="lazy">';
    }
  }

  function mount() {
    if (!isPage() || !global.HshsRender) return;
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (!tpl) return;
    global.HshsRender.mountHTML ? global.HshsRender.mountHTML(root, tpl) : root.innerHTML = tpl;
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    loadCss('css/hshs-more.css');
    hydrateProfile();
    global['__hshs' + PAGE + 'Mounted'] = true;
    console.info('[HSHS] JS-first full page active:', PAGE);
  }

  function boot() {
    var go = function () {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    };
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    document.addEventListener('hshs:page', function () {
      if (isPage()) {
        global['__hshs' + PAGE + 'Mounted'] = false;
        setTimeout(go, 0);
      }
    });
  }

  global.HshsMore = { mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
