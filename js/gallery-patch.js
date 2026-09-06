/**
 * GalleryPage runtime patch: fix updateObserver init order (live main bug).
 */
(function () {
  'use strict';
  function patch() {
    if (typeof GalleryPage === 'undefined' || GalleryPage.__hshsPatched) return;
    GalleryPage.__hshsPatched = true;
    GalleryPage.prototype.updateObserver = function () {
      var feed = document.getElementById('galleryFeed');
      if (!feed || !this.observer) return;
      try { this.observer.disconnect(); } catch (e) {}
      var cards = feed.querySelectorAll('.post-card');
      if (cards.length) this.observer.observe(cards[cards.length - 1]);
    };
    GalleryPage.prototype.init = async function () {
      this.setupCategoryFilter();
      this.setupInfiniteScroll();
      await this.loadPosts();
      this.setupSwipeNavigation();
      this.setupDoubleClick();
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patch);
  else patch();
  setTimeout(patch, 0);
  setTimeout(patch, 100);
})();
