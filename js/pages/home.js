(function (global) {
  'use strict';
  if (global.__hshsHomePageModule) return;
  global.__hshsHomePageModule = true;

  function isPage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'index.html' || file === '';
  }
  function assetBase() {
    return location.pathname.indexOf('/index/') !== -1 ? '../' : '';
  }
  function loadOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      if (id) link.id = id;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.appendChild(link);
    });
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function formatCount(value) {
    var n = Number(value || 0);
    return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k' : String(n);
  }
  function mediaOf(post) {
    if (!post) return '';
    if (global.HshsStorage && typeof global.HshsStorage.mediaUrl === 'function') {
      var fromStore = global.HshsStorage.mediaUrl(post);
      if (fromStore) return fromStore;
    }
    var direct = post.image || post.imageUrl || post.image_url || post.thumbnailUrl || post.thumbnail_url || post.videoUrl || post.video_url || '';
    if (direct && /^https?:\/\//i.test(direct)) return direct;
    var key = post.mediaKey || post.media_key || '';
    if (key && global.HshsStorage && typeof global.HshsStorage.publicUrl === 'function') {
      return global.HshsStorage.publicUrl(key);
    }
    return direct || '';
  }
  function postCard(post, index) {
    var image = mediaOf(post);
    var isVideo = String(post.type || '').toLowerCase().indexOf('video') !== -1 || !!post.videoUrl || !!post.video_url;
    var media = image
      ? '<div class="home-feature-media is-live" style="background-image:url(\'' + esc(image) + '\');animation-delay:' + ((index || 0) * 1.2) + 's"></div>'
      : '<div class="home-feature-media home-feature-media-empty"><i class="fas fa-align-left"></i></div>';
    return '<article class="home-feature-card is-alive" data-id="' + esc(post.id || '') + '">' + media
      + '<div class="home-feature-overlay"></div><div class="home-feature-body">'
      + '<span class="home-feature-type"><i class="fas ' + (isVideo ? 'fa-video' : 'fa-image') + '"></i> ' + (isVideo ? 'Vibe' : 'Photo') + '</span>'
      + '<h3>' + esc(post.title || post.caption || 'HSHS moment') + '</h3>'
      + '<div class="home-feature-meta"><span>' + formatCount(post.likes) + ' likes</span><span>' + formatCount(post.views) + ' views</span></div>'
      + '</div></article>';
  }
  function postsFromStore(store) {
    var posts = [];
    try {
      if (store && typeof store.listPosts === 'function') posts = store.listPosts() || [];
      else if (store && typeof store.getState === 'function') posts = store.getState().posts || [];
    } catch (e) {}
    return posts.filter(function (p) { return p && p.id && (mediaOf(p) || p.description); });
  }
  async function loadPosts() {
    var db = global.db;
    var posts = [];
    if (db) {
      try {
        var lists = await Promise.all([
          db.getPosts ? db.getPosts(12) : [],
          db.getPhotos ? db.getPhotos(12) : [],
          db.getVideos ? db.getVideos(8) : []
        ]);
        posts = (lists[0] || []).concat(
          (lists[1] || []).map(function (p) { p.type = p.type || 'photo'; return p; }),
          (lists[2] || []).map(function (p) { p.type = 'video'; return p; })
        );
      } catch (e) {}
    }
    if (!posts.length) posts = postsFromStore(global.HshsStore);
    if (!posts.length && global.HshsStorage && typeof global.HshsStorage.list === 'function') {
      try { posts = await global.HshsStorage.list({ limit: 24 }) || []; } catch (e) {}
    }
    var seen = {};
    return posts.filter(function (p) {
      var key = p && (p.id || p.mediaKey || p.media_key || p.title);
      if (!key || seen[key]) return false;
      seen[key] = true;
      var url = mediaOf(p);
      if (url) {
        p.image = p.image || url;
        p.imageUrl = p.imageUrl || url;
        p.thumbnailUrl = p.thumbnailUrl || url;
      }
      return !!(url || p.description);
    });
  }
  function withMedia(list) {
    return (list || []).filter(function (p) { return !!mediaOf(p); });
  }
  async function renderData() {
    var grid = document.getElementById('featuredGrid');
    if (!grid) return;
    grid.setAttribute('aria-busy', 'true');
    try {
      var results = await Promise.all([
        loadPosts(),
        global.db && typeof global.db.getFeatured === 'function' ? global.db.getFeatured(6).catch(function () { return []; }) : Promise.resolve([])
      ]);
      var posts = results[0] || [];
      var featured = withMedia(results[1] || []);
      if (!featured.length) featured = withMedia(posts).slice(0, 6);
      grid.innerHTML = featured.length
        ? featured.map(function (p, i) { return postCard(p, i); }).join('')
        : '<div class="home-empty home-feature-empty"><i class="fas fa-layer-group"></i><strong>Nothing featured yet</strong><p style="opacity:.75;margin:6px 0 0;font-size:.85rem">Share a photo or video to light up this feed.</p></div>';
    } catch (error) {
      grid.innerHTML = '<div class="home-empty home-feature-empty"><strong>Could not load Featured</strong><button type="button" data-hshs-retry>Retry</button></div>';
    } finally {
      grid.removeAttribute('aria-busy');
    }
  }
  async function mount() {
    if (!isPage() || !global.HshsRender || global.__hshsHomeMounted) return;
    if (global.HshsShell) global.HshsShell.ensureShell();
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    document.documentElement.setAttribute('data-hshs-page', 'home');
    if (global.HshsPaint) global.HshsPaint.now();
    loadOnce(assetBase() + 'css/home.css?v=261025featured1', 'hshs-home-css');
    loadOnce(assetBase() + 'css/hshs-home-polish.css?v=261025featured1', 'hshs-home-polish-css');
    loadOnce(assetBase() + 'css/hshs-vibe-home.css?v=261025featured1', 'hshs-vibe-home-css');
    loadOnce(assetBase() + 'css/hshs-glass.css?v=260926glass', 'hshs-glass-css');
    var tpl = global.HshsTemplates && global.HshsTemplates.home;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    global.__hshsHomeMounted = true;
    if (typeof window.__hshsRevealPage === 'function') window.__hshsRevealPage();
    document.dispatchEvent(new CustomEvent('hshs:page'));
    renderData();
  }
  function boot() {
    function go() {
      if (!isPage()) return;
      if (!global.HshsRender) { setTimeout(go, 40); return; }
      mount();
    }
    if (global.HshsApp && typeof global.HshsApp.whenReady === 'function') global.HshsApp.whenReady(go);
    else if (global.HshsApp && global.HshsApp.isReady && global.HshsApp.isReady()) go();
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    document.addEventListener('hshs:page', function () { if (isPage()) setTimeout(renderData, 0); });
    document.addEventListener('hshs:content-created', function () { if (isPage()) setTimeout(renderData, 200); });
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-hshs-retry]') && isPage()) renderData();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
