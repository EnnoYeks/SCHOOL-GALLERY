import { renderPage } from '../components/page-templates.js';

export function render() { return renderPage('spotlight', `<div class="spotlight-grid" id="spotlightGrid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`); }
export function init({ root } = {}) { if (window.hshsNavigation?.init) window.hshsNavigation.init(); if (typeof window.initSpotlight === 'function') window.initSpotlight(root); }
