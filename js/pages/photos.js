/* Photos structure - masonry + lightbox, same as the static page. */
(function (rootExport) {
  function html() {
    return `
<main class="photos-container">
  <div class="photos-search">
    <input type="text" class="search-input-field" id="photoSearchInput" placeholder="Search photos by title, category...">
    <button class="search-submit" type="button"><i class="fas fa-search"></i> Search</button>
  </div>
  <div class="filter-bar" id="filterBar">
    <button class="filter-btn active" data-filter="all">All Photos</button>
    <button class="filter-btn" data-filter="popular">Most Popular</button>
    <button class="filter-btn" data-filter="recent">Most Recent</button>
    <button class="filter-btn" data-filter="trending">Trending</button>
  </div>
  <div class="masonry-grid" id="masonryGrid">
    <div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>
  </div>
</main>
<div class="photo-modal" id="photoModal">
  <div class="modal-content">
    <button class="modal-close" id="modalClose" aria-label="Close"><i class="fas fa-times"></i></button>
    <img src="" alt="Full Photo" class="modal-image" id="modalImage">
    <div class="modal-info">
      <div class="modal-title" id="modalTitle">Photo Title</div>
      <div class="modal-description" id="modalDescription">Photo description goes here</div>
      <div class="modal-actions">
        <button class="modal-action-btn" type="button"><i class="fas fa-heart"></i> Like</button>
        <button class="modal-action-btn secondary" type="button"><i class="fas fa-comment"></i> Comment</button>
        <button class="modal-action-btn secondary" type="button"><i class="fas fa-share"></i> Share</button>
        <button class="modal-action-btn secondary" type="button"><i class="fas fa-download"></i> Download</button>
      </div>
    </div>
  </div>
</div>
<div class="photo-details" id="photoDetails">
  <button class="details-close" type="button"><i class="fas fa-times"></i></button>
  <div class="detail-section"><div class="detail-title">Title</div><div class="detail-content" id="detailTitle">Loading...</div></div>
  <div class="detail-section"><div class="detail-title">Category</div><div class="detail-content" id="detailCategory">Loading...</div></div>
  <div class="detail-section"><div class="detail-title">Uploaded By</div><div class="detail-content" id="detailAuthor">Loading...</div></div>
  <div class="detail-section"><div class="detail-title">Date</div><div class="detail-content" id="detailDate">Loading...</div></div>
  <div class="detail-section"><div class="detail-title">Statistics</div><div class="detail-content"><div><strong id="detailLikes">0</strong> Likes</div><div><strong id="detailComments">0</strong> Comments</div><div><strong id="detailViews">0</strong> Views</div></div></div>
</div>`;
  }
  function mount() {
    const root = document.getElementById('hshsPhotosRoot');
    if (!root || root.dataset.mounted === '1') return;
    root.innerHTML = html();
    root.dataset.mounted = '1';
  }
  rootExport.renderPhotos = html;
  rootExport.initPhotos = mount;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})(typeof window !== 'undefined' ? (window.HshsPages = window.HshsPages || {}) : {});
export function render() { return window.HshsPages.renderPhotos(); }
export function init() { if (window.HshsPages.initPhotos) window.HshsPages.initPhotos(); }
