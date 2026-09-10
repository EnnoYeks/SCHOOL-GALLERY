(function () {
  if (window.__hshsVibeUploadHook) return;
  window.__hshsVibeUploadHook = true;

  function openFromVibe() {
    if (typeof window.__hshsOpenUpload !== 'function') return false;
    try {
      window.__hshsOpenUpload({ prefer: 'video', destinations: ['vibe', 'gallery'] });
      return true;
    } catch (e) {
      try { window.__hshsOpenUpload(); return true; } catch (e2) { return false; }
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-buzz-action="upload"], .buzz-studio');
    if (!btn) return;
    // only intercept studio-style post controls on Vibe
    if (!/\/(buzz|clips|shorts|vibe)/i.test(location.pathname) && !document.querySelector('.buzz-page')) return;
    e.preventDefault();
    e.stopPropagation();
    if (!openFromVibe()) {
      console.warn('[vibe] Studio not ready yet');
    }
  }, true);
})();
