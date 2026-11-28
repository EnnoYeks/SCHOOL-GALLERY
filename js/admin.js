// HSHS World — Admin control room

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
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const safeMediaUrl = (v) => { const s = String(v || '').trim(); if (/^https:\/\/pub-cf880c90c5ff4ca697baac59284a6024\.r2\.dev\/[\w./-]+$/i.test(s) && !s.includes('..')) return s; if (/^\/assets\/[\w./-]+$/i.test(s) && !s.includes('..')) return s; return ''; };

  class AdminDashboard {
    constructor() {
      this.busy = false; this.items = []; this.official = []; this.isAdmin = false; this.uploadTarget = 'posts';
      this.init();
    }

    async init() {
      const ready = await this.waitForAuth();
      if (!ready) {
        this.showLock('Sign in required', 'Please sign in to access the control room.', '/login/');
        return;
      }
      this.isAdmin = false;
      try {
        if (!window.adminApi || typeof window.adminApi.createContent !== 'function') throw new Error('Admin API unavailable');
        const saved = await window.adminApi.createContent(payload);
        if (!saved) throw new Error('Worker did not return the saved record');
        if (feature && saved.id) await window.adminApi.feature(saved.id, true, target);
        this.setProgress(100);
        progress.done('Done');
        progress.hide();
        if ($('upTitle')) $('upTitle').value = ''; if ($('upDesc')) $('upDesc').value = '';
        if ($('upFile')) $('upFile').value = ''; if ($('upPoster')) $('upPoster').value = '';
        if ($('upFeature')) $('upFeature').checked = false;
        this.setFeedback('upFeedback', status === 'draft' ? 'Draft saved' : 'Published — check Home Featured', true);
        await Promise.all([this.loadRecentItems(), this.loadOfficialPosts()]);
      } catch (e) {
        this.setFeedback('upFeedback', e.message || 'Could not save', false);
        if (progress && progress.fail) progress.fail(e.message || 'Could not save');
      } finally {
        this.busy = false; this.setProgress(null);
      }
    }

    async loadRecentItems() {
      const box = $('recentItems'); if (!box) return;
      if (!window.db) { box.innerHTML = '<div class="admin-empty">Database is not available yet.</div>'; return; }
      try {
        const [posts, photos, videos] = await Promise.all([
          window.db.getPosts ? window.db.getPosts(8, 0) : [],
          window.db.getPhotos ? window.db.getPhotos(8, 0) : [],
          window.db.getVideos ? window.db.getVideos(6, 0) : []
        ]);
        this.items = [].concat(
          (posts || []).map(i => Object.assign({}, i, { _col: 'posts' })),
          (photos || []).map(i => Object.assign({}, i, { _col: 'photos' })),
          (videos || []).map(i => Object.assign({}, i, { _col: 'videos' }))
        ).slice(0, 12);
        if ($('adminPostCount')) $('adminPostCount').textContent = String((posts || []).length);
        if ($('adminPhotoCount')) $('adminPhotoCount').textContent = String((photos || []).length);
        if ($('adminVideoCount')) $('adminVideoCount').textContent = String((videos || []).length);
        if (!this.items.length) { box.innerHTML = '<div class="admin-empty">No content yet.</div>'; return; }
        box.innerHTML = this.items.map(it => {
          const pinned = !!it.featured;
          const media = safeMediaUrl(it.image_url || it.imageUrl || it.thumbnail_url || it.image || '');
          return '<article class="admin-item-row" data-id="' + esc(it.id) + '" data-col="' + it._col + '">' +
            (media ? '<span class="admin-type-icon" style="background-image:url(\'' + esc(media) + '\');background-size:cover"></span>' :
              '<span class="admin-type-icon"><i class="fa-solid ' + (it._col === 'videos' ? 'fa-film' : 'fa-image') + '"></i></span>') +
            '<div class="admin-item-copy"><strong>' + esc(it.title || 'Untitled') + '</strong><small>' + esc(it._col) + (pinned ? ' · on Home' : '') + '</small></div>' +
            '<button class="admin-btn ' + (pinned ? 'admin-btn-quiet' : 'admin-btn-primary') + ' admin-pin-one" type="button" data-id="' + esc(it.id) + '" data-col="' + it._col + '" data-featured="' + (pinned ? '1' : '0') + '">' + (pinned ? 'Unpin Home' : 'Pin Home') + '</button>' +
            '<button class="admin-icon-btn admin-edit-one" type="button" data-id="' + esc(it.id) + '" data-col="' + it._col + '" title="Edit title"><i class="fa-solid fa-pen"></i></button>' +
            '<button class="admin-icon-btn admin-del-one" type="button" data-id="' + esc(it.id) + '" data-col="' + it._col + '" title="Delete"><i class="fa-solid fa-trash"></i></button></article>';
        }).join('');
        box.querySelectorAll('.admin-pin-one').forEach(btn => {
          btn.addEventListener('click', () => { if ($('pinId')) $('pinId').value = btn.dataset.id; if ($('pinCol')) $('pinCol').value = btn.dataset.col; this.pinItem(btn.dataset.featured !== '1'); });
        });
        box.querySelectorAll('.admin-edit-one').forEach(btn => {
          btn.addEventListener('click', () => this.editItem(btn.dataset.id, btn.dataset.col));
        });
        box.querySelectorAll('.admin-del-one').forEach(btn => {
          btn.addEventListener('click', () => this.deleteItem(btn.dataset.id, btn.dataset.col));
        });
      } catch (e) { box.innerHTML = '<div class="admin-empty">Could not load items.</div>'; }
    }

    async pinItem(featured) {
      const id = (($('pinId') && $('pinId').value) || '').trim();
      const col = ($('pinCol') && $('pinCol').value) || 'posts';
      if (!id || !ALLOWED.has(col) || this.busy) return;
      this.busy = true;
      try {
        if (!window.adminApi || typeof window.adminApi.feature !== 'function') throw new Error('Admin API unavailable');
        await window.adminApi.feature(id, featured, col);
        await this.loadRecentItems();
        this.setFeedback('adminFeedback', featured ? 'Pinned on Home' : 'Removed from Home', true);
      } catch (e) { this.setFeedback('adminFeedback', e.message || 'Could not update', false); }
      finally { this.busy = false; }
    }

    async editItem(id, col) {
      const it = this.items.find(x => String(x.id) === String(id) && x._col === col);
      const title = prompt('Title for home / feed', (it && it.title) || '');
      if (title == null) return;
      const description = prompt('Description / caption', (it && (it.description || it.caption)) || '');
      if (description == null) return;
      try {
        if (!window.adminApi || typeof window.adminApi.updateContent !== 'function') throw new Error('Admin API unavailable');
        await window.adminApi.updateContent(col, id, { title: title.trim().slice(0, 200), description: description.trim().slice(0, 2000) });
        await this.loadRecentItems();
        this.setFeedback('upFeedback', 'Updated for home', true);
      } catch (e) {
        this.setFeedback('upFeedback', (e && e.message) || 'Could not edit', false);
      }
    }

    async deleteItem(id, col) {
      if (!confirm('Delete this item from the site?')) return;
      try {
        if (!window.adminApi || typeof window.adminApi.deleteContent !== 'function') throw new Error('Admin API unavailable');
        await window.adminApi.deleteContent(col, id);
        await this.loadRecentItems();
        this.setFeedback('upFeedback', 'Deleted', true);
      } catch (e) {
        this.setFeedback('upFeedback', (e && e.message) || 'Could not delete', false);
      }
    }

    async addEvent() {
      const title = (($('evTitle') && $('evTitle').value) || '').trim();
      const date = ($('evDate') && $('evDate').value) || '';
      const place = (($('evPlace') && $('evPlace').value) || '').trim();
      if (!title || !date || this.busy) return;
      this.busy = true;
      try {
        if (!window.adminApi || typeof window.adminApi.createEvent !== 'function') throw new Error('Admin API unavailable');
        await window.adminApi.createEvent({ title, date, location: place });
        if ($('evTitle')) $('evTitle').value = ''; if ($('evDate')) $('evDate').value = ''; if ($('evPlace')) $('evPlace').value = '';
        await this.loadEventsList(); this.setFeedback('adminFeedback', 'Event added', true);
      } catch (e) { this.setFeedback('adminFeedback', e.message || 'Could not add event', false); }
      finally { this.busy = false; }
    }

    async loadEventsList() {
      const box = $('eventsList'); if (!box) return;
      try {
        const sb = window.supabase; if (!sb) { box.innerHTML = '<div class="admin-empty">Events need database.</div>'; return; }
        const { data, error } = await sb.from('events').select('*').order('date', { ascending: true }).limit(20);
        if (error) throw error;
        if ($('adminEventCount')) $('adminEventCount').textContent = String((data || []).length);
        if (!data || !data.length) { box.innerHTML = '<div class="admin-empty">No events yet.</div>'; return; }
        box.innerHTML = data.map(ev => '<article class="admin-event-row"><div class="admin-event-copy"><strong>' + esc(ev.title || '') + '</strong><small>' + esc(ev.date || '') + (ev.location ? ' · ' + esc(ev.location) : '') + '</small></div><button class="admin-icon-btn" type="button" data-id="' + esc(ev.id) + '" title="Delete"><i class="fa-solid fa-trash"></i></button></article>').join('');
        box.querySelectorAll('.admin-icon-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this event?')) return;
            try {
              if (!window.adminApi || typeof window.adminApi.deleteEvent !== 'function') throw new Error('Admin API unavailable');
              await window.adminApi.deleteEvent(btn.dataset.id);
              await this.loadEventsList();
            } catch (e) { this.setFeedback('adminFeedback', e.message || 'Could not delete event', false); }
          });
        });
      } catch (e) { box.innerHTML = '<div class="admin-empty">Could not load events.</div>'; }
    }

    async loadOfficialPosts() {
      const box = $('officialList'); if (!box) return;
      try {
        if (!window.adminApi || !window.adminApi.listPosts) {
          box.innerHTML = '<div class="admin-empty">Official list needs Worker admin routes.</div>';
          return;
        }
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
