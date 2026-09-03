/* gallery page module — original markup, hydrate-first. */
export const pageId = "gallery";
export const styles = ["css/gallery.css", "css/mobile-shell.css", "css/hshs-theme.css"];
export const scripts = ["js/gallery.js"];
export const rootIds = ["galleryFeed", "categoryFilter"];
export const bodyClass = "light-mode";
export function render() {
  return `<div class="gallery-container"><div class="category-filter" id="categoryFilter"><button class="category-btn active" data-category="all">All</button><button class="category-btn" data-category="academics">Academics</button><button class="category-btn" data-category="sports">Sports</button><button class="category-btn" data-category="clubs">Clubs</button><button class="category-btn" data-category="trips">Trips</button><button class="category-btn" data-category="graduation">Graduation</button><button class="category-btn" data-category="arts">Arts</button><button class="category-btn" data-category="music">Music</button><button class="category-btn" data-category="events">Events</button></div><div class="story-bar" id="storyBar"></div><div class="gallery-feed" id="galleryFeed"><div class="post-loading"><div class="loading-spinner"></div></div></div><div class="swipe-indicator" id="swipeIndicator"><div class="swipe-arrow"><i class="fas fa-arrow-down"></i></div><div class="swipe-text">Scroll to explore</div></div></div><div class="double-tap-overlay" id="doubleTapOverlay"><i class="fas fa-heart"></i></div>`;
}
export async function init() {
  document.documentElement.classList.remove("hshs-booting");
  document.documentElement.classList.add("hshs-ready");
  if (document.body) document.body.classList.add("has-mobile-shell");
}
