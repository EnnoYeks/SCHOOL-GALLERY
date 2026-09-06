(function (global) {
  'use strict';
  if (global.__hshsAdminPageModule) return;
  global.__hshsAdminPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'admin.html'; }
  function assetBase() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var s = document.createElement('script'); if (id) s.id = id; s.src = src; s.async = false;
      s.onload = function () { resolve(); }; s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', 'admin');
    var base = assetBase();
    if (!document.querySelector('link[data-hshs-page-css="css/admin.css"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'css/admin.css?v=260906r';
      l.setAttribute('data-hshs-page-css', 'css/admin.css'); document.head.appendChild(l);
    }
    var tpl = global.HshsTemplates && global.HshsTemplates.admin;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    await loadOnce(base + 'js/admin.js?v=260906r', 'hshs-legacy-admin');
    console.info('[HSHS] JS-first full page active: admin');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
