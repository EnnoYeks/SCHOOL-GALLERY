(function (global) {
  'use strict';
  if (global.__hshsAboutPageModule) return;
  global.__hshsAboutPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'about.html'; }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', 'about');
    var tpl = global.HshsTemplates && global.HshsTemplates.about;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    else if (global.HshsUI) {
      global.HshsRender.mount(root, [global.HshsUI.pageHeader('About', 'About HSHS World')]);
    }
    console.info('[HSHS] JS-first full page active: about');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
