import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('admin', `<div class="admin-dashboard" id="adminDashboard"><div class="content-grid"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div></div>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
