import { renderPage } from '../components/page-templates.js';
import { getPhotos } from '../services/page-data.js';

export function render() {
  return renderPage('photos', `
    <div class="photos-search"><input id="photoSearchInput" type="search" placeholder="Search photos..." aria-label="Search photos"><button id="photoSearchBtn" class="btn btn-primary"><i class="fas fa-search"></i> Search</button></div>
    <div class="filter-bar" role="tablist" aria-label="Photo filters"><button class="filter-btn active" data-filter="all">All Photos</button><button class="filter-btn" data-filter="popular">Most Popular</button><button class="filter-btn" data-filter="recent">Most Recent</button><button class="filter-btn" data-filter="trending">Trending</button></div>
    <div class="masonry-grid" id="masonryGrid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>
    <div class="photo-modal" id="photoModal" hidden></div><aside class="photo-details" id="photoDetails" hidden></aside>`);
}

export async function init({ root } = {}) {
  if (window.hshsNavigation?.init) window.hshsNavigation.init();
  try {
    const items = await getPhotos(20, 0);
    window.__hshsPageData = window.__hshsPageData || {};
    window.__hshsPageData.photos = items;
  } catch (_) {}
  if (typeof window.initPhotos === 'function') window.initPhotos(root);
}
