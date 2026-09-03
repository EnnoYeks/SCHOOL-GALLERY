import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('buzz', `<div class="buzz-feed" id="buzzFeed"><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
