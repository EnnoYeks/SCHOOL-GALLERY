// HSHS staff desk — Supabase for featured + events
// Admin claim check temporarily disabled.
class AdminDashboard {
    constructor() {
        this.lock = document.getElementById('adminLock');
        this.desk = document.getElementById('adminDesk') || document.querySelector('.admin-container');
        this.unlockDesk();
        this.init();
    }

    unlockDesk() {
        if (this.lock) {
            this.lock.hidden = true;
            this.lock.style.display = 'none';
        }
        if (this.desk) {
            this.desk.hidden = false;
            this.desk.style.display = '';
        }
    }

    async init() {
        this.renderAdminPanels();
        try { await this.loadRecentItems(); } catch (e) { console.warn(e); }
        try { await this.loadEventsList(); } catch (e) { console.warn(e); }
    }

    renderAdminPanels() {
        const panels = document.getElementById('adminPanels');
        if (!panels) return;
        panels.innerHTML = `
            <section style="margin:1.5rem 0;padding:1rem;background:rgba(255,255,255,0.04);border-radius:12px">
                <h2 style="margin:0 0 0.5rem">Pin Featured Today</h2>
                <p style="color:var(--text-secondary);font-size:0.9rem">Only pinned items appear in Featured Today. Normal uploads stay in Gallery / Photos / Studio.</p>
                <div id="recentItems" style="margin-top:1rem;max-height:280px;overflow:auto"></div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem">
                    <input id="pinId" placeholder="Or paste an ID" style="flex:1;min-width:160px;padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:inherit">
                    <select id="pinCol" style="padding:0.5rem;border-radius:8px;background:transparent;color:inherit;border:1px solid rgba(255,255,255,0.15)">
                        <option value="posts">posts</option>
                        <option value="photos">photos</option>
                        <option value="videos">videos</option>
                    </select>
                    <button id="pinBtn" type="button" style="padding:0.5rem 1rem;border-radius:8px;background:#2563eb;color:#fff;border:none;cursor:pointer">Pin</button>
                    <button id="unpinBtn" type="button" style="padding:0.5rem 1rem;border-radius:8px;background:transparent;color:inherit;border:1px solid rgba(255,255,255,0.2);cursor:pointer">Unpin</button>
                </div>
            </section>
            <section style="margin:1.5rem 0;padding:1rem;background:rgba(255,255,255,0.04);border-radius:12px">
                <h2 style="margin:0 0 0.5rem">Upcoming Events</h2>
                <div style="display:grid;gap:0.5rem;margin-top:0.75rem">
                    <input id="evTitle" placeholder="Event title" style="padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:inherit">
                    <input id="evDate" type="date" style="padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:inherit">
                    <input id="evPlace" placeholder="Location / place" style="padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:inherit">
                    <button id="addEventBtn" type="button" style="padding:0.6rem 1rem;border-radius:8px;background:#2563eb;color:#fff;border:none;cursor:pointer">Add event</button>
                </div>
                <div id="eventsList" style="margin-top:1rem"></div>
            </section>
        `;
        this.bindAdminActions();
    }

    bindAdminActions() {
        document.getElementById('pinBtn')?.addEventListener('click', () => this.pinItem(true));
        document.getElementById('unpinBtn')?.addEventListener('click', () => this.pinItem(false));
        document.getElementById('addEventBtn')?.addEventListener('click', () => this.addEvent());
    }

