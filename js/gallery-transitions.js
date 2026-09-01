(function () {
  if (window.__hshsGalleryTransitions) return;
  window.__hshsGalleryTransitions = true;

  function run() {
    if (window.__hshsStagger) {
      window.__hshsStagger(document.getElementById('galleryFeed') || document.getElementById('masonryGrid') || document);
    }
  }

  document.addEventListener('hshs:page', run);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
