// ============================================
// GALLERY/FEED PAGE LOGIC
// ============================================

class GalleryPage {
    constructor() {
        this.currentCategory = 'all';
        this.currentPage = 0;
        this.postsPerPage = CONFIG.pagination.postsPerPage;
        this.observer = null;
        this.currentlyLoading = false;
        this.init();
    }

    async init() {
        this.setupCategoryFilter();
        await this.loadPosts();
        this.setupInfiniteScroll();
        this.setupSwipeNavigation();
        this.setupDoubleClick();
    }

    setupCategoryFilter() {
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => btn.addEventListener('click', async () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentCategory = btn.getAttribute('data-category');
            this.currentPage = 0;
            if (this.observer) this.observer.disconnect();
            await this.loadPosts();
        }));
    }

    async loadPosts() {
        const feed = document.getElementById('galleryFeed');
        if (!feed || this.currentlyLoading) return;
        this.currentlyLoading = true;
        try {
            const allPosts = await db.getPosts(this.postsPerPage * (this.currentPage + 1), 0);
            const filteredPosts = this.currentCategory === 'all' ? allPosts : allPosts.filter(p => p.category === this.currentCategory);
            const startIndex = this.currentPage * this.postsPerPage;
            const pagePosts = filteredPosts.slice(startIndex, startIndex + this.postsPerPage);
            if (this.currentPage === 0) feed.innerHTML = '';
            pagePosts.forEach((post, index) => feed.appendChild(this.createPostCard(post, index)));
            this.currentPage++;
            this.currentlyLoading = false;
            this.updateObserver?.();
        } catch (error) {
            console.error('Gallery load failed:', error);
            feed.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><h3>Gallery is taking a moment</h3><p>Please try again shortly.</p></div>';
            this.currentlyLoading = false;
        }
    }

    createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-post-id', post.id);
        const image = post.image || post.imageUrl || post.thumbnailUrl || '';
        card.innerHTML = `
            <div class="post-content">
                ${image ? `<img src="${image}" alt="${post.title || 'HSHS World post'}" class="post-media">` : '<div class="post-media thumb-fallback"><i class="fas fa-image"></i></div>'}
                <div class="post-overlay"></div>
                <div class="post-info">
                    <h2 class="post-title">${this.escape(post.title || 'Untitled')}</h2>
                    <p class="post-description">${this.escape((post.description || '').slice(0, 150))}</p>
                    <div class="post-meta"><div class="meta-item"><i class="fas fa-user"></i> ${this.escape(post.author || 'HSHS World')}</div></div>
                </div>
                <div class="side-actions">
                    <button class="action-btn like-action" data-action="like"><i class="far fa-heart"></i><div class="action-count">${post.likes || 0}</div></button>
                    <button class="action-btn comment-action" data-action="comment"><i class="far fa-comment"></i><div class="action-count">${post.comments || 0}</div></button>
                    <button class="action-btn share-action" data-action="share"><i class="fas fa-share"></i><div class="action-count">${post.shares || 0}</div></button>
                    <button class="action-btn save-action" data-action="save"><i class="far fa-bookmark"></i><div class="action-count">${post.saves || 0}</div></button>
                </div>
            </div>`;
        card.querySelectorAll('.action-btn').forEach(btn => btn.addEventListener('click', e => {
            e.stopPropagation();
            const manager = window.reactionManager;
            if (!manager) return;
            const action = btn.dataset.action;
            if (action === 'like') manager.toggleLike?.(post.id);
            if (action === 'share') manager.sharePost?.(post.id);
        }));
        return card;
    }

    setupInfiniteScroll() {
        const feed = document.getElementById('galleryFeed');
        if (!feed || !('IntersectionObserver' in window)) return;
        this.observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) this.loadPosts(); }, { threshold: 0.1 });
        this.updateObserver = () => {
            const last = feed.lastElementChild;
            if (last) { this.observer.disconnect(); this.observer.observe(last); }
        };
        this.updateObserver();
    }

    setupSwipeNavigation() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;
        let start = 0;
        feed.addEventListener('touchstart', e => { start = e.changedTouches[0].screenX; }, { passive: true });
        feed.addEventListener('touchend', e => { if (e.changedTouches[0].screenX < start - 50) this.nextPost(); }, { passive: true });
    }

    setupDoubleClick() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;
        feed.addEventListener('dblclick', e => {
            if (!e.target.classList.contains('post-media')) return;
            const card = e.target.closest('.post-card');
            const overlay = document.getElementById('doubleTapOverlay');
            window.reactionManager?.toggleLike?.(card?.dataset.postId);
            overlay?.classList.add('active');
            setTimeout(() => overlay?.classList.remove('active'), 600);
        });
    }

    nextPost() { document.getElementById('galleryFeed')?.firstElementChild?.scrollIntoView({ behavior: 'smooth' }); }
    escape(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c])); }
}

window.GalleryPage = GalleryPage;
window.initGallery = function () {
    if (!document.getElementById('galleryFeed')) return;
    if (window.__hshsGalleryInstance) return window.__hshsGalleryInstance;
    window.__hshsGalleryInstance = new GalleryPage();
    return window.__hshsGalleryInstance;
};

document.addEventListener('DOMContentLoaded', () => window.initGallery());