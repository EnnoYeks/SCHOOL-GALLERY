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
      l.href = (inSub() ? '../css/' : 'css/') + 'hshs-shared-header.css?v=260926cancel1';
      document.head.appendChild(l);
    }
    function addScript(id, file) {
      if (document.getElementById(id)) return;
      var s = document.createElement('script');
      s.id = id;
      var ver = file === 'hshs-upload-cancel.js' ? '260926cancel1' : '260926more2';
      s.src = (inSub() ? '../js/' : 'js/') + file + '?v=' + ver;
      document.body.appendChild(s);
    }
    addScript('hshs-upload-cancel-js', 'hshs-upload-cancel.js');
    addScript('hshs-shared-header-js', 'hshs-shared-header.js');
  }
  function cleanChatCopy() {
    if ((location.pathname.split('/').pop() || '').toLowerCase() === 'chat.html') return;
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
