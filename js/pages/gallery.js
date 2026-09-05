/**
 * JS-first page module: gallery
 */
(function (global) {
  'use strict';
  if (global.__hshsGalleryPageModule) return;
  global.__hshsGalleryPageModule = true;
  var PAGE = 'gallery';
  var PATH = 'index/gallery.html';
  function isPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase() === 'gallery.html';
  }
  async function hydrateFeed(elId) {
    var el = document.getElementById(elId);
    if (!el) return;
    try {
      var posts = [];
      if (global.HshsData && global.HshsData.getPosts) posts = await global.HshsData.getPosts(24, 0) || [];
      global.HshsRender.clear(el);
      if (!posts.length) {
        el.appendChild(global.HshsUI.emptyState('No posts yet. Be the first to share.', 'fa-images'));
        return;
      }
      posts.forEach(function (p) {
        el.appendChild(global.HshsUI.mediaCard({
          id: p.id, url: p.imageUrl || p.url || p.mediaUrl || p.thumbnail,
          caption: p.caption || p.title || '', likes: p.likes || 0, type: p.type
        }));
      });
    } catch (e) {
      global.HshsRender.clear(el);
      el.appendChild(global.HshsUI.emptyState('Could not load content.', 'fa-exclamation-triangle'));
    }
  }
  function render(root) {
    var R = global.HshsRender, UI = global.HshsUI;
    function chip(label, cat, active) {
      return R.el('button', { type: 'button', className: 'filter-chip' + (active ? ' active' : ''), dataset: { category: cat }, text: label });
    }
    R.mount(root, [
      R.el('div', { className: 'gallery-container' }, [
        R.el('div', { className: 'category-filter', id: 'categoryFilter' }, [
          chip('All', 'all', true), chip('Photos', 'photo'), chip('Videos', 'video'), chip('Events', 'event')
        ]),
        R.el('div', { className: 'gallery-feed', id: 'galleryFeed' }, [UI.skeleton(6)])
      ])
    ]);
    hydrateFeed('galleryFeed');
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
    global.HshsPages[PAGE] = { name: PAGE, path: PATH, isActive: isPage, mount: mount, reinit: function(){ if(isPage()) mount(); } };
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
