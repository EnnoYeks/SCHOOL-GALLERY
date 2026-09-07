(function (global) {
  'use strict';
  var PAGE = 'chat';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'chat.html'; }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }
  function loadOnce(src, id, type) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) return resolve();
      var s = document.createElement('script'); if (id) s.id = id; if (type) s.type = type;
      s.src = src; s.async = false; s.onload = function () { resolve(); }; s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    if (document.querySelector('link[data-hshs-css="' + href + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base() + href + '?v=260907w1';
    l.setAttribute('data-hshs-css', href); document.head.appendChild(l);
  }
  async function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl) { if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl); else root.innerHTML = tpl; }
    loadCss('css/hshs-chat.css'); loadCss('css/hshs-chat-spring.css'); loadCss('css/hshs-messages.css');
    await loadOnce(base() + 'js/hshs-chat.js?v=260907w1', 'hshs-leg-chat', 'module');
    await loadOnce(base() + 'js/hshs-chat-spring.js?v=260907w1', 'hshs-leg-chat-spring', 'module');
    await loadOnce(base() + 'js/hshs-messages-ui.js?v=260907w1', 'hshs-msg-ui');
    if (typeof global.initHshsChat === 'function') global.initHshsChat();
    if (global.HshsMessagesUi) global.HshsMessagesUi.boot();
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  document.addEventListener('hshs:page', function (e) { var name = e && e.detail && e.detail.page; if (name === PAGE || isPage()) mount(); });
})(typeof window !== 'undefined' ? window : this);
