// HSHS World — Admin control room
(function () {
  'use strict';
  const ALLOWED = new Set(['posts', 'photos', 'videos']);
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'})[c]);

  class AdminDashboard {
    constructor() {
      this.busy = false;
      this.items = [];
      this.init();
    }

    async init() {
      this.bind();
      await Promise.all([this.loadRecentItems(), this.loadEventsList()]);
    }

    bind() {
      $('adminRefresh')?.addEventListener('click', () => this.init());
      $('pinBtn')?.addEventListener('click', () => this.pinItem(true));
      $('unpinBtn')?.addEventListener('click', () => this.pinItem(false));
      $('adminEventForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.addEvent(); });
    }

    async loadRecentItems() {
      const box = $('recentItems');
      if (!box || !window.db) return;
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
        const sb = window.supabase;
        if (!sb) throw new Error('Supabase not ready');
        const patch = featured ? { featured: true, featured_at: new Date().toISOString() } : { featured: false, featured_at: null };
        const { error } = await sb.from(col).update(patch).eq('id', id);
        if (error) throw error;
        await this.loadRecentItems();
      } catch (e) {
        alert(e.message || 'Could not update');
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
        const sb = window.supabase;
        if (!sb) throw new Error('Supabase not ready');
        const { error } = await sb.from('events').insert({ title, date, location: place });
        if (error) throw error;
        $('evTitle').value = ''; $('evDate').value = ''; $('evPlace').value = '';
        await this.loadEventsList();
      } catch (e) {
        alert(e.message || 'Could not add event');
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
              await sb.from('events').delete().eq('id', btn.dataset.id);
              this.loadEventsList();
            } catch (e) {}
          });
        });
      } catch (e) {
        box.innerHTML = '<div class="admin-empty">Could not load events.</div>';
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
