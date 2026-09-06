/**
 * JS-first photos: full masonry + modal from main + PhotosPage
 */
(function (global) {
  'use strict';
  if (global.__hshsPhotosPageModule) return;
  global.__hshsPhotosPageModule = true;
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'photos.html';
  }
  function assetBase() {
    return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
  }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src; s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.__hshsPhotosMounted) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', 'photos');
    var base = assetBase();
    var tpl = global.HshsTemplates && global.HshsTemplates.photos;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    if (!document.querySelector('link[data-hshs-page-css="css/photos.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = base + 'css/photos.css?v=260906r';
      l.setAttribute('data-hshs-page-css', 'css/photos.css');
      document.head.appendChild(l);
    }
    await loadOnce(base + 'js/photos.js?v=260906r', 'hshs-legacy-photos');
    try {
      setTimeout(function () {
        if (typeof PhotosPage === 'function' && document.getElementById('masonryGrid') && !global.__hshsPhotosPageInstance) {
          global.__hshsPhotosPageInstance = new PhotosPage();
        }
      }, 50);
    } catch (e) { console.warn('[HSHS] photos init', e); }
    global.__hshsPhotosMounted = true;
    console.info('[HSHS] JS-first full page active: photos');
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender || !global.HshsTemplates) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
