/* Gallery structure - same mobile look as the static page. Feed logic stays in ../gallery.js */
(function (rootExport) {
  function html() {
    return `
<main class="gallery-container">
  <div class="category-filter" id="categoryFilter">
    <button class="category-btn active" data-category="all"><i class="fas fa-th"></i> All</button>
    <button class="category-btn" data-category="academics"><i class="fas fa-book"></i> Academics</button>
    <button class="category-btn" data-category="sports"><i class="fas fa-basketball-ball"></i> Sports</button>
    <button class="category-btn" data-category="clubs"><i class="fas fa-users"></i> Clubs</button>
    <button class="category-btn" data-category="trips"><i class="fas fa-bus"></i> Trips</button>
    <button class="category-btn" data-category="graduation"><i class="fas fa-graduation-cap"></i> Graduation</button>
    <button class="category-btn" data-category="arts"><i class="fas fa-palette"></i> Arts</button>
    <button class="category-btn" data-category="music"><i class="fas fa-music"></i> Music</button>
    <button class="category-btn" data-category="events"><i class="fas fa-calendar"></i> Events</button>
  </div>
  <div class="story-bar" id="storyBar">
    <div class="story-item"><i class="fas fa-plus"></i></div>
  </div>
  <div class="gallery-feed" id="galleryFeed">
    <div class="post-loading"><div class="loading-spinner"></div></div>
  </div>
  <div class="swipe-indicator" id="swipeIndicator">
    <div class="swipe-arrow"><i class="fas fa-arrow-down"></i></div>
    <div class="swipe-text">Scroll to explore</div>
  </div>
</main>
<div class="double-tap-overlay" id="doubleTapOverlay"><i class="fas fa-heart"></i></div>`;
  }
  function mount() {
    const root = document.getElementById('hshsGalleryRoot');
    if (!root || root.dataset.mounted === '1') return;
    root.innerHTML = html();
    root.dataset.mounted = '1';
  }
  rootExport.render = html;
  rootExport.init = mount;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})(typeof window !== 'undefined' ? (window.HshsPages = window.HshsPages || {}) : {});
export function render() { return window.HshsPages.render(); }
export function init() { if (window.HshsPages.init) window.HshsPages.init(); }
