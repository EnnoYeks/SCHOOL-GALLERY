(function (global) {
  'use strict';
  var PAGE = 'settings';
  if (global.__hshsSettingsPageModule) return;
  global.__hshsSettingsPageModule = true;
  var VER = '260919set1';

  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'settings.html';
  }
  function base() {
    return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
  }
  function loadCss(h) {
    if (document.querySelector('link[data-hshs-css="' + h + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base() + h + '?v=' + VER;
    l.dataset.hshsCss = h;
    document.head.appendChild(l);
  }
  function loadOnce(src, id, asModule) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) return resolve();
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      if (asModule) s.type = 'module';
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    loadCss('css/hshs-settings.css');
    await loadOnce(base() + 'js/core/templates/settings.js?v=' + VER, 'hshs-tpl-settings');
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl) {
      if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
      else root.innerHTML = tpl;
    }
    await loadOnce(base() + 'js/config.js?v=' + VER, 'hshs-cfg', true);
    await loadOnce(base() + 'js/hshs-auth-api.js?v=' + VER, 'hshs-auth-api', true);
    await loadOnce(base() + 'js/hshs-settings.js?v=' + VER, 'hshs-leg-settings');
    if (global.initHshsSettings) global.initHshsSettings();
  }
  function go() {
    if (!isPage()) return;
    if (!global.HshsRender) { setTimeout(go, 40); return; }
    mount();
  }
  if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
  else document.addEventListener('hshs:foundation-ready', go, { once: true });
  document.addEventListener('hshs:page', function () { if (isPage()) mount(); });
})(typeof window !== 'undefined' ? window : this);
