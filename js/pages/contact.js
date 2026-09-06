(function (global) {
  'use strict';
  if (global.__hshsContactPageModule) return;
  global.__hshsContactPageModule = true;
  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'contat.html' || f === 'contact.html';
  }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'contact');
    R.mount(root, [
      UI.pageHeader('Contact', 'Get in touch'),
      R.el('div', { className: 'page-content', style: { padding: '1.5rem' } }, [
        R.el('p', { text: 'Email: info@hshs.ac.ug' }),
        R.el('p', { text: 'Phone: +256 200 946933' }),
        R.el('p', { text: 'Address: Bududa, Kikholo' })
      ])
    ]);
    console.info('[HSHS] JS-first page active: contact');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
