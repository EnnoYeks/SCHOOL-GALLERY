(function (global) {
  'use strict';
  if (global.__hshsPhotosPageModule) return;
  global.__hshsPhotosPageModule = true;
  var PAGE = 'photos';
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'photos.html'; }
  async function hydrate(elId) {
    var el = document.getElementById(elId); if (!el) return;
    try {
      var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
      global.HshsRender.clear(el);
      if (!posts || !posts.length) { el.appendChild(global.HshsUI.emptyState('No photos yet.', 'fa-images')); return; }
      posts.forEach(function (p) {
        el.appendChild(global.HshsUI.mediaCard({ id: p.id, url: p.imageUrl || p.url || p.mediaUrl, caption: p.caption || '', likes: p.likes || 0 }));
      });
    } catch (e) { global.HshsRender.clear(el); el.appendChild(global.HshsUI.emptyState('Could not load.', 'fa-exclamation-triangle')); }
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'hshs-page' }));
    global.HshsRender.mount(root, [
      global.HshsUI.pageHeader('Photos', 'School moments in pictures'),
      global.HshsRender.el('div', { className: 'photos-grid', id: 'photosGrid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px', padding: '1rem' } }, [global.HshsUI.skeleton(8)])
    ]);
    hydrate('photosGrid');
    console.info('[HSHS] JS-first page active: photos');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
