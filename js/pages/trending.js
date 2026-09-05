(function (global) {
  'use strict';
  if (global.__hshsTrendingPageModule) return;
  global.__hshsTrendingPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'trending.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { trending: { registered: true, path: 'index/trending.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.trending = { name: 'trending', path: 'index/trending.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('trending'); location.href = 'index/trending.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-trending'); console.info('[HSHS] Trending page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
