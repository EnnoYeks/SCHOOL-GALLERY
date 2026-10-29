(function (global) {
  'use strict';
  if (global.__hshsMediaManagerLoaded) return;
  global.__hshsMediaManagerLoaded = true;

  var items = [];
  var selectedId = null;
  var selectedCollection = null;
  var busy = false;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function iconFor(type) { return type === 'video' ? '▶' : type === 'photo' ? '▧' : '✦'; }
  function collectionFor(item) { return item._collection || (item.type === 'video' ? 'videos' : item.type === 'post' ? 'posts' : 'photos'); }
  function titleFor(item) { return item.title || item.caption || 'Untitled media'; }
  function mediaFor(item) {
    if (global.HshsStorage && global.HshsStorage.mediaUrl) return global.HshsStorage.mediaUrl(item);
    return item.video_url || item.videoUrl || item.image_url || item.imageUrl || item.thumbnail_url || item.thumbnailUrl || item.image || '';
  }
  function kindFor(item, collection) {
    if (collection === 'videos' || item.type === 'video' || item.video_url || item.videoUrl) return 'video';
    if (collection === 'posts') return item.type || 'post';
    return 'photo';
  }
  function rootMarkup() {
    return '<section class="hshs-media-manager" id="hshsMediaManager" aria-labelledby="hmmTitle">' +
      '<div class="hmm-head"><div><p class="hmm-kicker">HSHS World · Live library</p><h2 class="hmm-title" id="hmmTitle">Media Manager</h2><p class="hmm-subtitle">Manage content stored in the HSHS World database. Media files remain in Cloudflare R2.</p></div><button class="hmm-btn" id="hmmRefresh" type="button">↻ Refresh library</button></div>' +
      '<div class="hmm-stats" aria-label="Media summary">' +
      '<article class="hmm-stat"><span>Loaded items</span><strong id="hmmTotal">0</strong></article>' +
      '<article class="hmm-stat"><span>Photos</span><strong id="hmmPhotos">0</strong></article>' +
      '<article class="hmm-stat"><span>Videos</span><strong id="hmmVideos">0</strong></article>' +
      '<article class="hmm-stat"><span>Featured</span><strong id="hmmFeatured">0</strong></article></div>' +
      '<div class="hmm-toolbar"><label class="hmm-search"><input id="hmmSearch" type="search" placeholder="Search title, uploader, category…" aria-label="Search media"></label>' +
      '<select class="hmm-select" id="hmmType" aria-label="Filter by media type"><option value="all">All types</option><option value="photo">Photos</option><option value="video">Videos</option><option value="post">Posts</option></select>' +
      '<select class="hmm-select" id="hmmStatus" aria-label="Filter by status"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></div>' +
      '<p class="hmm-message" id="hmmMessage" role="status" aria-live="polite">Connecting to the live library…</p>' +
      '<div class="hmm-grid" id="hmmGrid" aria-live="polite"></div>' +
      '<p class="hmm-note">Live database records are shown here. Feature, edit and delete actions require an authenticated admin session. Deleting a database record may not remove its R2 object.</p></section>' +
      '<div class="hmm-modal" id="hmmModal" role="dialog" aria-modal="true" aria-labelledby="hmmModalTitle"><div class="hmm-modal-card"><div class="hmm-modal-head"><h3 id="hmmModalTitle">Media details</h3><button class="hmm-btn" id="hmmCloseModal" type="button" aria-label="Close details">Close ✕</button></div><div class="hmm-modal-preview" id="hmmModalPreview"></div><p class="hmm-modal-copy" id="hmmModalCopy"></p><div class="hmm-card-actions"><button class="hmm-btn" id="hmmModalFeature" type="button">Toggle featured</button></div></div></div>';
  }
  function normalise(row, collection) {
    var item = Object.assign({}, row);
    item._collection = collection;
    item.type = kindFor(item, collection);
    item._title = titleFor(item);
    item._url = mediaFor(item);
    item._status = String(item.status || 'published').toLowerCase();
    item._uploader = item.author || item.uploader || item.author_id || 'Unknown uploader';
    item._category = item.category || item.class_tag || item.classTag || 'Uncategorised';
    return item;
  }
  async function loadItems() {
    var message = document.getElementById('hmmMessage');
    if (!global.db) {
      items = [];
      if (message) message.textContent = 'Database layer is unavailable. Check that js/db.js loaded successfully.';
      render();
      return;
    }
    if (message) message.textContent = 'Loading live content…';
    try {
      var results = await Promise.all([
        global.db.getPhotos ? global.db.getPhotos(100, 0) : Promise.resolve([]),
        global.db.getVideos ? global.db.getVideos(100, 0) : Promise.resolve([]),
        (global.adminApi && global.adminApi.listPosts ? global.adminApi.listPosts().catch(function () { return global.db.getPosts ? global.db.getPosts(100, 0) : []; }) : (global.db.getPosts ? global.db.getPosts(100, 0) : Promise.resolve([])))
      ]);
      items = []
        .concat((results[0] || []).map(function (x) { return normalise(x, 'photos'); }))
        .concat((results[1] || []).map(function (x) { return normalise(x, 'videos'); }))
        .concat((results[2] || []).map(function (x) { return normalise(x, 'posts'); }));
      items.sort(function (a, b) {
        var at = Date.parse(a.created_at || a.createdAt || 0) || 0;
        var bt = Date.parse(b.created_at || b.createdAt || 0) || 0;
        return bt - at;
      });
      if (message) message.textContent = 'Loaded ' + items.length + ' live records. If some records are missing, check Supabase access policies and the admin Worker.';
      render();
    } catch (error) {
      if (message) message.textContent = 'Could not load the live library: ' + (error && error.message ? error.message : 'unknown error');
      render();
    }
  }
  function matches(item) {
    var search = (document.getElementById('hmmSearch').value || '').trim().toLowerCase();
    var type = document.getElementById('hmmType').value;
    var status = document.getElementById('hmmStatus').value;
    var haystack = [item._title, item._category, item._uploader, item.id, item.description].join(' ').toLowerCase();
    return (type === 'all' || item.type === type) &&
      (status === 'all' || item._status === status) &&
      (!search || haystack.indexOf(search) !== -1);
  }
  function updateStats() {
    document.getElementById('hmmTotal').textContent = items.length;
    document.getElementById('hmmPhotos').textContent = items.filter(function (x) { return x._collection === 'photos'; }).length;
    document.getElementById('hmmVideos').textContent = items.filter(function (x) { return x._collection === 'videos'; }).length;
    document.getElementById('hmmFeatured').textContent = items.filter(function (x) { return !!x.featured; }).length;
  }
  function render() {
    var grid = document.getElementById('hmmGrid');
    if (!grid) return;
    updateStats();
    var found = items.filter(matches);
    if (!found.length) {
      grid.innerHTML = '<div class="hmm-empty"><strong>No live records match</strong>Try another search or check whether the database has content.</div>';
      return;
    }
    grid.innerHTML = found.map(function (item) {
      var media = item._url ? (item.type === 'video'
        ? '<video src="' + esc(item._url) + '" muted playsinline preload="metadata"></video>'
        : '<img src="' + esc(item._url) + '" alt="' + esc(item._title) + '" loading="lazy">')
        : '<span class="hmm-thumb-icon" aria-hidden="true">' + iconFor(item.type) + '</span>';
      var status = item._status === 'draft' ? 'Draft' : 'Published';
      return '<article class="hmm-card" data-id="' + esc(item.id) + '" data-collection="' + esc(item._collection) + '"><div class="hmm-thumb" data-kind="' + esc(item.type) + '">' + media +
        '<span class="hmm-kind">' + esc(item._collection) + '</span>' + (item.featured ? '<span class="hmm-featured">★ Featured</span>' : '') + '</div>' +
        '<div class="hmm-card-body"><div class="hmm-card-top"><h3 class="hmm-card-title">' + esc(item._title) + '</h3><span class="hmm-status ' + (status === 'Draft' ? 'draft' : '') + '">' + status + '</span></div>' +
        '<p class="hmm-meta">' + esc(item._category) + ' · ' + esc(item._uploader) + '<br>ID ' + esc(item.id) + '</p>' +
        '<div class="hmm-card-actions"><button class="hmm-btn" data-action="preview" data-id="' + esc(item.id) + '" data-collection="' + esc(item._collection) + '" type="button">Preview</button>' +
        '<button class="hmm-btn" data-action="feature" data-id="' + esc(item.id) + '" data-collection="' + esc(item._collection) + '" type="button">' + (item.featured ? 'Unfeature' : 'Feature') + '</button>' +
        '<button class="hmm-btn" data-action="edit" data-id="' + esc(item.id) + '" data-collection="' + esc(item._collection) + '" type="button">Edit</button>' +
        '<button class="hmm-btn hmm-btn-danger" data-action="delete" data-id="' + esc(item.id) + '" data-collection="' + esc(item._collection) + '" type="button">Delete record</button></div></div></article>';
    }).join('');
  }
  function findItem(id, collection) {
    return items.find(function (item) { return String(item.id) === String(id) && item._collection === collection; });
  }
  function openModal(id, collection) {
    var item = findItem(id, collection);
    if (!item) return;
    selectedId = id; selectedCollection = collection;
    document.getElementById('hmmModalTitle').textContent = item._title;
    var preview = document.getElementById('hmmModalPreview');
    if (item._url) preview.innerHTML = item.type === 'video'
      ? '<video src="' + esc(item._url) + '" controls playsinline preload="metadata"></video>'
      : '<img src="' + esc(item._url) + '" alt="' + esc(item._title) + '">';
    else preview.innerHTML = '<div class="hmm-thumb" data-kind="' + esc(item.type) + '" style="width:100%;min-height:190px"><span class="hmm-thumb-icon">' + iconFor(item.type) + '</span></div>';
    document.getElementById('hmmModalCopy').textContent = (item.description || item.caption || 'No description') + ' Category: ' + item._category + '. Collection: ' + collection + '. ID: ' + id + '.';
    document.getElementById('hmmModalFeature').textContent = item.featured ? 'Remove featured' : 'Mark featured';
    document.getElementById('hmmModal').classList.add('is-open');
    document.getElementById('hmmCloseModal').focus();
  }
  function closeModal() {
    document.getElementById('hmmModal').classList.remove('is-open');
    selectedId = null; selectedCollection = null;
  }
  async function featureItem(id, collection) {
    var item = findItem(id, collection);
    if (!item || busy) return;
    if (!global.adminApi || !global.adminApi.feature) throw new Error('Admin API is unavailable; sign in with an admin account first.');
    busy = true;
    try {
      await global.adminApi.feature(id, !item.featured, collection);
      await loadItems();
      if (selectedId === id) document.getElementById('hmmModalFeature').textContent = item.featured ? 'Mark featured' : 'Remove featured';
    } finally { busy = false; }
  }
  async function editItem(id, collection) {
    var item = findItem(id, collection);
    if (!item || busy) return;
    var title = global.prompt('Title', item._title);
    if (title == null) return;
    var description = global.prompt('Description / caption', item.description || item.caption || '');
    if (description == null) return;
    if (!global.adminApi || !global.adminApi.updateContent) { global.alert('Admin API is unavailable. Sign in with an admin account first.'); return; }
    busy = true;
    try {
      await global.adminApi.updateContent(collection, id, { title: title.trim().slice(0, 200), description: description.trim().slice(0, 2000) });
      await loadItems();
    } catch (error) { global.alert('Update failed: ' + (error.message || 'unknown error')); }
    finally { busy = false; }
  }
  async function deleteItem(id, collection) {
    var item = findItem(id, collection);
    if (!item || busy) return;
    if (!global.confirm('Delete the database record "' + item._title + '"? This may not delete the corresponding R2 file.')) return;
    if (!global.adminApi || !global.adminApi.deleteContent) { global.alert('Admin API is unavailable. Sign in with an admin account first.'); return; }
    busy = true;
    try {
      await global.adminApi.deleteContent(collection, id);
      if (selectedId === id && selectedCollection === collection) closeModal();
      await loadItems();
    } catch (error) { global.alert('Delete failed: ' + (error.message || 'unknown error')); }
    finally { busy = false; }
  }
  function bind() {
    document.getElementById('hmmSearch').addEventListener('input', render);
    document.getElementById('hmmType').addEventListener('change', render);
    document.getElementById('hmmStatus').addEventListener('change', render);
    document.getElementById('hmmRefresh').addEventListener('click', loadItems);
    document.getElementById('hmmGrid').addEventListener('click', function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) return;
      var id = button.getAttribute('data-id');
      var collection = button.getAttribute('data-collection');
      var action = button.getAttribute('data-action');
      if (action === 'preview') openModal(id, collection);
      if (action === 'feature') featureItem(id, collection).catch(function (e) { global.alert(e.message || 'Could not update featured state'); });
      if (action === 'edit') editItem(id, collection);
      if (action === 'delete') deleteItem(id, collection);
    });
    document.getElementById('hmmCloseModal').addEventListener('click', closeModal);
    document.getElementById('hmmModal').addEventListener('click', function (event) {
      if (event.target.id === 'hmmModal') closeModal();
    });
    document.getElementById('hmmModalFeature').addEventListener('click', function () {
      if (selectedId != null && selectedCollection) featureItem(selectedId, selectedCollection).catch(function (e) { global.alert(e.message || 'Could not update featured state'); });
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeModal(); });
  }
  function mount() {
    var panels = document.getElementById('adminPanels');
    if (!panels || !panels.querySelector('.admin-welcome')) return false;
    if (document.getElementById('hshsMediaManager')) return true;
    panels.insertAdjacentHTML('beforeend', rootMarkup());
    bind(); loadItems();
    return true;
  }
  function start() {
    if (mount()) return;
    var observer = new MutationObserver(function () { if (mount()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    global.setTimeout(function () { observer.disconnect(); }, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(window);
