(function (global) {
  'use strict';
  if (global.__hshsChatPageModule) return;
  global.__hshsChatPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'chat.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { chat: { registered: true, path: 'index/chat.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.chat = { name: 'chat', path: 'index/chat.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('chat'); location.href = 'index/chat.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-chat'); console.info('[HSHS] Chat page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
