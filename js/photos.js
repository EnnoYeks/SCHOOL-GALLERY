import { getPhotos } from './services/page-data.js';

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
        document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', async () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentFilter = btn.dataset.filter || 'all';
            this.currentPage = 0;
            await this.loadPhotos();
        }));
    }

    async loadPhotos() {
        const grid = document.getElementById('masonryGrid');
        if (!grid) return;
        let photos = await getPhotos(this.photosPerPage * (this.currentPage + 1), 0);
        if (this.currentFilter === 'popular') photos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        if (this.currentFilter === 'trending') photos.sort((a, b) => ((b.likes || 0) + (b.comments || 0) + (b.views || 0)) - ((a.likes || 0) + (a.comments || 0) + (a.views || 0)));
        if (this.currentFilter === 'recent') photos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const start = this.currentPage * this.photosPerPage;
        const pagePhotos = photos.slice(start, start + this.photosPerPage);
        if (this.currentPage === 0) grid.innerHTML = '';
        pagePhotos.forEach(photo => grid.appendChild(this.createPhotoCard(photo)));
        this.currentPage++;
        if (!pagePhotos.length && this.currentPage === 1) grid.innerHTML = '<div class="empty-state"><i class="fas fa-camera"></i><h2>No photos yet</h2><p>School moments will appear here when they are shared.</p></div>';
    }

    createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.photoId = String(photo.id ?? '');
        card.dataset.postId = String(photo.id ?? '');
        const img = document.createElement('img');
        img.className = 'photo-image';
        img.src = photo.image || photo.imageUrl || photo.mediaUrl || '';
        img.alt = photo.title || 'Photo';
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        const header = document.createElement('div');
        header.className = 'photo-header';
        const author = document.createElement('div');
        author.className = 'photo-author';
        const av = document.createElement('img');
        av.className = 'author-avatar';
        av.src = photo.authorAvatar || photo.avatar || '';
        av.alt = photo.author || '';
        const authorName = document.createElement('div');
        authorName.className = 'author-name';
        authorName.textContent = photo.author || 'HSHS Student';
        author.append(av, authorName);
        const likeBtn = document.createElement('button');
        likeBtn.className = 'photo-like-btn';
        likeBtn.type = 'button';
        likeBtn.setAttribute('aria-label', 'Like photo');
        likeBtn.innerHTML = '<i class="far fa-heart"></i>';
        likeBtn.addEventListener('click', ev => { ev.stopPropagation(); try { window.reactionManager?.toggleLike(String(photo.id)); } catch (_) {} });
        header.append(author, likeBtn);

        const footer = document.createElement('div');
        footer.className = 'photo-footer';
        const title = document.createElement('div');
        title.className = 'photo-title';
        title.textContent = photo.title || 'Untitled moment';
        const stats = document.createElement('div');
        stats.className = 'photo-stats';
        stats.innerHTML = `<div class="stat"><i class="fas fa-heart"></i> ${photo.likes || 0}</div><div class="stat"><i class="fas fa-eye"></i> ${photo.views || 0}</div>`;
        footer.append(title, stats);
        overlay.append(header, footer);
        card.append(img, overlay);
        card.addEventListener('click', () => this.openModal(photo));
        return card;
    }

    setupSearch() {
        const btn = document.getElementById('photoSearchBtn');
        const input = document.getElementById('photoSearchInput');
        if (!btn || !input) return;
        btn.addEventListener('click', () => this.search(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Enter') this.search(input.value); });
    }

    async search(query) {
        const grid = document.getElementById('masonryGrid');
        if (!grid) return;
        const term = String(query || '').trim().toLowerCase();
        const all = await getPhotos(100, 0);
        const results = term ? all.filter(p => `${p.title || ''} ${p.description || ''} ${p.author || ''}`.toLowerCase().includes(term)) : all;
        grid.innerHTML = '';
        results.forEach(photo => grid.appendChild(this.createPhotoCard(photo)));
        if (!results.length) grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h2>No photos found</h2><p>Try another search.</p></div>';
    }

    setupModal() {
        const modal = document.getElementById('photoModal');
        if (!modal) return;
        document.getElementById('modalClose')?.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
    }

    openModal(photo) {
        const modal = document.getElementById('photoModal');
        if (!modal) return;
        modal.innerHTML = `<div class="photo-modal-content"><button type="button" class="modal-close" aria-label="Close">&times;</button><img alt=""><div class="photo-modal-caption"><h2></h2><p></p></div></div>`;
        const image = modal.querySelector('img');
        image.src = photo.image || photo.imageUrl || photo.mediaUrl || '';
        image.alt = photo.title || 'Photo';
        modal.querySelector('h2').textContent = photo.title || 'Photo';
        modal.querySelector('p').textContent = photo.description || '';
        modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('active'));
        modal.classList.add('active');
    }
}

window.PhotosPage = PhotosPage;
window.initPhotos = function () {
    if (!document.getElementById('masonryGrid')) return;
    if (window.__hshsPhotosInstance) return window.__hshsPhotosInstance;
    window.__hshsPhotosInstance = new PhotosPage();
    return window.__hshsPhotosInstance;
};

document.addEventListener('DOMContentLoaded', () => window.initPhotos?.());
