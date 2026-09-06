/**
 * JS-first page module: spotlight
 */
(function (global) {
  'use strict';
  if (global.__hshsSpotlightPageModule) return;
  global.__hshsSpotlightPageModule = true;
  var PAGE = 'spotlight';
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'spotlight.html';
  }
  function R() { return global.HshsRender; }
  function UI() { return global.HshsUI; }
  async function hydrateFeed(elId) {
    var el = document.getElementById(elId);
    if (!el || !R() || !UI()) return;
    try {
      var posts = [];
      if (global.HshsData && global.HshsData.getPosts) posts = await global.HshsData.getPosts(24, 0) || [];
      R().clear(el);
      if (!posts.length) { el.appendChild(UI().emptyState('Nothing here yet.', 'fa-star')); return; }
      posts.forEach(function (p) {
        el.appendChild(UI().postCard ? UI().postCard(p) : UI().mediaCard(p));
      });
    } catch (e) {
      R().clear(el);
      el.appendChild(UI().emptyState('Could not load content.', 'fa-exclamation-triangle'));
    }
  }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    R().mount(root, [
      UI().pageHeader('Spotlight', 'Featured students and moments'),
      R().el('div', { className: 'page-content', id: 'spotlightFeed', style: { padding: '1rem' } }, [UI().skeleton(4)])
    ]);
    hydrateFeed('spotlightFeed');
    console.info('[HSHS] JS-first page active:', PAGE);
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender || !global.HshsUI) { setTimeout(go, 40); return; }
      mount();
    }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
