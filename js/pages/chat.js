(function (global) {
  'use strict';
  var PAGE = 'chat';
  if (global['__hshs' + PAGE + 'PageModule']) return;
  global['__hshs' + PAGE + 'PageModule'] = true;
  var BLANK = '<main id="hshsChatBlank" class="hshs-chat-blank-canvas" aria-label="Chat"></main>';
  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'chat.html';
  }
  function mount() {
    if (!isPage()) return;
    if (global.HshsShell) try { global.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    if (global.HshsTemplates) global.HshsTemplates.chat = BLANK;
    global.__hshsTplChat = true;
    if (global.HshsRender && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, BLANK);
    else root.innerHTML = BLANK;
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    if (document.readyState !== 'loading') setTimeout(go, 40);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  document.addEventListener('hshs:page', function (e) {
    var name = e && e.detail && e.detail.page;
    if (name === PAGE || isPage()) mount();
  });
})(typeof window !== 'undefined' ? window : this);
