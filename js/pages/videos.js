/**
 * JS-first videos/vibe: full structure + VideosPage module
 */
(function (global) {
  'use strict';
  if (global.__hshsVideosPageModule) return;
  global.__hshsVideosPageModule = true;
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'videos.html';
  }
  function assetBase() {
    return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
  }
  function loadModule(src) {
    return import(src).catch(function (e) { console.warn('[HSHS] module load', src, e); });
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
    if (global.__hshsVideosMounted) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', 'videos');
    var base = assetBase();
    var tpl = global.HshsTemplates && global.HshsTemplates.videos;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    ['css/videos.css', 'css/vibe.css'].forEach(function (c) {
      if (!document.querySelector('link[data-hshs-page-css="' + c + '"]')) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = base + c + '?v=260906r';
        l.setAttribute('data-hshs-page-css', c);
        document.head.appendChild(l);
      }
    });
    await loadOnce(base + 'js/vibe-skel.js?v=260906r', 'hshs-vibe-skel');
    await loadModule(base + 'js/videos.js?v=260906r');
    try {
      setTimeout(function () {
        if (typeof startVideos === 'function') startVideos();
        else if (typeof VideosPage === 'function' && document.getElementById('videosContainer') && !global.__hshsVideosPageInstance) {
          global.__hshsVideosPageInstance = new VideosPage();
        }
      }, 100);
    } catch (e) { console.warn('[HSHS] videos init', e); }
    global.__hshsVideosMounted = true;
    console.info('[HSHS] JS-first full page active: videos');
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
