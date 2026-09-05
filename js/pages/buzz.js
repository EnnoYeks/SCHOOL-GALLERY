(function (global) {
  'use strict';
  if (global.__hshsBuzzPageModule) return;
  global.__hshsBuzzPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'buzz.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { buzz: { registered: true, path: 'index/buzz.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.buzz = { name: 'buzz', path: 'index/buzz.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('buzz'); location.href = 'index/buzz.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-buzz'); console.info('[HSHS] Buzz page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
