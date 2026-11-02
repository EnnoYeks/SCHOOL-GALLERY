(function (global) {
  'use strict';

  // Clean app paths. Always /page — never .html, and no required trailing slash.
  var HSHS_PAGES = {
    home: 1, gallery: 1, photos: 1, videos: 1, trending: 1, spotlight: 1,
    polls: 1, memories: 1, more: 1, search: 1, about: 1, contact: 1,
    profile: 1, settings: 1, notifications: 1, saved: 1, buzz: 1, chat: 1,
    admin: 1, login: 1, "edit-profile": 1
  };
  function hshsKey(path) {
    var p = String(path == null ? (location.pathname || "/") : path);
    p = p.split("?")[0].split("#")[0];
    p = p.replace(/\\/g, "/");
    p = p.replace(/\/index\.html$/i, "/");
    p = p.replace(/\.html$/i, "");
    p = p.replace(/\/index\//gi, "/");
    p = p.replace(/^\.\//, "").replace(/^\.\.\//, "");
    var parts = p.split("/").filter(Boolean);
    var seg = (parts.pop() || "home").toLowerCase();
    if (seg === "index") seg = "home";
    if (seg === "contat") seg = "contact";
    if (seg === "clips" || seg === "shorts" || seg === "vibe") seg = "buzz";
    if (seg === "studio") seg = "videos";
    return seg;
  }
  function hshsHref(name) {
    var raw = String(name || "");
    var hash = "";
    var hi = raw.indexOf("#");
    if (hi !== -1) { hash = raw.slice(hi); raw = raw.slice(0, hi); }
    var q = "";
    var qi = raw.indexOf("?");
    if (qi !== -1) { q = raw.slice(qi); raw = raw.slice(0, qi); }
    raw = raw.replace(/^\.\//, "").replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
    if (!raw || raw === "index" || raw === "index.html") return "/" + q + hash;
    var key = hshsKey(raw);
    if (!key || key === "home") return "/" + q + hash;
    return "/" + key + q + hash;
  }
  global.HshsPaths = { key: hshsKey, href: hshsHref, pages: HSHS_PAGES };
  try {
    var now = hshsKey(location.pathname);
    if (now && now !== "home") document.documentElement.setAttribute("data-hshs-page", now);
  } catch (e) {}

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

  function clearSkeletons(host) {
    host.querySelectorAll(':scope > .hshs-section-state, :scope > .hshs-sk-poll, :scope > .hshs-sk-spot, :scope > .hshs-sk-feat, :scope > .hshs-sk-mem, :scope > .hshs-sk-row, :scope > .hshs-sk-card, :scope > .poll-empty, :scope > .sp-empty, :scope > .hshs-empty, :scope > .memories-empty, :scope > [aria-hidden="true"]').forEach(function (node) {
      if (node.parentNode === host) node.parentNode.removeChild(node);
    });
  }
  function section(host, state, opts) {
    opts = opts || {};
    if (!host) return;
    host.setAttribute('data-hshs-state', state);
    if (state !== 'loading') {
      var reserved = host.getBoundingClientRect().height;
      if (reserved > 0) host.style.minHeight = reserved + 'px';
    }
    if (state === 'loading') {
      if (!host.querySelector(':scope > .hshs-section-state, :scope > .hshs-sk-poll, :scope > .hshs-sk-spot, :scope > .hshs-sk-feat, :scope > .hshs-sk-mem, :scope > .hshs-sk-row')) {
        host.insertAdjacentHTML('afterbegin', opts.skeleton || '<div class="hshs-section-state hshs-section-skel" role="status" aria-label="Loading"><span></span><span></span><span></span></div>');
      }
      return;
    }
    clearSkeletons(host);
    if (state === 'success') return;
    var html = state === 'error'
      ? (opts.error || '<div class="hshs-section-state hshs-error"><strong>Could not load this section</strong><button type="button" data-hshs-retry>Retry</button></div>')
      : (opts.empty || '<div class="hshs-section-state hshs-empty"><strong>Nothing here yet</strong></div>');
    host.insertAdjacentHTML('beforeend', html);
    var retry = host.querySelector('[data-hshs-retry]');
    if (retry && typeof opts.onRetry === 'function') retry.addEventListener('click', opts.onRetry);
  }

  global.__hshsRevealPage = paintNow;
  function ready(page) {
    global.__hshsReadyPage = page || global.__hshsReadyPage || '';
    paintNow();
  }
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
  global.HshsPaint = { now: paintNow, ready: ready, section: section, markup: markup };
})(typeof window !== 'undefined' ? window : this);
