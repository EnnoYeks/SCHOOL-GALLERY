/**
 * JS-first page module: trending
 */
(function (global) {
  'use strict';
  if (global.__hshsTrendingPageModule) return;
  global.__hshsTrendingPageModule = true;
  var PAGE = 'trending';
  var PATH = 'index/trending.html';
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'trending.html';
  }
  function R() { return global.HshsRender; }
  function UI() { return global.HshsUI; }
  async function hydrateFeed(elId) {
    var el = document.getElementById(elId);
    if (!el || !R() || !UI()) return;
    try {
      var posts = [];
      if (global.HshsData && global.HshsData.getPosts) posts = await global.HshsData.getPosts(24, 0) || [];
      else if (global.db && global.db.getPosts) posts = await global.db.getPosts(24, 0) || [];
      R().clear(el);
      if (!posts.length) { el.appendChild(UI().emptyState('Nothing here yet.', 'fa-inbox')); return; }
      posts.forEach(function (p) {
        el.appendChild(UI().postCard ? UI().postCard(p) : UI().mediaCard(p));
      });
    } catch (e) {
      R().clear(el);
      el.appendChild(UI().emptyState('Could not load content.', 'fa-exclamation-triangle'));
    }
  }
  function render(root) {
    R().mount(root, [
      UI().pageHeader('Trending', 'What is hot on campus'),
      R().el('div', { className: 'page-content', id: 'trendingFeed', style: { padding: '1rem' } }, [UI().skeleton(4)])
    ]);
    hydrateFeed('trendingFeed');
  }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    render(root);
    console.info('[HSHS] JS-first page active:', PAGE);
  }
  function boot() {
    global.HshsPages = global.HshsPages || {};
    global.HshsPages[PAGE] = { name: PAGE, path: PATH, isActive: isPage, mount: mount, reinit: function () { if (isPage()) mount(); } };
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
