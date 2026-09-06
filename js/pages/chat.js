(function (global) {
  'use strict';
  if (global.__hshsChatPageModule) return;
  global.__hshsChatPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'chat.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'chat');
    R.mount(root, [
      UI.pageHeader('Chat', 'Messages'),
      R.el('div', { className: 'page-content', id: 'hshsChatPage', style: { padding: '1rem' } }, [
        UI.emptyState('Open chat to message campus friends.', 'fa-comments')
      ])
    ]);
    try { if (typeof global.initHshsChat === 'function') global.initHshsChat(); } catch (e) {}
    console.info('[HSHS] JS-first page active: chat');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
