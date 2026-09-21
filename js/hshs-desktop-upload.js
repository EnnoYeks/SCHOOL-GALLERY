/* HSHS desktop upload — file-first composer, no phone clone */
(function () {
  if (window.__hshsDesktopUpload) return;
  window.__hshsDesktopUpload = true;

  function isDesktop() {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  function studio() {
    return document.getElementById('hshsStudio') || document.getElementById('hshsUploadStudio');
  }

  function openStudio() {
    if (typeof window.__hshsOpenUploadForPage === 'function') {
      window.__hshsOpenUploadForPage(location.pathname);
      return;
    }
    if (typeof window.__hshsOpenUpload === 'function') {
      window.__hshsOpenUpload();
      return;
    }
    var fallback = document.getElementById('openUploadStudio');
    if (fallback) fallback.click();
  }

  function mountNavButton() {
    if (!isDesktop()) {
      var extra = document.getElementById('hshsDeskUploadBtn');
      if (extra) extra.hidden = true;
      return;
    }
    if (document.getElementById('hshsDeskUploadBtn')) {
      document.getElementById('hshsDeskUploadBtn').hidden = false;
      return;
    }
    var actions = document.querySelector('.navbar .nav-actions, .navbar .hshs-top-actions');
    if (!actions) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'hshsDeskUploadBtn';
    btn.className = 'hshs-desk-upload';
    btn.setAttribute('aria-label', 'Upload');
    btn.innerHTML = '<i class="fas fa-plus"></i><span>Upload</span>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openStudio();
    });
    var more = document.getElementById('hshsDesktopMore');
    if (more && more.parentNode === actions) actions.insertBefore(btn, more);
    else actions.insertBefore(btn, actions.firstChild);
  }

  function stopIdleCamera() {
    var root = studio();
    if (!root || root.hidden) return;
    if (root.querySelector('.hshs-create')) return;
    if (root.classList.contains('is-desk-cam')) return;
    var video = document.getElementById('hshsCamVideo') || root.querySelector('.hshs-cam-stage video');
    if (!video) return;
    try {
      if (video.srcObject && video.srcObject.getTracks) {
        video.srcObject.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      }
      video.srcObject = null;
      video.removeAttribute('src');
    } catch (e) {}
  }

  function pickFile() {
    var input = document.getElementById('hshsUploadFile');
    if (!input) {
      var label = document.querySelector('.hshs-cam-gallery');
      if (label) label.click();
      return;
    }
    input.click();
  }

  function useCamera() {
    var root = studio();
    if (root) {
      root.classList.add('is-desk-cam');
      var panel = document.getElementById('hshsDeskStart');
      if (panel) panel.hidden = true;
    }
  }

  function mountStartPanel() {
    if (!isDesktop()) return;
    var root = studio();
    if (!root || root.hidden) return;
    if (root.querySelector('.hshs-create, .hshs-sheet')) {
      var old = document.getElementById('hshsDeskStart');
      if (old) old.remove();
      return;
    }
    if (!root.querySelector('.hshs-cam')) return;
    if (root.classList.contains('is-desk-cam')) return;
    var panel = document.getElementById('hshsDeskStart');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'hshsDeskStart';
      panel.className = 'hshs-desk-start';
      panel.innerHTML =
        '<button type="button" class="hshs-desk-start-x" data-desk="close" aria-label="Close"><i class="fas fa-xmark"></i></button>' +
        '<div class="hshs-desk-drop" data-desk="pick">' +
        '<i class="fas fa-cloud-arrow-up"></i>' +
        '<strong>New campus post</strong>' +
        '<p>Drop a photo or video here, or choose a file from this computer.</p>' +
        '<div class="hshs-desk-start-actions">' +
        '<button type="button" class="hshs-desk-start-primary" data-desk="pick"><i class="fas fa-folder-open"></i> Choose file</button>' +
        '<button type="button" class="hshs-desk-start-ghost" data-desk="camera"><i class="fas fa-camera"></i> Use camera</button>' +
        '</div>' +
        '<small>Photos and school-safe videos. Posted to the page you are on.</small>' +
        '</div>';
      root.appendChild(panel);
    }
    panel.hidden = false;
    stopIdleCamera();
  }

  function polishCompose() {
    if (!isDesktop()) return;
    var root = studio();
    if (!root) return;
    var title = root.querySelector('.hshs-create-head strong');
    if (title && /pin/i.test(title.textContent || '')) title.textContent = 'New post';
    var go = root.querySelector('.hshs-create-go');
    if (go && /^create$/i.test((go.textContent || '').trim())) go.textContent = 'Share to campus';
    var titleInput = document.getElementById('hshsTitle');
    if (titleInput && /pin/i.test(titleInput.getAttribute('placeholder') || '')) {
      titleInput.setAttribute('placeholder', 'Give this moment a title');
    }
    var desc = document.getElementById('hshsDesc');
    if (desc && /pin/i.test(desc.getAttribute('placeholder') || '')) {
      desc.setAttribute('placeholder', 'What is happening in this photo or video?');
    }
    var board = root.querySelector('.hshs-row[data-act="boards"] span');
    if (board && /board/i.test(board.textContent || '')) board.textContent = 'Post to';
  }

  function onDrop(e) {
    var root = studio();
    if (!isDesktop() || !root || root.hidden) return;
    var dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    e.preventDefault();
    e.stopPropagation();
    var input = document.getElementById('hshsUploadFile');
    if (!input) return;
    try {
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) {}
  }

  function bind() {
    if (document.documentElement.__hshsDeskUploadBound) return;
    document.documentElement.__hshsDeskUploadBound = true;
    document.addEventListener('click', function (e) {
      var act = e.target.closest('[data-desk]');
      if (!act) return;
      var kind = act.getAttribute('data-desk');
      if (kind === 'pick') {
        e.preventDefault();
        pickFile();
      } else if (kind === 'camera') {
        e.preventDefault();
        useCamera();
      } else if (kind === 'close') {
        e.preventDefault();
        var closeBtn = document.querySelector('#hshsStudio [data-act="close"]');
        if (closeBtn) closeBtn.click();
      }
    });
    document.addEventListener('dragover', function (e) {
      if (!isDesktop() || !studio() || studio().hidden) return;
      if (e.dataTransfer) e.preventDefault();
    });
    document.addEventListener('drop', onDrop);
  }

  function refresh() {
    mountNavButton();
    var root = studio();
    var open = !!(root && !root.hidden && document.body.classList.contains('studio-open'));
    document.documentElement.classList.toggle('hshs-desk-studio', isDesktop() && open);
    if (!open) {
      var panel = document.getElementById('hshsDeskStart');
      if (panel) panel.remove();
      if (root) root.classList.remove('is-desk-cam');
      return;
    }
    if (!isDesktop()) return;
    polishCompose();
    mountStartPanel();
  }

  function boot() {
    bind();
    mountNavButton();
    var n = 0;
    var iv = setInterval(function () {
      mountNavButton();
      refresh();
      if (++n > 24) clearInterval(iv);
    }, 250);
    if (typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(function () { refresh(); });
      function watch() {
        var root = studio();
        if (root && !root.__deskObserved) {
          root.__deskObserved = true;
          mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
        }
      }
      watch();
      setInterval(watch, 800);
    }
  }

  window.addEventListener('resize', function () {
    mountNavButton();
    refresh();
  }, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
})();
