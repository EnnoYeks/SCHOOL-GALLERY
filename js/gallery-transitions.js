
// ============================================
// ENHANCED GALLERY/FEED WITH SMOOTH TRANSITIONS
// ============================================

class EnhancedGalleryPage {
    constructor() {
        this.currentCategory = 'all';
        this.currentIndex = 0;
        this.postsPerPage = CONFIG.pagination.postsPerPage;
        this.allPosts = [];
        this.filteredPosts = [];
        this.observer = null;
        this.currentlyLoading = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.preloadedPosts = new Map(); // Cache posts for smooth loading
        this.init();
    }

    async init() {
        // Load all posts first to prevent flickering
        await this.preloadAllPosts();
        this.setupCategoryFilter();
        this.setupNavigationPanel();
        this.renderCurrentPage();
        this.setupSwipeGestures();
        this.setupDoubleClick();
        this.setupKeyboardNavigation();
    }

    // ========== PRELOADING LOGIC ==========
    async preloadAllPosts() {
        try {
            // Load all posts at once to avoid loading states
            this.allPosts = await db.getPosts(1000, 0);
            this.filterPostsByCategory();
        } catch (error) {
            console.error('Error preloading posts:', error);
        }
    }

    filterPostsByCategory() {
        if (this.currentCategory === 'all') {
            this.filteredPosts = [...this.allPosts];
        } else {
            this.filteredPosts = this.allPosts.filter(p => p.category === this.currentCategory);
        }
        this.currentIndex = 0; // Reset to first post when filtering
    }

