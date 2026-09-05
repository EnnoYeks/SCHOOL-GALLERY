(function (global) {
  'use strict';
  if (global.__hshsVideosPageModule) return;
  global.__hshsVideosPageModule = true;
  function isPage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'videos.html';
  }
  function onFoundationReady() {
    if (!global.HshsRouter) return;
    if (global.HshsApp) {
      global.HshsApp.setState({
        pages: Object.assign({}, (global.HshsApp.getState().pages || {}), {
          videos: { registered: true, path: 'index/videos.html' }
        })
      });
    }
    global.HshsPages = global.HshsPages || {};
    global.HshsPages.videos = {
      name: 'videos', path: 'index/videos.html',
      isActive: function () { return isPage(); },
      navigate: function () {
        if (global.HshsRouter) return global.HshsRouter.navigate('videos');
        location.href = 'index/videos.html';
      }
    };
    if (isPage()) {
      document.documentElement.classList.add('hshs-page-videos');
      console.info('[HSHS] Videos page module active');
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
