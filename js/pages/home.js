(function (global) {
  'use strict';
  if (global.__hshsHomePageModule) return;
  global.__hshsHomePageModule = true;

  var lastGood = null;
  var renderToken = 0;

  function isPage() {
    if (window.HshsPaths) return HshsPaths.key() === 'home';
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'index.html' || file === '' || file === 'index';
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

  function loadScriptOnce(src, id) {
    return new Promise(function (resolve) {
      if (id && document.getElementById(id)) { resolve(); return; }
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      if (id) script.id = id;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
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

  function mediaOf(post) {
    if (!post) return '';
    if (global.HshsStorage && typeof global.HshsStorage.mediaUrl === 'function') {
      var fromStore = global.HshsStorage.mediaUrl(post);
      if (fromStore) return fromStore;
    }
    var direct = post.image || post.imageUrl || post.image_url || post.thumbnailUrl || post.thumbnail_url || post.videoUrl || post.video_url || '';
    if (direct && /^https?:\/\//i.test(direct)) return direct;
    var key = post.mediaKey || post.media_key || '';
    if (key && global.HshsStorage && typeof global.HshsStorage.publicUrl === 'function') return global.HshsStorage.publicUrl(key);
    return direct || '';
  }

  function safeTitle(post) {
    if (!post) return '';
    var title = String(post.title || '').trim();
    if (!title || /^(campus moment|hshs moment|campus photo|campus video)$/i.test(title)) return '';
    return title;
  }

  function isVideoPost(post) {
    return String(post && post.type || '').toLowerCase().indexOf('video') !== -1 ||
      !!(post && (post.videoUrl || post.video_url));
  }

  function posterOf(post) {
    if (!post) return '';
    return post.thumbnailUrl || post.thumbnail_url || post.thumbnail ||
      post.posterUrl || post.poster_url || (isVideoPost(post) ? '' : mediaOf(post)) || '';
  }

  function imageLoads(url) {
    return new Promise(function (resolve) {
      if (!url) { resolve(false); return; }
      var img = new Image();
      var done = false;
      function finish(ok) { if (done) return; done = true; resolve(!!ok); }
      img.onload = function () { finish(true); };
      img.onerror = function () { finish(false); };
      img.src = url;
    });
  }

  function postCard(post, index) {
    var isVideo = isVideoPost(post);
    var image = post.__hshsPreview || posterOf(post);
    var title = safeTitle(post);
    var likes = post.likes == null ? '' : formatCount(post.likes) + ' likes';
    var views = post.views == null ? '' : formatCount(post.views) + ' views';
    var counts = [likes, views].filter(Boolean).join(' · ');
    return '<article class="home-feature-card is-alive" data-id="' + esc(post.id || '') + '">' +
      '<div class="home-feature-media" role="img" aria-label="' + esc(title || (isVideo ? 'Video' : 'Photo')) +
      '" style="background-image:url(\'' + esc(image) + '\');animation-delay:' + ((index || 0) * 1.2) + 's"></div>' +
      '<div class="home-feature-overlay"></div><div class="home-feature-body"><span class="home-feature-type">' +
      esc(isVideo ? 'Vibe' : 'Photo') + '</span>' + (title ? '<h3>' + esc(title) + '</h3>' : '') +
      (counts ? '<div class="home-feature-meta">' + esc(counts) + '</div>' : '') + '</div></article>';
  }

  function trendCard(post, rank) {
    if (!post) return '<div class="home-empty"><i class="fas fa-fire"></i><strong>No trending yet</strong></div>';
    var thumb = mediaOf(post);
    return '<a class="home-trend-item" href="/trending/"><span class="home-trend-thumb"' +
      (thumb ? ' style="background-image:url(\'' + esc(thumb) + '\')"' : '') +
      '></span><span class="home-trend-copy"><small>#' + rank + ' trending</small><strong>' +
      esc(safeTitle(post) || '') + '</strong><em>' + formatCount(post.likes) + ' likes</em></span></a>';
  }

  function eventCard(ev) {
    if (!ev) return '<div class="home-empty"><i class="fas fa-calendar-days"></i><strong>No events yet</strong></div>';
    var d = new Date(ev.date || ev.startsAt || Date.now());
    return '<article class="home-event-card"><div class="home-event-date"><small>' +
      esc(d.toLocaleString('en-US', { month: 'short' })) + '</small><strong>' + esc(String(d.getDate())) +
      '</strong></div><div><h3>' + esc(ev.title || ev.name || 'School event') + '</h3><p>' +
      esc(ev.location || ev.description || '') + '</p></div></article>';
  }

  function postsFromStore(store) {
    var posts = [];
    try {
      if (store && typeof store.listPosts === 'function') posts = store.listPosts() || [];
      else if (store && typeof store.getState === 'function') posts = store.getState().posts || [];
    } catch (e) {}
    return posts.filter(function (p) { return p && p.id && (mediaOf(p) || p.description); });
  }

  async function loadReal() {
    var db = global.db;
    var posts = [];
    var stats = { totalPhotos: 0, totalVideos: 0, totalStudents: 0, totalLikes: 0 };
    var dbError = null;
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
        if (db.getAnalytics) {
          var a = await db.getAnalytics();
          stats.totalPhotos = Number(a && a.totalPhotos) || 0;
          stats.totalVideos = Number(a && a.totalVideos) || 0;
        }
      } catch (e) {
        dbError = e;
        console.error('[HSHS] Home loadReal failed:', e && e.message || e);
      }
    }
    if (!posts.length && !dbError) posts = postsFromStore(global.HshsStore);
    if (!posts.length && !dbError && global.HshsStorage && typeof global.HshsStorage.list === 'function') {
      try { posts = await global.HshsStorage.list({ limit: 24 }) || []; } catch (e) {}
    }
    var seen = {};
    posts = posts.filter(function (p) {
      var url = mediaOf(p);
      var key = url || p.mediaKey || p.media_key || p.id || ((p.title || '') + '|' + (p.createdAt || p.created_at || ''));
      if (!key || seen[key]) return false;
      seen[key] = true;
      if (url) {
        if (isVideoPost(p)) {
          p.videoUrl = p.videoUrl || p.video_url || url;
        } else {
          p.image = p.image || url;
          p.imageUrl = p.imageUrl || url;
          p.thumbnailUrl = p.thumbnailUrl || url;
        }
      }
      return !!(url || p.description);
    });
    if (!stats.totalPhotos) stats.totalPhotos = posts.filter(function (p) { return p.type !== 'video'; }).length;
    if (!stats.totalVideos) stats.totalVideos = posts.filter(function (p) { return p.type === 'video'; }).length;
    stats.totalLikes = posts.reduce(function (sum, p) { return sum + (Number(p.likes) || 0); }, 0);
    return { posts: posts, stats: stats, error: dbError };
  }

  function withMedia(list) {
    return (list || []).filter(function (p) { return !!(posterOf(p) || mediaOf(p)); });
  }

  function previewReady(post) {
    var poster = posterOf(post);
    if (poster) return imageLoads(poster).then(function (ok) {
      if (ok) post.__hshsPreview = poster;
      return ok ? post : null;
    });
    var videoUrl = post.videoUrl || post.video_url || (isVideoPost(post) ? mediaOf(post) : '');
    if (!videoUrl || !global.HshsMediaCards || typeof global.HshsMediaCards.capturePoster !== 'function') {
      return Promise.resolve(null);
    }
    return new Promise(function (resolve) {
      global.HshsMediaCards.capturePoster(videoUrl, function (captured) {
        if (!captured) { resolve(null); return; }
        imageLoads(captured).then(function (ok) {
          if (ok) post.__hshsPreview = captured;
          resolve(ok ? post : null);
        });
      }, post.id);
    });
  }

  function animateHeroPhotos(posts) {
    var spans = document.querySelectorAll('.vibe-hero-photos span');
    if (!spans.length) return;
    var urls = withMedia(posts).map(mediaOf).filter(Boolean);
    var seen = {};
    urls = urls.filter(function (u) {
      if (seen[u]) return false;
      seen[u] = 1;
      return /^https?:\/\//i.test(u) && u.indexOf('data:') !== 0;
    }).slice(0, 4);
    if (!urls.length) return;
    for (var i = 0; i < spans.length; i++) {
      var url = urls[i % urls.length];
      spans[i].style.backgroundImage = "url('" + url.replace(/'/g, '%27') + "')";
      spans[i].classList.add('is-campus');
    }
  }

  function paintLoaded(loaded) {
    var posts = loaded.posts;
    var stats = loaded.stats;
    ['totalPhotos', 'totalVideos', 'totalStudents', 'totalLikes'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-count', String(Number(stats[id] || 0)));
      el.textContent = formatCount(Number(stats[id] || 0));
    });
    animateCounts();
    var featured = withMedia(posts).slice(0, 6);
    animateHeroPhotos(featured);
    var grid = document.getElementById('featuredGrid');
    if (grid && featured.length) {
      grid.innerHTML = featured.map(function (p, i) { return postCard(p, i); }).join('');
    }
    var trending = posts.slice().sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 2);
    var trendA = document.getElementById('homeTrendA');
    var trendB = document.getElementById('homeTrendB');
    if (trendA) trendA.innerHTML = trendCard(trending[0], 1);
    if (trendB) trendB.innerHTML = trendCard(trending[1], 2);
  }

  function showEmpty(grid) {
    if (!grid) return;
    grid.innerHTML = '<div class="home-empty home-feature-empty"><i class="fas fa-layer-group"></i><strong>Nothing featured yet</strong><p style="opacity:.75;margin:6px 0 0;font-size:.85rem">Share a photo to get started.</p></div>';
  }

  async function renderData() {
    var token = ++renderToken;
    var loaded;
    try {
      loaded = await loadReal();
    } catch (err) {
      if (token !== renderToken) return;
      if (lastGood) { paintLoaded(lastGood); return; }
      var grid = document.getElementById('featuredGrid');
      if (grid && global.HshsPaint) {
        global.HshsPaint.section(grid, 'error', {
          onRetry: renderData,
          error: '<div class="hshs-section-state hshs-error"><strong>Could not load the feed</strong><button type="button" data-hshs-retry>Retry</button></div>'
        });
      }
      return;
    }
    if (token !== renderToken) return;
    if (loaded && loaded.error && !(loaded.posts && loaded.posts.length)) {
      if (lastGood) { paintLoaded(lastGood); return; }
      var errGrid = document.getElementById('featuredGrid');
      if (errGrid && global.HshsPaint) {
        global.HshsPaint.section(errGrid, 'error', {
          onRetry: renderData,
          error: '<div class="hshs-section-state hshs-error"><strong>Could not load the feed</strong><button type="button" data-hshs-retry>Retry</button></div>'
        });
      }
      return;
    }
    var candidates = withMedia(loaded.posts || []);
    var checks = await Promise.all(candidates.map(previewReady));
    if (token !== renderToken) return;
    var mediaPosts = checks.filter(Boolean);
    if (!mediaPosts.length) {
      if (lastGood && !(loaded && loaded.error)) {
        paintLoaded(lastGood);
        return;
      }
      showEmpty(document.getElementById('featuredGrid'));
      return;
    }
    lastGood = { posts: mediaPosts, stats: loaded.stats };
    paintLoaded(lastGood);
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
    if (section) io.observe(section);
    else run();
    setTimeout(run, 900);
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
    loadOnce('/css/home.css?v=261124mediafix1', 'hshs-home-css');
    loadOnce('/css/hshs-home-polish.css?v=261124mediafix1', 'hshs-home-polish-css');
    loadOnce('/css/hshs-vibe-home.css?v=261124mediafix1', 'hshs-vibe-home-css');
    loadOnce('/css/hshs-glass.css?v=261124mediafix1', 'hshs-glass-css');
    loadOnce('/css/hshs-media-cards.css?v=261124mediafix1', 'hshs-media-cards-css');
    var tpl = global.HshsTemplates && global.HshsTemplates.home;
    if (tpl && global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl);
    else if (tpl) root.innerHTML = tpl;
    var grid = document.getElementById('featuredGrid');
    if (grid && !grid.querySelector('.home-feature-card') && !grid.querySelector('.home-skeleton')) {
      grid.innerHTML = '<div class="home-skeleton" aria-hidden="true"></div><div class="home-skeleton" aria-hidden="true"></div><div class="home-skeleton" aria-hidden="true"></div>';
    }
    await loadScriptOnce('/js/hshs-media-cards.js?v=261124mediafix1', 'hshs-media-cards');
    renderData();
    global.__hshsHomeMounted = true;
    if (typeof window.__hshsRevealPage === 'function') window.__hshsRevealPage();
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
    document.addEventListener('hshs:content-created', function () {
      if (isPage()) setTimeout(renderData, 200);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : this);
