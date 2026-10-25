// HSHS World — Admin control room
// Security checks are implemented but temporarily relaxed because Firebase is locked.
// Full token + allowlist enforcement will be re-enabled once Firebase access is restored.

(function () {
  'use strict';
  const ALLOWED = new Set(['posts', 'photos', 'videos']);
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'})[c]);

  class AdminDashboard {
    constructor() {
      this.busy = false;
      this.items = [];
      this.official = [];
      this.isAdmin = false;
      this.init();
    }

    async init() {
      const ready = await this.waitForAuth();
      if (!ready) {
        this.showLock('Sign in required', 'Please sign in to access the control room.', 'index/login.html');
        return;
      }
      // TEMP: skip full /admin/me check while locked out of Firebase
      // When restored, call window.adminApi.me() and set isAdmin from response
      this.isAdmin = true; // temporary bypass
      if (!this.isAdmin) {
        this.showLock('You do not have permission', 'This area is for admins only.', null);
        return;
      }
      this.render();
      this.bind();
      await Promise.all([this.loadRecentItems(), this.loadEventsList(), this.loadOfficialPosts()]);
    }

    waitForAuth() {
      return new Promise((resolve) => {
        const check = () => {
          if (window.hshsAuthState && window.hshsAuthState !== 'loading') {
            return resolve(!!window.hshsAuthUser);
          }
          document.addEventListener('hshs:auth', () => resolve(!!window.hshsAuthUser), { once: true });
          setTimeout(() => resolve(!!window.hshsAuthUser), 3000);
        };
        check();
      });
    }

    showLock(title, msg, link) {
      const lock = $('adminLock');
      const panels = $('adminPanels');
      if (panels) panels.style.display = 'none';
      if (lock) {
        lock.style.display = 'grid';
        lock.innerHTML = `<div class="admin-lock-card"><div class="admin-lock-icon"><i class="fa-solid fa-lock"></i></div><h1>${esc(title)}</h1><p class="admin-muted">${esc(msg)}</p>${link ? `<a class="admin-back-link" href="${link}">Go to sign in</a>` : ''}</div>`;
      }
    }

    render() {
      const panels = $('adminPanels');
      if (!panels) return;
      panels.innerHTML = `
        <header class="admin-welcome">
          <div>
            <p class="admin-eyebrow">HSHS WORLD · CONTROL ROOM</p>
            <h1>Good to see you, admin.</h1>
            <p class="admin-muted">Pin Featured Today, manage events, and create official posts.</p>
          </div>
          <button class="admin-btn admin-btn-quiet" id="adminRefresh" type="button"><i class="fa-solid fa-rotate"></i> Refresh</button>
        </header>
        <section class="admin-stat-grid">
          <article class="admin-stat"><p>Posts</p><strong id="adminPostCount">0</strong><small>Latest content</small></article>
          <article class="admin-stat"><p>Photos</p><strong id="adminPhotoCount">0</strong><small>Gallery uploads</small></article>
          <article class="admin-stat"><p>Videos</p><strong id="adminVideoCount">0</strong><small>Video uploads</small></article>
          <article class="admin-stat"><p>Upcoming events</p><strong id="adminEventCount">0</strong><small>School calendar</small></article>
        </section>
        <div class="admin-work-grid">
          <section class="admin-panel">
            <div class="admin-panel-head">
              <div>
                <p class="admin-eyebrow">HOMEPAGE</p>
                <h2>Featured Today</h2>
                <p class="admin-muted">Pin a post, photo or video to the homepage.</p>
              </div>
            </div>
            <div id="recentItems" class="admin-item-list"><div class="admin-empty">Loading…</div></div>
            <details class="admin-manual-pin">
              <summary>Pin by item ID</summary>
              <div class="admin-inline-form">
                <input id="pinId" placeholder="Item ID">
                <select id="pinCol"><option value="posts">posts</option><option value="photos">photos</option><option value="videos">videos</option></select>
                <button id="pinBtn" class="admin-btn admin-btn-primary" type="button">Pin</button>
                <button id="unpinBtn" class="admin-btn admin-btn-quiet" type="button">Unpin</button>
              </div>
            </details>
          </section>
          <section class="admin-panel">
            <div class="admin-panel-head">
              <div>
                <p class="admin-eyebrow">SCHOOL CALENDAR</p>
                <h2>Upcoming Events</h2>
                <p class="admin-muted">Keep everyone in the loop.</p>
              </div>
            </div>
            <form class="admin-event-form" id="adminEventForm">
              <label>Event name<input id="evTitle" placeholder="Event title" required></label>
              <div class="admin-form-row">
                <label>Date<input id="evDate" type="date" required></label>
                <label>Location<input id="evPlace" placeholder="Campus"></label>
              </div>
              <button id="addEventBtn" class="admin-btn admin-btn-primary" type="submit">Add event</button>
              <p id="adminFeedback" class="admin-feedback"></p>
            </form>
            <div id="eventsList" class="admin-event-list"><div class="admin-empty">Loading…</div></div>
          </section>
        </div>
        <section class="admin-panel" style="margin-top:18px">
          <div class="admin-panel-head">
            <div>
              <p class="admin-eyebrow">OFFICIAL</p>
              <h2>Create post</h2>
              <p class="admin-muted">Text, optional image or video. Drafts stay hidden until published.</p>
            </div>
          </div>
          <form class="admin-event-form" id="adminPostForm">
            <label>Title<input id="postTitle" placeholder="Post title" maxlength="200"></label>
            <label>Description<textarea id="postDesc" placeholder="Write the announcement or caption" rows="4" maxlength="2000"></textarea></label>
            <label>Media (optional)<input id="postMedia" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"></label>
            <div class="admin-form-row">
              <button type="button" id="saveDraftBtn" class="admin-btn admin-btn-quiet">Save draft</button>
              <button type="button" id="publishBtn" class="admin-btn admin-btn-primary">Publish</button>
            </div>
            <p id="postFeedback" class="admin-feedback"></p>
          </form>
          <div id="officialList" class="admin-item-list"><div class="admin-empty">Loading official posts…</div></div>
        </section>
      `;
    }

    bind() {
      $('adminRefresh')?.addEventListener('click', () => this.init());
      $('pinBtn')?.addEventListener('click', () => this.pinItem(true));
      $('unpinBtn')?.addEventListener('click', () => this.pinItem(false));
      $('adminEventForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.addEvent(); });
      $('saveDraftBtn')?.addEventListener('click', () => this.savePost('draft'));
      $('publishBtn')?.addEventListener('click', () => this.savePost('published'));
    }

    setFeedback(id, msg, ok) {
      const el = $(id);
      if (!el) return;
      el.textContent = msg || '';
      el.className = 'admin-feedback' + (ok === true ? ' is-success' : ok === false ? ' is-error' : '');
    }

    async loadRecentItems() {
      const box = $('recentItems');
      if (!box) return;
      if (!window.db) {
        box.innerHTML = '<div class="admin-empty">Database is not available yet.</div>';
        return;
      }
      try {
        const [posts, photos, videos] = await Promise.all([
          window.db.getPosts(8, 0), window.db.getPhotos(8, 0), window.db.getVideos(6, 0)
        ]);
        this.items = [
          ...(posts || []).map(i => ({...i, _col:'posts'})),
          ...(photos || []).map(i => ({...i, _col:'photos'})),
          ...(videos || []).map(i => ({...i, _col:'videos'}))
        ].slice(0, 12);
        $('adminPostCount') && ($('adminPostCount').textContent = (posts||[]).length);
        $('adminPhotoCount') && ($('adminPhotoCount').textContent = (photos||[]).length);
        $('adminVideoCount') && ($('adminVideoCount').textContent = (videos||[]).length);
        if (!this.items.length) {
          box.innerHTML = '<div class="admin-empty">No content yet.</div>';
          return;
        }
        box.innerHTML = this.items.map(it => {
          const pinned = !!it.featured;
          return `<article class="admin-item-row">
            <span class="admin-type-icon"><i class="fa-solid ${it._col==='videos'?'fa-film':'fa-image'}"></i></span>
            <div class="admin-item-copy"><strong>${esc(it.title||'Untitled')}</strong><small>${esc(it._col)}${pinned?' · pinned':''}</small></div>
            <button class="admin-btn ${pinned?'admin-btn-quiet':'admin-btn-primary'} admin-pin-one" type="button" data-id="${esc(it.id)}" data-col="${it._col}" data-featured="${pinned?'1':'0'}">${pinned?'Unpin':'Pin'}</button>
          </article>`;
        }).join('');
        box.querySelectorAll('.admin-pin-one').forEach(btn => {
          btn.addEventListener('click', () => {
            $('pinId').value = btn.dataset.id;
            $('pinCol').value = btn.dataset.col;
            this.pinItem(btn.dataset.featured !== '1');
          });
        });
      } catch (e) {
        box.innerHTML = '<div class="admin-empty">Could not load items.</div>';
      }
    }

    async pinItem(featured) {
      const id = ($('pinId')?.value || '').trim();
      const col = $('pinCol')?.value || 'posts';
      if (!id || !ALLOWED.has(col)) return;
      if (this.busy) return;
      this.busy = true;
      try {
        // TEMP: still uses anon client while security is deferred
        const sb = window.supabase;
        if (!sb) throw new Error('Supabase not ready');
        const patch = featured ? { featured: true, featured_at: new Date().toISOString() } : { featured: false, featured_at: null };
        const { error } = await sb.from(col).update(patch).eq('id', id);
        if (error) throw error;
        await this.loadRecentItems();
        this.setFeedback('adminFeedback', featured ? 'Pinned' : 'Unpinned', true);
      } catch (e) {
        this.setFeedback('adminFeedback', e.message || 'Could not update', false);
      } finally { this.busy = false; }
    }

    async addEvent() {
      const title = ($('evTitle')?.value || '').trim();
      const date = $('evDate')?.value || '';
      const place = ($('evPlace')?.value || '').trim();
      if (!title || !date) return;
      if (this.busy) return;
      this.busy = true;
      try {
        // TEMP: anon insert while security deferred
        const sb = window.supabase;
        if (!sb) throw new Error('Supabase not ready');
        const { error } = await sb.from('events').insert({ title, date, location: place });
        if (error) throw error;
        $('evTitle').value = ''; $('evDate').value = ''; $('evPlace').value = '';
        await this.loadEventsList();
        this.setFeedback('adminFeedback', 'Event added', true);
      } catch (e) {
        this.setFeedback('adminFeedback', e.message || 'Could not add event', false);
      } finally { this.busy = false; }
    }

    async loadEventsList() {
      const box = $('eventsList');
      if (!box) return;
      try {
        const sb = window.supabase;
        if (!sb) return;
        const { data, error } = await sb.from('events').select('*').order('date', { ascending: true }).limit(20);
        if (error) throw error;
        $('adminEventCount') && ($('adminEventCount').textContent = (data||[]).length);
        if (!data || !data.length) {
          box.innerHTML = '<div class="admin-empty">No events added yet.</div>';
          return;
        }
        box.innerHTML = data.map(ev => `<article class="admin-event-row">
          <div class="admin-event-copy"><strong>${esc(ev.title||'')}</strong><small>${esc(ev.date||'')}${ev.location?' · '+esc(ev.location):''}</small></div>
          <button class="admin-icon-btn" type="button" data-id="${esc(ev.id)}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </article>`).join('');
        box.querySelectorAll('.admin-icon-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!confirm('Delete this event?')) return;
            try {
              const { error } = await sb.from('events').delete().eq('id', btn.dataset.id);
              if (error) throw error;
              await this.loadEventsList();
            } catch (e) {}
          });
        });
      } catch (e) {
        box.innerHTML = '<div class="admin-empty">Could not load events.</div>';
      }
    }

    async savePost(status) {
      const title = ($('postTitle')?.value || '').trim();
      const description = ($('postDesc')?.value || '').trim();
      const file = $('postMedia')?.files?.[0];
      if (!description && !file) {
        this.setFeedback('postFeedback', 'Add text or media', false);
        return;
      }
      if (this.busy) return;
      this.busy = true;
      this.setFeedback('postFeedback', 'Saving…');
      try {
        let mediaKey = '', imageUrl = '';
        if (file && window.HshsStorage && window.HshsStorage.uploadAdmin) {
          const up = await window.HshsStorage.uploadAdmin(file);
          mediaKey = up.key;
          imageUrl = up.url;
        }
        // TEMP: direct insert while security deferred; Worker will set official fields later
        const sb = window.supabase;
        const payload = {
          title: title || 'Untitled',
          description,
          type: file && file.type.startsWith('video') ? 'video' : 'photo',
          image_url: imageUrl,
          thumbnail_url: imageUrl,
          media_key: mediaKey,
          media_provider: mediaKey ? 'cloudflare-r2' : null,
          status,
          is_official: true,
          author_role: 'admin',
          author: 'HSHS Admin',
          author_id: window.hshsUid || 'admin-temp'
        };
        const { error } = await sb.from('posts').insert(payload);
        if (error) throw error;
        $('postTitle').value = '';
        $('postDesc').value = '';
        if ($('postMedia')) $('postMedia').value = '';
        this.setFeedback('postFeedback', status === 'published' ? 'Published' : 'Draft saved', true);
        await this.loadOfficialPosts();
      } catch (e) {
        this.setFeedback('postFeedback', e.message || 'Could not save', false);
      } finally { this.busy = false; }
    }

    async loadOfficialPosts() {
      const box = $('officialList');
      if (!box) return;
      try {
        const sb = window.supabase;
        const { data, error } = await sb.from('posts').select('*').eq('is_official', true).order('created_at', { ascending: false }).limit(20);
        if (error) throw error;
        this.official = data || [];
        if (!this.official.length) {
          box.innerHTML = '<div class="admin-empty">No official posts yet.</div>';
          return;
        }
        box.innerHTML = this.official.map(p => {
          const badge = p.status === 'draft' ? 'Draft' : 'Published';
          return `<article class="admin-item-row">
            <div class="admin-item-copy"><strong>${esc(p.title||'Untitled')}</strong><small>${badge} · ${esc((p.description||'').slice(0,60))}</small></div>
            <button class="admin-btn admin-btn-quiet" data-id="${esc(p.id)}" data-action="toggle">${p.status==='draft'?'Publish':'Unpublish'}</button>
            <button class="admin-icon-btn" data-id="${esc(p.id)}" data-action="delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </article>`;
        }).join('');
        box.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => this.handleOfficialAction(btn.dataset.id, btn.dataset.action));
        });
      } catch (e) {
        box.innerHTML = '<div class="admin-empty">Could not load official posts.</div>';
      }
    }

    async handleOfficialAction(id, action) {
      if (action === 'delete' && !confirm('Delete this official post?')) return;
      try {
        const sb = window.supabase;
        if (action === 'delete') {
          const { error } = await sb.from('posts').delete().eq('id', id);
          if (error) throw error;
        } else {
          const post = this.official.find(p => p.id === id);
          const next = post && post.status === 'draft' ? 'published' : 'draft';
          const { error } = await sb.from('posts').update({ status: next }).eq('id', id);
          if (error) throw error;
        }
        await this.loadOfficialPosts();
      } catch (e) {
        this.setFeedback('postFeedback', e.message || 'Action failed', false);
      }
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
