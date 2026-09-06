/**
 * JS-first gallery: mount full main structure + GalleryPage controller
 */
(function (global) {
  'use strict';
  if (global.__hshsGalleryPageModule) return;
  global.__hshsGalleryPageModule = true;
  var PAGE = 'gallery';
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'gallery.html';
  }
  function assetBase() {
    return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
  }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.__hshsGalleryMounted) return;
    global.__hshsGalleryOwnedByJsFirst = true;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var base = assetBase();
    var tpl = global.HshsTemplates && global.HshsTemplates.gallery;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    ['css/gallery.css', 'css/gallery-transitions.css'].forEach(function (c) {
      if (!document.querySelector('link[data-hshs-page-css="' + c + '"]')) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = base + c + '?v=260906r';
        l.setAttribute('data-hshs-page-css', c);
        document.head.appendChild(l);
      }
    });
    await loadOnce(base + 'js/gallery.js?v=260906r', 'hshs-legacy-gallery');
    await loadOnce(base + 'js/gallery-transitions.js?v=260906r', 'hshs-legacy-gallery-tr');
    try {
      if (!global.__hshsGalleryPageInstance && document.getElementById('galleryFeed')) {
        var GP = global.GalleryPage || (typeof GalleryPage !== 'undefined' ? GalleryPage : null);
        if (GP) global.__hshsGalleryPageInstance = new GP();
      }
    } catch (e) { console.warn('[HSHS] gallery init', e); }
    global.__hshsGalleryMounted = true;
    console.info('[HSHS] JS-first full page active: gallery');
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
