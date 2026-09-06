/**
 * HSHS WORLD · Home page controller
 * Phase 3: rebuilt page content + live local store integration.
 */
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

  function postCard(post) {
    var image = post.image || post.imageUrl || post.thumbnailUrl || '';
    var media = image
      ? '<div class="home-feature-media" style="background-image:url(\'' + esc(image) + '\')"></div>'
      : '<div class="home-feature-media home-feature-media-empty"><i class="fas fa-photo-film"></i></div>';
    return '<article class="home-feature-card">' + media
      + '<div class="home-feature-overlay"></div><div class="home-feature-body">'
      + '<span class="home-feature-type"><i class="fas ' + (post.type === 'video' ? 'fa-video' : 'fa-image') + '"></i> ' + esc(post.type === 'video' ? 'Vibe' : 'Photo') + '</span>'
      + '<h3>' + esc(post.title || 'HSHS moment') + '</h3>'
      + '<p>' + esc(post.description || 'A moment from HSHS World.') + '</p>'
      + '<div class="home-feature-meta"><span>' + formatCount(post.likes) + ' likes</span><span>' + formatCount(post.views) + ' views</span></div>'
      + '</div></article>';
  }

  function renderData() {
    var store = global.HshsStore;
    if (!store) return;
    var stats = typeof store.analytics === 'function' ? store.analytics() : {};
    ['totalPhotos', 'totalVideos', 'totalStudents', 'totalLikes'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = formatCount(stats[id] || 0);
    });

    var featured = typeof store.featured === 'function' ? store.featured(4) : [];
    var grid = document.getElementById('featuredGrid');
    if (grid) {
      grid.innerHTML = featured.length
        ? featured.map(postCard).join('')
        : '<div class="home-empty home-feature-empty">No featured moments yet.</div>';
    }

    var trending = typeof store.trending === 'function' ? store.trending(3) : [];
    var trendRoot = document.getElementById('homeTrending');
    if (trendRoot) {
      trendRoot.innerHTML = trending.length
        ? trending.map(function (post, index) {
            return '<a class="home-trend-item" href="index/trending.html"><span class="home-trend-rank">0' + (index + 1) + '</span><span><strong>' + esc(post.title || 'HSHS moment') + '</strong><small>' + formatCount(post.likes) + ' likes · ' + formatCount(post.views) + ' views</small></span><i class="fas fa-arrow-right"></i></a>';
          }).join('')
        : '<div class="home-empty">No trending moments yet.</div>';
      trendRoot.insertAdjacentHTML('beforeend', '<a class="home-link" href="index/trending.html">Open Trending <i class="fas fa-arrow-right"></i></a>');
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
    await loadOnce(assetBase() + 'css/home.css?v=260906p3', 'hshs-home-css');
    var tpl = global.HshsTemplates && global.HshsTemplates.home;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    renderData();
    global.__hshsHomeMounted = true;
    console.info('[HSHS] Phase 3 home mounted');
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
