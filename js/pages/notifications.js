(function (global) {
  'use strict';
  if (global.__hshsNotificationsPageModule) return;
  global.__hshsNotificationsPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'notifications.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { notifications: { registered: true, path: 'index/notifications.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.notifications = { name: 'notifications', path: 'index/notifications.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('notifications'); location.href = 'index/notifications.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-notifications'); console.info('[HSHS] Notifications page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
