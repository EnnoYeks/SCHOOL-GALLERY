(function () {
  if (window.__hshsUploadCancel) return;
  window.__hshsUploadCancel = true;

  var closing = false;

  function stopMedia() {
    var videos = document.querySelectorAll('video');
    Array.prototype.forEach.call(videos, function (video) {
      try {
        if (video.srcObject && video.srcObject.getTracks) {
          video.srcObject.getTracks().forEach(function (t) {
            try { t.stop(); } catch (e) {}
          });
        }
        video.srcObject = null;
        video.pause();
      } catch (e) {}
    });
  }

  function unlockPage() {
    document.body.classList.remove('studio-open', 'upload-open');
    document.documentElement.classList.remove('hshs-desk-studio');
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.pointerEvents = '';
    var tab = document.querySelector('.mobile-tabbar');
    var nav = document.querySelector('.navbar');
    if (tab) { tab.style.pointerEvents = ''; tab.style.opacity = ''; }
    if (nav) { nav.style.pointerEvents = ''; nav.style.opacity = ''; }
  }

  function removeStudio() {
    ['hshsStudio', 'hshsUploadStudio', 'hshsDeskStart', 'hshsUploadProgress'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    document.querySelectorAll('.hshs-studio, .hshs-desk-start, .hshs-studio-progress, .hshs-studio-progress-card').forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function hardClose() {
    if (closing) return;
    closing = true;
    window.__hshsUploadClosed = true;
    window.__hshsUploadGen = (window.__hshsUploadGen || 0) + 1;
    try {
      var closeFn = window.__hshsCloseUpload;
      if (typeof closeFn === 'function' && closeFn !== hardClose && !closeFn.__hshsCancelWrapped) {
        closeFn();
      }
    } catch (e) {}
    stopMedia();
    removeStudio();
    unlockPage();
    try {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    } catch (e) {}
    try {
      if (window.HshsAnalytics && window.HshsAnalytics.events && window.HshsAnalytics.events.uploadCancel) {
        window.HshsAnalytics.events.uploadCancel();
      }
    } catch (e) {}
    closing = false;
  }

  window.__hshsCancelUpload = hardClose;

  function wrapOpen() {
    var orig = window.__hshsOpenUpload;
    if (typeof orig !== 'function' || orig.__hshsCancelWrapped) return;
    function wrapped(opts) {
      window.__hshsUploadClosed = false;
      window.__hshsUploadGen = (window.__hshsUploadGen || 0) + 1;
      return orig.call(this, opts);
    }
    wrapped.__hshsCancelWrapped = true;
    window.__hshsOpenUpload = wrapped;
  }

  function isCancelTarget(target) {
    if (!target || !target.closest) return false;
    if (target.closest('[data-upload-cancel], [data-act="close"], [data-desk="close"], .hshs-desk-start-x')) return true;
    var button = target.closest('button');
    if (!button) return false;
    var label = String(button.getAttribute('aria-label') || button.textContent || '').replace(/\s+/g, ' ').trim();
    var inStudio = target.closest('#hshsStudio, #hshsUploadStudio, #hshsDeskStart');
    return !!(inStudio && /^(cancel|close)$/i.test(label));
  }

  function onCancelEvent(e) {
    if (!isCancelTarget(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    hardClose();
  }

  document.addEventListener('pointerdown', onCancelEvent, true);
  document.addEventListener('touchend', onCancelEvent, true);
  document.addEventListener('click', onCancelEvent, true);

  function armClose() {
    if (window.__hshsUploadClosed) {
      removeStudio();
      unlockPage();
      return;
    }
    document.querySelectorAll('#hshsStudio [data-act="close"], #hshsDeskStart [data-desk="close"], .hshs-desk-start-x, [data-upload-cancel]').forEach(function (btn) {
      btn.style.zIndex = '13050';
      btn.style.pointerEvents = 'auto';
      if (btn.__hshsArmed) return;
      btn.__hshsArmed = true;
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        hardClose();
      }, true);
    });
  }

  function boot() {
    wrapOpen();
    armClose();
  }

  document.addEventListener('hshs:page', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(boot, 400);

  if (typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function () {
      if (!window.__hshsUploadClosed) return;
      if (document.getElementById('hshsStudio') || document.getElementById('hshsDeskStart')) {
        removeStudio();
        unlockPage();
      }
    });
    function watch() {
      if (document.body && !document.body.__hshsCancelWatch) {
        document.body.__hshsCancelWatch = true;
        obs.observe(document.body, { childList: true });
      }
    }
    watch();
    document.addEventListener('DOMContentLoaded', watch);
  }
})();
