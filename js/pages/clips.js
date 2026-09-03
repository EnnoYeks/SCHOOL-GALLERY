import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('clips', `<div class="clips-feed" id="clipsFeed"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
