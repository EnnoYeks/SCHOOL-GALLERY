(function (global) {
  'use strict';
  if (global.__hshsVideosPageModule) return;
  global.__hshsVideosPageModule = true;
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'videos.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'videos');
    R.mount(root, [
      UI.pageHeader('Vibe', 'Short videos from campus'),
      R.el('div', { className: 'vibe-feed', id: 'vibeFeed', style: { padding: '1rem' } }, [UI.skeleton(4)])
    ]);
    (async function () {
      var el = document.getElementById('vibeFeed');
      if (!el) return;
      try {
        var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
        posts = (posts || []).filter(function (p) {
          var t = (p.type || p.mediaType || '').toLowerCase();
          return t.indexOf('video') !== -1;
        });
        R.clear(el);
        if (!posts.length) { el.appendChild(UI.emptyState('No videos yet.', 'fa-video')); return; }
        posts.forEach(function (p) {
          el.appendChild(UI.postCard ? UI.postCard(Object.assign({}, p, { type: 'video' })) : UI.mediaCard(p));
        });
      } catch (e) { R.clear(el); el.appendChild(UI.emptyState('Could not load.', 'fa-exclamation-triangle')); }
    })();
    console.info('[HSHS] JS-first page active: videos');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
