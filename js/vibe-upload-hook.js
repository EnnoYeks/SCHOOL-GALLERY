(function () {
  if (window.__hshsVibeUploadHook) return;
  window.__hshsVibeUploadHook = true;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-buzz-action="upload"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.__hshsOpenUpload === 'function') {
      window.__hshsOpenUpload({ prefer: 'video', destinations: ['vibe', 'gallery'] });
    }
  }, true);
})();
