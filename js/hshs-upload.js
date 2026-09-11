/**
 * HSHS Upload Studio — pinned known-good build (255cb66)
 * Context lock via hshs-upload-context.js
 */
(function () {
  if (window.__hshsUpload) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/EnnoYeks/SCHOOL-GALLERY@255cb6608129cf952fb2c8de957a7254ae830099/js/hshs-upload.js';
  s.async = false;
  s.crossOrigin = 'anonymous';
  s.onerror = function () {
    console.error('[HSHS] upload studio failed to load from CDN');
  };
  document.head.appendChild(s);
})();
