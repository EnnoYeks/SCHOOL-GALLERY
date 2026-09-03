/* photos — original look, hydrate-first */
export const pageId = "photos";
export const styles = ["css/photos.css", "css/mobile-shell.css", "css/hshs-theme.css"];
export const scripts = ["js/photos.js"];
export const rootIds = ["masonryGrid", "photoModal"];
export const bodyClass = "light-mode";
export function render() {
  return `<div class="photos-container">
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
            <div class="loading-skeleton"></div>
            <div class="loading-skeleton"></div>
            <div class="loading-skeleton"></div>
            <div class="loading-skeleton"></div>
            <div class="loading-skeleton"></div>
            <div class="loading-skeleton"></div>
        </div>
    </div>
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
    </div>`;
}
export async function init() {
  document.documentElement.classList.remove("hshs-booting");
  document.documentElement.classList.add("hshs-ready");
  if (document.body) document.body.classList.add("has-mobile-shell");
}
