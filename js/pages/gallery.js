(function (global) {
  'use strict';
  if (global.__hshsGalleryModernModule) return;
  global.__hshsGalleryModernModule = true;

  var PAGE = 'gallery';
  var PAGE_SIZE = 48;
  var GAP = 14;
  var MIN_COL = 180;
  var MAX_COL_W = 340;
  var MAX_COLS = 5;
  var ACTIONS_H = 44;
  var COPY_PAD = 0;

  var state = {
    type: 'all',
    category: 'all',
    query: '',
    all: [],
    items: [],
    offset: 0,
    loading: false,
    done: false,
    observer: null,
    resizeObserver: null,
    view: -1
  };

  function isPage() {
    var p = (window.HshsPaths ? HshsPaths.key() : '');
    return p === 'gallery' || (global.HshsRoute && global.HshsRoute.is(PAGE));
  }
  function base() { return '/'; }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>\"']/g, function (c) {
      return { '&': '&', '<': '<', '>': '>', '\"': '"', "'": '&#39;' }[c];
    });
  }
  function count(v) {
    v = Number(v) || 0;
    return v > 999 ? (v / 1000).toFixed(v > 9999 ? 0 : 1).replace('.0', '') + 'k' : String(v);
  }
  function date(v) {
    if (global.Utils && Utils.formatDate) return Utils.formatDate(v);
    var d = v && v.toDate ? v.toDate() : new Date(v);
    return isNaN(d) ? 'Recently' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function kindOf(p) {
    var t = String(p.type || p.media_type || '').toLowerCase();
    if (t.indexOf('video') !== -1 || p.videoUrl || p.video_url) return 'video';
    return 'photo';
  }
  function mediaUrl(p) {
    if (!p) return '';
    if (global.HshsStorage && typeof global.HshsStorage.mediaUrl === 'function') {
      var fromStore = global.HshsStorage.mediaUrl(p);
      if (fromStore) return fromStore;
    }
    var direct = p.imageUrl || p.image_url || p.thumbnailUrl || p.thumbnail_url || p.image || p.cover || p.mediaUrl || p.media_url || p._media || '';
    if (direct && /^https?:\/\//i.test(direct)) return direct;
    var key = p.mediaKey || p.media_key || '';
    if (key && global.HshsStorage && typeof global.HshsStorage.publicUrl === 'function') return global.HshsStorage.publicUrl(key);
    return direct || '';
  }
  function videoUrl(p) {
    return p.videoUrl || p.video_url || (kindOf(p) === 'video' ? (p.url || p.src || p.imageUrl || '') : '');
  }
  function loadCss() {
    ['css/hshs-wave.css', 'css/gallery.css'].forEach(function (href) {
      if (document.querySelector('link[data-hshs-gallery-css="' + href + '"]')) return;
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = base() + href + '?v=261028cap1';
      l.dataset.hshsGalleryCss = href;
      document.head.appendChild(l);
    });
  }

  function normalize(row, fallbackType) {
    if (!row) return null;
    var item = Object.assign({}, row);
    item.type = (fallbackType === 'video' || kindOf(item) === 'video') ? 'video' : 'photo';
    var rawTitle = String(item.title || '');
    if (item.provider === 'cloudflare-r2' && !item.description && !item.author_id && !item.authorId && /\.(jpe?g|png|webp|mp4|webm)$/i.test(rawTitle)) return null;
    item.title = item.title || item.caption || item.description || 'HSHS moment';
    if (/\.(jpe?g|png|webp|mp4|webm)$/i.test(String(item.title))) item.title = 'HSHS moment';
    item.author = item.author || item.username || item.userName || 'Campus student';
    item.category = String(item.category || item.tag || 'events').toLowerCase();
    item.likes = Number(item.likes || item.likesCount || 0);
    item.comments = Number(item.comments || item.commentsCount || 0);
    item.saves = Number(item.saves || 0);
    item.shares = Number(item.shares || 0);
    item.createdAt = item.createdAt || item.created_at || item.date || Date.now();
    item._media = mediaUrl(item);
    item._video = videoUrl(item);
    var w = Number(item.width || item.w || 0);
    var h = Number(item.height || item.h || 0);
    if (!(w > 0 && h > 0)) {
      if (item.type === 'video') { w = 16; h = 9; }
      else { w = 4; h = 5; }
    }
    item.w = w;
    item.h = h;
    if (!item._media && !item._video) return null;
    return item;
  }

  function visible() {
    var q = state.query;
    return state.all.filter(function (p) {
      if (state.type !== 'all' && p.type !== state.type) return false;
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (q && (p.title + ' ' + (p.description || '') + ' ' + p.author + ' ' + p.category).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function columnCount(width) {
    var n = Math.floor((width + GAP) / (MIN_COL + GAP));
    return Math.max(1, Math.min(MAX_COLS, n));
  }

  function layout(items, containerWidth) {
    var cols = columnCount(containerWidth);
    var colW = (containerWidth - GAP * (cols - 1)) / cols;
    // Cap column width so few items don't become huge on wide screens
    if (colW > MAX_COL_W) {
      colW = MAX_COL_W;
      // Recalculate how many columns fit at the capped width
      var fit = Math.floor((containerWidth + GAP) / (colW + GAP));
      cols = Math.max(1, Math.min(MAX_COLS, fit, items.length || 1));
      colW = Math.min(MAX_COL_W, (containerWidth - GAP * (cols - 1)) / cols);
    }
    var bottoms = Array(cols);
    for (var c = 0; c < cols; c++) bottoms[c] = 0;

    var placed = items.map(function (item) {
      var col = 0;
      for (var i = 1; i < cols; i++) {
        if (bottoms[i] < bottoms[col]) col = i;
      }
      var ratio = item.w > 0 ? item.h / item.w : 1.25;
      var imgH = colW * ratio;
      var height = imgH + ACTIONS_H + COPY_PAD;
      var top = bottoms[col];
      bottoms[col] += height + GAP;
      return {
        item: item,
        left: col * (colW + GAP),
        top: top,
        width: colW,
        height: height,
        imgH: imgH
      };
    });

    var used = items.length ? Math.max.apply(null, bottoms) - GAP : 0;
    return { placed: placed, height: Math.max(0, used), colW: colW, cols: cols };
  }

  function renderCardEl(placed, index) {
    var p = placed.item;
    var isVideo = p.type === 'video';
    var fig = document.createElement('article');
    fig.className = 'gallery-card';
    fig.dataset.id = p.id != null ? String(p.id) : '';
    fig.dataset.index = String(index);
    fig.style.left = placed.left + 'px';
    fig.style.top = placed.top + 'px';
    fig.style.width = placed.width + 'px';

    var wrap = document.createElement('div');
    wrap.className = 'gallery-media-wrap';
    wrap.dataset.open = String(index);
    wrap.style.aspectRatio = p.w + ' / ' + p.h;

    var media;
    if (isVideo && p._video) {
      media = document.createElement('video');
      media.className = 'gallery-media';
      media.src = p._video;
      if (p._media) media.poster = p._media;
      media.muted = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.style.aspectRatio = p.w + ' / ' + p.h;
    } else {
      media = document.createElement('img');
      media.className = 'gallery-media';
      media.src = p._media;
      media.alt = p.title || '';
      media.loading = index < 4 ? 'eager' : 'lazy';
      media.decoding = 'async';
      media.referrerPolicy = 'no-referrer';
      media.width = p.w;
      media.height = p.h;
      media.style.aspectRatio = p.w + ' / ' + p.h;
      media.onerror = function () {
        this.onerror = null;
        this.style.opacity = '.35';
      };
    }
    wrap.appendChild(media);

    var vig = document.createElement('div');
    vig.className = 'gallery-vignette';
    wrap.appendChild(vig);

    var typeSpan = document.createElement('span');
    typeSpan.className = 'gallery-type';
    typeSpan.innerHTML = '<i class="fas ' + (isVideo ? 'fa-play' : 'fa-image') + '"></i> ' + (isVideo ? 'Video' : 'Photo');
    wrap.appendChild(typeSpan);

    var catSpan = document.createElement('span');
    catSpan.className = 'gallery-category';
    catSpan.textContent = p.category || '';
    wrap.appendChild(catSpan);

    var copy = document.createElement('div');
    copy.className = 'gallery-card-copy';
    copy.innerHTML =
      '<div class="gallery-author"><span>' + esc(p.author) + '</span><time>' + esc(date(p.createdAt)) + '</time></div>' +
      '<h2>' + esc(p.title) + '</h2>' +
      (p.description ? '<p>' + esc(String(p.description).slice(0, 120)) + '</p>' : '');
    wrap.appendChild(copy);

    fig.appendChild(wrap);

    var actions = document.createElement('div');
    actions.className = 'gallery-actions';
    actions.innerHTML =
      '<button type="button" data-action="like"><i class="far fa-heart"></i><span>' + count(p.likes) + '</span></button>' +
      '<button type="button" data-action="comment"><i class="far fa-comment"></i><span>' + count(p.comments) + '</span></button>' +
      '<button type="button" data-action="save"><i class="far fa-bookmark"></i></button>' +
      '<button type="button" data-action="share"><i class="fas fa-share"></i></button>';
    fig.appendChild(actions);

    return fig;
  }

  function paint() {
    var feed = document.getElementById('galleryFeed');
    var empty = document.getElementById('galleryEmpty');
    var label = document.getElementById('galleryResultCount');
    if (!feed) return;

    var list = visible();
    state.items = list.slice(0, state.offset + PAGE_SIZE);
    state.done = state.items.length >= list.length;

    if (label) label.textContent = list.length ? list.length + ' moment' + (list.length === 1 ? '' : 's') : 'No moments found';
    if (empty) empty.hidden = list.length !== 0;

    if (!list.length) {
      feed.innerHTML = '';
      feed.style.height = '0px';
      return;
    }

    var width = feed.clientWidth || (feed.parentElement && feed.parentElement.clientWidth) || 320;
    var result = layout(state.items, width);
    feed.style.height = result.height + 'px';
    feed.replaceChildren();

    for (var i = 0; i < result.placed.length; i++) {
      feed.appendChild(renderCardEl(result.placed[i], i));
    }
  }

  function ensureResizeObserver() {
    var feed = document.getElementById('galleryFeed');
    if (!feed || state.resizeObserver) return;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', function () {
        if (isPage()) paint();
      });
      return;
    }
    state.resizeObserver = new ResizeObserver(function () {
      if (isPage()) paint();
    });
    state.resizeObserver.observe(feed);
  }

  async function loadFromR2() {
    if (!global.HshsStorage || typeof global.HshsStorage.list !== 'function') return [];
    try {
      var photos = await global.HshsStorage.list({ limit: 40, prefix: 'photos/' }) || [];
      var videos = await global.HshsStorage.list({ limit: 24, prefix: 'videos/' }) || [];
      return photos.concat(videos);
    } catch (e) {
      return [];
    }
  }

  async function loadAll() {
    state.loading = true;
    setLoading(true);
    var posts = [], photos = [], videos = [], storePosts = [], r2 = [];
    try { if (global.db && db.getPosts) posts = await db.getPosts(48, 0); } catch (e) {}
    try { if (global.db && db.getPhotos) photos = await db.getPhotos(48, 0); } catch (e) {}
    try { if (global.db && db.getVideos) videos = await db.getVideos(48, 0); } catch (e) {}
    try { if (global.HshsStore && typeof HshsStore.listPosts === 'function') storePosts = HshsStore.listPosts(); } catch (e) {}
    if (!(posts.length || photos.length || videos.length)) {
      try { r2 = await loadFromR2(); } catch (e) { r2 = []; }
    }
    var merged = [].concat(
      (posts || []).map(function (p) { return normalize(p, p.type); }),
      (photos || []).map(function (p) { return normalize(p, 'photo'); }),
      (videos || []).map(function (p) { return normalize(p, 'video'); }),
      (storePosts || []).map(function (p) { return normalize(p, p.type); }),
      (r2 || []).map(function (p) { return normalize(p, p.type); })
    ).filter(Boolean);
    var seen = {};
    state.all = merged.filter(function (p) {
      var key = String(p.id || p.mediaKey || p.media_key || p._media || p.title);
      if (seen[key]) return false;
      seen[key] = 1;
      return true;
    }).sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    state.offset = 0;
    state.loading = false;
    setLoading(false);
    paint();
    ensureResizeObserver();
    try {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { if (isPage()) paint(); });
      }
    } catch (e) {}
    try { if (global.HshsRoute && global.HshsRoute.reveal) global.HshsRoute.reveal(); } catch (e) {}
    try {
      window.__hshsRevealQueued = false;
      if (typeof window.__hshsRevealPage === 'function') window.__hshsRevealPage();
    } catch (e) {}
  }

  function setLoading(show) {
    var el = document.getElementById('galleryLoader');
    if (el) el.hidden = !show;
  }
  function itemById(id) {
    for (var i = 0; i < state.items.length; i++) {
      if (String(state.items[i].id) === String(id)) return state.items[i];
    }
    return null;
  }
  async function onAction(action, id, btn) {
    var item = itemById(id);
    if (!item) return;
    if (action === 'like') {
      item.likes = (item.likes || 0) + 1;
      if (btn) {
        btn.classList.add('is-on');
        var s = btn.querySelector('span');
        if (s) s.textContent = count(item.likes);
      }
      return;
    }
    if (action === 'save') {
      btn && btn.classList.toggle('is-on');
      return;
    }
    if (action === 'share') {
      var url = location.origin + '/gallery';
      try {
        if (navigator.share) await navigator.share({ title: item.title, url: url });
        else await navigator.clipboard.writeText(url);
      } catch (e) {}
      return;
    }
    if (action === 'comment') openViewer(state.items.indexOf(item));
  }
  function openViewer(index) {
    var item = state.items[index];
    var box = document.getElementById('galleryViewer');
    var stage = document.getElementById('galleryViewerStage');
    if (!item || !box || !stage) return;
    state.view = index;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    stage.innerHTML = item.type === 'video' && item._video
      ? '<video src="' + esc(item._video) + '" poster="' + esc(item._media) + '" controls autoplay playsinline></video>'
      : '<img src="' + esc(item._media) + '" alt="' + esc(item.title) + '">';
    var title = document.getElementById('gvTitle');
    var by = document.getElementById('gvBy');
    if (title) title.textContent = item.title;
    if (by) by.textContent = item.author + ' · ' + date(item.createdAt);
  }
  function closeViewer() {
    var box = document.getElementById('galleryViewer');
    if (box) box.hidden = true;
    document.body.style.overflow = '';
    var stage = document.getElementById('galleryViewerStage');
    if (stage) stage.innerHTML = '';
    state.view = -1;
  }

  function bind() {
    var root = document.getElementById('hshs-page');
    if (!root || root.dataset.galleryBound) return;
    root.dataset.galleryBound = '1';

    var cats = document.getElementById('categoryFilter');
    if (cats) {
      cats.addEventListener('click', function (e) {
        var b = e.target.closest('.category-btn');
        if (!b) return;
        document.querySelectorAll('.category-btn').forEach(function (x) {
          x.classList.toggle('active', x === b);
        });
        state.category = b.dataset.category;
        state.offset = 0;
        paint();
      });
    }

    var types = document.getElementById('galleryTypes');
    if (types) {
      types.addEventListener('click', function (e) {
        var b = e.target.closest('[data-type]');
        if (!b) return;
        document.querySelectorAll('#galleryTypes .gallery-chip').forEach(function (x) {
          x.classList.toggle('is-on', x === b);
        });
        state.type = b.dataset.type;
        state.offset = 0;
        paint();
      });
    }

    var search = document.getElementById('gallerySearch');
    if (search) {
      search.addEventListener('input', function () {
        state.query = search.value.trim().toLowerCase();
        state.offset = 0;
        paint();
      });
    }

    var share = document.getElementById('galleryShareBtn');
    if (share) {
      share.addEventListener('click', function () {
        if (global.__hshsOpenUpload) global.__hshsOpenUpload();
        else location.href = '/photos';
      });
    }

    root.addEventListener('click', function (e) {
      var open = e.target.closest('[data-open]');
      if (open) {
        openViewer(Number(open.dataset.open));
        return;
      }
      var act = e.target.closest('[data-action]');
      if (act) {
        var card = act.closest('.gallery-card');
        onAction(act.dataset.action, card && card.dataset.id, act);
        return;
      }
      var gv = e.target.closest('[data-gv],[data-gv-act]');
      if (!gv) {
        if (e.target.id === 'galleryViewer') closeViewer();
        return;
      }
      var cmd = gv.dataset.gv || gv.dataset.gvAct;
      if (cmd === 'close') closeViewer();
      if (cmd === 'prev' && state.view > 0) openViewer(state.view - 1);
      if (cmd === 'next' && state.view < state.items.length - 1) openViewer(state.view + 1);
      if (cmd === 'like' || cmd === 'save' || cmd === 'share') {
        var item = state.items[state.view];
        if (item) onAction(cmd, item.id, gv);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!isPage()) return;
      if (e.key === 'Escape') closeViewer();
      if (state.view < 0) return;
      if (e.key === 'ArrowLeft' && state.view > 0) openViewer(state.view - 1);
      if (e.key === 'ArrowRight' && state.view < state.items.length - 1) openViewer(state.view + 1);
    });
  }

  function mount() {
    if (!isPage() || !global.HshsRender) return;
    document.documentElement.dataset.hshsPage = PAGE;
    var root = document.getElementById('hshs-page');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshs-page';
      document.body.appendChild(root);
    }
    if (!document.getElementById('galleryFeed')) {
      var tpl = global.HshsTemplates && HshsTemplates[PAGE];
      if (tpl) (global.HshsRender.mountHTML ? global.HshsRender.mountHTML(root, tpl) : (root.innerHTML = tpl));
    }
    loadCss();
    bind();
    loadAll();
  }

  function boot() {
    var go = function () {
      if (isPage()) mount();
    };
    if (global.HshsApp && typeof HshsApp.whenReady === 'function') HshsApp.whenReady(go);
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
    else go();
    go();
    setTimeout(go, 500);
  }

  global.HshsGallery = {
    mount: mount,
    refresh: function () {
      if (isPage()) loadAll();
    },
    paint: paint
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  document.addEventListener('hshs:page', function () {
    if (isPage()) setTimeout(mount, 0);
  });
  document.addEventListener('hshs:content-created', function () {
    if (isPage()) loadAll();
  });
})(typeof window !== 'undefined' ? window : this);
