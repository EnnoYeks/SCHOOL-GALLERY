(function (global) {
  'use strict';
  if (global.__hshsNotificationsPageModule) return;
  global.__hshsNotificationsPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'notifications.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'notifications');
    R.mount(root, [
      UI.pageHeader('Notifications', 'Your alerts'),
      R.el('div', { className: 'page-content', id: 'notificationsList', style: { padding: '1rem' } }, [
        UI.emptyState('No notifications yet.', 'fa-bell')
      ])
    ]);
    console.info('[HSHS] JS-first page active: notifications');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
