(function (g) {
  'use strict';
  if (g.__hshsChatPageModule) return;
  g.__hshsChatPageModule = true;
  var PAGE = 'chat';

  function isPage() {
    try {
      if (g.HshsRegistry && g.HshsRegistry.activeRoute) return g.HshsRegistry.activeRoute().name === PAGE;
    } catch (e) {}
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'chat.html';
  }
  function base() { return location.pathname.indexOf('/index/') !== -1 ? '../' : ''; }

  function loadCss() {
    if (!document.querySelector('link[data-hshs-chat-css]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = base() + 'css/hshs-chat-ui.css?v=261007ui1';
      l.setAttribute('data-hshs-chat-css', '1');
      document.head.appendChild(l);
    }
    if (!document.querySelector('link[data-hshs-chat-desk]')) {
      var d = document.createElement('link');
      d.rel = 'stylesheet';
      d.href = base() + 'css/hshs-chat-desktop.css?v=260930desk1';
      d.setAttribute('data-hshs-chat-desk', '1');
      document.head.appendChild(d);
    }
  }

  function templateReady() {
    return !!(g.HshsRender && g.HshsTemplates && String(g.HshsTemplates.chat || '').indexOf('hshsChatPage') !== -1);
  }

  function mount() {
    if (!isPage() || !templateReady()) return;
    if (g.HshsShell) try { g.HshsShell.ensureShell(); } catch (e) {}
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    loadCss();
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var existing = document.getElementById('hshsChatPage');
    var fresh = !existing || existing.dataset.wired !== '1';
    if (fresh) g.HshsRender.mountHTML(root, g.HshsTemplates.chat);
    document.body.classList.add('has-mobile-shell');
    var tries = 0;
    function arm() {
      if (g.HshsMessagesUi && g.HshsMessagesUi.boot) {
        g.HshsMessagesUi.boot();
        return;
      }
      var list = document.getElementById('hshsChatList');
      if (list && !list.children.length) {
        list.innerHTML = '<div class="msg-empty"><i class="fas fa-comment-dots"></i><h3>No conversations yet</h3><p>Sign in to message a classmate.</p><a class="msg-empty-cta" href="' + base() + 'index/login.html">Sign in</a></div>';
      }
      if (++tries < 20) setTimeout(arm, 80);
    }
    arm();
    if (fresh && g.HshsChatLive && g.HshsChatLive.boot) g.HshsChatLive.boot();
  }

  function boot() {
    function go() {
      if (!isPage()) return;
      if (!templateReady()) { setTimeout(go, 40); return; }
      mount();
    }
    if (g.HshsApp && g.HshsApp.whenReady) g.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    document.addEventListener('hshs:foundation-ready', function () {
      if (isPage()) setTimeout(go, 0);
    });
    document.addEventListener('hshs:page', function (e) {
      var name = e && e.detail && e.detail.page;
      if (name && name !== PAGE) return;
      if (isPage()) setTimeout(go, 0);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
