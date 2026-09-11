/**
 * HSHS mobile-shell
 * Full source restored from commit 58704bde (in-repo push size-limited on some paths).
 * Loads pinned build; upload context via __hshsOpenUploadForPage when available.
 */
(function () {
  if (window.__hshsMobileShellBoot) return;
  window.__hshsMobileShellBoot = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/EnnoYeks/SCHOOL-GALLERY@58704bde2c3646cd4060ca1c2cdf35b2f61c37c3/js/mobile-shell.js';
  s.async = false;
  s.crossOrigin = 'anonymous';
  s.onerror = function () {
    console.error('[HSHS] mobile-shell failed to load from CDN');
  };
  document.head.appendChild(s);
  // Patch context-aware upload after shell loads
  var n = 0;
  var iv = setInterval(function () {
    var btn = document.getElementById('openUploadStudio');
    if (btn && !btn.__hshsCtxBound && window.__hshsOpenUpload) {
      btn.__hshsCtxBound = true;
      btn.addEventListener('click', function (e) {
        if (typeof window.__hshsOpenUploadForPage === 'function') {
          e.preventDefault();
          e.stopPropagation();
          window.__hshsOpenUploadForPage(location.pathname);
        }
      }, true);
      clearInterval(iv);
    }
    if (++n > 40) clearInterval(iv);
  }, 250);
})();
