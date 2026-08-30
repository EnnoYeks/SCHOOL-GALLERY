// HSHS staff desk
class AdminDashboard {
    constructor() {
        this.lock = document.getElementById('adminLock');
        this.desk = document.getElementById('adminDesk') || document.querySelector('.admin-container');
        if (!this.checkAdminAccess()) {
            this.showLock();
            return;
        }
        this.unlockDesk();
        this.init();
    }

    staffCode() {
        try {
            return localStorage.getItem('hshsStaffCode') || 'HSHS-STAFF';
        } catch (e) {
            return 'HSHS-STAFF';
        }
    }

    checkAdminAccess() {
        try {
            if (window.Utils && Utils.getData) return !!Utils.getData('adminToken');
            return !!localStorage.getItem('adminToken');
        } catch (e) {
            return false;
        }
    }

    saveToken() {
        try {
            if (window.Utils && Utils.setData) Utils.setData('adminToken', 'ok');
            localStorage.setItem('adminToken', 'ok');
        } catch (e) {}
    }

    clearToken() {
        try {
            if (window.Utils && Utils.removeData) Utils.removeData('adminToken');
            localStorage.removeItem('adminToken');
        } catch (e) {}
    }

    showLock() {
        if (this.desk) this.desk.hidden = true;
        if (this.lock) this.lock.hidden = false;
        const form = document.getElementById('adminLockForm');
        const err = document.getElementById('adminLockError');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('adminLockInput');
            const value = (input && input.value || '').trim();
            if (value !== this.staffCode()) {
                if (err) {
                    err.hidden = false;
                    err.textContent = 'That staff code is not right.';
                }
                return;
            }
            this.saveToken();
            this.unlockDesk();
            this.init();
        });
    }

    unlockDesk() {
        if (this.lock) this.lock.hidden = true;
        if (this.desk) this.desk.hidden = false;
    }

    goHome() {
        const inIndex = /\/index\//i.test(location.pathname);
        location.href = inIndex ? '../index.html' : 'index.html';
    }

    async init() {
        this.setupTabs();
        this.setupEventListeners();
        try { await this.loadDashboard(); } catch (e) {}
        try { await this.loadStats(); } catch (e) {}
    }

    async loadDashboard() {
        if (typeof db === 'undefined' || !db.getAnalytics) return;
        const analytics = await db.getAnalytics();
        const statElements = {
            totalPosts: document.getElementById('totalPosts'),
            totalPhotosStat: document.getElementById('totalPhotosStat'),
            totalVideosStat: document.getElementById('totalVideosStat'),
            totalLikesStat: document.getElementById('totalLikesStat'),
            totalCommentsStat: document.getElementById('totalCommentsStat'),
            totalViewsStat: document.getElementById('totalViewsStat')
        };
        Object.entries(statElements).forEach(([key, element]) => {
            if (!element) return;
            const value = analytics[key.replace('Stat', '')] || 0;
            if (window.Utils && Utils.animateCounter) Utils.animateCounter(element, 0, value, 800);
            else element.textContent = value;
        });
    }

    async loadStats() {}

    setupTabs() {
        const tabButtons = document.querySelectorAll('.menu-item');
        const tabs = document.querySelectorAll('.tab-content');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const tabName = btn.getAttribute('data-tab');
                if (btn.id === 'adminLogoutBtn' || btn.getAttribute('data-tab') === 'logout') {
                    this.clearToken();
                    this.goHome();
                    return;
                }
                if (!tabName) return;
                tabButtons.forEach(b => b.classList.remove('active'));
                tabs.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const tab = document.getElementById(tabName + 'Tab');
                if (tab) tab.classList.add('active');
                if (tabName === 'posts') await this.loadPostsTable();
                if (tabName === 'photos') await this.loadPhotosTable();
                if (tabName === 'videos') await this.loadVideosTable();
            });
        });
    }

    async loadPostsTable() {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody || typeof db === 'undefined') return;
        const posts = await db.getPosts(100, 0);
        if (!posts.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No posts found</td></tr>';
            return;
        }
        tbody.innerHTML = posts.map(post => '<tr><td><strong>' + (post.title || '') + '</strong></td><td>' + (post.category || 'general') + '</td><td></td><td>' + (post.likes || 0) + '</td><td>' + (post.views || 0) + '</td><td></td></tr>').join('');
    }

    async loadPhotosTable() {
        const tbody = document.getElementById('photosTableBody');
        if (!tbody || typeof db === 'undefined') return;
        const photos = await db.getPhotos(100, 0);
        if (!photos.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No photos found</td></tr>';
            return;
        }
        tbody.innerHTML = photos.map(photo => '<tr><td></td><td><strong>' + (photo.title || '') + '</strong></td><td></td><td>' + (photo.likes || 0) + '</td><td>' + (photo.views || 0) + '</td><td></td></tr>').join('');
    }

    async loadVideosTable() {
        const tbody = document.getElementById('videosTableBody');
        if (!tbody || typeof db === 'undefined') return;
        const videos = await db.getVideos(100, 0);
        if (!videos.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem">No videos found</td></tr>';
            return;
        }
        tbody.innerHTML = videos.map(video => '<tr><td></td><td><strong>' + (video.title || '') + '</strong></td><td>' + (video.duration || '') + '</td><td></td><td>' + (video.views || 0) + '</td><td></td></tr>').join('');
    }

    setupEventListeners() {
        document.getElementById('uploadBtn')?.addEventListener('click', () => this.openUploadModal());
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.loadDashboard();
            if (window.Utils && Utils.showToast) Utils.showToast('Dashboard refreshed', 'success');
        });
        document.getElementById('adminHomeBtn')?.addEventListener('click', () => this.goHome());
    }

    openUploadModal() {
        const modal = document.getElementById('adminModal');
        if (modal) modal.classList.add('active');
        document.getElementById('modalCloseBtn')?.addEventListener('click', () => modal.classList.remove('active'));
        document.getElementById('modalCancelBtn')?.addEventListener('click', () => modal.classList.remove('active'));
    }
}

window.adminDashboard = new AdminDashboard();
