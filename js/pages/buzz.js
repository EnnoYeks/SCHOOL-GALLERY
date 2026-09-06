(function (global) {
  'use strict';
  if (global.__hshsBuzzPageModule) return;
  global.__hshsBuzzPageModule = true;
  function isPage() {
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    return f === 'buzz.html' || f === 'clips.html' || f === 'shorts.html';
  }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', 'buzz');
    R.mount(root, [
      UI.pageHeader('Buzz', 'Clips and buzz'),
      R.el('div', { className: 'page-content', id: 'buzzFeed', style: { padding: '1rem' } }, [UI.skeleton(4)])
    ]);
    (async function () {
      var el = document.getElementById('buzzFeed');
      if (!el) return;
      try {
        var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
        R.clear(el);
        if (!posts || !posts.length) { el.appendChild(UI.emptyState('No buzz yet.', 'fa-bolt')); return; }
        posts.forEach(function (p) { el.appendChild(UI.postCard ? UI.postCard(p) : UI.mediaCard(p)); });
      } catch (e) { R.clear(el); el.appendChild(UI.emptyState('Could not load.', 'fa-exclamation-triangle')); }
    })();
    try { if (typeof global.initHshsClips === 'function') global.initHshsClips(); } catch (e) {}
    console.info('[HSHS] JS-first page active: buzz');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
