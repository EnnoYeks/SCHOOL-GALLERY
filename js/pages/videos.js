(function (global) {
  'use strict';
  if (global.__hshsVideosPageModule) return;
  global.__hshsVideosPageModule = true;
  var PAGE = 'videos';
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'videos.html'; }
  async function hydrate(elId) {
    var el = document.getElementById(elId); if (!el) return;
    try {
      var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
      global.HshsRender.clear(el);
      if (!posts || !posts.length) { el.appendChild(global.HshsUI.emptyState('No videos yet.', 'fa-video')); return; }
      posts.forEach(function (p) {
        el.appendChild(global.HshsUI.mediaCard({ id: p.id, url: p.imageUrl || p.url || p.mediaUrl, caption: p.caption || '', likes: p.likes || 0, type: 'video' }));
      });
    } catch (e) { global.HshsRender.clear(el); el.appendChild(global.HshsUI.emptyState('Could not load.', 'fa-exclamation-triangle')); }
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'hshs-page' }));
    global.HshsRender.mount(root, [
      global.HshsUI.pageHeader('Vibe', 'Short videos from campus'),
      global.HshsRender.el('div', { className: 'vibe-feed', id: 'vibeFeed' }, [global.HshsUI.skeleton(4)])
    ]);
    hydrate('vibeFeed');
    console.info('[HSHS] JS-first page active: videos');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
