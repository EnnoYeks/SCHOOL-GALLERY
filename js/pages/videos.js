(function (global) {
  'use strict';
  if (global.__hshsVideosPageModule) return;
  global.__hshsVideosPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'videos.html'; }
  async function hydrate(elId) {
    var el = document.getElementById(elId); if (!el) return;
    try {
      var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
      posts = (posts || []).filter(function (p) {
        var t = (p.type || p.mediaType || '').toLowerCase();
        return t.indexOf('video') !== -1;
      });
      global.HshsRender.clear(el);
      if (!posts.length) { el.appendChild(global.HshsUI.emptyState('No videos yet.', 'fa-video')); return; }
      posts.forEach(function (p) {
        el.appendChild(global.HshsUI.postCard ? global.HshsUI.postCard(Object.assign({}, p, { type: 'video' })) : global.HshsUI.mediaCard(p));
      });
    } catch (e) {
      global.HshsRender.clear(el);
      el.appendChild(global.HshsUI.emptyState('Could not load.', 'fa-exclamation-triangle'));
    }
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    global.HshsRender.mount(root, [
      global.HshsUI.pageHeader('Vibe', 'Short videos from campus'),
      global.HshsRender.el('div', { className: 'vibe-feed', id: 'vibeFeed', style: { padding: '1rem' } }, [global.HshsUI.skeleton(4)])
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
