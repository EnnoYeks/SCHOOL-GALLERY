import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('profile', `<div class="profile-card" id="profileCard"><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div><div class="profile-content" id="profileContent"></div>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
