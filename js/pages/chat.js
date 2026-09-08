(function (global) {
  'use strict';
  var PAGE = 'chat';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'chat.html';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) return resolve();
      var s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    var key = href.split('?')[0];
    if (document.querySelector('link[data-hshs-css="' + key + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base() + href;
    l.setAttribute('data-hshs-css', key);
    document.head.appendChild(l);
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
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl) {
      if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
      else root.innerHTML = tpl;
    }
    loadCss('css/hshs-chat.css?v=260908pk13');
    loadCss('css/hshs-messages.css?v=260908pk13');
    loadCss('css/hshs-chat-packs.css?v=260908pk13');
    loadCss('css/hshs-chat-finish.css?v=260908pk13');
    loadCss('css/hshs-chat-fixes.css?v=260908pk13');
    await loadOnce(base() + 'js/core/templates/chat.js?v=260908pk13', 'hshs-tpl-chat');
    tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl && root && !root.querySelector('#hshsChatPage')) {
      if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
      else root.innerHTML = tpl;
    }
    await loadOnce(base() + 'js/hshs-messages-ui.js?v=260908pk13', 'hshs-msg-ui');
    await loadOnce(base() + 'js/hshs-chat-packs.js?v=260908pk13', 'hshs-chat-packs');
    await loadOnce(base() + 'js/hshs-chat-spring.js?v=260908pk13', 'hshs-chat-spring');
    await loadOnce(base() + 'js/hshs-chat-attach.js?v=260908pk13', 'hshs-chat-attach');
    if (global.HshsMessagesUi) global.HshsMessagesUi.boot();
    if (global.HshsChatPacks) global.HshsChatPacks.boot();
    if (global.HshsChatAttach) global.HshsChatAttach.boot();
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    if (document.readyState !== 'loading') setTimeout(go, 80);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  document.addEventListener('hshs:page', function (e) {
    var name = e && e.detail && e.detail.page;
    if (name === PAGE || isPage()) mount();
  });
})(typeof window !== 'undefined' ? window : this);
