(function (global) {
  'use strict';
  if (global.__hshsSettingsPageModule) return;
  global.__hshsSettingsPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'settings.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { settings: { registered: true, path: 'index/settings.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.settings = { name: 'settings', path: 'index/settings.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('settings'); location.href = 'index/settings.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-settings'); console.info('[HSHS] Settings page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
