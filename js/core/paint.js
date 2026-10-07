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
  function repeat(html, n) {
    n = n || 1;
    var out = '';
    for (var i = 0; i < n; i++) out += html;
    return out;
  }
  var markup = {
    feed: function (n) {
      return repeat('<article class="hshs-sk-card" aria-hidden="true"><div class="hshs-sk-media"></div><div class="hshs-sk-copy"><span class="hshs-sk-line sm"></span><span class="hshs-sk-line"></span></div><div class="hshs-sk-acts"><i></i><i></i><i></i><i></i></div></article>', n || 4);
    },
    poll: function (n) {
      return repeat('<article class="hshs-sk-poll" aria-hidden="true"><span class="hshs-sk-line sm"></span><span class="hshs-sk-line"></span><span class="hshs-sk-bar"></span><span class="hshs-sk-bar"></span><span class="hshs-sk-bar short"></span></article>', n || 2);
    },
    notif: function (n) {
      return repeat('<div class="hshs-sk-row" aria-hidden="true"><i class="hshs-sk-ava"></i><span class="hshs-sk-copy"><b></b><em></em></span></div>', n || 5);
    },
    buzz: function () {
      return '<article class="hshs-sk-buzz" aria-hidden="true"><div class="hshs-sk-buzz-media"></div><div class="hshs-sk-buzz-cap"><b></b><em></em></div><div class="hshs-sk-buzz-rail"><i></i><i></i><i></i></div></article>';
    },
    memory: function (n) {
      return repeat('<article class="hshs-sk-mem" aria-hidden="true"></article>', n || 4);
    },
    empty: function (title, sub) {
      return '<div class="hshs-section-state hshs-empty"><strong>' + (title || 'Nothing here yet') + '</strong>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
    },
    error: function (title) {
      return '<div class="hshs-section-state hshs-error"><strong>' + (title || 'Could not load this section') + '</strong><button type="button" data-hshs-retry>Retry</button></div>';
    }
  };
  global.HshsPaint = { now: paintNow, section: section, markup: markup };
  setTimeout(releaseStuckSkeletons, 8000);
})(typeof window !== 'undefined' ? window : this);
