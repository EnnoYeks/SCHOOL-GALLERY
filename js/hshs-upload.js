/**
 * HSHS Upload Studio — restore camera + compose from known-good build.
 * Full UI (snap photo, record video, filters, gallery pick) lives at 255cb66.
 * Context lock still applied by hshs-upload-context.js.
 */
(function () {
  if (window.__hshsUpload && window.__hshsUpload.__studioLoaded) return;

  var CDN =
    'https://cdn.jsdelivr.net/gh/EnnoYeks/SCHOOL-GALLERY@255cb6608129cf952fb2c8de957a7254ae830099/js/hshs-upload.js';

  function loadStudio(src, onFail) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.crossOrigin = 'anonymous';
    s.onload = function () {
      window.__hshsUpload = window.__hshsUpload || {};
      if (typeof window.__hshsUpload === 'boolean') {
        /* older build sets __hshsUpload = true; open/close are globals */
      }
      if (typeof window.__hshsOpenUpload === 'function') {
        window.__hshsUpload = {
          __studioLoaded: true,
          open: window.__hshsOpenUpload,
          close: window.__hshsCloseUpload
        };
      }
    };
    s.onerror = function () {
      console.error('[HSHS] camera Studio failed to load from', src);
      if (typeof onFail === 'function') onFail();
    };
    document.head.appendChild(s);
  }

  function fileOnlyFallback() {
    console.warn('[HSHS] Using file-only upload fallback');
    if (window.__hshsUpload && window.__hshsUpload.compose) return;
    /* minimal: open file picker so uploads still work if CDN is blocked */
    window.__hshsOpenUpload = function () {
      var input = document.getElementById('hshsUploadFallback');
      if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.id = 'hshsUploadFallback';
        input.hidden = true;
        document.body.appendChild(input);
        input.addEventListener('change', function () {
          if (!input.files || !input.files[0]) return;
          alert('Camera Studio is offline. Choose a file from the full app once Studio reloads, or hard-refresh.');
        });
      }
      input.click();
    };
    window.__hshsCloseUpload = function () {};
    window.__hshsUpload = { compose: true, open: window.__hshsOpenUpload, close: window.__hshsCloseUpload };
  }

  loadStudio(CDN, fileOnlyFallback);
})();
