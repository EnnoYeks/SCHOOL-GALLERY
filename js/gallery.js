
// ============================================
// GALLERY/FEED PAGE LOGIC
// ============================================

class GalleryPage {
    constructor() {
        this.currentCategory = 'all';
        this.currentPage = 0;
        this.postsPerPage = (window.CONFIG && CONFIG.pagination && CONFIG.pagination.postsPerPage) || 10;
        this.observer = null;
        this.currentlyLoading = false;
        this.init();
    }

    async init() {
        this.setupCategoryFilter();
        await this.loadPosts();
        this.setupInfiniteScroll();
        this.setupDoubleClick();
        this.setupSwipeNavigation();
    }

    setupCategoryFilter() {
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.getAttribute('data-category');
                this.currentPage = 0;
                if (this.observer) {
                    this.observer.disconnect();
                }
                await this.loadPosts();
            });
        });
    }

    async readPosts() {
        var list = [];
        try {
            if (window.db && typeof db.getPosts === 'function') {
                list = await db.getPosts(80, 0);
            }
        } catch (e) { list = []; }
        if ((!list || !list.length) && window.HshsStore && typeof HshsStore.listPosts === 'function') {
            list = HshsStore.listPosts();
        }
        return Array.isArray(list) ? list : [];
    }

    async loadPosts() {
        const feed = document.getElementById('galleryFeed');
        if (!feed || this.currentlyLoading) return;

        this.currentlyLoading = true;
        const allPosts = await this.readPosts();
        const filteredPosts = this.currentCategory === 'all'
            ? allPosts
            : allPosts.filter(p => (p.category || '') === this.currentCategory);

        const startIndex = this.currentPage * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const pagePosts = filteredPosts.slice(startIndex, endIndex);

        if (this.currentPage === 0) {
            feed.innerHTML = '';
        }

        if (!pagePosts.length && this.currentPage === 0) {
            feed.innerHTML = '<div class="post-loading"><p>No posts in this category yet. Try All.</p></div>';
            this.currentlyLoading = false;
            return;
        }

        pagePosts.forEach((post, index) => {
            const card = this.createPostCard(post, index);
            feed.appendChild(card);
        });

        this.currentPage++;
        this.currentlyLoading = false;
        this.updateObserver();
    }

    createPostCard(post, index) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-post-id', post.id);
        const img = post.image || post.imageUrl || post.thumbnailUrl || '';
        const title = post.title || 'Campus post';
        const desc = post.description || '';
        const author = post.author || 'HSHS';
        const cut = (window.Utils && Utils.truncateText) ? Utils.truncateText(desc, 150) : desc;
        const when = (window.Utils && Utils.formatDate) ? Utils.formatDate(post.createdAt || Date.now()) : '';
        const num = (n) => (window.Utils && Utils.formatNumber) ? Utils.formatNumber(n || 0) : (n || 0);
        card.innerHTML = `
            <div class="post-content">
                <img src="${img}" alt="${title}" class="post-media">
                <div class="post-overlay"></div>
                <div class="post-info">
                    <h2 class="post-title">${title}</h2>
                    <p class="post-description">${cut}</p>
                    <div class="post-meta">
                        <div class="meta-item">
                            <i class="fas fa-user"></i> ${author}
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i> ${when}
                        </div>
                    </div>
                </div>
                <div class="side-actions">
                    <button class="action-btn like-action" type="button">
                        <i class="far fa-heart"></i>
                        <div class="action-count">${num(post.likes)}</div>
                    </button>
                    <button class="action-btn comment-action" type="button">
                        <i class="far fa-comment"></i>
                        <div class="action-count">${num(post.comments)}</div>
                    </button>
                    <button class="action-btn share-action" type="button">
                        <i class="fas fa-share"></i>
                        <div class="action-count">${num(post.shares)}</div>
                    </button>
                    <button class="action-btn save-action" type="button">
                        <i class="far fa-bookmark"></i>
                        <div class="action-count">${num(post.saves)}</div>
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    setupInfiniteScroll() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        this.observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.loadPosts();
            }
        }, { threshold: 0.1 });

        this.updateObserver = () => {
            const lastElement = feed.lastElementChild;
            if (lastElement) {
                this.observer.disconnect();
                this.observer.observe(lastElement);
            }
        };

        this.updateObserver();
    }

    setupSwipeNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;

        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        feed.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        feed.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, false);

        this.handleSwipe = () => {
            if (touchEndX < touchStartX - 50) this.nextPost();
            if (touchEndX > touchStartX + 50) this.previousPost();
        };
    }

    setupDoubleClick() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        feed.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('post-media')) {
                const card = e.target.closest('.post-card');
                if (!card) return;
                this.showDoubleTapLike();
            }
        });
    }

    showDoubleTapLike() {
        const overlay = document.getElementById('doubleTapOverlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 600);
        }
    }

    nextPost() {
        const feed = document.getElementById('galleryFeed');
        const firstCard = feed && feed.querySelector('.post-card');
        if (firstCard) {
            firstCard.style.animation = 'slideLeft 0.5s ease';
            setTimeout(() => {
                firstCard.remove();
                this.loadPosts();
            }, 500);
        }
    }

    previousPost() {
        if (window.Utils && Utils.showToast) Utils.showToast('Already at the beginning', 'info');
    }
}

window.GalleryPage = GalleryPage;

function bootGallery() {
    if (window.__hshsGalleryPage) return;
    if (document.getElementById('galleryFeed')) {
        window.__hshsGalleryPage = new GalleryPage();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGallery);
} else {
    bootGallery();
}
