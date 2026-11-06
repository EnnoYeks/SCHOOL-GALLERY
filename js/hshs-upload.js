/**
 * HSHS Upload Studio loader — local vendored Studio (no CDN).
 * Full UI lives in js/hshs-upload-studio.js
 * Context lock applied by hshs-upload-context.js
 */
(function () {
  if (window.__hshsUpload && window.__hshsUpload.__studioLoaded) return;

  function markLoaded() {
    window.__hshsUpload = window.__hshsUpload || {};
    if (typeof window.__hshsOpenUpload === 'function') {
      window.__hshsUpload = {
        __studioLoaded: true,
        open: window.__hshsOpenUpload,
        close: window.__hshsCloseUpload
      };
    } else {
      window.__hshsUpload.__studioLoaded = true;
    }
  }

  function loadLocal() {
    var existing = document.querySelector('script[data-hshs-studio]');
    if (existing) return;
    var s = document.createElement('script');
    s.src = '/js/hshs-upload-studio.js?v=upload-v2';
    s.async = false;
    s.dataset.hshsStudio = '1';
    s.onload = markLoaded;
    s.onerror = function () {
      console.error('[HSHS] Studio failed to load from /js/hshs-upload-studio.js');
      fileOnlyFallback();
    };
    document.head.appendChild(s);
  }

  function fileOnlyFallback() {
    console.warn('[HSHS] Using file-only upload fallback');
    if (window.__hshsUpload && window.__hshsUpload.compose) return;
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
          alert('Camera Studio is offline. Hard-refresh the page and try again.');
        });
      }
      input.click();
    };
    window.__hshsCloseUpload = function () {};
    window.__hshsUpload = { compose: true, open: window.__hshsOpenUpload, close: window.__hshsCloseUpload };
  }

  loadLocal();
})();
