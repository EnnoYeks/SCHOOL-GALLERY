(function (global) {
  'use strict';
  if (global.__hshsAboutPageModule) return;
  global.__hshsAboutPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'about.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'about');
    R.mount(root, [
      UI.pageHeader('About', 'About HSHS World'),
      R.el('div', { className: 'page-content', style: { padding: '1.5rem' } }, [
        R.el('p', { text: 'HSHS World is the home for school moments, achievements and community.' }),
        R.el('p', { text: 'Photos, Vibe, Buzz and memories \u2014 one place for campus life.' }),
        R.el('p', { text: 'Email: info@hshs.ac.ug \u00b7 Phone: +256 200 946933' })
      ])
    ]);
    console.info('[HSHS] JS-first page active: about');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
