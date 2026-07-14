
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

    async loadPosts() {
        const feed = document.getElementById('galleryFeed');
        if (!feed || this.currentlyLoading) return;

        this.currentlyLoading = true;
        const allPosts = await db.getPosts(this.postsPerPage * (this.currentPage + 1), 0);
        const filteredPosts = this.currentCategory === 'all'
            ? allPosts
            : allPosts.filter(p => p.category === this.currentCategory);

        const startIndex = this.currentPage * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const pagePosts = filteredPosts.slice(startIndex, endIndex);

        if (this.currentPage === 0) {
            feed.innerHTML = '';
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
        card.innerHTML = `
            <div class="post-content">
                <img src="${post.image}" alt="${post.title}" class="post-media">
                <div class="post-overlay"></div>
                
                <div class="post-info">
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-description">${Utils.truncateText(post.description, 150)}</p>
                    <div class="post-meta">
                        <div class="meta-item">
                            <i class="fas fa-user"></i> ${post.author}
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i> ${Utils.formatDate(post.createdAt)}
                        </div>
                    </div>
                </div>

                <!-- Side Actions -->
                <div class="side-actions">
                    <button class="action-btn like-action" onclick="reactionManager.toggleLike('${post.id}')">
                        <i class="far fa-heart"></i>
                        <div class="action-count">${Utils.formatNumber(post.likes)}</div>
                    </button>
                    <button class="action-btn comment-action">
                        <i class="far fa-comment"></i>
                        <div class="action-count">${Utils.formatNumber(post.comments)}</div>
                    </button>
                    <button class="action-btn share-action" onclick="reactionManager.sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                        <div class="action-count">${Utils.formatNumber(post.shares)}</div>
                    </button>
                    <button class="action-btn save-action">
                        <i class="far fa-bookmark"></i>
                        <div class="action-count">${Utils.formatNumber(post.saves || 0)}</div>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    setupInfiniteScroll() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.loadPosts();
            }
        }, { threshold: 0.1 });

        // Observe last element
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

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                // Swiped left - next post
                this.nextPost();
            }
            if (touchEndX > touchStartX + 50) {
                // Swiped right - previous post
                this.previousPost();
            }
        };

        this.handleSwipe = handleSwipe;
    }

    setupDoubleClick() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        feed.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('post-media')) {
                const card = e.target.closest('.post-card');
                const postId = card.getAttribute('data-post-id');
                
                reactionManager.toggleLike(postId);
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
        const firstCard = feed.querySelector('.post-card');
        if (firstCard) {
            firstCard.style.animation = 'slideLeft 0.5s ease';
            setTimeout(() => {
                firstCard.remove();
                this.loadPosts();
            }, 500);
        }
    }

    previousPost() {
        Utils.showToast('Already at the beginning', 'info');
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galleryFeed')) {
        new GalleryPage();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryPage;
}
