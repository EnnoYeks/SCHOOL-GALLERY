(function () {
  if (window.__hshsChrome) return;
  window.__hshsChrome = true;

  function inSub() {
    return /\/index\//i.test(location.pathname);
  }
  function settingsHref() {
    return inSub() ? 'settings.html' : 'index/settings.html';
  }
  function cssHref(file) {
    return (inSub() ? '../css/' : 'css/') + file + '?v=260926chrome2';
  }
  function ensureCss(id, file) {
    if (document.getElementById(id)) return;
    var l = document.createElement('link');
    l.id = id;
    l.rel = 'stylesheet';
    l.href = cssHref(file);
    document.head.appendChild(l);
  }
  function unifySettings() {
    document.querySelectorAll('.navbar .hshs-settings-btn, .navbar #hshsSettingsBtn, .navbar a[title="Settings"], .navbar a[aria-label="Settings"], .navbar #themeToggle').forEach(function (el) {
      el.remove();
    });
  }
  function ensureShared() {
    if (!document.getElementById('hshs-shared-header-css')) {
      var l = document.createElement('link');
      l.id = 'hshs-shared-header-css';
      l.rel = 'stylesheet';
      l.href = (inSub() ? '../css/' : 'css/') + 'hshs-shared-header.css?v=260926ui6';
      document.head.appendChild(l);
    }
    function addScript(id, file) {
      if (document.getElementById(id)) return;
      var s = document.createElement('script');
      s.id = id;
      s.src = (inSub() ? '../js/' : 'js/') + file + '?v=260926ui6';
      document.body.appendChild(s);
    }
    addScript('hshs-upload-cancel-js', 'hshs-upload-cancel.js');
    addScript('hshs-shared-header-js', 'hshs-shared-header.js');
  }
  function cleanChatCopy() {
    document.querySelectorAll('.msg-hero-titles p').forEach(function (el) {
      var t = String(el.textContent || '');
      if (/on this device/i.test(t) || /stay connected/i.test(t)) el.textContent = 'Campus chat';
    });
    var list = document.getElementById('hshsChatList');
    if (list && /Daniel Okello|Aisha Nakitende|Class 4A|Maya Okello/.test(list.textContent || '')) {
      list.innerHTML = '<div class="hshs-chat-empty">No conversations yet. Search a classmate and start a chat.</div>';
    }
  }
  function boot() {
    ensureCss('hshs-desktop-flex-css', 'hshs-desktop-flex.css');
    ensureCss('hshs-glass-css', 'hshs-glass.css');
    ensureCss('hshs-chrome-css', 'hshs-chrome.css');
    if (window.HshsShell && window.HshsShell.ensureShell) {
      try { window.HshsShell.ensureShell(); } catch (e) {}
    }
    ensureShared();
    unifySettings();
    cleanChatCopy();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:foundation-ready', boot);
  document.addEventListener('hshs:page', boot);
  setTimeout(boot, 200);
  setTimeout(boot, 800);
})();
