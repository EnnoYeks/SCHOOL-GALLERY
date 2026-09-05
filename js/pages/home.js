(function (global) {
  'use strict';
  if (global.__hshsHomePageModule) return;
  global.__hshsHomePageModule = true;
  var PAGE_NAME = 'home';
  var PAGE_PATH = 'index.html';
  function currentFile() {
    try { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }
    catch (e) { return 'index.html'; }
  }
  function isPage() {
    var file = currentFile();
    return file === 'index.html' || file === '';
  }
  function register() {
    if (!global.HshsRouter && !global.HshsApp) return;
    if (global.HshsApp) {
      var pages = (global.HshsApp.getState().pages || {});
      pages[PAGE_NAME] = { registered: true, path: PAGE_PATH, active: isPage() };
      global.HshsApp.setState({ pages: pages, currentRoute: isPage() ? PAGE_PATH : global.HshsApp.getState().currentRoute });
    }
    global.HshsPages = global.HshsPages || {};
    global.HshsPages[PAGE_NAME] = {
      name: PAGE_NAME, path: PAGE_PATH, isActive: isPage,
      navigate: function () {
        if (global.HshsRouter) return global.HshsRouter.navigate(PAGE_NAME);
        location.href = PAGE_PATH;
      },
      reinit: function () { if (isPage()) activate(true); }
    };
  }
  function activate(fromNav) {
    if (!isPage()) return;
    document.documentElement.classList.add('hshs-page-' + PAGE_NAME);
    document.documentElement.classList.add('hshs-page-active');
    document.documentElement.setAttribute('data-hshs-page', PAGE_NAME);
    if (global.HshsSharedUI && global.HshsSharedUI.markActiveNav) {
      try { global.HshsSharedUI.markActiveNav(); } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent('hshs:page-active', { detail: { page: PAGE_NAME, path: PAGE_PATH, fromNav: !!fromNav } }));
    console.info('[HSHS]', PAGE_NAME, 'page module active');
  }
  function onReady() { register(); if (isPage()) activate(false); }
  function boot() {
    document.addEventListener('hshs:foundation-ready', onReady, { once: true });
    setTimeout(function () { if (global.HshsApp || global.HshsRouter) onReady(); }, 150);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