    async loadRecentItems() {
        const box = document.getElementById('recentItems');
        if (!box || !window.db) return;
        box.innerHTML = '<p style="color:var(--text-secondary)">Loading recent items…</p>';
        try {
            const [posts, photos, videos] = await Promise.all([
                window.db.getPosts ? window.db.getPosts(8, 0) : [],
                window.db.getPhotos ? window.db.getPhotos(8, 0) : [],
                window.db.getVideos ? window.db.getVideos(6, 0) : []
            ]);
            const items = []
                .concat((posts || []).map(p => ({ ...p, _col: 'posts' })))
                .concat((photos || []).map(p => ({ ...p, _col: 'photos' })))
                .concat((videos || []).map(p => ({ ...p, _col: 'videos' })))
                .slice(0, 12);
            if (!items.length) {
                box.innerHTML = '<p style="color:var(--text-secondary)">No items yet</p>';
                return;
            }
            box.innerHTML = items.map(it => {
                const title = (it.title || 'Untitled').slice(0, 48);
                const pinned = it.featured ? ' · pinned' : '';
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.35rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">'
                    + '<span style="font-size:0.9rem">' + title + ' <small style="opacity:.6">' + it._col + pinned + '</small></span>'
                    + '<button type="button" class="pin-one" data-id="' + it.id + '" data-col="' + it._col + '" data-featured="' + (it.featured ? '1' : '0') + '" style="padding:0.25rem 0.6rem;border-radius:6px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:inherit;cursor:pointer;font-size:0.8rem">'
                    + (it.featured ? 'Unpin' : 'Pin') + '</button>'
                    + '</div>';
            }).join('');
            box.querySelectorAll('.pin-one').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const col = btn.getAttribute('data-col');
                    const isPinned = btn.getAttribute('data-featured') === '1';
                    document.getElementById('pinId').value = id;
                    document.getElementById('pinCol').value = col;
                    this.pinItem(!isPinned);
                });
            });
        } catch (e) {
            box.innerHTML = '<p style="color:var(--text-secondary)">Could not load items</p>';
        }
    }

    async pinItem(featured) {
        const id = (document.getElementById('pinId') || {}).value || '';
        const col = (document.getElementById('pinCol') || {}).value || 'posts';
        if (!id.trim()) {
            alert('Enter an item ID or use a button above');
            return;
        }
        try {
            const sb = window.supabase;
            if (!sb) throw new Error('Supabase not loaded');
            const patch = featured
                ? { featured: true, featured_at: new Date().toISOString() }
                : { featured: false, featured_at: null };
            const { error } = await sb.from(col).update(patch).eq('id', id.trim());
            if (error) throw error;
            alert(featured ? 'Pinned to Featured Today' : 'Unpinned');
            this.loadRecentItems();
        } catch (e) {
            alert('Could not update: ' + (e && e.message));
        }
    }

    async addEvent() {
        const title = (document.getElementById('evTitle') || {}).value || '';
        const date = (document.getElementById('evDate') || {}).value || '';
        const place = (document.getElementById('evPlace') || {}).value || '';
        if (!title.trim() || !date) {
            alert('Title and date are required');
            return;
        }
        try {
            const sb = window.supabase;
            if (!sb) throw new Error('Supabase not loaded');
            const { error } = await sb.from('events').insert({
                title: title.trim(),
                date: date,
                location: place.trim()
            });
            if (error) throw error;
            document.getElementById('evTitle').value = '';
            document.getElementById('evPlace').value = '';
            this.loadEventsList();
            alert('Event added');
        } catch (e) {
            alert('Could not add event: ' + (e && e.message));
        }
    }

    async loadEventsList() {
        const box = document.getElementById('eventsList');
        if (!box) return;
        try {
            const sb = window.supabase;
            if (!sb) return;
            const { data, error } = await sb.from('events').select('*').order('date', { ascending: true }).limit(20);
            if (error) throw error;
            if (!data || !data.length) {
                box.innerHTML = '<p style="color:var(--text-secondary)">No events yet</p>';
                return;
            }
            box.innerHTML = data.map(function (ev) {
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">'
                    + '<span>' + (ev.title || '') + ' · ' + (ev.date || '') + '</span>'
                    + '<button type="button" data-id="' + ev.id + '" class="del-ev" style="background:transparent;border:none;color:#f87171;cursor:pointer">Delete</button>'
                    + '</div>';
            }).join('');
            box.querySelectorAll('.del-ev').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (!confirm('Delete this event?')) return;
                    try {
                        const { error } = await sb.from('events').delete().eq('id', id);
                        if (error) throw error;
                        this.loadEventsList();
                    } catch (e) {
                        alert('Delete failed');
                    }
                });
            });
        } catch (e) {
            box.innerHTML = '<p style="color:var(--text-secondary)">Could not load events</p>';
        }
    }
}

function bootAdmin() {
    if (!document.getElementById('adminPanels')) {
        setTimeout(bootAdmin, 100);
        return;
    }
    window.adminDashboard = new AdminDashboard();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAdmin);
} else {
    bootAdmin();
}
