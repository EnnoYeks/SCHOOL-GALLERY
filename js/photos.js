(function () {
  'use strict';
  var CAMPUS = [
    { id: 'ph1', title: 'Morning assembly', description: 'The school gathers before lessons on the Bududa campus.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=70', author: 'HSHS Media', house: 'Campus', category: 'campus', likes: 86, views: 420, comments: 12, createdAt: '2026-09-20' },
    { id: 'ph2', title: 'Sports Day track', description: 'House teams line up for the 100 metres.', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=900&q=70', author: 'Sports Desk', house: 'Eagle', category: 'sports', likes: 124, views: 690, comments: 18, createdAt: '2026-09-18' },
    { id: 'ph3', title: 'Library hour', description: 'Quiet reading time in the school library.', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=70', author: 'Library Club', house: 'Falcon', category: 'campus', likes: 64, views: 310, comments: 6, createdAt: '2026-09-12' },
    { id: 'ph4', title: 'Football after class', description: 'A friendly match on the school field.', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=70', author: 'Sports Desk', house: 'Lion', category: 'sports', likes: 141, views: 802, comments: 22, createdAt: '2026-09-22' },
    { id: 'ph5', title: 'Art studio', description: 'Colour studies from the creative arts club.', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=70', author: 'Arts Club', house: 'Falcon', category: 'houses', likes: 73, views: 280, comments: 9, createdAt: '2026-09-08' },
    { id: 'ph6', title: 'Hills around Bududa', description: 'The view from the school slopes after rain.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=70', author: 'HSHS Media', house: 'Campus', category: 'campus', likes: 98, views: 540, comments: 11, createdAt: '2026-09-15' },
    { id: 'ph7', title: 'Class in session', description: 'A lesson underway in the main block.', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=70', author: 'Academics', house: 'Eagle', category: 'campus', likes: 57, views: 260, comments: 4, createdAt: '2026-09-05' },
    { id: 'ph8', title: 'House colour day', description: 'Eagle, Lion and Falcon show their colours.', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=70', author: 'House Captains', house: 'Lion', category: 'houses', likes: 116, views: 610, comments: 15, createdAt: '2026-09-25' },
    { id: 'ph9', title: 'Science bench', description: 'A practical session in the science room.', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=70', author: 'Science Club', house: 'Eagle', category: 'campus', likes: 69, views: 333, comments: 7, createdAt: '2026-09-11' }
  ];

  function seed() { return CAMPUS.map(function (p) { return Object.assign({}, p); }); }

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
        photos = await (window.db && db.getPhotos ? db.getPhotos(24, 0) : []);
      } catch (e) { photos = []; }
      photos = Array.isArray(photos) ? photos.filter(Boolean) : [];
      this.photos = photos.length ? photos : seed();
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
        grid.innerHTML = '<div class="photos-empty">No photos match that search yet.</div>';
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
