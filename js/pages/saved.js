(function (global) {
  'use strict';
  if (global.__hshsSavedPageModule) return;
  global.__hshsSavedPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'saved.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { saved: { registered: true, path: 'index/saved.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.saved = { name: 'saved', path: 'index/saved.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('saved'); location.href = 'index/saved.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-saved'); console.info('[HSHS] Saved page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
