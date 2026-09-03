import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('more', `<div class="more-grid" id="moreGrid"><button class="feature-card"><i class="fas fa-upload"></i><span>Upload</span></button><button class="feature-card"><i class="fas fa-search"></i><span>Search</span></button><button class="feature-card"><i class="fas fa-users"></i><span>Community</span></button></div>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
