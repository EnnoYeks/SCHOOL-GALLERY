import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('notifications', `<div class="notifications-list" id="notificationsList"><div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`); }
export function init({ root } = {}) { if (window.hshsNavigation?.init) window.hshsNavigation.init(); if (typeof window.initNotifications === 'function') window.initNotifications(root); }
