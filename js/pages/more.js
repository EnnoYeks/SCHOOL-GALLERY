(function (global) {
  'use strict';
  if (global.__hshsMorePageModule) return;
  global.__hshsMorePageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'more.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    var b = (global.HshsShell && global.HshsShell.basePath) ? global.HshsShell.basePath() : '../';
    document.documentElement.setAttribute('data-hshs-page', 'more');
    R.mount(root, [
      UI.pageHeader('More', 'Explore more of HSHS World'),
      R.el('div', { className: 'page-content', style: { padding: '1rem', display: 'grid', gap: '0.75rem' } }, [
        UI.btn('About', { href: b + 'index/about.html', variant: 'btn-secondary' }),
        UI.btn('Profile', { href: b + 'index/profile.html', variant: 'btn-secondary' }),
        UI.btn('Settings', { href: b + 'index/settings.html', variant: 'btn-secondary' }),
        UI.btn('Saved', { href: b + 'index/saved.html', variant: 'btn-secondary' }),
        UI.btn('Contact', { href: b + 'index/contat.html', variant: 'btn-secondary' })
      ])
    ]);
    console.info('[HSHS] JS-first page active: more');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
