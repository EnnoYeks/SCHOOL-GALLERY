(function (global) {
  'use strict';
  global.HshsTemplates = global.HshsTemplates || {};
  global.HshsTemplates.home = '<main class="home-page vibe-home">'
    + '<section class="vibe-hero"><div class="vibe-hero-card">'
    + '<div class="vibe-hero-photos" aria-hidden="true"><span></span><span></span><span></span><span></span></div>'
    + '<div class="vibe-hero-crest" aria-hidden="true"></div>'
    + '<div class="vibe-hero-sparkles" aria-hidden="true"><i class="vibe-spark"></i><i class="vibe-spark"></i><i class="vibe-spark"></i></div>'
    + '<div class="vibe-hero-copy"><span class="vibe-pill">Welcome to</span>'
    + '<h1>HSHS WORLD</h1>'
    + '<p class="vibe-sub">Your school. One world.<br>Photos, Vibe, Buzz and memories.</p>'
    + '<p class="vibe-desc">The HSHS home for school moments, achievements and community.</p>'
    + '<div class="vibe-cta"><a class="vibe-btn-primary" href="index/gallery.html"><i class="fas fa-play"></i> Explore Feed</a>'
    + '<a class="vibe-btn-ghost" href="index/about.html"><i class="fas fa-circle-info"></i> Learn More</a></div></div>'
    + '</div></section>'
    + '<section class="home-section"><div class="home-section-head"><h2 class="home-section-title"><i class="fas fa-crown"></i> Featured Today</h2><a class="home-link" href="index/gallery.html">View all <i class="fas fa-chevron-right"></i></a></div>'
    + '<div class="home-featured-grid" id="featuredGrid"><div class="home-skeleton"></div><div class="home-skeleton"></div><div class="home-skeleton"></div></div></section>'
    + '<section class="home-section"><div class="home-stats">'
    + '<div class="home-stat"><i class="fas fa-image"></i><div><strong id="totalPhotos" data-count="0">0</strong><span>Photos</span></div><i class="fas fa-chevron-right"></i></div>'
    + '<div class="home-stat"><i class="fas fa-video"></i><div><strong id="totalVideos" data-count="0">0</strong><span>Vibe</span></div><i class="fas fa-chevron-right"></i></div>'
    + '<div class="home-stat"><i class="fas fa-users"></i><div><strong id="totalStudents" data-count="0">0</strong><span>Students</span></div><i class="fas fa-chevron-right"></i></div>'
    + '<div class="home-stat"><i class="fas fa-heart"></i><div><strong id="totalLikes" data-count="0">0</strong><span>Likes</span></div><i class="fas fa-chevron-right"></i></div>'
    + '</div></section>'
    + '<section class="home-section"><div class="home-discovery">'
    + '<article class="home-panel large"><h3><i class="fas fa-fire"></i> Trending Today</h3><div id="homeTrending" class="home-panel-list"><div class="home-empty">Loading trending moments…</div></div></article>'
    + '<article class="home-panel"><h3><i class="fas fa-calendar-days"></i> Upcoming Events</h3><div id="homeEvents" class="home-empty">No event data loaded yet.</div></article>'
    + '</div></section>'
    + '</main>';
})(typeof window !== 'undefined' ? window : this);
