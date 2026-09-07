(function (global) {
  'use strict';
  var PAGE = 'trending';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'trending.html'; }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) return resolve();
      var s = document.createElement('script'); if (id) s.id = id;
      s.src = src; s.async = false; s.onload = resolve; s.onerror = resolve; document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    if (document.querySelector('link[data-hshs-css="' + href + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base() + href + '?v=260907d1';
    l.setAttribute('data-hshs-css', href); document.head.appendChild(l);
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl) { if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl); else root.innerHTML = tpl; }
    loadCss('css/trending.css'); loadCss('css/hshs-hub.css');
    loadOnce(base() + 'js/trending.js?v=260907d1', 'hshs-leg-trending').then(function () {
      if (typeof global.startTrending === 'function') global.startTrending();
      return loadOnce(base() + 'js/hshs-discover-ui.js?v=260907d1', 'hshs-discover');
    }).then(function () { if (global.HshsDiscoverUi) global.HshsDiscoverUi.boot(); });
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') global.HshsApp.whenReady(go);
    else if (global.HshsRender) go();
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  document.addEventListener('hshs:page', function () { if (isPage()) mount(); });
})(typeof window !== 'undefined' ? window : this);
