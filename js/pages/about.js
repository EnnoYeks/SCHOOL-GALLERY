(function (global) {
  'use strict';
  if (global.__hshsAboutPageModule) return;
  global.__hshsAboutPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'about.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { about: { registered: true, path: 'index/about.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.about = { name: 'about', path: 'index/about.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('about'); location.href = 'index/about.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-about'); console.info('[HSHS] About page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
