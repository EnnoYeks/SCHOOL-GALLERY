/**
 * Phase 5 – Shared UI bridge over existing mobile-shell.
 * Does NOT replace markup/CSS; pages keep looking the same.
 */
(function (global) {
  'use strict';
  if (global.HshsSharedUI) return;
  function getNavbar() {
    return document.querySelector('.navbar') || document.querySelector('header.navbar');
  }
  function getTabbar() {
    return document.getElementById('mobileTabbar') || document.querySelector('.mobile-tabbar');
  }
  function getMoreSheet() { return document.getElementById('moreSheet'); }
  function getFooter() {
    return document.querySelector('footer.footer') || document.querySelector('.footer');
  }
  function getPageRoot() {
    return document.getElementById('hshs-page') || document.querySelector('main') || document.body;
  }
  function getSearchInput() {
    return document.querySelector('.navbar input[type="search"], .navbar input[placeholder*="Search"], #searchInput, .search-input');
  }
  function markActiveNav() {
    if (typeof global.__hshsMarkActive === 'function') {
      try { global.__hshsMarkActive(); return; } catch (e) {}
    }
    var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.navbar .nav-link, .mobile-tabbar a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      var on = href === file || ((file === 'index.html' || file === '') && (href === 'index.html' || href === ''));
      a.classList.toggle('active', on);
    });
  }
  function closeMore() {
    if (typeof global.__hshsCloseMore === 'function') {
      global.__hshsCloseMore();
      return;
    }
    var sheet = getMoreSheet();
    var backdrop = document.getElementById('moreBackdrop');
    if (sheet) sheet.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('more-open');
  }
  function ensureShell() { markActiveNav(); }
  global.HshsSharedUI = {
    getNavbar: getNavbar, getTabbar: getTabbar, getMoreSheet: getMoreSheet,
    getFooter: getFooter, getPageRoot: getPageRoot, getSearchInput: getSearchInput,
    markActiveNav: markActiveNav, closeMore: closeMore, ensureShell: ensureShell
  };
  document.addEventListener('hshs:foundation-ready', function () { setTimeout(ensureShell, 60); });
  document.addEventListener('hshs:page', function () { setTimeout(markActiveNav, 40); });
  console.info('[HSHS] Shared UI bridge ready (Phase 5)');
})(typeof window !== 'undefined' ? window : this);
