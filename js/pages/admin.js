(function (global) {
  'use strict';
  if (global.__hshsAdminPageModule) return;
  global.__hshsAdminPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'admin.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'admin');
    R.mount(root, [
      UI.pageHeader('Admin', 'Staff desk'),
      R.el('div', { className: 'page-content', style: { padding: '1.5rem' } }, [
        R.el('p', { text: 'Staff tools remain protected by existing authentication.' }),
        R.el('p', { text: 'Sign in with an authorized account to moderate and manage content.' })
      ])
    ]);
    console.info('[HSHS] JS-first page active: admin');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
