(function(g){'use strict';g.HshsTemplates=g.HshsTemplates||{};g.HshsTemplates['photos']=`
<main class="photos-page">
  <section class="photos-hero">
    <div>
      <span class="photos-kicker"><i class="fas fa-camera"></i> HSHS WORLD · CAMPUS</span>
      <h1>Photos from <span>school life</span></h1>
      <p>Sports day, houses, class, trips and the moments that make Hawthorne Scribner feel like home.</p>
    </div>
    <div class="photos-hero-stats">
      <span><i class="fas fa-images"></i> Campus album</span>
      <span><i class="fas fa-school"></i> Bududa</span>
    </div>
  </section>
  <div class="photos-search">
    <input type="text" class="search-input-field" id="photoSearchInput" placeholder="Search photos by title or house...">
    <button class="search-submit" type="button"><i class="fas fa-search"></i> Search</button>
  </div>
  <div class="filter-bar" id="filterBar">
    <button class="filter-btn active" data-filter="all" type="button">All Photos</button>
    <button class="filter-btn" data-filter="popular" type="button">Most Popular</button>
    <button class="filter-btn" data-filter="recent" type="button">Most Recent</button>
    <button class="filter-btn" data-filter="trending" type="button">Trending</button>
    <button class="filter-btn" data-filter="sports" type="button">Sports</button>
    <button class="filter-btn" data-filter="houses" type="button">Houses</button>
    <button class="filter-btn" data-filter="campus" type="button">Campus</button>
  </div>
  <div class="masonry-grid" id="masonryGrid" aria-live="polite">
    <div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>
  </div>
  <div class="photo-modal" id="photoModal">
    <div class="modal-content">
      <button class="modal-close" id="modalClose" type="button" aria-label="Close"><i class="fas fa-times"></i></button>
      <img src="" alt="" class="modal-image" id="modalImage">
      <div class="modal-info">
        <div class="modal-title" id="modalTitle">Photo</div>
        <div class="modal-description" id="modalDescription"></div>
      </div>
    </div>
  </div>
</main>`;})(typeof window!=='undefined'?window:this);
