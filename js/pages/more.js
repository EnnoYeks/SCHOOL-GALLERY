(function (global) {
  'use strict';
  if (global.__hshsMorePageModule) return;
  global.__hshsMorePageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'more.html'; }
  function assetBase() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', 'more');
    var base = assetBase();
    if (!document.querySelector('link[data-hshs-page-css="css/hshs-more.css"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + 'css/hshs-more.css?v=260906r';
      l.setAttribute('data-hshs-page-css', 'css/hshs-more.css'); document.head.appendChild(l);
    }
    var tpl = global.HshsTemplates && global.HshsTemplates.more;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    console.info('[HSHS] JS-first full page active: more');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
