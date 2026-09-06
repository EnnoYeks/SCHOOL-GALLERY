(function (global) {
  'use strict';
  var PAGE = 'photos';
  if (global.__hshsphotosPageModule) return;
  global.__hshsphotosPageModule = true;

  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'photos.html';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
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
    l.href = base() + href + '?v=260906p7';
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
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (!tpl) return false;
    if (global.HshsRender && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else root.innerHTML = tpl;
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    return true;
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    if (!mountTemplate()) return;
    loadCss('css/photos.css');
    await loadOnce(base() + 'js/photos.js?v=260906p7', 'hshs-leg-photos');
    try {
      if (typeof global.startPhotos === 'function') global.startPhotos();
    } catch (e) {
      console.warn('[HSHS] Photos controller start failed', e);
    }
    console.info('[HSHS] JS-first full page active:', PAGE);
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) return setTimeout(go, 40);
      mount();
    }
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    else {
      document.addEventListener('hshs:foundation-ready', go, { once: true });
      if (global.HshsRender) go();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  document.addEventListener('hshs:page', function (e) {
    if (!isPage()) return;
    setTimeout(mount, 0);
  });
})(typeof window !== 'undefined' ? window : this);
