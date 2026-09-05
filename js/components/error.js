(function (global) {
  'use strict';
  if (global.HshsError) return;
  function show(message, options) {
    options = options || {};
    var id = 'hshs-error-toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('role', 'alert');
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:90vw;background:#7f1d1d;color:#fff;padding:12px 18px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.3);';
      document.body.appendChild(el);
    }
    el.textContent = message || 'Something went wrong';
    el.hidden = false;
    if (options.timeout !== 0) {
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(function () { el.hidden = true; }, options.timeout || 4000);
    }
    return el;
  }
  function hide() {
    var el = document.getElementById('hshs-error-toast');
    if (el) el.hidden = true;
  }
  function bindApp() {
    if (!global.HshsApp || global.HshsApp.__errorBound) return;
    global.HshsApp.__errorBound = true;
    global.HshsApp.on('error', function (entry) {
      if (entry && entry.message) show(entry.message, { timeout: 3500 });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindApp, { once: true });
  } else {
    setTimeout(bindApp, 80);
  }
  global.HshsError = { show: show, hide: hide };
})(typeof window !== 'undefined' ? window : this);
