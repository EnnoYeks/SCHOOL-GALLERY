(function (global) {
  'use strict';
  if (global.__hshsPhotosPageModule) return;
  global.__hshsPhotosPageModule = true;
  function isPage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'photos.html';
  }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) {
      global.HshsApp.setState({
        pages: Object.assign({}, (global.HshsApp.getState().pages || {}), {
          photos: { registered: true, path: 'index/photos.html' }
        })
      });
    }
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.photos = {
      name: 'photos', path: 'index/photos.html',
      isActive: function () { return isPage(); },
      navigate: function () {
        if (global.HshsRouter) return global.HshsRouter.navigate('photos');
        location.href = 'index/photos.html';
      }
    };
    if (isPage()) {
      document.documentElement.classList.add('hshs-page-photos');
      console.info('[HSHS] Photos page module active');
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
