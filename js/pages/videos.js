import { renderPage } from '../components/page-templates.js';

export function render() {
  return renderPage('videos', `<div class="videos-toolbar"><input id="videoSearchInput" type="search" placeholder="Search videos..." aria-label="Search videos"><div class="video-filters"><button class="filter-btn active" data-filter="all">All</button><button class="filter-btn" data-filter="popular">Popular</button><button class="filter-btn" data-filter="recent">Recent</button></div></div><div class="videos-grid" id="videosGrid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`);
}

export function init({ root } = {}) {
  if (window.hshsNavigation?.init) window.hshsNavigation.init();
  if (typeof window.initVideos === 'function') window.initVideos(root);
}
