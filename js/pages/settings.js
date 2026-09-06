(function (global) {
  'use strict';
  if (global.__hshsSettingsPageModule) return;
  global.__hshsSettingsPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'settings.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'settings');
    R.mount(root, [
      UI.pageHeader('Settings', 'Preferences and account'),
      R.el('div', { className: 'page-content', style: { padding: '1.5rem' } }, [
        R.el('p', { text: 'Use the theme toggle in the header to switch light and dark modes.' }),
        R.el('p', { text: 'Account and notification preferences stay connected to your signed-in profile.' })
      ])
    ]);
    console.info('[HSHS] JS-first page active: settings');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
