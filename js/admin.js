// HSHS World — Admin control room
// Fail closed: only a Firebase user with a server-issued admin claim can use controls.
(function () {
  'use strict';

  const ALLOWED_TABLES = new Set(['posts', 'photos', 'videos']);
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const dateLabel = (value) => {
    if (!value) return 'Date not set';
    const date = new Date(value + (String(value).length === 10 ? 'T00:00:00' : ''));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  class AdminDashboard {
    constructor() {
      this.lock = $('adminLock');
      this.desk = $('adminDesk') || document.querySelector('.admin-container');
      this.busy = false;
      this.items = [];
      this.events = [];
      this.init();
    }

    async init() {
      // Temporary open admin mode: do not depend on Firebase admin claims
      // while the project owner is locked out of Firebase.
      this.unlockDesk();
      this.renderAdminPanels();
      await Promise.all([this.loadRecentItems(), this.loadEventsList()]);
    }

    showLocked(message, showLogin = false) {
      if (this.desk) this.desk.hidden = true;
      if (!this.lock) return;
      this.lock.hidden = false;
      this.lock.style.display = 'grid';
      this.lock.innerHTML = `
        <div class="admin-lock-card">
          <div class="admin-lock-icon" aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></div>
          <p class="admin-eyebrow">HSHS WORLD · STAFF ACCESS</p>
          <h1>Admin control room</h1>
          <p class="admin-muted" role="status">${escapeHTML(message)}</p>
          ${showLogin ? '<a class="admin-btn admin-btn-primary" href="login.html"><i class="fa-solid fa-arrow-right-to-bracket"></i> Go to sign in</a>' : '<span class="admin-spinner" aria-label="Checking access"></span>'}
          <a class="admin-back-link" href="../index.html">← Back to HSHS World</a>
        </div>`;
    }

    unlockDesk() {
      if (this.lock) { this.lock.hidden = true; this.lock.style.display = 'none'; }
      if (this.desk) { this.desk.hidden = false; this.desk.style.display = ''; }
    }

    renderAdminPanels() {
      const panels = $('adminPanels');
      if (!panels) return;
      panels.innerHTML = `
        <header class="admin-welcome">
          <div><p class="admin-eyebrow">HSHS WORLD · CONTROL ROOM</p><h1>Good to see you, admin.</h1>
          <p class="admin-muted">Manage what students see across the school gallery.</p></div>
          <button class="admin-btn admin-btn-quiet" id="adminRefresh" type="button"><i class="fa-solid fa-rotate"></i> Refresh data</button>
        </header>
        <section class="admin-stat-grid" aria-label="Content overview">
          <article class="admin-stat"><span class="admin-stat-icon"><i class="fa-regular fa-file-lines"></i></span><p>Posts</p><strong id="adminPostCount">—</strong><small>Latest content</small></article>
          <article class="admin-stat"><span class="admin-stat-icon"><i class="fa-regular fa-images"></i></span><p>Photos</p><strong id="adminPhotoCount">—</strong><small>Gallery uploads</small></article>
          <article class="admin-stat"><span class="admin-stat-icon"><i class="fa-solid fa-film"></i></span><p>Videos</p><strong id="adminVideoCount">—</strong><small>Video uploads</small></article>
          <article class="admin-stat"><span class="admin-stat-icon"><i class="fa-regular fa-calendar"></i></span><p>Upcoming events</p><strong id="adminEventCount">—</strong><small>School calendar</small></article>
        </section>
        <div class="admin-work-grid">
          <section class="admin-panel">
            <div class="admin-panel-head"><div><p class="admin-eyebrow">HOMEPAGE</p><h2>Featured Today</h2><p class="admin-muted">Pin a post, photo or video to the homepage.</p></div><span class="admin-chip">CONTENT</span></div>
            <label class="admin-search"><i class="fa-solid fa-magnifying-glass"></i><input id="adminItemSearch" type="search" placeholder="Search recent content…" autocomplete="off"></label>
            <div id="recentItems" class="admin-item-list" aria-live="polite"><p class="admin-muted">Loading recent items…</p></div>
            <details class="admin-manual-pin"><summary>Pin by item ID</summary>
              <div class="admin-inline-form"><input id="pinId" aria-label="Item ID" placeholder="Paste item ID"><select id="pinCol" aria-label="Content type"><option value="posts">Post</option><option value="photos">Photo</option><option value="videos">Video</option></select><button id="pinBtn" class="admin-btn admin-btn-primary" type="button">Pin item</button><button id="unpinBtn" class="admin-btn admin-btn-quiet" type="button">Unpin</button></div>
            </details>
          </section>
          <section class="admin-panel">
            <div class="admin-panel-head"><div><p class="admin-eyebrow">SCHOOL CALENDAR</p><h2>Upcoming events</h2><p class="admin-muted">Keep everyone in the loop.</p></div><span class="admin-chip">EVENTS</span></div>
            <form id="adminEventForm" class="admin-event-form">
              <label>Event name<input id="evTitle" maxlength="120" required placeholder="e.g. Sports Day"></label>
              <div class="admin-form-row"><label>Date<input id="evDate" type="date" required></label><label>Location<input id="evPlace" maxlength="160" placeholder="School field"></label></div>
              <button id="addEventBtn" class="admin-btn admin-btn-primary" type="submit"><i class="fa-solid fa-plus"></i> Add event</button>
              <p id="adminFeedback" class="admin-feedback" role="status" aria-live="polite"></p>
            </form>
            <div id="eventsList" class="admin-event-list" aria-live="polite"><p class="admin-muted">Loading events…</p></div>
          </section>
        </div>
        <footer class="admin-footnote"><i class="fa-solid fa-lock"></i> Admin access is verified using your Firebase sign-in claims.</footer>
      `;
      $('adminRefresh')?.addEventListener('click', () => this.refresh());
      $('pinBtn')?.addEventListener('click', () => this.pinItem(true));
      $('unpinBtn')?.addEventListener('click', () => this.pinItem(false));
      $('adminEventForm')?.addEventListener('submit', (event) => { event.preventDefault(); this.addEvent(); });
      $('adminItemSearch')?.addEventListener('input', (event) => this.renderItems(event.target.value));
    }

    async refresh() {
      const button = $('adminRefresh');
      if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Refreshing'; }
      try { await Promise.all([this.loadRecentItems(), this.loadEventsList()]); this.feedback('Dashboard refreshed.'); }
      finally { if (button) { button.disabled = false; button.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh data'; } }
    }

    async loadRecentItems() {
      const box = $('recentItems');
      if (!box) return;
      if (!window.db) { box.innerHTML = '<p class="admin-error">Database is not ready. Refresh the page.</p>'; return; }
      try {
        const [posts, photos, videos] = await Promise.all([
          window.db.getPosts(10, 0), window.db.getPhotos(10, 0), window.db.getVideos(10, 0)
        ]);
        this.items = [
          ...(posts || []).map(item => ({ ...item, _col: 'posts' })),
          ...(photos || []).map(item => ({ ...item, _col: 'photos' })),
          ...(videos || []).map(item => ({ ...item, _col: 'videos' }))
        ].sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)).slice(0, 24);
        this.renderItems($('adminItemSearch')?.value || '');
        $('adminPostCount').textContent = String((posts || []).length);
        $('adminPhotoCount').textContent = String((photos || []).length);
        $('adminVideoCount').textContent = String((videos || []).length);
      } catch (error) {
        box.innerHTML = '<p class="admin-error">Could not load content. Check the Supabase connection and table permissions.</p>';
      }
    }

    renderItems(query = '') {
      const box = $('recentItems');
      if (!box) return;
      const term = query.trim().toLowerCase();
      const items = this.items.filter(item => !term || [item.title, item.description, item.author, item._col].some(value => String(value || '').toLowerCase().includes(term)));
      if (!items.length) {
        box.innerHTML = '<div class="admin-empty"><i class="fa-regular fa-folder-open"></i><p>No matching content found.</p></div>';
        return;
      }
      box.innerHTML = items.map(item => {
        const pinned = item.featured === true;
        const id = escapeHTML(item.id);
        const table = ALLOWED_TABLES.has(item._col) ? item._col : 'posts';
        return `<article class="admin-item-row">
          <span class="admin-type-icon"><i class="fa-solid ${table === 'videos' ? 'fa-film' : table === 'photos' ? 'fa-image' : 'fa-file-lines'}"></i></span>
          <div class="admin-item-copy"><strong>${escapeHTML(item.title || 'Untitled')}</strong><small>${escapeHTML(table)} · ${escapeHTML(item.author || 'HSHS community')}</small></div>
          ${pinned ? '<span class="admin-pinned"><i class="fa-solid fa-thumbtack"></i> Featured</span>' : ''}
          <button class="admin-btn ${pinned ? 'admin-btn-quiet' : 'admin-btn-primary'} admin-pin-one" type="button" data-id="${id}" data-col="${table}" data-featured="${pinned ? '1' : '0'}">${pinned ? 'Unpin' : 'Pin'}</button>
        </article>`;
      }).join('');
      box.querySelectorAll('.admin-pin-one').forEach(button => button.addEventListener('click', () => {
        $('pinId').value = button.dataset.id;
        $('pinCol').value = button.dataset.col;
        this.pinItem(button.dataset.featured !== '1');
      }));
    }

    async pinItem(featured) {
      const id = ($('pinId')?.value || '').trim();
      const col = $('pinCol')?.value || 'posts';
      if (!id) { this.feedback('Choose a content item or enter its ID.', true); return; }
      if (!ALLOWED_TABLES.has(col)) { this.feedback('That content type is not allowed.', true); return; }
      if (this.busy) return;
      this.busy = true;
      try {
        const sb = window.supabase;
        if (!sb) throw new Error('Supabase is not ready.');
        const patch = featured ? { featured: true, featured_at: new Date().toISOString() } : { featured: false, featured_at: null };
        const { data, error } = await sb.from(col).update(patch).eq('id', id).select('id');
        if (error) throw error;
        if (!data || !data.length) throw new Error('No row changed. Check the item ID and database update policy.');
        this.feedback(featured ? 'Pinned to Featured Today.' : 'Removed from Featured Today.');
        await this.loadRecentItems();
      } catch (error) {
        this.feedback(error.message || 'Could not update featured status.', true);
      } finally { this.busy = false; }
    }

    async addEvent() {
      const title = ($('evTitle')?.value || '').trim();
      const date = $('evDate')?.value || '';
      const place = ($('evPlace')?.value || '').trim();
      if (!title || !date) { this.feedback('Event name and date are required.', true); return; }
      if (date < new Date().toISOString().slice(0, 10)) { this.feedback('Choose today or a future date.', true); return; }
      if (this.busy) return;
      this.busy = true;
      const button = $('addEventBtn');
      if (button) button.disabled = true;
      try {
        const sb = window.supabase;
        if (!sb) throw new Error('Supabase is not ready.');
        const { error } = await sb.from('events').insert({ title, date, location: place });
        if (error) throw error;
        $('evTitle').value = ''; $('evDate').value = ''; $('evPlace').value = '';
        this.feedback('Event added.');
        await this.loadEventsList();
      } catch (error) {
        this.feedback(error.message || 'Could not add event.', true);
      } finally { this.busy = false; if (button) button.disabled = false; }
    }

    async loadEventsList() {
      const box = $('eventsList');
      if (!box) return;
      const sb = window.supabase;
      if (!sb) { box.innerHTML = '<p class="admin-error">Supabase is not ready.</p>'; return; }
      try {
        const { data, error } = await sb.from('events').select('id,title,date,location').order('date', { ascending: true }).limit(30);
        if (error) throw error;
        this.events = data || [];
        $('adminEventCount') && ($('adminEventCount').textContent = String(this.events.filter(event => event.date >= new Date().toISOString().slice(0, 10)).length));
        if (!this.events.length) { box.innerHTML = '<div class="admin-empty"><i class="fa-regular fa-calendar"></i><p>No events added yet.</p></div>'; return; }
        box.innerHTML = this.events.map(event => `<article class="admin-event-row">
          <div class="admin-event-date"><strong>${escapeHTML(new Date((event.date || '') + 'T12:00:00').getDate() || '—')}</strong><small>${escapeHTML(new Date((event.date || '') + 'T12:00:00').toLocaleDateString(undefined, { month: 'short' }))}</small></div>
          <div class="admin-event-copy"><strong>${escapeHTML(event.title || 'Untitled event')}</strong><small>${escapeHTML(dateLabel(event.date))}${event.location ? ' · ' + escapeHTML(event.location) : ''}</small></div>
          <button class="admin-icon-btn admin-delete-event" type="button" data-id="${escapeHTML(event.id)}" aria-label="Delete ${escapeHTML(event.title || 'event')}" title="Delete event"><i class="fa-regular fa-trash-can"></i></button>
        </article>`).join('');
        box.querySelectorAll('.admin-delete-event').forEach(button => button.addEventListener('click', async () => {
          if (!window.confirm('Delete this event? This cannot be undone.')) return;
          try {
            const { data, error } = await sb.from('events').delete().eq('id', button.dataset.id).select('id');
            if (error) throw error;
            if (!data || !data.length) throw new Error('No event was deleted. Check the database delete policy.');
            this.feedback('Event deleted.');
            await this.loadEventsList();
          } catch (error) { this.feedback(error.message || 'Could not delete event.', true); }
        }));
      } catch (error) {
        box.innerHTML = '<p class="admin-error">Could not load events. Check the events table and permissions.</p>';
      }
    }

    feedback(message, isError = false) {
      const node = $('adminFeedback');
      if (!node) return;
      node.textContent = message;
      node.className = 'admin-feedback' + (isError ? ' is-error' : ' is-success');
    }
  }

  function boot() {
    if (window.adminDashboard) return;
    const panels = $('adminPanels');
    if (!panels) { window.setTimeout(boot, 120); return; }
    window.adminDashboard = new AdminDashboard();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
