/**
 * HSHS WORLD · Home page controller
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
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
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
      + '<div class="home-feature-meta"><span>' + formatCount(post.likes) + ' likes</span><span>' + formatCount(post.views) + ' views</span></div>'
      + '</div></article>';
  }
  function trendCard(post, rank) {
    if (!post) return '<div class="home-empty"><i class="fas fa-fire"></i><strong>No trending yet</strong></div>';
    var thumb = post.image || post.imageUrl || post.thumbnailUrl || '';
    return '<a class="home-trend-item" href="index/trending.html"><span class="home-trend-thumb"' + (thumb ? ' style="background-image:url(\'' + esc(thumb) + '\')"' : '') + '></span><span class="home-trend-rank">#' + rank + '</span><span><strong>' + esc(post.title || 'HSHS moment') + '</strong><small>' + formatCount(post.likes) + ' likes · ' + formatCount(post.views) + ' views</small></span></a>';
  }
  function eventCard(ev) {
    if (!ev) return '<div class="home-empty"><i class="fas fa-calendar-days"></i><strong>No events yet</strong></div>';
    var d = new Date(ev.date || ev.startsAt || Date.now());
    return '<article class="home-event-card"><div class="home-event-date"><small>' + esc(d.toLocaleString('en-US', { month: 'short' })) + '</small><strong>' + esc(String(d.getDate())) + '</strong></div><div><strong>' + esc(ev.title || 'School event') + '</strong><small>' + esc(ev.location || ev.place || ev.time || 'Campus') + '</small></div></article>';
  }
  function campusPosts() {
    return [
      { type: 'photo', title: 'Sports Day 2026', likes: 42, views: 310, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=900&q=70' },
      { type: 'photo', title: 'Morning assembly', likes: 28, views: 190, image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=70' },
      { type: 'video', title: 'House colour day', likes: 116, views: 840, image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=70' },
      { type: 'photo', title: 'Library hour', likes: 64, views: 410, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=70' }
    ];
  }
  function postsFromStore(store) {
    var posts = [];
    try {
      if (store && typeof store.listPosts === 'function') posts = store.listPosts() || [];
      else if (store && typeof store.getState === 'function') posts = (store.getState().posts || []);
    } catch (e) {}
    return posts.filter(Boolean);
  }
  function renderData() {
    var store = global.HshsStore;
    var posts = postsFromStore(store);
    if (!posts.length) posts = campusPosts();
    var stats = (store && typeof store.analytics === 'function') ? (store.analytics() || {}) : {};
    if (!stats.totalPhotos) stats.totalPhotos = posts.filter(function (p) { return p.type !== 'video'; }).length || posts.length;
    if (!stats.totalVideos) stats.totalVideos = posts.filter(function (p) { return p.type === 'video'; }).length;
    if (!stats.totalStudents) stats.totalStudents = 8;
    if (!stats.totalLikes) stats.totalLikes = posts.reduce(function (sum, p) { return sum + (Number(p.likes) || 0); }, 0);
    ['totalPhotos', 'totalVideos', 'totalStudents', 'totalLikes'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-count', String(Number(stats[id] || 0)));
      el.textContent = '0';
    });
    animateCounts();
    var featured = (store && typeof store.featured === 'function') ? store.featured(4) : posts.slice(0, 4);
    if (!featured || !featured.length) featured = posts.slice(0, 4);
    var grid = document.getElementById('featuredGrid');
    if (grid) {
      grid.innerHTML = featured.length
        ? featured.map(postCard).join('')
        : '<div class="home-empty home-feature-empty"><i class="fas fa-layer-group"></i><strong>Nothing featured yet</strong></div>';
    }
    var trending = (store && typeof store.trending === 'function') ? store.trending(2) : posts.slice().sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 2);
    if (!trending || !trending.length) trending = posts.slice(0, 2);
    var trendA = document.getElementById('homeTrendA');
    var trendB = document.getElementById('homeTrendB');
    if (trendA) trendA.innerHTML = trendCard(trending[0], 1);
    if (trendB) trendB.innerHTML = trendCard(trending[1], 2);
    var events = [];
    if (store && store.events && typeof store.events === 'function') events = store.events(2) || [];
    else if (store && Array.isArray(store.events)) events = store.events.slice(0, 2);
    if (!events.length) {
      events = [
        { title: 'House colour day', location: 'Main field', date: Date.now() + 86400000 * 3 },
        { title: 'Friday assembly', location: 'School hall', date: Date.now() + 86400000 * 6 }
      ];
    }
    var eventA = document.getElementById('homeEventA');
    var eventB = document.getElementById('homeEventB');
    if (eventA) eventA.innerHTML = eventCard(events[0]);
    if (eventB) eventB.innerHTML = eventCard(events[1]);
  }
  function animateCounts() {
    var nodes = document.querySelectorAll('.home-stat strong[data-count]');
    if (!nodes.length) return;
    var started = false;
    function run() {
      if (started) return;
      started = true;
      nodes.forEach(function (el) {
        var target = Number(el.getAttribute('data-count') || 0);
        var start = performance.now();
        function tick(now) {
          var t = Math.min(1, (now - start) / 700);
          el.textContent = formatCount(Math.round(target * t));
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
    if (!('IntersectionObserver' in window)) { run(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) run(); });
    }, { threshold: 0.35 });
    var section = document.querySelector('.home-stats');
    if (section) io.observe(section); else run();
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
    await loadOnce(assetBase() + 'css/hshs-home-polish.css?v=260906hero', 'hshs-home-polish-css');
    await loadOnce(assetBase() + 'css/hshs-vibe-home.css?v=260906split2', 'hshs-vibe-home-css');
    await loadOnce(assetBase() + 'css/hshs-glass.css?v=260926glass', 'hshs-glass-css');
    var tpl = global.HshsTemplates && global.HshsTemplates.home;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    renderData();
    global.__hshsHomeMounted = true;
    if (typeof window.__hshsRevealPage === 'function') window.__hshsRevealPage();
    document.dispatchEvent(new CustomEvent('hshs:page'));
    setTimeout(renderData, 400);
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
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
