(function (global) {
  'use strict';
  if (global.HshsLoading) return;
  function skeleton(count, className) {
    count = count || 3;
    className = className || 'loading-skeleton';
    var html = '';
    for (var i = 0; i < count; i++) html += '<div class="' + className + '"></div>';
    return html;
  }
  function showOverlay(message) {
    var id = 'hshs-loading-overlay';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(7,20,51,.55);z-index:9998;backdrop-filter:blur(2px);';
      document.body.appendChild(el);
    }
    el.innerHTML = '<div style="background:#0f274f;color:#fff;padding:14px 22px;border-radius:12px;font-size:14px;box-shadow:0 8px 30px rgba(0,0,0,.35);">' + (message || 'Loading…') + '</div>';
    el.hidden = false;
    return el;
  }
  function hideOverlay() {
    var el = document.getElementById('hshs-loading-overlay');
    if (el) el.hidden = true;
  }
  global.HshsLoading = { skeleton: skeleton, show: showOverlay, hide: hideOverlay };
})(typeof window !== 'undefined' ? window : this);
