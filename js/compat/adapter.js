// js/compat/adapter.js
// Compatibility adapter: safely re-run legacy module init functions after app injection
function safeCall(fn) {
  try { if (typeof fn === 'function') fn(); } catch (e) { console.warn('compat init failed', e); }
}

window.addEventListener('app:hydration:ready', () => {
  safeCall(window.hshsNavigation && window.hshsNavigation.init);
});

window.addEventListener('app:page:loaded', () => {
  safeCall(window.hshsNavigation && window.hshsNavigation.init);
  safeCall(window.hshsMobileShell && window.hshsMobileShell.init);
  // page-specific fallbacks
  safeCall(window.initGallery);
  safeCall(window.initPhotos);
  safeCall(window.initVideos);
});
