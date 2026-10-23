(function () {
  'use strict';

  function mediaOf(p) {
    if (window.HshsStorage && typeof window.HshsStorage.mediaUrl === 'function') {
      return window.HshsStorage.mediaUrl(p) || '';
    }
    return p.image || p.imageUrl || p.thumbnailUrl || '';
  }

  class PhotosPage {
    constructor() {
      this.currentFilter = 'all';
      this.query = '';
      this.photos = [];
      this.init();
    }
    async init() {
      this.setupFilters();
      this.setupSearch();
      this.setupModal();
      await this.loadPhotos();
    }
    setupFilters() {
      var self = this;
      document.querySelectorAll('.filter-btn').forEach(function (btn) {
        if (btn.dataset.wired === '1') return;
        btn.dataset.wired = '1';
        btn.addEventListener('click', function () {
          document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          self.currentFilter = btn.getAttribute('data-filter') || 'all';
          self.render();
        });
      });
    }
    async loadPhotos() {
      var photos = [];
      try {
        photos = await (window.db && db.getPhotos ? db.getPhotos(48, 0) : []);
      } catch (e) { photos = []; }
      photos = Array.isArray(photos) ? photos.filter(Boolean) : [];

      // Fallback: list only the photos/ prefix from R2
      if (!photos.length && window.HshsStorage && typeof window.HshsStorage.list === 'function') {
        try {
          photos = await window.HshsStorage.list({ limit: 48, prefix: 'photos/' }) || [];
        } catch (e) { photos = []; }
      }

      photos = photos.map(function (p) {
        var url = mediaOf(p);
        p.image = p.image || url;
        p.imageUrl = p.imageUrl || url;
        p.thumbnailUrl = p.thumbnailUrl || url;
        return p;
      }).filter(function (p) { return p.image; });

      this.photos = photos;
      this.render();
    }
    filtered() {
      var list = this.photos.slice();
      var q = this.query.trim().toLowerCase();
      if (q) {
        list = list.filter(function (p) {
          return (p.title || '').toLowerCase().indexOf(q) !== -1 || (p.house || '').toLowerCase().indexOf(q) !== -1 || (p.category || '').toLowerCase().indexOf(q) !== -1;
        });
      }
      if (this.currentFilter === 'popular' || this.currentFilter === 'trending') {
        list.sort(function (a, b) { return ((b.likes || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.comments || 0)); });
      } else if (this.currentFilter === 'recent') {
        list.sort(function (a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); });
      } else if (this.currentFilter === 'sports' || this.currentFilter === 'houses' || this.currentFilter === 'campus') {
        list = list.filter(function (p) { return (p.category || '') === this.currentFilter; }, this);
      }
      return list;
    }
    render() {
      var grid = document.getElementById('masonryGrid');
      if (!grid) return;
      var list = this.filtered();
      grid.innerHTML = '';
      if (!list.length) {
        grid.innerHTML = '<div class="photos-empty">No photos yet.</div>';
        return;
      }
      var frag = document.createDocumentFragment();
      list.forEach(function (photo) { frag.appendChild(this.createPhotoCard(photo)); }, this);
      grid.appendChild(frag);
    }
    createPhotoCard(photo) {
      var card = document.createElement('article');
      card.className = 'photo-card';
      card.setAttribute('data-photo-id', String(photo.id || ''));
      var img = document.createElement('img');
      img.className = 'photo-image';
      img.alt = photo.title || 'Campus photo';
      img.loading = 'lazy';
      img.src = photo.image || '';
      img.addEventListener('error', function () {
        img.removeAttribute('src');
        card.classList.add('is-fallback');
      });
      var cap = document.createElement('div');
      cap.className = 'photo-caption';
      cap.innerHTML = '<strong></strong><span></span>';
      cap.querySelector('strong').textContent = photo.title || 'Campus photo';
      cap.querySelector('span').textContent = (photo.house || 'HSHS') + ' · ' + (photo.likes || 0) + ' likes';
      card.appendChild(img);
      card.appendChild(cap);
      card.addEventListener('click', this.openModal.bind(this, photo));
      return card;
    }
    setupSearch() {
      var self = this;
      var input = document.getElementById('photoSearchInput');
      var btn = document.querySelector('.search-submit');
      function go() { self.query = input ? input.value : ''; self.render(); }
      if (btn && btn.dataset.wired !== '1') { btn.dataset.wired = '1'; btn.addEventListener('click', go); }
      if (input && input.dataset.wired !== '1') { input.dataset.wired = '1'; input.addEventListener('input', go); }
    }
    setupModal() {
      var modal = document.getElementById('photoModal');
      var closeBtn = document.getElementById('modalClose');
      if (!modal || modal.dataset.wired === '1') return;
      modal.dataset.wired = '1';
      if (closeBtn) closeBtn.addEventListener('click', function () { modal.classList.remove('active'); });
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('active'); });
    }
    openModal(photo) {
      var modal = document.getElementById('photoModal');
      if (!modal) return;
      var modalImage = document.getElementById('modalImage');
      var modalTitle = document.getElementById('modalTitle');
      var modalDescription = document.getElementById('modalDescription');
      if (modalImage) { modalImage.src = photo.image || ''; modalImage.alt = photo.title || ''; }
      if (modalTitle) modalTitle.textContent = photo.title || '';
      if (modalDescription) modalDescription.textContent = photo.description || '';
      modal.classList.add('active');
    }
    destroy() {}
  }

  function startPhotos() {
    if (!document.getElementById('masonryGrid')) return;
    try {
      if (window.__hshsPhotosPage && typeof window.__hshsPhotosPage.destroy === 'function') window.__hshsPhotosPage.destroy();
    } catch (e) {}
    window.__hshsPhotosPage = new PhotosPage();
  }
  window.startPhotos = startPhotos;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPhotos);
  else startPhotos();
  document.addEventListener('hshs:page', startPhotos);
})();