    // ========== NAVIGATION PANEL ==========
    setupNavigationPanel() {
        // Create navigation panel if doesn't exist
        if (!document.querySelector('.pages-panel')) {
            const panel = document.createElement('div');
            panel.className = 'pages-panel';
            panel.innerHTML = `
                <div class="panel-content">
                    <div class="page-preview prev-page">
                        <div class="preview-label">Previous</div>
                        <div class="preview-thumbnail"></div>
                    </div>
                    <div class="page-indicator">
                        <div class="indicator-counter">
                            <span class="current-page">1</span> / <span class="total-pages">0</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                    <div class="page-preview next-page">
                        <div class="preview-label">Next</div>
                        <div class="preview-thumbnail"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
        }
        this.updateNavigationPanel();
    }

    updateNavigationPanel() {
        const total = this.filteredPosts.length;
        const current = this.currentIndex + 1;
        
        // Update counter
        document.querySelector('.current-page').textContent = current;
        document.querySelector('.total-pages').textContent = total;

        // Update progress bar
        const progress = total > 0 ? (current / total) * 100 : 0;
        document.querySelector('.progress-fill').style.width = progress + '%';

        // Update previews
        this.updatePrevPagePreview();
        this.updateNextPagePreview();
    }

    updatePrevPagePreview() {
        const prevIndex = this.currentIndex - 1;
        const element = document.querySelector('.prev-page .preview-thumbnail');
        
        if (prevIndex >= 0 && this.filteredPosts[prevIndex]) {
            const post = this.filteredPosts[prevIndex];
            element.innerHTML = `<img src="${post.image}" alt="Previous">`;
            element.classList.add('has-content');
        } else {
            element.innerHTML = '<i class="fas fa-lock"></i>';
            element.classList.remove('has-content');
        }
    }

    updateNextPagePreview() {
        const nextIndex = this.currentIndex + 1;
        const element = document.querySelector('.next-page .preview-thumbnail');
        
        if (nextIndex < this.filteredPosts.length && this.filteredPosts[nextIndex]) {
            const post = this.filteredPosts[nextIndex];
            element.innerHTML = `<img src="${post.image}" alt="Next">`;
            element.classList.add('has-content');
        } else {
            element.innerHTML = '<i class="fas fa-lock"></i>';
            element.classList.remove('has-content');
        }
    }

    // ========== RENDERING ==========
    renderCurrentPage() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        // Clear current content
        feed.innerHTML = '';

        if (this.filteredPosts.length === 0) {
            feed.innerHTML = '<div class="empty-state"><p>No posts found</p></div>';
            return;
        }

        const post = this.filteredPosts[this.currentIndex];
        const card = this.createPostCard(post);
        
        // Add entrance animation
        card.classList.add('entering');
        feed.appendChild(card);

        // Update navigation panel
        this.updateNavigationPanel();

        // Preload next posts silently
        this.preloadNextPosts();
    }

    preloadNextPosts() {
        // Preload 3 posts ahead for smooth transitions
        for (let i = 1; i <= 3; i++) {
            const index = this.currentIndex + i;
            if (index < this.filteredPosts.length && !this.preloadedPosts.has(index)) {
                const post = this.filteredPosts[index];
                const img = new Image();
                img.onload = () => {
                    this.preloadedPosts.set(index, true);
                };
                img.src = post.image;
            }
        }
    }

    createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-post-id', post.id);
        card.innerHTML = `
            <div class="post-content">
                <img src="${post.image}" alt="${post.title}" class="post-media" loading="eager">
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

    // ========== CATEGORY FILTER ==========
    setupCategoryFilter() {
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.getAttribute('data-category');
                this.filterPostsByCategory();
                this.renderCurrentPage();
            });
        });
    }

    // ========== SWIPE GESTURES ==========
    setupSwipeGestures() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        feed.addEventListener('touchstart', (e) => {
            if (this.isTransitioning) return;
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, false);

        feed.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;
            this.updateTransitionPreview(e);
        }, false);

        feed.addEventListener('touchend', (e) => {
            if (this.isTransitioning) return;
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, false);
    }

    updateTransitionPreview(e) {
        const currentX = e.changedTouches[0].currentX;
        const diff = this.touchStartX - currentX;
        const progress = Math.abs(diff) / window.innerWidth;
        
        // Update visual feedback (optional)
        const feed = document.getElementById('galleryFeed');
        if (feed) {
            feed.style.opacity = 1 - (progress * 0.2);
        }
    }

    handleSwipe() {
        const diff = this.touchEndX - this.touchStartX;
        const diffY = Math.abs(this.touchEndY - this.touchStartY);
        
        // Prevent vertical swipe from triggering horizontal navigation
        if (diffY > Math.abs(diff)) return;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.previousPage();
            } else {
                this.nextPage();
            }
        }
    }

    // ========== PAGE NAVIGATION ==========
    async nextPage() {
        if (this.isTransitioning || this.currentIndex >= this.filteredPosts.length - 1) {
            Utils.showToast('No more posts', 'info');
            return;
        }

        this.isTransitioning = true;
        await this.transitionToPage(this.currentIndex + 1, 'left');
        this.isTransitioning = false;
    }

    async previousPage() {
        if (this.isTransitioning || this.currentIndex <= 0) {
            Utils.showToast('Already at the beginning', 'info');
            return;
        }

        this.isTransitioning = true;
        await this.transitionToPage(this.currentIndex - 1, 'right');
        this.isTransitioning = false;
    }

    async transitionToPage(newIndex, direction) {
        const feed = document.getElementById('galleryFeed');
        const currentCard = feed.querySelector('.post-card');
        
        if (!currentCard) return;

        const animationClass = direction === 'left' ? 'slide-out-left' : 'slide-out-right';
        currentCard.classList.add(animationClass);

        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 400));

        this.currentIndex = newIndex;
        this.renderCurrentPage();

        // Trigger entrance animation
        const newCard = feed.querySelector('.post-card');
        if (newCard) {
            newCard.classList.add('slide-in-' + (direction === 'left' ? 'right' : 'left'));
        }
    }

    // ========== DOUBLE CLICK ==========
    setupDoubleClick() {
        const feed = document.getElementById('galleryFeed');
        if (!feed) return;

        let lastTap = 0;
        feed.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0 && e.target.classList.contains('post-media')) {
                const card = e.target.closest('.post-card');
                const postId = card.getAttribute('data-post-id');
                reactionManager.toggleLike(postId);
                this.showDoubleTapLike();
            }
            lastTap = currentTime;
        });

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

    // ========== KEYBOARD NAVIGATION ==========
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                this.nextPage();
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
                this.previousPage();
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galleryFeed')) {
        window.galleryPage = new EnhancedGalleryPage();
    }
});
