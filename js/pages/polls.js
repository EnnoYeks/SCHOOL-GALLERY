import { renderPage } from '../components/page-templates.js';

export function render() { return renderPage('polls', `<div class="polls-list" id="pollsList"><div class="loading-skeleton"></div><div class="loading-skeleton"></div></div>`); }
export function init({ root } = {}) { if (window.hshsNavigation?.init) window.hshsNavigation.init(); if (typeof window.initPolls === 'function') window.initPolls(root); }
