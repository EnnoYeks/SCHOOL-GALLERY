(function (global) {
  'use strict';
  if (global.__hshsSpotlightPageModule) return;
  global.__hshsSpotlightPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'spotlight.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { spotlight: { registered: true, path: 'index/spotlight.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.spotlight = { name: 'spotlight', path: 'index/spotlight.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('spotlight'); location.href = 'index/spotlight.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-spotlight'); console.info('[HSHS] Spotlight page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
