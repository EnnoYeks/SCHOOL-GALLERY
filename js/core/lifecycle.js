/**
 * HSHS Page lifecycle coordinator
 *
 * Keeps JS-first pages reliable during both hard loads and in-app SPA swaps.
 */
(function (global) {
  'use strict';
  if (global.__hshsLifecycle) return;
  global.__hshsLifecycle = true;

  var bound = false;
  var activatedKey = '';

  function currentFile() {
    try { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }
    catch (e) { return 'index.html'; }
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

  function renderTemplateFallback(name) {
    try {
      var root = document.getElementById('hshs-page');
      var templates = global.HshsTemplates;
      var render = global.HshsRender;
      if (!root || !templates || !templates[name]) return false;

      // JS-first pages own their markup. The mobile shell may briefly place
      // legacy/fetched HTML into #hshs-page while swapping pages. Replace it
      // synchronously with the JS template before the browser gets a chance
      // to paint that raw intermediate DOM.
      if (render && typeof render.mountHTML === 'function') {
        render.mountHTML(root, templates[name]);
      } else {
        root.innerHTML = templates[name];
      }
      return true;
    } catch (e) {
      if (global.HshsApp) global.HshsApp.reportError(e, 'lifecycle.template-fallback');
      return false;
    }
  }

  function refreshKnownPage(name) {
    try {
      if (name === 'gallery' && global.HshsGallery && typeof global.HshsGallery.refresh === 'function') {
        global.HshsGallery.refresh(); return;
      }
      if (name === 'buzz' && global.HshsBuzz && typeof global.HshsBuzz.refresh === 'function') {
        global.HshsBuzz.refresh(); return;
      }
    } catch (e) {
      if (global.HshsApp) global.HshsApp.reportError(e, 'lifecycle.page-refresh');
    }
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
    renderTemplateFallback(fileToPage());
    activateCurrent(false, true);
  }

  function handleSpaPage() {
    var name = fileToPage();
    renderTemplateFallback(name);
    refreshKnownPage(name);

    // Page modules use HshsApp.whenReady(), so they do not need an artificial
    // 80ms readiness delay here. Keeping this event immediate also makes the
    // navigation path feel responsive on slower phones.
    try {
      document.dispatchEvent(new CustomEvent('hshs:foundation-ready', {
        detail: { navigation: true, page: name }
      }));
    } catch (e) {}
  }

  function bind() {
    if (bound) return;
    bound = true;

    document.addEventListener('hshs:page', function () {
      if (global.HshsSharedUI && global.HshsSharedUI.markActiveNav) {
        try { global.HshsSharedUI.markActiveNav(); } catch (e) {}
      }
      handleSpaPage();
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();

  global.HshsLifecycle = {
    activateCurrent: activateCurrent,
    fileToPage: fileToPage,
    currentFile: currentFile
  };
})(typeof window !== 'undefined' ? window : this);
