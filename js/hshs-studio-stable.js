/**
 * HSHS Studio stability patch
 * - Mode switches no longer leave a dead camera
 * - Hides leftover covering canvas from older filter builds
 */
(function () {
  if (window.__hshsStudioStable) return;
  window.__hshsStudioStable = true;

  function softMode(mode) {
    var root = document.getElementById('hshsStudio') || document.getElementById('hshsUploadStudio');
    if (!root || root.hidden) return false;
    if (!document.querySelector('.hshs-cam-stage video')) return false;

    root.querySelectorAll('[data-mode]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-mode') === mode);
    });

    var isPhoto = mode === 'photo';
    var shutter = root.querySelector('.hshs-cam-shutter');
    if (shutter) {
      shutter.classList.toggle('is-rec', !isPhoto);
      shutter.setAttribute('data-act', isPhoto ? 'snap' : 'record');
      shutter.setAttribute('aria-label', isPhoto ? 'Take photo' : 'Record');
    }

    var video = document.getElementById('hshsCamVideo') || root.querySelector('video');
    if (video && video.srcObject) {
      video.style.opacity = '1';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.position = 'absolute';
      video.style.inset = '0';
      video.style.left = '0';
      video.play().catch(function () {});
    }

    root.querySelectorAll('#hshsCamCanvas, .hshs-cam-canvas').forEach(function (c) {
      c.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    });

    return true;
  }

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-mode]');
    if (!tab) return;
    var mode = tab.getAttribute('data-mode');
    if (!mode) return;
    setTimeout(function () {
      softMode(mode);
      var v = document.getElementById('hshsCamVideo');
      if (v && v.srcObject && (v.paused || v.videoWidth === 0)) {
        v.play().catch(function () {});
      }
    }, 0);
    setTimeout(function () { softMode(mode); }, 150);
  }, true);

  setInterval(function () {
    if (!document.body.classList.contains('studio-open') &&
        !document.body.classList.contains('upload-open')) return;
    var v = document.getElementById('hshsCamVideo') ||
      document.querySelector('.hshs-cam-stage video');
    if (!v) return;
    v.style.opacity = '1';
    v.style.objectFit = 'cover';
    if (v.srcObject && v.paused) v.play().catch(function () {});
    document.querySelectorAll('#hshsCamCanvas, .hshs-cam-canvas').forEach(function (c) {
      if (c.style.opacity !== '0') {
        c.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
      }
    });
  }, 1000);
})();
