(function (global) {
  'use strict';
  if (global.HshsLoading) return;

  function skeleton(count, className) {
    count = count || 3;
    className = className || 'hshs-sk-card';
    var html = '';
    for (var i = 0; i < count; i++) {
      html += '<div class="' + className + '"><span class="hshs-sk-media"></span><div class="hshs-sk-copy"><span class="hshs-sk-line"></span><span class="hshs-sk-line sm"></span></div></div>';
    }
    return html;
  }

  function showSkeleton(root, page) {
    if (global.HshsSkeleton && typeof global.HshsSkeleton.insert === 'function') {
      global.HshsSkeleton.insert(root || document.getElementById('hshs-page'), page || 'home');
      return;
    }
    var el = root || document.getElementById('hshs-page');
    if (el) el.innerHTML = '<div class="hshs-load-skel"><div class="hshs-skel-page">' + skeleton(4) + '</div></div>';
  }

  function showOverlay(message) {
    // Overlay kept only for rare full-screen cases; prefer skeletons.
    var id = 'hshs-loading-overlay';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(7,20,51,.4);z-index:9998;';
      document.body.appendChild(el);
    }
    el.innerHTML = '<div style="background:#0f274f;color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;">' + (message || 'Loading…') + '</div>';
    el.hidden = false;
    return el;
  }

  function hideOverlay() {
    var el = document.getElementById('hshs-loading-overlay');
    if (el) el.hidden = true;
  }

  global.HshsLoading = {
    skeleton: skeleton,
    showSkeleton: showSkeleton,
    show: showSkeleton,   // default is now skeleton
    hide: hideOverlay,
    overlay: showOverlay
  };
})(typeof window !== 'undefined' ? window : this);
