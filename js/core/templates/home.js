(function (global) {
  'use strict';
  global.HshsTemplates = global.HshsTemplates || {};
  global.HshsTemplates.home = '<main class="home-page vibe-home home-featured-only">'
    + '<section class="home-section home-featured-only-section" aria-labelledby="featuredHomeTitle">'
    + '<div class="home-section-head">'
    + '<div><span class="vibe-pill">HSHS WORLD</span><h1 class="home-section-title" id="featuredHomeTitle"><i class="fas fa-crown"></i> Featured</h1>'
    + '<p class="home-featured-intro">The moments worth seeing from our school community.</p></div>'
    + '<a class="home-link" href="index/gallery.html">View all <i class="fas fa-chevron-right"></i></a>'
    + '</div>'
    + '<div class="home-featured-grid" id="featuredGrid" aria-live="polite">'
    + '<div class="home-skeleton"></div><div class="home-skeleton"></div><div class="home-skeleton"></div>'
    + '</div></section>'
    + '</main>';
})(typeof window !== 'undefined' ? window : this);
