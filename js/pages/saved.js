import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('saved', `<div class="saved-grid" id="savedGrid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
