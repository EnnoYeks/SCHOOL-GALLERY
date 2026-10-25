// HSHS World — Admin control room
// Privileged writes via Worker /admin/* (Firebase token + ADMIN_UIDS).

(function () {
  'use strict';
  const ALLOWED = new Set(['posts', 'photos', 'videos']);
  const CATEGORIES = [
    { id: 'events', label: 'Events' }, { id: 'sports', label: 'Sports' },
    { id: 'academics', label: 'Academics' }, { id: 'arts', label: 'Arts' },
    { id: 'clubs', label: 'Clubs' }, { id: 'campus', label: 'Campus' }
  ];
  const CLASSES = ['Campus', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'})[c]);

  class AdminDashboard {
    constructor() {
      this.busy = false; this.items = []; this.official = []; this.isAdmin = false; this.uploadTarget = 'posts';
      this.init();
    }

    async init() {
      const ready = await this.waitForAuth();
      if (!ready) { this.showLock('Sign in required', 'Please sign in to access the control room.', 'index/login.html'); return; }
      try { const me = await window.adminApi.me(); this.isAdmin = !!(me && me.admin); } catch (e) { this.isAdmin = false; }
      if (!this.isAdmin) { this.showLock('You do not have permission', 'This area is for admins only.', null); return; }
      this.render(); this.bind();
      await Promise.all([this.loadRecentItems(), this.loadEventsList(), this.loadOfficialPosts()]);
    }

    waitForAuth() {
      return new Promise((resolve) => {
        if (window.hshsAuthState && window.hshsAuthState !== 'loading') return resolve(!!window.hshsAuthUser);
        document.addEventListener('hshs:auth', () => resolve(!!window.hshsAuthUser), { once: true });
        setTimeout(() => resolve(!!window.hshsAuthUser), 3000);
      });
    }

    showLock(title, msg, link) {
      const lock = $('adminLock'); const panels = $('adminPanels');
      if (panels) panels.style.display = 'none';
      if (lock) {
        lock.style.display = 'grid';
        lock.innerHTML = '<div class="admin-lock-card"><div class="admin-lock-icon"><i class="fa-solid fa-lock"></i></div><h1>' + esc(title) + '</h1><p class="admin-muted">' + esc(msg) + '</p>' + (link ? '<a class="admin-back-link" href="' + link + '">Go to sign in</a>' : '') + '</div>';
      }
    }

    catOptions() { return CATEGORIES.map(c => '<option value="' + c.id + '">' + esc(c.label) + '</option>').join(''); }
    classOptions() { return CLASSES.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join(''); }

    render() {
      const panels = $('adminPanels'); if (!panels) return;
      panels.innerHTML = [
        '<header class="admin-welcome"><div><p class="admin-eyebrow">HSHS WORLD · CONTROL ROOM</p><h1>Good to see you, admin.</h1><p class="admin-muted">Upload content, pin Featured Today, manage events.</p></div>',
        '<button class="admin-btn admin-btn-quiet" id="adminRefresh" type="button"><i class="fa-solid fa-rotate"></i> Refresh</button></header>',
        '<section class="admin-stat-grid">',
        '<article class="admin-stat"><p>Posts</p><strong id="adminPostCount">0</strong><small>Latest</small></article>',
        '<article class="admin-stat"><p>Photos</p><strong id="adminPhotoCount">0</strong><small>Gallery</small></article>',
        '<article class="admin-stat"><p>Videos</p><strong id="adminVideoCount">0</strong><small>Videos</small></article>',
        '<article class="admin-stat"><p>Events</p><strong id="adminEventCount">0</strong><small>Calendar</small></article></section>',
        '<section class="admin-panel" style="margin-bottom:18px"><div class="admin-panel-head"><div><p class="admin-eyebrow">UPLOAD</p><h2>Post · Photo · Video</h2>',
        '<p class="admin-muted">Feature on Home pins Featured Today in the same write.</p></div></div>',
        '<form class="admin-event-form" id="adminUploadForm">',
        '<div class="admin-form-row" style="gap:8px;flex-wrap:wrap">',
        '<label>Destination<select id="upTarget"><option value="posts">Post</option><option value="photos">Photo</option><option value="videos">Video</option></select></label>',
        '<label>Category<select id="upCategory">' + this.catOptions() + '</select></label>',
        '<label>Class<select id="upClass">' + this.classOptions() + '</select></label></div>',
        '<label>Title<input id="upTitle" placeholder="Title" maxlength="200"></label>',
        '<label>Description<textarea id="upDesc" placeholder="Caption or announcement" rows="3" maxlength="2000"></textarea></label>',
        '<label>File<input id="upFile" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"></label>',
        '<label id="upPosterWrap" style="display:none">Poster (optional)<input id="upPoster" type="file" accept="image/jpeg,image/png,image/webp"></label>',
        '<label style="display:flex;align-items:center;gap:8px;margin:8px 0"><input type="checkbox" id="upFeature"> Feature on Home</label>',
        '<div id="upProgress" style="display:none;height:6px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin:8px 0"><div id="upProgressBar" style="height:100%;width:0%;background:#2563eb"></div></div>',
        '<div class="admin-form-row"><button type="button" id="upDraftBtn" class="admin-btn admin-btn-quiet">Save draft</button>',
        '<button type="button" id="upPublishBtn" class="admin-btn admin-btn-primary">Publish</button></div>',
        '<p id="upFeedback" class="admin-feedback"></p></form></section>',
        '<div class="admin-work-grid"><section class="admin-panel"><div class="admin-panel-head"><div><p class="admin-eyebrow">HOMEPAGE</p><h2>Featured Today</h2></div></div>',
        '<div id="recentItems" class="admin-item-list"><div class="admin-empty">Loading…</div></div>',
        '<details class="admin-manual-pin"><summary>Pin by item ID</summary><div class="admin-inline-form">',
        '<input id="pinId" placeholder="Item ID"><select id="pinCol"><option value="posts">posts</option><option value="photos">photos</option><option value="videos">videos</option></select>',
        '<button id="pinBtn" class="admin-btn admin-btn-primary" type="button">Pin</button><button id="unpinBtn" class="admin-btn admin-btn-quiet" type="button">Unpin</button></div></details></section>',
        '<section class="admin-panel"><div class="admin-panel-head"><div><p class="admin-eyebrow">CALENDAR</p><h2>Upcoming Events</h2></div></div>',
        '<form class="admin-event-form" id="adminEventForm"><label>Event name<input id="evTitle" required></label>',
        '<div class="admin-form-row"><label>Date<input id="evDate" type="date" required></label><label>Location<input id="evPlace"></label></div>',
        '<button class="admin-btn admin-btn-primary" type="submit">Add event</button><p id="adminFeedback" class="admin-feedback"></p></form>',
        '<div id="eventsList" class="admin-event-list"><div class="admin-empty">Loading…</div></div></section></div>',
        '<section class="admin-panel" style="margin-top:18px"><div class="admin-panel-head"><div><p class="admin-eyebrow">OFFICIAL</p><h2>Official posts</h2></div></div>',
        '<div id="officialList" class="admin-item-list"><div class="admin-empty">Loading…</div></div></section>'
      ].join('');
      this.syncUploadUi();
    }

    syncUploadUi() {
      const target = ($('upTarget') && $('upTarget').value) || 'posts';
      this.uploadTarget = target;
      const draft = $('upDraftBtn'); if (draft) draft.style.display = target === 'posts' ? '' : 'none';
      const poster = $('upPosterWrap'); if (poster) poster.style.display = target === 'videos' ? '' : 'none';
      const file = $('upFile');
      if (file) {
        if (target === 'photos') file.accept = 'image/jpeg,image/png,image/webp';
        else if (target === 'videos') file.accept = 'video/mp4,video/webm';
        else file.accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm';
      }
      const pub = $('upPublishBtn'); if (pub) pub.textContent = target === 'posts' ? 'Publish' : 'Upload';
    }

    bind() {
      $('adminRefresh') && $('adminRefresh').addEventListener('click', () => this.init());
      $('pinBtn') && $('pinBtn').addEventListener('click', () => this.pinItem(true));
      $('unpinBtn') && $('unpinBtn').addEventListener('click', () => this.pinItem(false));
      $('adminEventForm') && $('adminEventForm').addEventListener('submit', (e) => { e.preventDefault(); this.addEvent(); });
      $('upTarget') && $('upTarget').addEventListener('change', () => this.syncUploadUi());
      $('upDraftBtn') && $('upDraftBtn').addEventListener('click', () => this.submitUpload('draft'));
      $('upPublishBtn') && $('upPublishBtn').addEventListener('click', () => this.submitUpload('published'));
    }

    setFeedback(id, msg, ok) {
      const el = $(id); if (!el) return;
      el.textContent = msg || '';
      el.className = 'admin-feedback' + (ok === true ? ' is-success' : ok === false ? ' is-error' : '');
    }

    setProgress(pct) {
      const wrap = $('upProgress'); const bar = $('upProgressBar');
      if (!wrap || !bar) return;
      if (pct == null) { wrap.style.display = 'none'; bar.style.width = '0%'; return; }
      wrap.style.display = 'block'; bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }

    async submitUpload(status) {
      const target = ($('upTarget') && $('upTarget').value) || 'posts';
      const title = (($('upTitle') && $('upTitle').value) || '').trim();
      const description = (($('upDesc') && $('upDesc').value) || '').trim();
      const category = ($('upCategory') && $('upCategory').value) || 'events';
      const class_tag = ($('upClass') && $('upClass').value) || 'Campus';
      const feature = !!($('upFeature') && $('upFeature').checked);
      const file = $('upFile') && $('upFile').files && $('upFile').files[0];
      const poster = $('upPoster') && $('upPoster').files && $('upPoster').files[0];
      if (target === 'photos' && !file) { this.setFeedback('upFeedback', 'Photo requires an image (jpeg, png, webp)', false); return; }
      if (target === 'videos' && !file) { this.setFeedback('upFeedback', 'Video requires mp4 or webm', false); return; }
      if (target === 'posts' && !description && !file) { this.setFeedback('upFeedback', 'Add text or media', false); return; }
      if (this.busy) return;
      this.busy = true; this.setFeedback('upFeedback', 'Uploading…'); this.setProgress(10);
      try {
        let media_key = '', image_url = '', video_url = '', thumbnail_url = '', poster_key = '';
        if (file && window.HshsStorage && window.HshsStorage.uploadAdmin) {
          this.setProgress(30);
          const up = await window.HshsStorage.uploadAdmin(file);
          media_key = up.key;
          if (file.type.indexOf('video/') === 0) video_url = up.url; else { image_url = up.url; thumbnail_url = up.url; }
          this.setProgress(60);
        }
        if (poster && window.HshsStorage && window.HshsStorage.uploadAdmin) {
          const up2 = await window.HshsStorage.uploadAdmin(poster);
          poster_key = up2.key; thumbnail_url = up2.url; this.setProgress(75);
        }
        const payload = {
          target, title: title || (target === 'posts' ? 'Untitled' : target === 'photos' ? 'Photo' : 'Video'),
          description, category, class_tag, media_key, image_url, video_url, thumbnail_url, poster_key, feature,
          status: target === 'posts' ? status : 'published',
          type: file && file.type.indexOf('video/') === 0 ? 'video' : 'photo'
        };
        this.setProgress(90);
        await window.adminApi.createContent(payload);
        this.setProgress(100);
        if ($('upTitle')) $('upTitle').value = ''; if ($('upDesc')) $('upDesc').value = '';
        if ($('upFile')) $('upFile').value = ''; if ($('upPoster')) $('upPoster').value = '';
        if ($('upFeature')) $('upFeature').checked = false;
        this.setFeedback('upFeedback', status === 'draft' ? 'Draft saved' : 'Published', true);
        await Promise.all([this.loadRecentItems(), this.loadOfficialPosts()]);
      } catch (e) {
        this.setFeedback('upFeedback', e.message || 'Could not save', false);
      } finally {
        this.busy = false; setTimeout(() => this.setProgress(null), 600);
      }
    }

    async loadRecentItems() {
      const box = $('recentItems'); if (!box) return;
      if (!window.db) { box.innerHTML = '<div class="admin-empty">Database is not available yet.</div>'; return; }
      try {
        const [posts, photos, videos] = await Promise.all([window.db.getPosts(8, 0), window.db.getPhotos(8, 0), window.db.getVideos(6, 0)]);
        this.items = [].concat((posts || []).map(i => Object.assign({}, i, { _col: 'posts' })), (photos || []).map(i => Object.assign({}, i, { _col: 'photos' })), (videos || []).map(i => Object.assign({}, i, { _col: 'videos' }))).slice(0, 12);
        if ($('adminPostCount')) $('adminPostCount').textContent = String((posts || []).length);
        if ($('adminPhotoCount')) $('adminPhotoCount').textContent = String((photos || []).length);
        if ($('adminVideoCount')) $('adminVideoCount').textContent = String((videos || []).length);
        if (!this.items.length) { box.innerHTML = '<div class="admin-empty">No content yet.</div>'; return; }
        box.innerHTML = this.items.map(it => {
          const pinned = !!it.featured;
          return '<article class="admin-item-row"><span class="admin-type-icon"><i class="fa-solid ' + (it._col === 'videos' ? 'fa-film' : 'fa-image') + '"></i></span><div class="admin-item-copy"><strong>' + esc(it.title || 'Untitled') + '</strong><small>' + esc(it._col) + (pinned ? ' · pinned' : '') + '</small></div><button class="admin-btn ' + (pinned ? 'admin-btn-quiet' : 'admin-btn-primary') + ' admin-pin-one" type="button" data-id="' + esc(it.id) + '" data-col="' + it._col + '" data-featured="' + (pinned ? '1' : '0') + '">' + (pinned ? 'Unpin' : 'Pin') + '</button></article>';
        }).join('');
        box.querySelectorAll('.admin-pin-one').forEach(btn => {
          btn.addEventListener('click', () => { $('pinId').value = btn.dataset.id; $('pinCol').value = btn.dataset.col; this.pinItem(btn.dataset.featured !== '1'); });
        });
      } catch (e) { box.innerHTML = '<div class="admin-empty">Could not load items.</div>'; }
    }

    async pinItem(featured) {
      const id = (($('pinId') && $('pinId').value) || '').trim();
      const col = ($('pinCol') && $('pinCol').value) || 'posts';
      if (!id || !ALLOWED.has(col) || this.busy) return;
      this.busy = true;
      try { await window.adminApi.feature(id, featured, col); await this.loadRecentItems(); this.setFeedback('adminFeedback', featured ? 'Pinned' : 'Unpinned', true); }
      catch (e) { this.setFeedback('adminFeedback', e.message || 'Could not update', false); }
      finally { this.busy = false; }
    }

    async addEvent() {
      const title = (($('evTitle') && $('evTitle').value) || '').trim();
      const date = ($('evDate') && $('evDate').value) || '';
      const place = (($('evPlace') && $('evPlace').value) || '').trim();
      if (!title || !date || this.busy) return;
      this.busy = true;
      try {
        await window.adminApi.createEvent({ title, date, location: place });
        if ($('evTitle')) $('evTitle').value = ''; if ($('evDate')) $('evDate').value = ''; if ($('evPlace')) $('evPlace').value = '';
        await this.loadEventsList(); this.setFeedback('adminFeedback', 'Event added', true);
      } catch (e) { this.setFeedback('adminFeedback', e.message || 'Could not add event', false); }
      finally { this.busy = false; }
    }

    async loadEventsList() {
      const box = $('eventsList'); if (!box) return;
      try {
        const sb = window.supabase; if (!sb) return;
        const { data, error } = await sb.from('events').select('*').order('date', { ascending: true }).limit(20);
        if (error) throw error;
        if ($('adminEventCount')) $('adminEventCount').textContent = String((data || []).length);
        if (!data || !data.length) { box.innerHTML = '<div class="admin-empty">No events yet.</div>'; return; }
        box.innerHTML = data.map(ev => '<article class="admin-event-row"><div class="admin-event-copy"><strong>' + esc(ev.title || '') + '</strong><small>' + esc(ev.date || '') + (ev.location ? ' · ' + esc(ev.location) : '') + '</small></div><button class="admin-icon-btn" type="button" data-id="' + esc(ev.id) + '" title="Delete"><i class="fa-solid fa-trash"></i></button></article>').join('');
        box.querySelectorAll('.admin-icon-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this event?')) return;
            try { await window.adminApi.deleteEvent(btn.dataset.id); await this.loadEventsList(); } catch (e) {}
          });
        });
      } catch (e) { box.innerHTML = '<div class="admin-empty">Could not load events.</div>'; }
    }

    async loadOfficialPosts() {
      const box = $('officialList'); if (!box) return;
      try {
        const res = await window.adminApi.listPosts();
        this.official = res.posts || res || [];
        if (!this.official.length) { box.innerHTML = '<div class="admin-empty">No official posts yet.</div>'; return; }
        box.innerHTML = this.official.map(p => {
          const badge = p.status === 'draft' ? 'Draft' : 'Published';
          return '<article class="admin-item-row"><div class="admin-item-copy"><strong>' + esc(p.title || 'Untitled') + '</strong><small>' + badge + ' · ' + esc((p.description || '').slice(0, 60)) + '</small></div><button class="admin-btn admin-btn-quiet" data-id="' + esc(p.id) + '" data-action="toggle">' + (p.status === 'draft' ? 'Publish' : 'Unpublish') + '</button><button class="admin-icon-btn" data-id="' + esc(p.id) + '" data-action="delete" title="Delete"><i class="fa-solid fa-trash"></i></button></article>';
        }).join('');
        box.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => this.handleOfficialAction(btn.dataset.id, btn.dataset.action));
        });
      } catch (e) { box.innerHTML = '<div class="admin-empty">Could not load official posts.</div>'; }
    }

    async handleOfficialAction(id, action) {
      if (action === 'delete' && !confirm('Delete this official post?')) return;
      try {
        if (action === 'delete') await window.adminApi.deleteContent('posts', id);
        else {
          const post = this.official.find(p => p.id === id);
          const next = post && post.status === 'draft' ? 'published' : 'draft';
          await window.adminApi.updateContent('posts', id, { status: next });
        }
        await this.loadOfficialPosts();
      } catch (e) { this.setFeedback('upFeedback', e.message || 'Action failed', false); }
    }
  }

  function boot() {
    if (window.adminDashboard) return;
    if (!$('adminPanels')) { setTimeout(boot, 100); return; }
    window.adminDashboard = new AdminDashboard();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
