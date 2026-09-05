(function (global) {
  'use strict';
  if (global.__hshsProfilePageModule) return;
  global.__hshsProfilePageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'profile.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { profile: { registered: true, path: 'index/profile.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.profile = { name: 'profile', path: 'index/profile.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('profile'); location.href = 'index/profile.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-profile'); console.info('[HSHS] Profile page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
