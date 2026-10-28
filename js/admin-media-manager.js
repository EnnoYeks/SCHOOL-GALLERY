(function (global) {
  'use strict';
  if (global.__hshsMediaManagerLoaded) return;
  global.__hshsMediaManagerLoaded = true;

  // Intentionally local demo data. This module does not call Supabase, R2, Firebase, or any API.
  var items = [
    { id: 'demo-1001', title: 'Inter-house Sports Highlights', type: 'video', category: 'Sports', uploader: 'HSHS Media Team', date: 'Today', status: 'Published', featured: true, description: 'Sample entry for the media manager preview.' },
    { id: 'demo-1002', title: 'Campus Life · Morning Assembly', type: 'photo', category: 'Campus', uploader: 'Student Media Club', date: 'Yesterday', status: 'Published', featured: false, description: 'Sample campus photo entry. No real media is connected.' },
    { id: 'demo-1003', title: 'Term Two Announcement', type: 'post', category: 'Academics', uploader: 'Admin Preview', date: 'Oct 24', status: 'Draft', featured: false, description: 'A sample draft post used to test filters and actions.' },
    { id: 'demo-1004', title: 'Choir Practice Moments', type: 'video', category: 'Arts', uploader: 'HSHS Media Team', date: 'Oct 22', status: 'Published', featured: false, description: 'Sample video entry for layout testing only.' },
    { id: 'demo-1005', title: 'Science Exhibition', type: 'photo', category: 'Academics', uploader: 'Student Media Club', date: 'Oct 20', status: 'Published', featured: true, description: 'Sample image entry for the admin preview.' },
    { id: 'demo-1006', title: 'Weekend Reminder', type: 'post', category: 'Campus', uploader: 'Admin Preview', date: 'Oct 18', status: 'Draft', featured: false, description: 'Sample text post; edits are temporary and local.' }
  ];
  var activeFilter = 'all';
  var selectedId = null;
  var objectUrls = [];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function iconFor(type) { return type === 'video' ? '▶' : type === 'photo' ? '▧' : '✦'; }
  function byId(id) { return items.find(function (item) { return item.id === id; }); }
  function rootMarkup() {
    return '<section class="hshs-media-manager" id="hshsMediaManager" aria-labelledby="hmmTitle">' +
      '<div class="hmm-head"><div><p class="hmm-kicker">Library · Local preview</p><h2 class="hmm-title" id="hmmTitle">Media Manager</h2><p class="hmm-subtitle">Browse the media library layout and try the controls before connecting live data.</p></div><span class="hmm-demo-tag">DEMO MODE</span></div>' +
      '<div class="hmm-stats" aria-label="Media summary">' +
      '<article class="hmm-stat"><span>Total items</span><strong id="hmmTotal">0</strong></article>' +
      '<article class="hmm-stat"><span>Photos</span><strong id="hmmPhotos">0</strong></article>' +
      '<article class="hmm-stat"><span>Videos</span><strong id="hmmVideos">0</strong></article>' +
      '<article class="hmm-stat"><span>Featured</span><strong id="hmmFeatured">0</strong></article></div>' +
      '<div class="hmm-toolbar"><label class="hmm-search"><input id="hmmSearch" type="search" placeholder="Search title, uploader, category…" aria-label="Search media"></label>' +
      '<select class="hmm-select" id="hmmType" aria-label="Filter by media type"><option value="all">All types</option><option value="photo">Photos</option><option value="video">Videos</option><option value="post">Posts</option></select>' +
      '<select class="hmm-select" id="hmmStatus" aria-label="Filter by status"><option value="all">All statuses</option><option value="Published">Published</option><option value="Draft">Drafts</option></select>' +
      '<button class="hmm-btn hmm-btn-primary" id="hmmAddLocal" type="button">＋ Add local preview</button><input id="hmmFileInput" type="file" accept="image/*,video/mp4,video/webm" multiple hidden></div>' +
      '<div class="hmm-upload-progress" id="hmmProgress" role="status" aria-live="polite"><div class="hmm-card-top"><strong id="hmmProgressLabel">Preparing local preview…</strong><span id="hmmProgressValue">0%</span></div><div class="hmm-progress-track"><div class="hmm-progress-fill" id="hmmProgressFill"></div></div></div>' +
      '<div class="hmm-grid" id="hmmGrid" aria-live="polite"></div>' +
      '<p class="hmm-note">Demo only: edits and local previews exist in this page session. They are not uploaded or saved to the live HSHS World database.</p></section>' +
      '<div class="hmm-modal" id="hmmModal" role="dialog" aria-modal="true" aria-labelledby="hmmModalTitle"><div class="hmm-modal-card"><div class="hmm-modal-head"><h3 id="hmmModalTitle">Media details</h3><button class="hmm-btn" id="hmmCloseModal" type="button" aria-label="Close details">Close ✕</button></div><div class="hmm-modal-preview" id="hmmModalPreview"></div><p class="hmm-modal-copy" id="hmmModalCopy"></p><div class="hmm-card-actions"><button class="hmm-btn" id="hmmModalFeature" type="button">Toggle featured</button><button class="hmm-btn hmm-btn-danger" id="hmmModalDelete" type="button">Remove demo item</button></div></div></div>';
  }
  function matches(item) {
    var search = (document.getElementById('hmmSearch').value || '').trim().toLowerCase();
    var type = document.getElementById('hmmType').value;
    var status = document.getElementById('hmmStatus').value;
    var haystack = [item.title, item.category, item.uploader, item.id, item.description].join(' ').toLowerCase();
    return (activeFilter === 'all' || item.type === activeFilter) &&
      (type === 'all' || item.type === type) &&
      (status === 'all' || item.status === status) &&
      (!search || haystack.indexOf(search) !== -1);
  }
  function updateStats() {
    document.getElementById('hmmTotal').textContent = items.length;
    document.getElementById('hmmPhotos').textContent = items.filter(function (x) { return x.type === 'photo'; }).length;
    document.getElementById('hmmVideos').textContent = items.filter(function (x) { return x.type === 'video'; }).length;
    document.getElementById('hmmFeatured').textContent = items.filter(function (x) { return x.featured; }).length;
  }
  function render() {
    var grid = document.getElementById('hmmGrid');
    if (!grid) return;
    updateStats();
    var found = items.filter(matches);
    if (!found.length) {
      grid.innerHTML = '<div class="hmm-empty"><strong>No matching items</strong>Try another search or filter.</div>';
      return;
    }
    grid.innerHTML = found.map(function (item) {
      var media = item.previewUrl ? (item.type === 'video'
        ? '<video src="' + esc(item.previewUrl) + '" muted playsinline preload="metadata"></video>'
        : '<img src="' + esc(item.previewUrl) + '" alt="Local preview for ' + esc(item.title) + '">')
        : '<span class="hmm-thumb-icon" aria-hidden="true">' + iconFor(item.type) + '</span>';
      return '<article class="hmm-card" data-id="' + esc(item.id) + '"><div class="hmm-thumb" data-kind="' + esc(item.type) + '">' + media +
        '<span class="hmm-kind">' + esc(item.type) + '</span>' + (item.featured ? '<span class="hmm-featured">★ Featured</span>' : '') + '</div>' +
        '<div class="hmm-card-body"><div class="hmm-card-top"><h3 class="hmm-card-title">' + esc(item.title) + '</h3><span class="hmm-status ' + (item.status === 'Draft' ? 'draft' : '') + '">' + esc(item.status) + '</span></div>' +
        '<p class="hmm-meta">' + esc(item.category) + ' · ' + esc(item.uploader) + '<br>' + esc(item.date) + ' · ID ' + esc(item.id) + '</p>' +
        '<div class="hmm-card-actions"><button class="hmm-btn" data-action="preview" data-id="' + esc(item.id) + '" type="button">Preview</button>' +
        '<button class="hmm-btn" data-action="feature" data-id="' + esc(item.id) + '" type="button">' + (item.featured ? 'Unfeature' : 'Feature') + '</button>' +
        '<button class="hmm-btn hmm-btn-danger" data-action="delete" data-id="' + esc(item.id) + '" type="button">Remove</button></div></div></article>';
    }).join('');
  }
  function openModal(id) {
    var item = byId(id);
    if (!item) return;
    selectedId = id;
    document.getElementById('hmmModalTitle').textContent = item.title;
    var preview = document.getElementById('hmmModalPreview');
    if (item.previewUrl) preview.innerHTML = item.type === 'video'
      ? '<video src="' + esc(item.previewUrl) + '" controls playsinline></video>'
      : '<img src="' + esc(item.previewUrl) + '" alt="' + esc(item.title) + '">';
    else preview.innerHTML = '<div class="hmm-thumb" data-kind="' + esc(item.type) + '" style="width:100%;min-height:190px"><span class="hmm-thumb-icon">' + iconFor(item.type) + '</span></div>';
    document.getElementById('hmmModalCopy').textContent = item.description + ' Category: ' + item.category + '. Uploader: ' + item.uploader + '. Status: ' + item.status + '. ID: ' + item.id + '.';
    document.getElementById('hmmModalFeature').textContent = item.featured ? 'Remove featured' : 'Mark featured';
    document.getElementById('hmmModal').classList.add('is-open');
    document.getElementById('hmmCloseModal').focus();
  }
  function closeModal() {
    document.getElementById('hmmModal').classList.remove('is-open');
    selectedId = null;
  }
  function toggleFeature(id) {
    var item = byId(id);
    if (!item) return;
    item.featured = !item.featured;
    render();
    if (selectedId === id) document.getElementById('hmmModalFeature').textContent = item.featured ? 'Remove featured' : 'Mark featured';
  }
  function removeItem(id) {
    var item = byId(id);
    if (!item || !global.confirm('Remove this demo item from the preview? This does not delete anything from HSHS World.')) return;
    items = items.filter(function (entry) { return entry.id !== id; });
    if (selectedId === id) closeModal();
    render();
  }
  function addLocalFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var progress = document.getElementById('hmmProgress');
    var fill = document.getElementById('hmmProgressFill');
    var label = document.getElementById('hmmProgressLabel');
    var value = document.getElementById('hmmProgressValue');
    progress.classList.add('is-visible');
    var n = 0;
    label.textContent = 'Creating local-only previews…';
    fill.style.width = '0%'; value.textContent = '0%';
    var step = function () {
      n = Math.min(100, n + 20);
      fill.style.width = n + '%'; value.textContent = n + '%';
      if (n < 100) { global.setTimeout(step, 70); return; }
      files.forEach(function (file) {
        var isVideo = file.type.indexOf('video/') === 0;
        var url = URL.createObjectURL(file);
        objectUrls.push(url);
        items.unshift({
          id: 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
          title: file.name, type: isVideo ? 'video' : 'photo', category: 'Local preview',
          uploader: 'This device', date: 'Just now', status: 'Draft', featured: false,
          description: 'Local preview only. This file has not been uploaded.', previewUrl: url
        });
      });
      document.getElementById('hmmType').value = 'all';
      document.getElementById('hmmStatus').value = 'all';
      document.getElementById('hmmSearch').value = '';
      progress.classList.remove('is-visible');
      render();
    };
    global.setTimeout(step, 70);
  }
  function bind() {
    document.getElementById('hmmSearch').addEventListener('input', render);
    document.getElementById('hmmType').addEventListener('change', render);
    document.getElementById('hmmStatus').addEventListener('change', render);
    document.getElementById('hmmAddLocal').addEventListener('click', function () { document.getElementById('hmmFileInput').click(); });
    document.getElementById('hmmFileInput').addEventListener('change', function (event) {
      addLocalFiles(event.target.files); event.target.value = '';
    });
    document.getElementById('hmmGrid').addEventListener('click', function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) return;
      var id = button.getAttribute('data-id');
      var action = button.getAttribute('data-action');
      if (action === 'preview') openModal(id);
      if (action === 'feature') toggleFeature(id);
      if (action === 'delete') removeItem(id);
    });
    document.getElementById('hmmCloseModal').addEventListener('click', closeModal);
    document.getElementById('hmmModal').addEventListener('click', function (event) {
      if (event.target.id === 'hmmModal') closeModal();
    });
    document.getElementById('hmmModalFeature').addEventListener('click', function () { if (selectedId) toggleFeature(selectedId); });
    document.getElementById('hmmModalDelete').addEventListener('click', function () { if (selectedId) removeItem(selectedId); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeModal(); });
  }
  function mount() {
    var panels = document.getElementById('adminPanels');
    if (!panels || !panels.querySelector('.admin-welcome')) return false;
    if (document.getElementById('hshsMediaManager')) return true;
    panels.insertAdjacentHTML('beforeend', rootMarkup());
    bind(); render();
    return true;
  }
  function start() {
    if (mount()) return;
    var observer = new MutationObserver(function () {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    global.setTimeout(function () { observer.disconnect(); }, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  global.addEventListener('beforeunload', function () { objectUrls.forEach(function (url) { URL.revokeObjectURL(url); }); });
})(window);
