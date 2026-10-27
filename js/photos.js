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
      if (!list.length) {
        grid.innerHTML = '<div class="photos-empty">No photos yet.</div>';
        return;
      }
      if (window.HshsMediaCards && window.HshsMediaCards.keyedPhotoUpdate) {
        window.HshsMediaCards.keyedPhotoUpdate(grid, list, this.createPhotoCard.bind(this));
      } else {
        grid.innerHTML = '';
        var frag = document.createDocumentFragment();
        list.forEach(function (photo) { frag.appendChild(this.createPhotoCard(photo)); }, this);
        grid.appendChild(frag);
      }
    }
    createPhotoCard(photo) {
      var card = document.createElement('article');
      card.className = 'photo-card';
      card.setAttribute('data-photo-id', String(photo.id || photo.mediaKey || photo.media_key || ''));
      if (photo.width && photo.height) card.style.aspectRatio = String(photo.width) + ' / ' + String(photo.height);
      card.style.setProperty('--photo-dominant', photo.dominantColor || '#10245a');
      card.classList.add('is-loading');
      if (photo.blurData) {
        var blur = document.createElement('img');
        blur.className = 'photo-blur'; blur.alt = ''; blur.setAttribute('aria-hidden', 'true');
        blur.src = photo.blurData; card.appendChild(blur);
      }
      var img = document.createElement('img');
      img.className = 'photo-image';
      img.alt = photo.title || 'Campus photo';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = photo.image || '';
      img.addEventListener('load', function () { card.classList.add('is-loaded'); card.classList.remove('is-loading'); var blur = card.querySelector('.photo-blur'); if (blur) blur.remove(); }, { once: true });
      img.addEventListener('error', function () {
        img.removeAttribute('src');
        card.classList.add('is-fallback');
        card.classList.remove('is-loading');
      });
      var cap = document.createElement('div');
      cap.className = 'photo-caption';
      cap.innerHTML = '<strong></strong><span></span>';
      cap.querySelector('strong').textContent = photo.title || 'Campus photo';
      cap.querySelector('span').textContent = (photo.house || 'HSHS') + ' · ' + (photo.likes || 0) + ' likes';
      card.appendChild(img);
      var like = document.createElement('button');
      like.type = 'button'; like.className = 'like-btn'; like.setAttribute('aria-label', 'Like photo');
      like.innerHTML = '<span aria-hidden="true">♥</span>';
      var likeKey = 'hshs-liked-photo-' + String(photo.id || '');
      try { if (sessionStorage.getItem(likeKey) === '1') like.classList.add('liked'); } catch (_) {}
      like.addEventListener('click', async function (event) {
        event.stopPropagation();
        if (!photo.id || like.classList.contains('liked')) return;
        var sb = window.supabase;
        if (!sb || typeof sb.rpc !== 'function') return;
        like.disabled = true;
        like.classList.add('heart-pop');
        window.setTimeout(function () { like.classList.remove('heart-pop'); }, 450);
        try {
          var result = await sb.rpc('increment_photo_likes', { photo_id: photo.id });
          if (result && result.error) throw result.error;
          like.classList.add('liked');
          photo.likes = (Number(photo.likes) || 0) + 1;
          cap.querySelector('span').textContent = (photo.house || 'HSHS') + ' · ' + photo.likes + ' likes';
          try { sessionStorage.setItem(likeKey, '1'); } catch (_) {}
        } catch (error) {
          console.warn('[HSHS] Could not save photo like:', error && error.message);
          like.setAttribute('aria-label', 'Could not save like. Try again.');
        } finally { like.disabled = false; }
      });
      card.appendChild(like);
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
