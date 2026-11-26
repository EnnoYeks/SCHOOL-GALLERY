/**
 * HSHS Upload Studio loader.
 * Full camera UI lives in js/hshs-studio.js. Context lock is hshs-upload-context.js.
 */
(function () {
  if (window.__hshsUpload && window.__hshsUpload.__studioLoaded) return;

  function installOneRecordGuard() {
    function captureUploadMetadata() {
      var storage = window.HshsStorage;
      if (!storage || typeof storage.uploadFromUrl !== 'function' || storage.__variantCapture) return !!storage;
      var originalUpload = storage.uploadFromUrl.bind(storage);
      storage.uploadFromUrl = async function (src, options) {
        window.__hshsLastUploadMeta = null;
        var result = await originalUpload(src, options);
        window.__hshsLastUploadMeta = result || null;
        return result;
      };
      storage.__variantCapture = true;
      return true;
    }

    function wrap() {
      var storageReady = captureUploadMetadata();
      var db = window.db;
      if (!db) return false;
      if (!db.__oneRecord) {
        db.__oneRecord = true;
        var last = { key: '', at: 0 };
        function keyOf(payload) {
          return String((payload && (payload.mediaKey || payload.media_key || payload.imageUrl || payload.image)) || '');
        }
        function shouldSkip(payload) {
          var k = keyOf(payload);
          var now = Date.now();
          if (k && k === last.key && (now - last.at) < 8000) return true;
          last = { key: k, at: now };
          return false;
        }
        function withVariantKey(payload) {
          var meta = window.__hshsLastUploadMeta;
          if (!meta || !meta.processedKey || !meta.key || keyOf(payload) !== String(meta.key)) return payload;
          return Object.assign({}, payload, {
            processedKey: meta.processedKey,
            width: Number(meta.width) > 0 ? Number(meta.width) : payload.width,
            height: Number(meta.height) > 0 ? Number(meta.height) : payload.height
          });
        }
        ['createPost', 'createPhoto', 'createVideo'].forEach(function (fn) {
          if (typeof db[fn] !== 'function') return;
          var original = db[fn].bind(db);
          db[fn] = function (payload) {
            if (shouldSkip(payload)) {
              console.warn('[HSHS] Skipped duplicate ' + fn + ' for same media');
              return Promise.resolve(null);
            }
            return original(withVariantKey(payload));
          };
        });
      }
      return !!db.__oneRecord && storageReady;
    }
    if (!wrap()) {
      var n = 0;
      var iv = setInterval(function () {
        if (wrap() || ++n > 40) clearInterval(iv);
      }, 200);
    }
  }
  installOneRecordGuard();

  function ensureStudioCss() {
    var link = document.getElementById('hshs-studio-css');
    if (!link) {
      link = document.createElement('link');
      link.id = 'hshs-studio-css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = '/css/hshs-studio.css?v=261126pyramid1';
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }

  function loadStudio() {
    ensureStudioCss();
    var ready = window.HshsLoading && window.HshsLoading.pyramid
      ? Promise.resolve()
      : loadScript('/js/components/loading.js?v=261126pyramid1');
    ready.then(function () {
      var s = document.createElement('script');
      s.src = '/js/hshs-studio.js?v=261126pyramid1';
      s.async = false;
      s.onload = function () {
        window.__hshsUpload = window.__hshsUpload || {};
        if (typeof window.__hshsOpenUpload === 'function') {
          window.__hshsUpload = {
            __studioLoaded: true,
            open: window.__hshsOpenUpload,
            close: window.__hshsCloseUpload
          };
        }
      };
      s.onerror = function () {
        console.error('[HSHS] camera studio failed to load');
      };
      document.head.appendChild(s);
    });
  }

  loadStudio();
})();
