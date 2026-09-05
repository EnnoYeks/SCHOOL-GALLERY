(function (global) {
  'use strict';
  if (global.__hshsMemoriesPageModule) return;
  global.__hshsMemoriesPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'memories.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { memories: { registered: true, path: 'index/memories.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.memories = { name: 'memories', path: 'index/memories.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('memories'); location.href = 'index/memories.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-memories'); console.info('[HSHS] Memories page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
