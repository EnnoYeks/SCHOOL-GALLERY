(function (global) {
  'use strict';
  if (global.__hshsGalleryPageModule) return;
  global.__hshsGalleryPageModule = true;
  function isPage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'gallery.html';
  }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) {
      global.HshsApp.setState({
        pages: Object.assign({}, (global.HshsApp.getState().pages || {}), {
          gallery: { registered: true, path: 'index/gallery.html' }
        })
      });
    }
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.gallery = {
      name: 'gallery', path: 'index/gallery.html',
      isActive: function () { return isPage(); },
      navigate: function () {
        if (global.HshsRouter) return global.HshsRouter.navigate('gallery');
        location.href = 'index/gallery.html';
      }
    };
    if (isPage()) {
      document.documentElement.classList.add('hshs-page-gallery');
      console.info('[HSHS] Gallery page module active');
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
