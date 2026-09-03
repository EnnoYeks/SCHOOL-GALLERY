import { renderPage } from '../components/page-templates.js';
export function render() { return renderPage('about', `<article class="info-card"><h2>Our school, our stories</h2><p>HSHS World brings photos, videos, achievements, conversations and memories together in one school community.</p><p>Built for students and the school community to celebrate everyday moments.</p></article>`); }
export function init() { if (window.hshsNavigation?.init) window.hshsNavigation.init(); }
