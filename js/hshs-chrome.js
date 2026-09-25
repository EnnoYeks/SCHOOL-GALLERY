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
    return (inSub() ? '../css/' : 'css/') + file + '?v=260926chrome';
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
    var moon = document.getElementById('themeToggle');
    if (moon && moon.tagName === 'BUTTON') {
      var a = document.createElement('a');
      a.id = 'hshsSettingsBtn';
      a.className = 'hshs-settings-btn theme-toggle';
      a.href = settingsHref();
      a.title = 'Settings';
      a.setAttribute('aria-label', 'Settings');
      a.innerHTML = '<i class="fas fa-gear"></i>';
      moon.replaceWith(a);
    }
    document.querySelectorAll('#themeToggle').forEach(function (el) {
      if (el.tagName === 'BUTTON') el.style.display = 'none';
    });
  }
  function boot() {
    ensureCss('hshs-desktop-flex-css', 'hshs-desktop-flex.css');
    ensureCss('hshs-glass-css', 'hshs-glass.css');
    ensureCss('hshs-chrome-css', 'hshs-chrome.css');
    if (window.HshsShell && window.HshsShell.ensureShell) {
      try { window.HshsShell.ensureShell(); } catch (e) {}
    }
    unifySettings();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  document.addEventListener('hshs:foundation-ready', boot);
  document.addEventListener('hshs:page', boot);
  setTimeout(boot, 200);
  setTimeout(boot, 800);
})();
