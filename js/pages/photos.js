(function (global) {
  'use strict';
  var PAGE = 'photos';
  if (global.__hshsphotosPageModule) return;
  global.__hshsphotosPageModule = true;

  function isPage() {
    if (window.HshsPaths) return HshsPaths.key() === 'photos';
    if (document.documentElement.getAttribute('data-hshs-page') === 'photos') return true;
    return !!document.getElementById('masonryGrid');
  }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) return resolve();
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    if (document.querySelector('link[data-hshs-css="' + href + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/' + href + '?v=261027media2';
    l.setAttribute('data-hshs-css', href);
    document.head.appendChild(l);
  }
  function mountTemplate() {
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    if (document.getElementById('masonryGrid') && document.querySelector('.photos-hero')) return true;
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (!tpl) return !!document.getElementById('masonryGrid');
    if (global.HshsRender && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else root.innerHTML = tpl;
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    return true;
  }
  async function mount() {
    if (!isPage()) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    loadCss('css/photos.css');
    loadCss('css/photos-campus.css');
    loadCss('css/hshs-media-cards.css');
    if (!mountTemplate()) return;
    await loadOnce('/js/hshs-media-cards.js?v=261027media2', 'hshs-media-cards');
    await loadOnce('/js/photos.js?v=261027media2', 'hshs-leg-photos');
    try {
      if (typeof global.startPhotos === 'function') global.startPhotos();
    } catch (e) {
      console.warn('[HSHS] Photos controller start failed', e);
    }
  }
  function boot() {
    function go() { if (isPage()) mount(); }
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    go();
    setTimeout(go, 500);
    setTimeout(function () {
      if (document.querySelector('.loading-skeleton')) go();
    }, 1400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  document.addEventListener('hshs:page', function () {
    if (!isPage()) return;
    setTimeout(mount, 0);
  });
})(typeof window !== 'undefined' ? window : this);
