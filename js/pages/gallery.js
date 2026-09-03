import { renderPage } from '../components/page-templates.js';

export function render() {
  return renderPage('gallery', `<div class="gallery-grid" id="galleryGrid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`);
}

export function init({ root } = {}) {
  if (window.hshsNavigation?.init) window.hshsNavigation.init();
  if (typeof window.initGallery === 'function') window.initGallery(root);
}
