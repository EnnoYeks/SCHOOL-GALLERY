/**
 * HSHS Page lifecycle coordinator
 * Bridges mobile-shell SPA swaps with page modules without replacing either.
 */
(function (global) {
  'use strict';
  if (global.__hshsLifecycle) return;
  global.__hshsLifecycle = true;

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
    if (file === 'contact.html') return 'contact';
    return file.replace(/\.html$/, '');
  }

  function activateCurrent(fromNav) {
    var name = fileToPage();
    var mod = global.HshsPages && global.HshsPages[name];
    if (mod && typeof mod.reinit === 'function') {
      try { mod.reinit(); } catch (e) {
        if (global.HshsApp) global.HshsApp.reportError(e, 'lifecycle.reinit');
      }
    }
    document.documentElement.setAttribute('data-hshs-page', name);
    document.dispatchEvent(new CustomEvent('hshs:page', {
      detail: { page: name, fromNav: !!fromNav }
    }));
  }

  function bind() {
    document.addEventListener('hshs:page', function () {
      if (global.HshsSharedUI && global.HshsSharedUI.markActiveNav) {
        try { global.HshsSharedUI.markActiveNav(); } catch (e) {}
      }
    });

    window.addEventListener('popstate', function () {
      setTimeout(function () { activateCurrent(true); }, 30);
    });

    var orig = global.__hshsOnPageReady;
    global.__hshsOnPageReady = function () {
      if (typeof orig === 'function') {
        try { orig(); } catch (e) {}
      }
      activateCurrent(true);
    };

    document.addEventListener('hshs:foundation-ready', function () {
      setTimeout(function () { activateCurrent(false); }, 80);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  global.HshsLifecycle = {
    activateCurrent: activateCurrent,
    fileToPage: fileToPage
  };
})(typeof window !== 'undefined' ? window : this);
