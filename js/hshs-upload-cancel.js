(function () {
  if (window.__hshsUploadCancel) return;
  window.__hshsUploadCancel = true;

  function studio() {
    return document.getElementById('hshsStudio') || document.getElementById('hshsUploadStudio');
  }

  function stopTracks(root) {
    var nodes = [];
    if (root) nodes = Array.prototype.slice.call(root.querySelectorAll('video'));
    var cam = document.getElementById('hshsCamVideo');
    if (cam) nodes.push(cam);
    nodes.forEach(function (video) {
      try {
        if (video.srcObject && video.srcObject.getTracks) {
          video.srcObject.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
        }
        video.srcObject = null;
        video.removeAttribute('src');
        video.load();
      } catch (e) {}
    });
  }

  function hardClose() {
    var root = studio();
    try { if (typeof window.__hshsCloseUpload === 'function') window.__hshsCloseUpload(); } catch (e) {}
    stopTracks(root);
    if (root) {
      root.hidden = true;
      root.classList.remove('is-desk-cam', 'is-open');
      root.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('studio-open', 'upload-open');
    document.documentElement.classList.remove('hshs-desk-studio');
    var panel = document.getElementById('hshsDeskStart');
    if (panel) panel.remove();
    document.querySelectorAll('.hshs-studio-progress-card, #hshsUploadProgress').forEach(function (el) {
      var wrap = el.closest('.hshs-studio-progress') || el;
      try { wrap.remove(); } catch (e) {}
    });
    document.querySelectorAll('#hshsUploadFile, #hshsStudio input[type="file"]').forEach(function (input) {
      try { input.value = ''; } catch (e) {}
    });
    try {
      if (window.HshsAnalytics && window.HshsAnalytics.events && window.HshsAnalytics.events.uploadCancel) {
        window.HshsAnalytics.events.uploadCancel();
      }
    } catch (e) {}
  }

  window.__hshsCancelUpload = hardClose;

  function ensureCancel() {
    var root = studio();
    if (!root || root.hidden) return;
    if (root.querySelector('[data-upload-cancel]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hshs-upload-cancel';
    btn.setAttribute('data-upload-cancel', '1');
    btn.textContent = 'Cancel';
    root.appendChild(btn);
  }

  document.addEventListener('click', function (e) {
    var explicit = e.target.closest('[data-upload-cancel], [data-act="close"], [data-desk="close"]');
    var button = e.target.closest('button');
    var label = button ? String(button.textContent || '').replace(/\s+/g, ' ').trim() : '';
    var inStudio = e.target.closest('#hshsStudio, #hshsUploadStudio, #hshsDeskStart');
    if (!explicit && !(inStudio && /^cancel$/i.test(label))) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    hardClose();
  }, true);

  function boot() { ensureCancel(); }
  document.addEventListener('hshs:page', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(ensureCancel, 700);
})();
