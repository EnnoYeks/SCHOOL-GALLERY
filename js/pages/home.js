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

  function renderData() {
    var store = global.HshsStore;
    if (!store) return;
    var stats = typeof store.analytics === 'function' ? store.analytics() : {};
    ['totalPhotos', 'totalVideos', 'totalStudents', 'totalLikes'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var raw = Number(stats[id] || 0);
      el.setAttribute('data-count', String(raw));
      el.textContent = '0';
    });
    animateCounts();

    var featured = typeof store.featured === 'function' ? store.featured(4) : [];
    var grid = document.getElementById('featuredGrid');
    if (grid) {
      grid.innerHTML = featured.length
        ? featured.map(postCard).join('')
        : '<div class="home-empty home-feature-empty"><i class="fas fa-layer-group"></i><strong>Nothing featured yet</strong><span>Check back soon for campus moments.</span></div>';
    }

    var trending = typeof store.trending === 'function' ? store.trending(1) : [];
    var trendRoot = document.getElementById('homeTrending');
    if (trendRoot) {
      if (!trending.length) {
        trendRoot.innerHTML = '<div class="home-empty"><i class="fas fa-fire"></i><strong>No trending yet</strong><span>Loading...</span></div>';
      } else {
        var post = trending[0];
        var thumb = post.image || post.imageUrl || post.thumbnailUrl || '';
        trendRoot.innerHTML = '<a class="home-trend-item" href="index/trending.html"><span class="home-trend-thumb"' + (thumb ? ' style="background-image:url(\'' + esc(thumb) + '\')"' : '') + '></span><span class="home-trend-rank">#1</span><span><strong>' + esc(post.title || 'HSHS moment') + '</strong><small>' + formatCount(post.likes) + ' likes · ' + formatCount(post.views) + ' views</small></span></a>';
      }
    }

    var eventsRoot = document.getElementById('homeEvents');
    if (eventsRoot) {
      var events = [];
      if (store.events && typeof store.events === 'function') events = store.events(1) || [];
      else if (Array.isArray(store.events)) events = store.events.slice(0, 1);
      if (!events.length) {
        eventsRoot.innerHTML = '<div class="home-empty"><i class="fas fa-calendar-days"></i><strong>No events yet</strong><span>Loading...</span></div>';
      } else {
        var ev = events[0];
        var d = new Date(ev.date || ev.startsAt || Date.now());
        eventsRoot.innerHTML = '<article class="home-event-card"><div class="home-event-date"><small>' + esc(d.toLocaleString('en-US', { month: 'short' })) + '</small><strong>' + esc(String(d.getDate())) + '</strong></div><div><strong>' + esc(ev.title || 'School event') + '</strong><small>' + esc(ev.location || ev.place || ev.time || 'Campus') + '</small></div></article>';
      }
    }
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
    await loadOnce(assetBase() + 'css/hshs-vibe-home.css?v=260906split', 'hshs-vibe-home-css');
    var tpl = global.HshsTemplates && global.HshsTemplates.home;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    renderData();
    global.__hshsHomeMounted = true;
    document.dispatchEvent(new CustomEvent('hshs:page'));
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
