/**
 * HSHS Page lifecycle coordinator
 *
 * Phase 1 contract:
 * - foundation readiness is safe whether the listener attaches before or after boot
 * - page activation is idempotent
 * - legacy multi-page navigation and SPA-style swaps can share one lifecycle
 */
(function (global) {
  'use strict';
  if (global.__hshsLifecycle) return;
  global.__hshsLifecycle = true;

  var bound = false;
  var activatedKey = '';

  function currentFile() {
    try {
      return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    } catch (e) {
      return 'index.html';
    }
  }

  function fileToPage(file) {
    file = (file || currentFile()).toLowerCase();
    if (!file || file === 'index.html') return 'home';
    if (file === 'clips.html' || file === 'shorts.html') return 'buzz';
    if (file === 'contact.html' || file === 'contat.html') return 'contact';
    return file.replace(/\.html$/, '');
  }

  function pageKey() {
    return fileToPage() + '|' + (location.pathname || '/') + '|' + (location.search || '');
  }

  function activateCurrent(fromNav, force) {
    var name = fileToPage();
    var key = pageKey();
    if (!force && key === activatedKey) return false;

    var mod = global.HshsPages && global.HshsPages[name];
    if (mod && typeof mod.reinit === 'function') {
      try { mod.reinit(); } catch (e) {
        if (global.HshsApp) global.HshsApp.reportError(e, 'lifecycle.reinit');
      }
    }

    activatedKey = key;
    document.documentElement.setAttribute('data-hshs-page', name);
    document.dispatchEvent(new CustomEvent('hshs:page', {
      detail: { page: name, fromNav: !!fromNav }
    }));
    return true;
  }

  function foundationReady() {
    activateCurrent(false, true);
  }

  function bind() {
    if (bound) return;
    bound = true;

    document.addEventListener('hshs:page', function () {
      if (global.HshsSharedUI && global.HshsSharedUI.markActiveNav) {
        try { global.HshsSharedUI.markActiveNav(); } catch (e) {}
      }
    });

    window.addEventListener('popstate', function () {
      setTimeout(function () { activateCurrent(true, true); }, 30);
    });

    var orig = global.__hshsOnPageReady;
    global.__hshsOnPageReady = function () {
      if (typeof orig === 'function') {
        try { orig(); } catch (e) {}
      }
      activateCurrent(true, true);
    };

    if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') {
      global.HshsApp.whenReady(foundationReady);
    } else if (global.HshsApp && global.HshsApp.isReady && global.HshsApp.isReady()) {
      foundationReady();
    } else {
      document.addEventListener('hshs:foundation-ready', foundationReady, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  global.HshsLifecycle = {
    activateCurrent: activateCurrent,
    fileToPage: fileToPage,
    currentFile: currentFile
  };
})(typeof window !== 'undefined' ? window : this);
