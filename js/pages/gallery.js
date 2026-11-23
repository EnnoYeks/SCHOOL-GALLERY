(function (global) {
  'use strict';
  if (global.__hshsGalleryModernModule) return;
  global.__hshsGalleryModernModule = true;

  var PAGE = 'gallery';
  var PAGE_SIZE = 48;
  var CSS_VER = '261124card2';

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
    view: -1,
    liked: {},
    saved: {},
    failed: {}
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
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function relTime(v) {
    var d = v && v.toDate ? v.toDate() : new Date(v);
    if (isNaN(d)) return '';
    var sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
    if (sec < 45) return 'Just now';
    if (sec < 3600) return Math.max(1, Math.floor(sec / 60)) + ' min ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    if (sec < 86400 * 7) return Math.floor(sec / 86400) + 'd ago';
    return date(v);
  }
  var BAD_TITLE = { 'campus moment': 1, 'hshs moment': 1, 'campus photo': 1, 'campus video': 1 };
  function cleanLabel(value) {
    var s = String(value || '').trim();
    if (!s || BAD_TITLE[s.toLowerCase()]) return '';
    if (/\.(jpe?g|png|webp|mp4|webm)$/i.test(s)) return '';
    return s;
  }
  function safeTitle(post) {
    if (!post) return '';
    return cleanLabel(post.title) || cleanLabel(post.caption) || cleanLabel(post.description);
  }
  function safeAuthor(post) {
    var a = String(post.author || post.username || post.userName || post.author_name || post.authorName || '').trim();
    if (!a || a.toLowerCase() === 'campus student') return '';
    return a;
  }
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
  }
  function avatarUrl(post) {
    return post.avatar || post.avatarUrl || post.avatar_url || post.authorAvatar || post.author_avatar || post.photoURL || '';
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
      l.href = base() + href + '?v=' + CSS_VER;
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
    item._title = safeTitle(item);
    item.title = item._title;
    item._author = safeAuthor(item);
    item.author = item._author;
    var rawCat = String(item.category || item.tag || item.className || item.class_name || '').trim();
    item._subtitle = rawCat && rawCat.toLowerCase() !== 'all' ? rawCat : '';
    item.category = rawCat.toLowerCase();
    item._hasLikes = item.hasLikesCount != null ? item.hasLikesCount === true : item.likes != null || item.likesCount != null;
    item._hasComments = item.hasCommentsCount != null ? item.hasCommentsCount === true : item.comments != null || item.commentsCount != null;
    item._hasShares = item.hasSharesCount != null ? item.hasSharesCount === true : item.shares != null || item.sharesCount != null;
    item.likes = Number(item.likes != null ? item.likes : item.likesCount || 0);
    item.comments = Number(item.comments != null ? item.comments : item.commentsCount || 0);
    item.saves = Number(item.saves || 0);
    item.shares = Number(item.shares != null ? item.shares : item.sharesCount || 0);
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

  function mediaKeyOf(p) {
    var raw = String(p.mediaKey || p.media_key || p._media || p._video || '');
    raw = raw.split('?')[0].replace(/\/+$/, '').toLowerCase();
    if (raw) return 'm:' + raw;
    return 't:' + [p.author, p.title, p.category, date(p.createdAt)].join('|').toLowerCase();
  }

  function visible() {
    var q = state.query;
    return state.all.filter(function (p) {
      if (state.failed[mediaKeyOf(p)]) return false;
      if (state.type !== 'all' && p.type !== state.type) return false;
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (q && (p.title + ' ' + (p.description || '') + ' ' + p.author + ' ' + p.category).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderCardEl(p, index) {
    var isVideo = p.type === 'video';
    var fig = document.createElement('article');
    fig.className = 'gallery-card hshs-feed-card';
    fig.dataset.id = p.id != null ? String(p.id) : '';
    fig.dataset.index = String(index);

    if (p._author) {
      var head = document.createElement('header');
      head.className = 'hshs-feed-author';
      var av = document.createElement('span');
      av.className = 'hshs-feed-avatar';
      var face = avatarUrl(p);
      if (face) {
        var faceImg = document.createElement('img');
        faceImg.src = face;
        faceImg.alt = '';
        faceImg.referrerPolicy = 'no-referrer';
        av.appendChild(faceImg);
      } else {
        av.textContent = initials(p._author);
      }
      var who = document.createElement('span');
      who.className = 'hshs-feed-who';
      who.innerHTML = '<strong>' + esc(p._author) + '</strong>' + (p._subtitle ? '<small>' + esc(p._subtitle) + '</small>' : '');
      head.appendChild(av);
      head.appendChild(who);
      fig.appendChild(head);
    }

    var wrap = document.createElement('div');
    wrap.className = 'hshs-feed-media';
    wrap.dataset.open = String(index);

    var media;
    if (isVideo && p._video) {
      media = document.createElement('video');
      media.className = 'gallery-media';
      media.src = p._video;
      if (p._media) media.poster = p._media;
      media.muted = true;
      media.playsInline = true;
      media.preload = 'metadata';
    } else {
      media = document.createElement('img');
      media.className = 'gallery-media';
      media.src = p._media;
      media.alt = p._title || '';
      media.loading = index < 4 ? 'eager' : 'lazy';
      media.decoding = 'async';
      media.referrerPolicy = 'no-referrer';
      media.onerror = function () {
        this.onerror = null;
        state.failed[mediaKeyOf(p)] = 1;
        paint();
      };
    }
    wrap.appendChild(media);
    fig.appendChild(wrap);

    if (p._title) {
      var cap = document.createElement('p');
      cap.className = 'hshs-feed-caption';
      cap.textContent = p._title;
      fig.appendChild(cap);
    }

    var actions = document.createElement('div');
    actions.className = 'gallery-actions hshs-feed-actions';
    actions.innerHTML =
      '<button type="button" data-action="like" aria-label="Like" title="Like" class="' + (state.liked[p.id] ? 'is-on' : '') + '"><span class="gallery-action-symbol" aria-hidden="true">' + (state.liked[p.id] ? '♥' : '♡') + '</span><span>Like</span>' + (p._hasLikes ? '<span class="gallery-action-count">' + count(p.likes) + '</span>' : '') + '</button>' +
      '<button type="button" data-action="comment" aria-label="Comment" title="Comment"><span class="gallery-action-symbol" aria-hidden="true">▤</span><span>Comment</span>' + (p._hasComments ? '<span class="gallery-action-count">' + count(p.comments) + '</span>' : '') + '</button>' +
      '<button type="button" data-action="share" aria-label="Share" title="Share"><span class="gallery-action-symbol" aria-hidden="true">↗</span><span>Share</span>' + (p._hasShares ? '<span class="gallery-action-count">' + count(p.shares) + '</span>' : '') + '</button>' +
      '<time class="hshs-feed-time">' + esc(relTime(p.createdAt)) + '</time>' +
      '<button type="button" data-action="save" aria-label="Save" title="Save" class="' + (state.saved[p.id] ? 'is-on' : '') + '"><span class="gallery-action-symbol" aria-hidden="true">' + (state.saved[p.id] ? '▣' : '▢') + '</span><span>Save</span></button>';
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

    feed.style.height = '';
    feed.replaceChildren();
    for (var i = 0; i < state.items.length; i++) {
      feed.appendChild(renderCardEl(state.items[i], i));
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
      var key = mediaKeyOf(p);
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
    var skel = document.querySelector('#hshs-page .hshs-load-skel');
    if (skel && skel.parentNode) skel.parentNode.removeChild(skel);
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
  function setIcon(btn, cls) {
    var icon = btn && btn.querySelector('i');
    if (icon) icon.className = cls;
  }
  function pop(btn) {
    if (!btn) return;
    btn.classList.remove('is-pop');
    void btn.offsetWidth;
    btn.classList.add('is-pop');
  }
  function closeNotes() {
    var sheet = document.getElementById('galleryNotes');
    if (!sheet) return;
    sheet.classList.remove('is-open');
    setTimeout(function () { if (sheet.parentNode) sheet.parentNode.removeChild(sheet); }, 200);
  }
  function openNotes(item, btn) {
    if (!item) return;
    closeNotes();
    item._notes = item._notes || [];
    var sheet = document.createElement('div');
    sheet.id = 'galleryNotes';
    sheet.className = 'gallery-notes';
    var rows = item._notes.map(function (note) {
      return '<div class="gallery-note"><b>You</b><p>' + esc(note) + '</p></div>';
    }).join('');
    sheet.innerHTML =
      '<div class="gallery-notes-back" data-notes-close></div>' +
      '<div class="gallery-notes-panel" role="dialog" aria-label="Comments">' +
      '<div class="gallery-notes-head"><strong>Comments</strong><button type="button" data-notes-close aria-label="Close">×</button></div>' +
      '<div class="gallery-notes-list">' + (rows || '<p class="gallery-notes-empty">No comments yet. Say something kind.</p>') + '</div>' +
      '<form class="gallery-notes-form">' +
      '<input type="text" maxlength="160" placeholder="Add a kind note…" aria-label="Comment" required>' +
      '<button type="submit">Post</button></form></div>';
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    sheet.querySelectorAll('[data-notes-close]').forEach(function (el) {
      el.addEventListener('click', closeNotes);
    });
    var form = sheet.querySelector('form');
    var input = sheet.querySelector('input');
    if (input) input.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      item._notes.unshift(text);
      item.comments = (item.comments || 0) + 1;
      if (btn) {
        var s = btn.querySelector('.gallery-action-count');
        if (s) s.textContent = count(item.comments);
        pop(btn);
      }
      var list = sheet.querySelector('.gallery-notes-list');
      var empty = list.querySelector('.gallery-notes-empty');
      if (empty) empty.remove();
      var row = document.createElement('div');
      row.className = 'gallery-note';
      row.innerHTML = '<b>You</b><p>' + esc(text) + '</p>';
      list.insertBefore(row, list.firstChild);
      input.value = '';
    });
  }
  async function onAction(action, id, btn) {
    var item = itemById(id);
    if (!item) return;
    if (action === 'like') {
      var liked = !state.liked[item.id];
      state.liked[item.id] = liked;
      item.likes = Math.max(0, (item.likes || 0) + (liked ? 1 : -1));
      if (btn) {
        btn.classList.toggle('is-on', liked);
        setIcon(btn, liked ? 'fas fa-heart' : 'far fa-heart');
        var likeCount = btn.querySelector('.gallery-action-count');
        if (likeCount && item._hasLikes) likeCount.textContent = count(item.likes);
        var likeSymbol = btn.querySelector('.gallery-action-symbol');
        if (likeSymbol) likeSymbol.textContent = liked ? '♥' : '♡';
        pop(btn);
      }
      return;
    }
    if (action === 'save') {
      var saved = !state.saved[item.id];
      state.saved[item.id] = saved;
      if (btn) {
        btn.classList.toggle('is-on', saved);
        setIcon(btn, saved ? 'fas fa-bookmark' : 'far fa-bookmark');
        pop(btn);
      }
      return;
    }
    if (action === 'share') {
      var url = location.origin + '/gallery';
      var shared = false;
      try {
        if (navigator.share) {
          await navigator.share({ title: item._title || item.title || 'HSHS World', text: 'Shared from HSHS World', url: url });
          shared = true;
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          shared = true;
        }
      } catch (e) {
        if (e && e.name === 'AbortError') return;
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            shared = true;
          }
        } catch (err) {}
      }
      if (shared && btn) {
        btn.classList.add('is-on');
        setIcon(btn, 'fas fa-check');
        pop(btn);
        setTimeout(function () {
          btn.classList.remove('is-on');
          setIcon(btn, 'fas fa-share');
        }, 900);
      }
      return;
    }
    if (action === 'comment') openNotes(item, btn);
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
    var clearSearch = document.getElementById('gallerySearchClear');
    if (search) {
      var syncClear = function () {
        if (clearSearch) clearSearch.hidden = !search.value;
      };
      search.addEventListener('input', function () {
        state.query = search.value.trim().toLowerCase();
        state.offset = 0;
        syncClear();
        paint();
      });
      if (clearSearch) {
        clearSearch.addEventListener('click', function () {
          search.value = '';
          state.query = '';
          state.offset = 0;
          syncClear();
          paint();
          search.focus();
        });
      }
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
