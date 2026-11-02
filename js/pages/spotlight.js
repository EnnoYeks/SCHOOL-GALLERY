(function (global) {
  'use strict';
  if (global.__hshsSpotlightPageModule) return;
  global.__hshsSpotlightPageModule = true;
  var PAGE = 'spotlight';
  var STORE = 'hshs-spotlight-nominations';
  var HALLS = [
    { id: 'all', label: 'All', icon: 'fa-border-all' },
    { id: 'academics', label: 'Academics', icon: 'fa-book' },
    { id: 'sports', label: 'Sports', icon: 'fa-basketball-ball' },
    { id: 'arts', label: 'Arts', icon: 'fa-palette' },
    { id: 'leadership', label: 'Leadership', icon: 'fa-crown' },
    { id: 'community', label: 'Community', icon: 'fa-heart' },
    { id: 'events', label: 'Events', icon: 'fa-calendar' }
  ];
  var state = { posts: [], filter: 'all' };
  function isPage() {
    var f = (window.HshsPaths ? HshsPaths.key() : '');
    return f === PAGE || (global.HshsRoute && global.HshsRoute.is(PAGE));
  }
  function base() { return '/'; }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function (c) {
      return { '&': '&', '<': '<', '>': '>', "'": '&#39;', '"': '"' }[c];
    });
  }

  function dateValue(v) { var d = v && v.toDate ? v.toDate() : new Date(v || 0); return isNaN(d.getTime()) ? 0 : d.getTime(); }
  function score(p) { return Number(p.likes || 0) * 3 + Number(p.comments || 0) * 2 + Number(p.views || 0) * 0.05 + Number(p.shares || 0); }
  function media(p) { return p.imageUrl || p.image || p.thumbnailUrl || p.mediaURL || p.mediaUrl || ''; }
  function author(p) { return p.author || p.authorName || p.displayName || p.userName || 'HSHS Student'; }
  function hallOf(p) {
    var raw = String(p.category || p.type || 'community').toLowerCase();
    if (/sport/.test(raw)) return 'sports';
    if (/art|music|drama/.test(raw)) return 'arts';
    if (/lead/.test(raw)) return 'leadership';
    if (/event|grad/.test(raw)) return 'events';
    if (/academ|science|book|study/.test(raw)) return 'academics';
    if (/communit|club|service/.test(raw)) return 'community';
    return 'community';
  }
  function hallLabel(id) { var hit = HALLS.filter(function (h) { return h.id === id; })[0]; return hit ? hit.label : 'Community'; }
  function initial(name) { return esc(String(name || 'H').trim().charAt(0).toUpperCase() || 'H'); }
  function readNoms() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; } }
  function writeNoms(list) { localStorage.setItem(STORE, JSON.stringify(list.slice(0, 24))); }
  function featureHtml(p) {
    if (!p) return '<div class="sp-empty"><i class="fas fa-star"></i><strong>The week is still open</strong><p>When a school post is shared, the most active moment becomes the featured spotlight.</p></div>';
    var img = media(p);
    return '<article class="sp-feature-body"><div class="sp-feature-media">' + (img ? '<img src="' + esc(img) + '" alt="">' : '<span>' + initial(author(p)) + '</span>') + '</div><div><span class="sp-pill">' + esc(hallLabel(hallOf(p))) + '</span><h3>' + esc(author(p)) + '</h3><p class="sp-title">' + esc(p.title || 'Campus moment') + '</p><p>' + esc(p.description || 'Recognized from HSHS campus activity.') + '</p><div class="sp-metrics"><span><i class="fas fa-heart"></i> ' + Number(p.likes || 0) + '</span><span><i class="fas fa-eye"></i> ' + Number(p.views || 0) + '</span><span><i class="fas fa-comment"></i> ' + Number(p.comments || 0) + '</span></div><button type="button" class="sp-open" data-spotlight-id="' + esc(p.id) + '">Open spotlight</button></div></article>';
  }
  function cardHtml(p) {
    var img = media(p);
    return '<button type="button" class="sp-card" data-spotlight-id="' + esc(p.id) + '"><div class="sp-card-media">' + (img ? '<img src="' + esc(img) + '" alt="">' : '<span>' + initial(author(p)) + '</span>') + '</div><div><span>' + esc(hallLabel(hallOf(p))) + '</span><strong>' + esc(author(p)) + '</strong><small>' + esc(p.title || 'Featured moment') + '</small></div></button>';
  }
  function visible() { return state.posts.filter(function (p) { return state.filter === 'all' || hallOf(p) === state.filter; }); }
  function renderStats() {
    var box = document.getElementById('spStats'); if (!box) return;
    var people = {}; state.posts.forEach(function (p) { people[author(p)] = 1; });
    box.innerHTML = [[state.posts.length, 'Moments'], [Object.keys(people).length, 'Groups'], [readNoms().length, 'Nominations']].map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
  }
  function renderFilters() {
    var box = document.getElementById('spFilters'); if (!box) return;
    box.innerHTML = HALLS.map(function (h) { return '<button type="button" class="' + (state.filter === h.id ? 'is-on' : '') + '" data-filter="' + h.id + '"><i class="fas ' + h.icon + '"></i> ' + h.label + '</button>'; }).join('');
    box.onclick = function (e) { var btn = e.target.closest('[data-filter]'); if (!btn) return; state.filter = btn.getAttribute('data-filter'); renderBoard(); };
  }
  function renderBoard() {
    var grid = document.getElementById('spotlightGrid');
    var featured = document.getElementById('featuredStudent');
    var list = visible();
    if (featured) {
      featured.innerHTML = '';
      if (global.HshsPaint) global.HshsPaint.section(featured, (list[0] || state.posts[0]) ? 'success' : 'empty', { empty: '<div class="sp-empty"><i class="fas fa-star"></i><strong>The week is still open</strong><p>When a school post is shared, the most active moment becomes the featured spotlight.</p></div>' });
      featured.insertAdjacentHTML('beforeend', featureHtml(list[0] || state.posts[0] || null));
    }
    if (!grid) return;
    grid.innerHTML = '';
    if (global.HshsPaint) global.HshsPaint.section(grid, list.length ? 'success' : 'empty', { empty: '<div class="sp-empty"><i class="fas fa-compass"></i><strong>Nothing in this hall yet</strong><p>Share a photo or video in that area, or nominate someone below.</p></div>' });
    if (list.length) grid.insertAdjacentHTML('beforeend', list.slice(0, 12).map(cardHtml).join(''));
    renderFilters(); renderStats(); renderHall(); renderCats(); wireModal();
  }
  function renderHall() {
    var hall = document.getElementById('hallOfFameList'); if (!hall) return;
    var by = {};
    state.posts.forEach(function (p) { var n = author(p); if (!by[n]) by[n] = { name: n, points: 0 }; by[n].points += Math.round(score(p)); });
    var people = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.points - a.points; }).slice(0, 6);
    hall.innerHTML = '';
    if (global.HshsPaint) global.HshsPaint.section(hall, people.length ? 'success' : 'empty', { empty: '<div class="sp-empty compact"><strong>Hall of Fame starts with real posts</strong><p>Likes, comments, and views decide the order.</p></div>' });
    if (people.length) hall.insertAdjacentHTML('beforeend', people.map(function (x, i) { return '<div class="sp-rank"><b>' + (i + 1) + '</b><span>' + esc(x.name) + '</span><em>' + x.points + '</em></div>'; }).join(''));
  }
  function renderCats() {
    var cats = document.getElementById('spotlightCategories'); if (!cats) return;
    cats.innerHTML = HALLS.filter(function (h) { return h.id !== 'all'; }).map(function (h) {
      var n = state.posts.filter(function (p) { return hallOf(p) === h.id; }).length;
      return '<button type="button" data-filter="' + h.id + '"><i class="fas ' + h.icon + '"></i><strong>' + h.label + '</strong><small>' + n + ' moment' + (n === 1 ? '' : 's') + '</small></button>';
    }).join('');
    cats.onclick = function (e) { var btn = e.target.closest('[data-filter]'); if (!btn) return; state.filter = btn.getAttribute('data-filter'); var board = document.querySelector('.sp-board'); if (board) board.scrollIntoView({ behavior: 'smooth', block: 'start' }); renderBoard(); };
  }
  function renderNoms() {
    var box = document.getElementById('spNominations'); if (!box) return;
    var list = readNoms();
    box.innerHTML = list.length ? '<h3>Saved on this device</h3>' + list.map(function (n) { return '<article><b>' + esc(n.name) + '</b><span>' + esc(n.category) + (n.classTag ? ' · ' + esc(n.classTag) : '') + '</span><p>' + esc(n.note) + '</p></article>'; }).join('') : '';
    renderStats();
  }
  function wireForm() {
    var form = document.getElementById('spNominateForm'); if (!form || form.dataset.ready) return; form.dataset.ready = '1';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var item = { name: String(data.get('name') || '').trim(), classTag: String(data.get('classTag') || '').trim(), category: String(data.get('category') || 'Community'), note: String(data.get('note') || '').trim(), at: Date.now() };
      if (!item.name || !item.note) return;
      var list = readNoms(); list.unshift(item); writeNoms(list); form.reset();
      var status = document.getElementById('spFormStatus'); if (status) status.textContent = 'Nomination saved on this device.';
      renderNoms();
    });
  }
  function wireModal() {
    var modal = document.getElementById('studentModal'); var body = document.getElementById('modalBody');
    if (!modal || !body || modal.dataset.ready) return; modal.dataset.ready = '1';
    function shut() { modal.hidden = true; }
    function open(id) {
      var p = state.posts.filter(function (x) { return String(x.id) === String(id); })[0]; if (!p) return;
      var img = media(p);
      body.innerHTML = (img ? '<img src="' + esc(img) + '" alt="">' : '<div class="sp-sheet-mark">' + initial(author(p)) + '</div>') + '<span class="sp-pill">' + esc(hallLabel(hallOf(p))) + '</span><h2 id="spSheetTitle">' + esc(author(p)) + '</h2><p><strong>' + esc(p.title || 'HSHS Spotlight') + '</strong></p><p>' + esc(p.description || '') + '</p>';
      modal.hidden = false;
    }
    document.getElementById('hshs-page').addEventListener('click', function (e) { var btn = e.target.closest('[data-spotlight-id]'); if (btn) open(btn.getAttribute('data-spotlight-id')); });
    var close = document.getElementById('closeModal'); var overlay = document.getElementById('modalOverlay');
    if (close) close.onclick = shut; if (overlay) overlay.onclick = shut;
  }
  function mount() {
    if (!isPage() || !global.HshsRender) return;
    var root = document.getElementById('hshs-page'); if (!root) return;
    var tpl = global.HshsTemplates && global.HshsTemplates[PAGE];
    if (tpl && !document.getElementById('featuredStudent')) { if (global.HshsRender.mountHTML) global.HshsRender.mountHTML(root, tpl); else root.innerHTML = tpl; }
    var grid = document.getElementById('spotlightGrid');
    var featured = document.getElementById('featuredStudent');
    var hall = document.getElementById('hallOfFameList');
    if (global.HshsPaint) {
      if (featured) global.HshsPaint.section(featured, 'loading');
      if (grid) global.HshsPaint.section(grid, 'loading');
      if (hall) global.HshsPaint.section(hall, 'loading');
    }
    renderNoms(); wireForm(); loadData();
  }
  async function loadData() {
    var posts = [], failed = false;
    try {
      if (!(global.db && global.db.getPosts)) throw new Error('Spotlight source unavailable');
      posts = await global.db.getPosts(60, 0);
    } catch (e) { failed = true; posts = []; }
    if (failed) {
      var grid = document.getElementById('spotlightGrid');
      var featured = document.getElementById('featuredStudent');
      var hall = document.getElementById('hallOfFameList');
      var err = '<div class="sp-empty"><strong>Could not load spotlight</strong><button type="button" data-hshs-retry>Retry</button></div>';
      if (global.HshsPaint) {
        if (featured) global.HshsPaint.section(featured, 'error', { onRetry: loadData, error: err });
        if (grid) global.HshsPaint.section(grid, 'error', { onRetry: loadData, error: err });
        if (hall) global.HshsPaint.section(hall, 'error', { onRetry: loadData, error: err });
      }
      if (global.HshsPaint && global.HshsPaint.ready) global.HshsPaint.ready('spotlight');
      return;
    }
    posts = (posts || []).filter(function (p) { return p && p.id; });
    state.posts = posts.sort(function (a, b) { return score(b) - score(a) || dateValue(b.createdAt || b.timestamp) - dateValue(a.createdAt || a.timestamp); });
    renderBoard();
    if (global.HshsPaint && global.HshsPaint.ready) global.HshsPaint.ready('spotlight');
  }
  function boot() {
    function go() { if (!isPage()) return; if (global.HshsRender) mount(); else setTimeout(go, 40); }
    if (global.HshsApp && global.HshsApp.whenReady) global.HshsApp.whenReady(go);
    else document.addEventListener('hshs:foundation-ready', go, { once: true });
    go(); setTimeout(go, 500);
  }
  document.addEventListener('hshs:page', function () { if (isPage()) boot(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(typeof window !== 'undefined' ? window : this);
