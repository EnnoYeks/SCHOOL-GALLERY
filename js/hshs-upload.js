/**
 * HSHS Upload Studio — restore camera + compose from known-good build.
 * Full UI (snap photo, record video, filters, gallery pick) lives at 255cb66.
 * Context lock still applied by hshs-upload-context.js.
 */
(function () {
  if (window.__hshsUpload && window.__hshsUpload.__studioLoaded) return;

  // One record per upload. Photo -> photos table, video -> videos table.
  // Gallery and Home already merge posts + photos + videos.
  function installOneRecordGuard() {
    function wrap() {
      var db = window.db;
      if (!db || db.__oneRecord) return !!db;
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
      ['createPost', 'createPhoto', 'createVideo'].forEach(function (fn) {
        if (typeof db[fn] !== 'function') return;
        var orig = db[fn].bind(db);
        db[fn] = function (payload) {
          if (shouldSkip(payload)) {
            console.warn('[HSHS] Skipped duplicate ' + fn + ' for same media');
            return Promise.resolve(null);
          }
          return orig(payload);
        };
      });
      return true;
    }
    if (!wrap()) {
      var n = 0;
      var iv = setInterval(function () {
        if (wrap() || ++n > 40) clearInterval(iv);
      }, 200);
    }
  }
  installOneRecordGuard();


  var CDN =
    'https://cdn.jsdelivr.net/gh/EnnoYeks/SCHOOL-GALLERY@255cb6608129cf952fb2c8de957a7254ae830099/js/hshs-upload.js';


  function installCameraFallback() {
    if (window.__hshsCamFallbackInstalled) return;
    window.__hshsCamFallbackInstalled = true;

    var media = navigator.mediaDevices;
    if (media && typeof media.getUserMedia === 'function') {
      var nativeGetUserMedia = media.getUserMedia.bind(media);
      try {
        media.getUserMedia = function (constraints) {
          return nativeGetUserMedia(constraints).then(function (result) {
            window.__hshsLastCameraError = null;
            hideCamFallback();
            return result;
          }, function (err) {
            window.__hshsLastCameraError = err || null;
            throw err;
          });
        };
      } catch (err) {
        console.warn('[HSHS] Could not observe camera permission errors', err);
      }
    }

    function hideCamFallback() {
      var root = document.getElementById('hshsStudio');
      if (!root) return;
      var card = root.querySelector('#camFallback');
      if (card) card.remove();
      var rail = root.querySelector('.hshs-cam-rail');
      if (rail) rail.classList.remove('cam-disabled');
      var shutter = root.querySelector('.hshs-cam-shutter');
      if (shutter) shutter.style.removeProperty('display');
      var effects = root.querySelector('.hshs-cam-bottom .hshs-cam-effects-btn');
      if (effects) effects.style.removeProperty('display');
    }

    function showCamFallback(err) {
      var root = document.getElementById('hshsStudio');
      var stage = root && root.querySelector('.hshs-cam-stage');
      if (!stage) return;
      var messages = {
        NotAllowedError: ['Camera is blocked', 'Allow camera access in your browser settings, then tap Try again.'],
        NotFoundError: ['No camera found', "This device doesn't seem to have a camera."],
        NotReadableError: ['Camera is busy', 'Close other apps using the camera, then tap Try again.']
      };
      var pair = messages[err && err.name] || ['Camera unavailable', 'You can still pick a photo or video from your gallery.'];
      var oldMessage = stage.querySelector('.hshs-cam-msg');
      if (oldMessage) oldMessage.remove();

      var card = stage.querySelector('#camFallback');
      if (!card) {
        card = document.createElement('div');
        card.className = 'cam-fallback';
        card.id = 'camFallback';
        card.hidden = true;
        card.innerHTML =
          '<div class="cam-fallback__icon" aria-hidden="true">📷</div>' +
          '<h2 id="camTitle">Camera unavailable</h2>' +
          '<p id="camHelp">You can still pick a photo from your gallery.</p>' +
          '<button type="button" class="cam-fallback__primary" id="pickBtn">Choose from gallery</button>' +
          '<button type="button" class="cam-fallback__ghost" id="retryBtn">Try camera again</button>';
        stage.appendChild(card);
        card.querySelector('#pickBtn').addEventListener('click', function () {
          var input = root.querySelector('#hshsUploadFile');
          if (input) input.click();
        });
        card.querySelector('#retryBtn').addEventListener('click', function () {
          var active = root.querySelector('.hshs-cam-modes [data-mode].is-on');
          var mode = active ? active.getAttribute('data-mode') : 'photo';
          if (typeof window.__hshsOpenUpload === 'function') {
            window.__hshsOpenUpload({ mode: mode });
          }
        });
      }
      card.querySelector('#camTitle').textContent = pair[0];
      card.querySelector('#camHelp').textContent = pair[1];
      card.hidden = false;

      var rail = root.querySelector('.hshs-cam-rail');
      if (rail) rail.classList.add('cam-disabled');
      var shutter = root.querySelector('.hshs-cam-shutter');
      if (shutter) shutter.style.display = 'none';
      var effects = root.querySelector('.hshs-cam-bottom .hshs-cam-effects-btn');
      if (effects) effects.style.display = 'none';
    }

    var root = document.getElementById('hshsStudio');
    if (root && typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function () {
        var message = root.querySelector('.hshs-cam-msg');
        if (message && /camera unavailable/i.test(message.textContent || '')) {
          showCamFallback(window.__hshsLastCameraError);
        }
      });
      observer.observe(root, { childList: true, subtree: true });
      root.__hshsCameraFallbackObserver = observer;
    }
    window.__hshsShowCameraFallback = showCamFallback;
    window.__hshsHideCameraFallback = hideCamFallback;
  }

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
      installCameraFallback();
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
        input.type = 'file'; input.accept = 'image/*,video/*'; input.id = 'hshsUploadFallback'; input.hidden = true;
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
