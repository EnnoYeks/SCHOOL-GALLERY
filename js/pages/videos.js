(function (global) {
  'use strict';
  var PAGE = 'videos';
  if (global.__hshsvideosPageModule) return;
  global.__hshsvideosPageModule = true;
  function isPage() {
    var f = (window.HshsPaths ? HshsPaths.key() : '');
    return f === 'videos' || f === 'studio' || document.documentElement.getAttribute('data-hshs-page') === 'videos' || (global.HshsRoute && global.HshsRoute.is(PAGE));
  }
  function loadOnce(src, id) {
    return new Promise(function (res) {
      if (id && document.getElementById(id)) return res();
      var s = document.createElement('script'); if (id) s.id = id;
      s.src = src; s.async = false; s.onload = function () { res(); }; s.onerror = function () { res(); };
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    if (document.querySelector('link[data-hshs-css="' + href + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/' + href.replace(/^\\/+/, '') + '?v=261027media2';
    l.setAttribute('data-hshs-css', href); document.head.appendChild(l);
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (!tpl) return;
    if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl); else root.innerHTML = tpl;
    loadCss('css/videos.css'); loadCss('css/vibe.css'); loadCss('css/hshs-hub.css'); loadCss('css/hshs-media-cards.css');
    loadOnce('/js/hshs-media-cards.js?v=261027media2', 'hshs-media-cards').then(function () {
      return loadOnce('/js/vibe-skel.js?v=261002route1', 'hshs-vibe-skel');
    }).then(function () {
      if (typeof global.startVideos === 'function') global.startVideos();
      return loadOnce('/js/hshs-discover-ui.js?v=261002route1', 'hshs-discover-ui');
    }).then(function () { if (global.HshsDiscoverUi) global.HshsDiscoverUi.boot(); if (global.HshsRoute) global.HshsRoute.reveal(); });
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    go(); setTimeout(go, 400);
  }
  document.addEventListener('hshs:page', function () { if (isPage()) mount(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
