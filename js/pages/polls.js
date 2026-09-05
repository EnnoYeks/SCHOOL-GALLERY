(function (global) {
  'use strict';
  if (global.__hshsPollsPageModule) return;
  global.__hshsPollsPageModule = true;
  function isPage() { var file = (location.pathname.split('/').pop() || '').toLowerCase(); return file === 'polls.html'; }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) global.HshsApp.setState({ pages: Object.assign({}, (global.HshsApp.getState().pages || {}), { polls: { registered: true, path: 'index/polls.html' } }) });
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.polls = { name: 'polls', path: 'index/polls.html', isActive: function () { return isPage(); }, navigate: function () { if (global.HshsRouter) return global.HshsRouter.navigate('polls'); location.href = 'index/polls.html'; } };
    if (isPage()) { document.documentElement.classList.add('hshs-page-polls'); console.info('[HSHS] Polls page module active'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }, { once: true });
  else { document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true }); setTimeout(onFoundationReady, 120); }
})(typeof window !== 'undefined' ? window : this);
