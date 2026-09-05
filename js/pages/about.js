/**
 * JS-first page module: about
 */
(function (global) {
  'use strict';
  if (global.__hshsAboutPageModule) return;
  global.__hshsAboutPageModule = true;
  var PAGE = 'about';
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'about.html';
  }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    R.mount(root, [
      UI.pageHeader('About', 'About HSHS World'),
      R.el('div', { className: 'page-content', style: { padding: '1rem' } }, [
        R.el('p', { text: 'HSHS World is the home for school moments, achievements and community.' }),
        R.el('p', { text: 'Photos, Vibe, Buzz and memories — one place for campus life.' })
      ])
    ]);
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    console.info('[HSHS] JS-first page active: about');
  }
  function boot() {
    global.HshsPages = global.HshsPages || {};
    global.HshsPages[PAGE] = { name: PAGE, isActive: isPage, mount: mount, reinit: function(){ if(isPage()) mount(); } };
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
