(function (global) {
  'use strict';
  if (global.__hshsProfilePageModule) return;
  global.__hshsProfilePageModule = true;
  var PAGE = 'profile';
  function isPage() { return (location.pathname.split('/').pop() || '').toLowerCase() === 'profile.html'; }
  function mount() {
    if (!isPage() || !global.HshsRender || !global.HshsUI) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) { root = document.createElement('div'); root.id = 'hshs-page'; document.body.appendChild(root); }
    var R = global.HshsRender, UI = global.HshsUI;
    document.documentElement.setAttribute('data-hshs-page', PAGE);
    var user = (global.HshsData && global.HshsData.currentUser) ? global.HshsData.currentUser() : null;
    R.mount(root, [
      UI.pageHeader('Profile', user && (user.displayName || user.email) ? String(user.displayName || user.email) : 'Your profile'),
      R.el('div', { className: 'page-content', id: 'profileFeed', style: { padding: '1rem' } }, [UI.skeleton(4)])
    ]);
    (async function () {
      var el = document.getElementById('profileFeed');
      if (!el) return;
      try {
        var posts = (global.HshsData && global.HshsData.getPosts) ? await global.HshsData.getPosts(24, 0) : [];
        R.clear(el);
        if (!posts || !posts.length) { el.appendChild(UI.emptyState('No posts on this profile yet.', 'fa-user')); return; }
        posts.forEach(function (p) { el.appendChild(UI.postCard ? UI.postCard(p) : UI.mediaCard(p)); });
      } catch (e) { R.clear(el); el.appendChild(UI.emptyState('Could not load.', 'fa-exclamation-triangle')); }
    })();
    console.info('[HSHS] JS-first page active: profile');
  }
  function boot() {
    function go() { if (!isPage()) return; if (!global.HshsRender) { setTimeout(go, 40); return; } mount(); }
    document.addEventListener('hshs:foundation-ready', go, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
