(function (global) {
  'use strict';
  if (global.__hshsSavedPageModule) return;
  global.__hshsSavedPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'saved.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'saved');
    R.mount(root, [
      UI.pageHeader('Saved', 'Saved posts'),
      R.el('div', { className: 'page-content', id: 'savedFeed', style: { padding: '1rem' } }, [UI.skeleton(3)])
    ]);
    (async function () {
      var el = document.getElementById('savedFeed');
      if (!el) return;
      try {
        var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
        R.clear(el);
        if (!posts || !posts.length) { el.appendChild(UI.emptyState('No saved posts yet.', 'fa-bookmark')); return; }
        posts.forEach(function (p) { el.appendChild(UI.postCard ? UI.postCard(p) : UI.mediaCard(p)); });
      } catch (e) { R.clear(el); el.appendChild(UI.emptyState('Could not load.', 'fa-exclamation-triangle')); }
    })();
    console.info('[HSHS] JS-first page active: saved');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
