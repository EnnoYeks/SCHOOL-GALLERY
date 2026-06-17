// ============================================
// PHOTOS PAGE LOGIC
// ============================================

class PhotosPage {
    constructor() {
        this.currentFilter = 'all';
        this.currentPage = 0;
        this.photosPerPage = CONFIG.pagination.photosPerPage;
        this.init();
    }

    init() {
        this.setupFilters();
        this.loadPhotos();
        this.setupSearch();
        this.setupModal();
    }

    setupFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.currentPage = 0;
                this.loadPhotos();
            });
        });
    }

    loadPhotos() {
        const grid = document.getElementById('masonryGrid');
        if (!grid) return;

        let photos = db.getPhotos();

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

        pagePhotos.forEach((photo) => {
            const card = this.createPhotoCard(photo);
            grid.appendChild(card);
        });

        this.currentPage++;
    }

    createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.setAttribute('data-photo-id', photo.id);
        card.innerHTML = `
            <img src="${photo.image}" alt="${photo.title}" class="photo-image">
            <div class="photo-overlay">
                <div class="photo-header">
                    <div class="photo-author">
                        <img src="${photo.authorAvatar || 'https://via.placeholder.com/32'}" alt="${photo.author}" class="author-avatar">
                        <div class="author-name">${photo.author}</div>
                    </div>
                    <button class="photo-like-btn" onclick="event.stopPropagation(); reactionManager.toggleLike('${photo.id}')">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="photo-footer">
                    <div class="photo-title">${photo.title}</div>
                    <div class="photo-stats">
                        <div class="stat">
                            <i class="fas fa-heart"></i> ${Utils.formatNumber(photo.likes || 0)}
                        </div>
                        <div class="stat">
                            <i class="fas fa-eye"></i> ${Utils.formatNumber(photo.views || 0)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.openModal(photo);
        });

        return card;
    }

    setupSearch() {
        const searchBtn = document.querySelector('.search-submit');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = document.getElementById('photoSearchInput').value;
                this.search(query);
            });
        }
    }

    search(query) {
        const results = db.search(query, 'photos');
        const grid = document.getElementById('masonryGrid');
        grid.innerHTML = results.map(photo => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img src="${photo.image}" alt="${photo.title}" class="photo-image">
                <div class="photo-overlay">
                    <div class="photo-title">${photo.title}</div>
                </div>
            `;
            card.addEventListener('click', () => this.openModal(photo));
            return card.outerHTML;
        }).join('');
    }

    setupModal() {
        const modal = document.getElementById('photoModal');
        const closeBtn = document.getElementById('modalClose');

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
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');

        if (modalImage) modalImage.src = photo.image;
        if (modalTitle) modalTitle.textContent = photo.title;
        if (modalDescription) modalDescription.textContent = photo.description || 'Amazing moment captured!';

        modal.classList.add('active');
    }
}

// Initialize photos page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('masonryGrid')) {
        new PhotosPage();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotosPage;
}
