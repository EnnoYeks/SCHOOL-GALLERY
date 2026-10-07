(function (global) {
  'use strict';
  if (global.HshsPaint) return;

  function paintNow() {
    var root = document.documentElement;
    root.classList.add('hshs-ready', 'hshs-js-first');
    root.classList.remove('hshs-booting');
    global.__hshsBootDone = true;
    global.__hshsRevealQueued = true;
    ['hshs-boot', 'hshs-tt-overlay'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function section(host, state, opts) {
    opts = opts || {};
    if (!host) return;
    host.setAttribute('data-hshs-state', state);
    var old = host.querySelector(':scope > .hshs-section-state');
    if (old) old.parentNode.removeChild(old);
    if (state === 'loading') {
      host.insertAdjacentHTML('afterbegin', opts.skeleton || '<div class="hshs-section-state hshs-section-skel" role="status" aria-label="Loading"><span></span><span></span><span></span></div>');
      return;
    }
    if (state === 'success') return;
    var html = state === 'error'
      ? (opts.error || '<div class="hshs-section-state hshs-error"><strong>Could not load this section</strong><button type="button" data-hshs-retry>Retry</button></div>')
      : (opts.empty || '<div class="hshs-section-state hshs-empty"><strong>Nothing here yet</strong></div>');
    host.insertAdjacentHTML('beforeend', html);
    var retry = host.querySelector('[data-hshs-retry]');
    if (retry && typeof opts.onRetry === 'function') retry.addEventListener('click', opts.onRetry);
  }

  function releaseStuckSkeletons() {
    document.querySelectorAll('.hshs-load-skel').forEach(function (sk) {
      if (!sk.parentNode) return;
      var page = sk.getAttribute('data-skel-page') || 'this page';
      var box = document.createElement('div');
      box.className = 'hshs-section-state hshs-error';
      box.innerHTML = '<strong>Couldn\'t load ' + page + '</strong><p>The HSHS World shell is ready. This section did not finish.</p><button type="button">Retry</button>';
      box.querySelector('button').addEventListener('click', function () { location.reload(); });
      sk.parentNode.replaceChild(box, sk);
    });
  }

  paintNow();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintNow);
  else paintNow();
  global.__hshsRevealPage = paintNow;
  global.HshsPaint = { now: paintNow, section: section };
  setTimeout(releaseStuckSkeletons, 8000);
})(typeof window !== 'undefined' ? window : this);
