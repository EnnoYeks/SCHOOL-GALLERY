(function (global) {
  'use strict';
  var PAGE = 'admin';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  function isPage() { var f=(window.HshsPaths?HshsPaths.key():''); return f===PAGE || (global.HshsRoute && global.HshsRoute.is(PAGE)); }
  function base() { return '/'; }
  function loadOnce(src, id) {
    return new Promise(function (res) {
      if (id && document.getElementById(id)) return res();
      var s = document.createElement('script'); if (id) s.id = id; s.src = src; s.async = false;
      s.onload = function () { res(); }; s.onerror = function () { res(); }; document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    if (document.querySelector('link[data-hshs-css="' + href + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base() + href + '?v=261029live2';
    l.setAttribute('data-hshs-css', href); document.head.appendChild(l);
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global['__hshs' + PAGE + 'Mounted']) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl) { if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl); else root.innerHTML = tpl; }
    loadCss('css/admin.css');
    loadCss('css/admin-media-manager.css');
    await loadOnce(base() + 'js/admin.js?v=261029live2', 'hshs-leg-admin');
    await loadOnce(base() + 'js/admin-media-manager.js?v=261029live2', 'hshs-admin-media-manager');
    global['__hshs' + PAGE + 'Mounted'] = true;
    if (global.HshsRoute) global.HshsRoute.reveal();
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    go(); setTimeout(go, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
