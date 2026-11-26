/* From Uiverse.io by andrew-demchenk0 - https://uiverse.io/andrew-demchenk0/orange-monkey-2
   MIT License, Copyright (c) andrew-demchenk0 (A) */
(function (global) {
  'use strict';
  if (global.HshsLoading && global.HshsLoading.pyramid) return;

  var OVERLAY_ID = 'hshs-loading-overlay';
  var active = null;
  var lockedOverflow = '';
  var lockedHtmlOverflow = '';

  function skeleton(count, className) {
    count = count || 3;
    className = className || 'loading-skeleton';
    var html = '';
    for (var i = 0; i < count; i++) html += '<div class="' + className + '"></div>';
    return html;
  }

  function pyramid(size, extraClass) {
    var named = size === 'sm' || size === 'md' || size === 'lg' ? size : 'md';
    var extra = extraClass ? ' ' + extraClass : '';
    return '<!-- From Uiverse.io by andrew-demchenk0 - https://uiverse.io/andrew-demchenk0/orange-monkey-2 -->' +
      '<div class="hshs-pyramid-slot is-' + named + ' is-on' + extra + '">' +
      '<div class="hshs-pyramid-loader" role="img" aria-label="Loading">' +
      '<div class="hshs-pyramid-wrapper">' +
      '<span class="hshs-pyramid-side hshs-pyramid-side1"></span>' +
      '<span class="hshs-pyramid-side hshs-pyramid-side2"></span>' +
      '<span class="hshs-pyramid-side hshs-pyramid-side3"></span>' +
      '<span class="hshs-pyramid-side hshs-pyramid-side4"></span>' +
      '<span class="hshs-pyramid-shadow"></span>' +
      '</div></div></div>';
  }

  function lockScroll() {
    lockedOverflow = document.body.style.overflow;
    lockedHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('hshs-pyramid-overlay-open');
  }

  function unlockScroll() {
    document.body.style.overflow = lockedOverflow || '';
    document.documentElement.style.overflow = lockedHtmlOverflow || '';
    document.body.classList.remove('hshs-pyramid-overlay-open');
  }

  function hideOverlay() {
    var el = document.getElementById(OVERLAY_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    unlockScroll();
    active = null;
  }

  function stageWord(stage) {
    var s = String(stage || '').toLowerCase();
    if (s === 'uploading') return 'Uploading';
    if (s === 'sizes' || s === 'optimizing') return 'Optimizing';
    if (s === 'saving') return 'Saving';
    if (s === 'done' || s === 'uploaded') return 'Done';
    return 'Preparing';
  }

  function showController(opts) {
    opts = opts || {};
    hideOverlay();
    var el = document.createElement('div');
    el.id = OVERLAY_ID;
    el.className = 'hshs-studio-progress hshs-pyramid-overlay';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    var size = opts.size === 'sm' || opts.size === 'lg' ? opts.size : 'md';
    el.innerHTML = '<div class="hshs-pyramid-card">' + pyramid(size) +
      '<strong class="hshs-pyramid-pct" id="hshsPyramidPct" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">0%</strong>' +
      '<small class="hshs-pyramid-label" id="hshsPyramidLabel">Preparing</small>' +
      '<button type="button" class="hshs-pyramid-cancel" id="hshsPyramidCancel"' + (opts.cancelable ? '' : ' hidden') + '>Cancel</button>' +
      '<p class="hshs-pyramid-error" id="hshsPyramidError" hidden></p>' +
      '<button type="button" class="hshs-pyramid-retry" id="hshsPyramidRetry" hidden>Retry</button>' +
      '</div>';
    document.body.appendChild(el);
    lockScroll();
    var highest = 0;
    var lastBucket = -1;
    var pctEl = el.querySelector('#hshsPyramidPct');
    var labelEl = el.querySelector('#hshsPyramidLabel');
    var errEl = el.querySelector('#hshsPyramidError');
    var retryEl = el.querySelector('#hshsPyramidRetry');
    var cancelEl = el.querySelector('#hshsPyramidCancel');
    if (cancelEl && opts.cancelable) {
      cancelEl.addEventListener('click', function () {
        if (typeof opts.onCancel === 'function') opts.onCancel();
        controller.hide();
      });
    }
    function paint(percent, label) {
      var p = Math.max(highest, Math.max(0, Math.min(100, Math.round(Number(percent) || 0))));
      highest = p;
      if (pctEl) {
        pctEl.textContent = p + '%';
        pctEl.setAttribute('aria-valuenow', String(p));
      }
      if (label && labelEl) labelEl.textContent = label;
      var bucket = Math.floor(p / 10);
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        el.setAttribute('aria-label', (label || 'Loading') + ' ' + p + ' percent');
      }
    }
    var controller = {
      set: function (percent, label) { paint(percent, label || stageWord(label)); },
      done: function (label) { paint(100, label || 'Done'); },
      fail: function (message, onRetry) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = message || 'Upload failed';
        }
        if (retryEl) {
          retryEl.hidden = false;
          retryEl.onclick = function () {
            controller.hide();
            if (typeof onRetry === 'function') onRetry();
          };
        }
        if (cancelEl) cancelEl.hidden = true;
      },
      hide: function () { if (active === controller) hideOverlay(); }
    };
    active = controller;
    if (opts.percent != null) paint(opts.percent, opts.message || 'Preparing');
    else if (opts.message) paint(0, opts.message);
    return controller;
  }

  function showOverlay(message) {
    if (message && typeof message === 'object') return showController(message);
    return showController({ message: message || 'Preparing', size: 'md' });
  }

  function inline(target, size) {
    if (!target) return { set: function () {}, hide: function () {}, done: function () {}, fail: function () {} };
    var wrap = document.createElement('span');
    wrap.className = 'hshs-pyramid-inline';
    wrap.innerHTML = pyramid(size || 'sm') + '<b class="hshs-pyramid-pct" style="font-size:12px"></b>';
    target.appendChild(wrap);
    var pct = wrap.querySelector('b');
    var highest = 0;
    return {
      set: function (percent, label) {
        var p = Math.max(highest, Math.max(0, Math.min(100, Math.round(Number(percent) || 0))));
        highest = p;
        if (pct) pct.textContent = (label ? label + ' ' : '') + p + '%';
      },
      done: function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); },
      hide: function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); },
      fail: function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    };
  }

  global.HshsLoading = {
    skeleton: skeleton,
    pyramid: pyramid,
    show: showOverlay,
    hide: hideOverlay,
    inline: inline,
    stageWord: stageWord
  };
})(typeof window !== 'undefined' ? window : this);
