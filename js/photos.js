// ============================================
// PHOTOS PAGE LOGIC
// ============================================

class PhotosPage {
    constructor() {
        this.currentFilter = 'all';
        this.currentPage = 0;
        this.photosPerPage = (window.CONFIG && CONFIG.pagination && CONFIG.pagination.photosPerPage) || 20;
        this.init();
    }

    async init() {
        this.setupFilters();
        await this.loadPhotos();
        this.setupSearch();
        this.setupModal();
    }

    setupFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.currentPage = 0;
                await this.loadPhotos();
            });
        });
    }

    async loadPhotos() {
        const grid = document.getElementById('masonryGrid');
        if (!grid) return;

        let photos = [];
        try {
            photos = await (window.db && db.getPhotos ? db.getPhotos(this.photosPerPage * (this.currentPage + 1), 0) : []);
        } catch (e) { photos = []; }

        // Apply filter
        if (this.currentFilter === 'popular') {
            photos = photos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else if (this.currentFilter === 'trending') {
            const engagement = (p) => (p.likes || 0) + (p.comments || 0);
            photos = photos.sort((a, b) => engagement(b) - engagement(a));
        } else if (this.currentFilter === 'recent') {
            photos = photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const startIndex = this.currentPage * this.photosPerPage;
        const endIndex = startIndex + this.photosPerPage;
        const pagePhotos = photos.slice(startIndex, endIndex);

        if (this.currentPage === 0) {
            grid.innerHTML = '';
        }

        const frag = document.createDocumentFragment();
        pagePhotos.forEach((photo) => {
            const card = this.createPhotoCard(photo);
            frag.appendChild(card);
        });
        grid.appendChild(frag);

        this.currentPage++;
    }

    createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        try { card.setAttribute('data-photo-id', String(photo.id)); } catch (e) {}
        try { card.setAttribute('data-post-id', String(photo.id)); } catch (e) {}

        // preview image
        const img = document.createElement('img');
        img.className = 'photo-image';
        try { img.setAttribute('src', photo.image || ''); } catch (e) { img.src = ''; }
        img.setAttribute('alt', photo.title || 'Photo');

        const overlay = document.createElement('div'); overlay.className = 'photo-overlay';

        // header
        const header = document.createElement('div'); header.className = 'photo-header';
        const author = document.createElement('div'); author.className = 'photo-author';
        const av = document.createElement('img'); av.className = 'author-avatar';
        av.setAttribute('alt', photo.author || '');
        try { av.setAttribute('src', photo.authorAvatar || 'https://via.placeholder.com/32'); } catch (e) { av.src = 'https://via.placeholder.com/32'; }
        const authorName = document.createElement('div'); authorName.className = 'author-name'; authorName.textContent = photo.author || '';
        author.appendChild(av); author.appendChild(authorName);

        const likeBtn = document.createElement('button'); likeBtn.className = 'photo-like-btn'; likeBtn.type = 'button';
        likeBtn.setAttribute('aria-label', 'Like');
        const likeIcon = document.createElement('i'); likeIcon.className = 'far fa-heart';
        likeBtn.appendChild(likeIcon);
        // wire reactionManager if present
        likeBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            try { if (window.reactionManager && typeof reactionManager.toggleLike === 'function') reactionManager.toggleLike(String(photo.id)); } catch (e) {}
        });

        header.appendChild(author);
        header.appendChild(likeBtn);

        // footer
        const footer = document.createElement('div'); footer.className = 'photo-footer';
        const title = document.createElement('div'); title.className = 'photo-title'; title.textContent = photo.title || '';
        const stats = document.createElement('div'); stats.className = 'photo-stats';
        const statLikes = document.createElement('div'); statLikes.className = 'stat'; statLikes.innerHTML = '<i class="fas fa-heart"></i> ' + (window.Utils && Utils.formatNumber ? Utils.formatNumber(photo.likes || 0) : String(photo.likes || 0));
        const statViews = document.createElement('div'); statViews.className = 'stat'; statViews.innerHTML = '<i class="fas fa-eye"></i> ' + (window.Utils && Utils.formatNumber ? Utils.formatNumber(photo.views || 0) : String(photo.views || 0));
        stats.appendChild(statLikes); stats.appendChild(statViews);
        footer.appendChild(title); footer.appendChild(stats);

        overlay.appendChild(header);
        overlay.appendChild(footer);

        card.appendChild(img);
        card.appendChild(overlay);

        card.addEventListener('click', () => {
            this.openModal(photo);
        });

        return card;
    }

    setupSearch() {
        const searchBtn = document.querySelector('.search-submit');
        if (searchBtn) {
            searchBtn.addEventListener('click', async () => {
                const input = document.getElementById('photoSearchInput');
                const query = input ? input.value : '';
                await this.search(query);
            });
        }
    }

    async search(query) {
        const grid = document.getElementById('masonryGrid');
        if (!grid) return;
        let results = [];
        try { results = await (window.db && db.search ? db.search(query, 'photos') : []); } catch (e) { results = []; }
        grid.innerHTML = '';
        const frag = document.createDocumentFragment();
        results.forEach(photo => {
            const card = document.createElement('div'); card.className = 'photo-card';
            try { card.setAttribute('data-photo-id', String(photo.id)); } catch (e) {}
            try { card.setAttribute('data-post-id', String(photo.id)); } catch (e) {}
            const img = document.createElement('img'); img.className = 'photo-image'; img.setAttribute('src', photo.image || ''); img.setAttribute('alt', photo.title || '');
            const overlay = document.createElement('div'); overlay.className = 'photo-overlay';
            const ptitle = document.createElement('div'); ptitle.className = 'photo-title'; ptitle.textContent = photo.title || '';
            overlay.appendChild(ptitle);
            card.appendChild(img); card.appendChild(overlay);
            card.addEventListener('click', () => this.openModal(photo));
            frag.appendChild(card);
        });
        grid.appendChild(frag);
    }

    setupModal() {
        const modal = document.getElementById('photoModal');
        const closeBtn = document.getElementById('modalClose');

        if (!modal) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    openModal(photo) {
        const modal = document.getElementById('photoModal');
        if (!modal) return;
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        if (modalImage) { try { modalImage.setAttribute('src', photo.image || ''); } catch (e) { modalImage.src = ''; } }
        if (modalTitle) modalTitle.textContent = photo.title || '';
        if (modalDescription) modalDescription.textContent = photo.description || 'Amazing moment captured!';

        modal.classList.add('active');
    }

    destroy() {
        // SPA teardown hook (no persistent observers yet).
    }
}

// Boot for full page load AND SPA page swaps (hshs:page).
function startPhotos() {
    if (!document.getElementById('masonryGrid')) return;
    try {
        if (window.__hshsPhotosPage && typeof window.__hshsPhotosPage.destroy === 'function') {
            window.__hshsPhotosPage.destroy();
        }
    } catch (e) {}
    window.__hshsPhotosPage = new PhotosPage();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPhotos);
} else {
    startPhotos();
}
document.addEventListener('hshs:page', startPhotos);
window.startPhotos = startPhotos;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotosPage;
}
