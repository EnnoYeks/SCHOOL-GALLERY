(function (global) {
  'use strict';
  if (global.__hshsHomePageModule) return;
  global.__hshsHomePageModule = true;
  function isPage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'index.html' || file === '';
  }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) {
      global.HshsApp.setState({
        pages: Object.assign({}, (global.HshsApp.getState().pages || {}), {
          home: { registered: true, path: 'index.html' }
        })
      });
    }
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.home = {
      name: 'home', path: 'index.html',
      isActive: function () { return isPage(); },
      navigate: function () {
        if (global.HshsRouter) return global.HshsRouter.navigate('home');
        location.href = 'index.html';
      }
    };
    if (isPage()) {
      document.documentElement.classList.add('hshs-page-home');
      console.info('[HSHS] Home page module active');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true });
      setTimeout(onFoundationReady, 120);
    }, { once: true });
  } else {
    document.addEventListener('hshs:foundation-ready', onFoundationReady, { once: true });
    setTimeout(onFoundationReady, 120);
  }
})(typeof window !== 'undefined' ? window : this);
