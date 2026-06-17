
// ============================================
// ADMIN DASHBOARD LOGIC
// ============================================

class AdminDashboard {
    constructor() {
        this.isAdmin = this.checkAdminAccess();
        if (!this.isAdmin) {
            this.redirectToHome();
            return;
        }
        this.init();
    }

    checkAdminAccess() {
        const adminToken = Utils.getData('adminToken');
        return !!adminToken;
    }

    redirectToHome() {
        window.location.href = 'index.html';
    }

    init() {
        this.loadDashboard();
        this.setupTabs();
        this.loadStats();
        this.setupEventListeners();
    }

    loadDashboard() {
        const analytics = db.getAnalytics();
        
        // Update stat cards
        const statElements = {
            totalPosts: document.getElementById('totalPosts'),
            totalPhotosStat: document.getElementById('totalPhotosStat'),
            totalVideosStat: document.getElementById('totalVideosStat'),
            totalLikesStat: document.getElementById('totalLikesStat'),
            totalCommentsStat: document.getElementById('totalCommentsStat'),
            totalViewsStat: document.getElementById('totalViewsStat')
        };

        Object.entries(statElements).forEach(([key, element]) => {
            if (element) {
                const value = analytics[key.replace('Stat', '')] || 0;
                Utils.animateCounter(element, 0, value, 800);
            }
        });
    }

    loadStats() {
        const analytics = db.getAnalytics();
        console.log('Analytics:', analytics);
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.menu-item');
        const tabs = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                
                // Remove active class
                tabButtons.forEach(b => b.classList.remove('active'));
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class
                btn.classList.add('active');
                const tab = document.getElementById(tabName + 'Tab');
                if (tab) {
                    tab.classList.add('active');
                    
                    // Load content based on tab
                    if (tabName === 'posts') {
                        this.loadPostsTable();
                    } else if (tabName === 'photos') {
                        this.loadPhotosTable();
                    } else if (tabName === 'videos') {
                        this.loadVideosTable();
                    }
                }
            });
        });
    }

    loadPostsTable() {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody) return;

        const posts = db.posts;
        
        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No posts found</td></tr>';
            return;
        }

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                    <strong>${post.title}</strong>
                </td>
                <td>${Utils.capitalize(post.category || 'general')}</td>
                <td>${Utils.formatDate(post.createdAt)}</td>
                <td>${Utils.formatNumber(post.likes || 0)}</td>
                <td>${Utils.formatNumber(post.views || 0)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn-small" onclick="adminDashboard.editPost('${post.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn-small warning" onclick="adminDashboard.approvePost('${post.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="action-btn-small danger" onclick="adminDashboard.deletePost('${post.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadPhotosTable() {
        const tbody = document.getElementById('photosTableBody');
        if (!tbody) return;

        const photos = db.photos;

        if (photos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No photos found</td></tr>';
            return;
        }

        tbody.innerHTML = photos.map(photo => `
            <tr>
                <td>
                    <img src="${photo.image}" alt="${photo.title}" style="
                        width: 40px;
                        height: 40px;
                        border-radius: 5px;
                        object-fit: cover;
                    ">
                </td>
                <td><strong>${photo.title}</strong></td>
                <td>${Utils.formatDate(photo.createdAt)}</td>
                <td>${Utils.formatNumber(photo.likes || 0)}</td>
                <td>${Utils.formatNumber(photo.views || 0)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn-small" onclick="adminDashboard.editPhoto('${photo.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn-small danger" onclick="adminDashboard.deletePhoto('${photo.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadVideosTable() {
        const tbody = document.getElementById('videosTableBody');
        if (!tbody) return;

        const videos = db.videos;

        if (videos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No videos found</td></tr>';
            return;
        }

        tbody.innerHTML = videos.map(video => `
            <tr>
                <td>
                    <img src="${video.thumbnail}" alt="${video.title}" style="
                        width: 40px;
                        height: 40px;
                        border-radius: 5px;
                        object-fit: cover;
                    ">
                </td>
                <td><strong>${video.title}</strong></td>
                <td>${video.duration}</td>
                <td>${Utils.formatDate(video.createdAt)}</td>
                <td>${Utils.formatNumber(video.views || 0)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn-small" onclick="adminDashboard.editVideo('${video.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn-small danger" onclick="adminDashboard.deleteVideo('${video.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        const uploadBtn = document.getElementById('uploadBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const uploadBtnModal = document.querySelector('.btn-admin');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.openUploadModal();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboard();
                Utils.showToast('Dashboard refreshed', 'success');
            });
        }
    }

    openUploadModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('active');
        }

        const closeBtn = document.getElementById('modalCloseBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    }

    editPost(postId) {
        Utils.showToast('Edit feature coming soon!', 'info');
    }

    approvePost(postId) {
        const post = db.getPostById(postId);
        if (post) {
            post.approved = true;
            db.saveToStorage();
            this.loadPostsTable();
            Utils.showToast('Post approved', 'success');
        }
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            db.deletePost(postId);
            this.loadPostsTable();
            Utils.showToast('Post deleted', 'success');
        }
    }

    editPhoto(photoId) {
        Utils.showToast('Edit feature coming soon!', 'info');
    }

    deletePhoto(photoId) {
        if (confirm('Are you sure you want to delete this photo?')) {
            db.photos = db.photos.filter(p => p.id !== photoId);
            db.saveToStorage();
            this.loadPhotosTable();
            Utils.showToast('Photo deleted', 'success');
        }
    }

    editVideo(videoId) {
        Utils.showToast('Edit feature coming soon!', 'info');
    }

    deleteVideo(videoId) {
        if (confirm('Are you sure you want to delete this video?')) {
            db.videos = db.videos.filter(v => v.id !== videoId);
            db.saveToStorage();
            this.loadVideosTable();
            Utils.showToast('Video deleted', 'success');
        }
    }

    // Export Data
    exportData(type = 'all') {
        let data = {};

        if (type === 'all' || type === 'posts') {
            data.posts = db.posts;
        }
        if (type === 'all' || type === 'photos') {
            data.photos = db.photos;
        }
        if (type === 'all' || type === 'videos') {
            data.videos = db.videos;
        }

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ennoyeks-export-${type}-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        Utils.showToast('Data exported successfully', 'success');
    }

    // Import Data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.posts) {
                    db.posts = [...db.posts, ...data.posts];
                }
                if (data.photos) {
                    db.photos = [...db.photos, ...data.photos];
                }
                if (data.videos) {
                    db.videos = [...db.videos, ...data.videos];
                }

                db.saveToStorage();
                this.loadDashboard();
                Utils.showToast('Data imported successfully', 'success');
            } catch (error) {
                Utils.showToast('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Generate Report
    generateReport() {
        const analytics = db.getAnalytics();
        const report = {
            generatedAt: new Date().toISOString(),
            school: CONFIG.app.school,
            ...analytics
        };

        const reportStr = JSON.stringify(report, null, 2);
        const blob = new Blob([reportStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        Utils.showToast('Report generated', 'success');
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
