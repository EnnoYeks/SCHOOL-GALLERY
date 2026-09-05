(function (global) {
  'use strict';
  if (global.__hshsMorePageModule) return;
  global.__hshsMorePageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'more.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { more: { registered: true, path: 'index/more.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.more = { name: 'more', path: 'index/more.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('more'); location.href = 'index/more.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-more'); console.info('[HSHS] More page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
