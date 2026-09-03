import { renderPage } from '../components/page-templates.js';

export function render() {
  return renderPage('trending', `<div class="trending-list" id="trendingList"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`);
}

export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
