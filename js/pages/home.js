/**
 * JS-first home page.
 * The page owns only its content; shared shell/foundation stay global.
 */
(function (global) {
  'use strict';
  if (global.__hshsHomePageModule) return;
  global.__hshsHomePageModule = true;

  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'index.html' || f === '';
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
    if (!isPage() || !global.HshsRender || global.__hshsHomeMounted) return;

    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }

    document.documentElement.setAttribute('data-hshs-page', 'home');
    var tpl = global.HshsTemplates && global.HshsTemplates.home;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;

    await loadOnce(assetBase() + 'js/particles.js?v=260906r', 'hshs-particles');
    global.__hshsHomeMounted = true;
    console.info('[HSHS] JS-first home mounted');
  }

  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }

    if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') {
      global.HshsApp.whenReady(go);
    } else if (global.HshsApp && global.HshsApp.isReady && global.HshsApp.isReady()) {
      go();
    } else {
      document.addEventListener('hshs:foundation-ready', go, { once: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
