// HSHS staff desk
class AdminDashboard {
    constructor() {
        this.lock = document.getElementById('adminLock');
        this.desk = document.getElementById('adminDesk') || document.querySelector('.admin-container');
        this.checkAndInit();
    }

    async checkAndInit() {
        const isAdmin = await this.checkAdminAccess();
        if (!isAdmin) {
            this.showLock();
            return;
        }
        this.unlockDesk();
        this.init();
    }

    async checkAdminAccess() {
        try {
            const user = window.auth && window.auth.currentUser;
            if (!user || user.isAnonymous) return false;
            const tokenResult = await user.getIdTokenResult(true);
            return !!(tokenResult && tokenResult.claims && tokenResult.claims.admin === true);
        } catch (e) {
            return false;
        }
    }

    showLock() {
        if (this.desk) this.desk.hidden = true;
        if (this.lock) this.lock.hidden = false;
        if (this.lock) {
            this.lock.innerHTML = '<p style="color:var(--text-secondary)">Admin access requires the admin claim set in the Firebase console.<br>Sign in with an admin account and refresh.</p>';
        }
    }

    unlockDesk() {
        if (this.lock) this.lock.hidden = true;
        if (this.desk) this.desk.hidden = false;
    }

    goHome() {
        const inIndex = /\\/index\\//i.test(location.pathname);
        location.href = inIndex ? '../index.html' : 'index.html';
    }

    async init() {
        this.renderAdminPanels();
        try { await this.loadDashboard(); } catch (e) {}
    }

    renderAdminPanels() {
        const panels = document.getElementById('adminPanels');
        if (!panels) return;
        panels.innerHTML = `
            <section style="margin:1.5rem 0;padding:1rem;background:rgba(255,255,255,0.04);border-radius:12px">
                <h2 style="margin:0 0 0.5rem">Pin Featured Today</h2>
                <p style="color:var(--text-secondary);font-size:0.9rem">Only pinned items appear in Featured Today. Normal uploads stay in Gallery / Photos / Studio.</p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem">
                    <input id="pinId" placeholder="Post / Photo / Video ID" style="flex:1;min-width:180px;padding:0.5rem;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:inherit">
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
                <h2 style="margin:0 0 0.5rem">Add Upcoming Event</h2>
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
        this.loadEventsList();
    }

    bindAdminActions() {
        document.getElementById('pinBtn')?.addEventListener('click', () => this.pinItem(true));
        document.getElementById('unpinBtn')?.addEventListener('click', () => this.pinItem(false));
        document.getElementById('addEventBtn')?.addEventListener('click', () => this.addEvent());
    }

    async pinItem(featured) {
        const id = (document.getElementById('pinId') || {}).value || '';
        const col = (document.getElementById('pinCol') || {}).value || 'posts';
        if (!id.trim()) {
            alert('Enter an item ID');
            return;
        }
        try {
            const fs = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js');
            const ref = fs.doc(window.firestore, col, id.trim());
            const patch = featured
                ? { featured: true, featuredAt: fs.serverTimestamp() }
                : { featured: false, featuredAt: null };
            await fs.updateDoc(ref, patch);
            alert(featured ? 'Pinned to Featured Today' : 'Unpinned');
        } catch (e) {
            alert('Could not update (check ID and admin claim): ' + (e && e.message));
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
            const fs = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js');
            await fs.addDoc(fs.collection(window.firestore, 'events'), {
                title: title.trim(),
                date: date,
                location: place.trim(),
                createdAt: fs.serverTimestamp()
            });
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
            const fs = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js');
            const q = fs.query(fs.collection(window.firestore, 'events'), fs.orderBy('date', 'asc'), fs.limit(20));
            const snap = await fs.getDocs(q);
            if (snap.empty) {
                box.innerHTML = '<p style="color:var(--text-secondary)">No events yet</p>';
                return;
            }
            box.innerHTML = snap.docs.map(function (d) {
                const ev = d.data();
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.06)">'
                    + '<span>' + (ev.title || '') + ' · ' + (ev.date || '') + '</span>'
                    + '<button type="button" data-id="' + d.id + '" class="del-ev" style="background:transparent;border:none;color:#f87171;cursor:pointer">Delete</button>'
                    + '</div>';
            }).join('');
            box.querySelectorAll('.del-ev').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (!confirm('Delete this event?')) return;
                    try {
                        const fs = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js');
                        await fs.deleteDoc(fs.doc(window.firestore, 'events', id));
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

    async loadDashboard() {}
}

window.adminDashboard = new AdminDashboard();
