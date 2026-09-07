(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.gallery = `
    <main class="gallery-page">
      <section class="gallery-hero">
        <div class="gallery-hero-card">
          <span class="gallery-pill">Campus feed</span>
          <h1>Gallery</h1>
          <p>Photos, clips and school moments in one place.</p>
          <div class="gallery-hero-actions">
            <button class="gallery-btn-primary" type="button" id="galleryShareBtn"><i class="fas fa-plus"></i> Share a moment</button>
            <a class="gallery-btn-ghost" href="videos.html"><i class="fas fa-clapperboard"></i> HSHS Studio</a>
          </div>
        </div>
      </section>
      <section class="gallery-toolbar" aria-label="Gallery filters">
        <div class="gallery-search">
          <i class="fas fa-magnifying-glass"></i>
          <input id="gallerySearch" type="search" placeholder="Search moments, clubs, sports…" aria-label="Search gallery">
        </div>
        <div class="gallery-types" id="galleryTypes" role="tablist">
          <button class="gallery-chip is-on" type="button" data-type="all">All</button>
          <button class="gallery-chip" type="button" data-type="photo">Photos</button>
          <button class="gallery-chip" type="button" data-type="video">Videos</button>
        </div>
        <div class="gallery-toolbar-head"><strong>Explore</strong><span id="galleryResultCount">Loading…</span></div>
        <div class="category-filter" id="categoryFilter">
          <button class="category-btn active" data-category="all">All</button>
          <button class="category-btn" data-category="academics">Academics</button>
          <button class="category-btn" data-category="sports">Sports</button>
          <button class="category-btn" data-category="clubs">Clubs</button>
          <button class="category-btn" data-category="events">Events</button>
          <button class="category-btn" data-category="arts">Arts</button>
          <button class="category-btn" data-category="music">Music</button>
          <button class="category-btn" data-category="graduation">Graduation</button>
        </div>
      </section>
      <section class="gallery-feed" id="galleryFeed" aria-live="polite">
        <article class="gallery-skel"></article><article class="gallery-skel"></article><article class="gallery-skel"></article><article class="gallery-skel"></article>
      </section>
      <div class="gallery-loader" id="galleryLoader" hidden><div class="hshs-wave"><i></i><i></i><i></i></div></div>
      <div class="gallery-sentinel" id="gallerySentinel" aria-hidden="true"></div>
      <section class="gallery-empty" id="galleryEmpty" hidden>
        <div class="empty-orb"><i class="far fa-images"></i></div>
        <h2>No moments yet</h2>
        <p>When photos or videos are shared to HSHS World, they will land here.</p>
      </section>
    </main>
    <div class="gallery-viewer" id="galleryViewer" hidden>
      <button class="gv-close" type="button" data-gv="close" aria-label="Close"><i class="fas fa-xmark"></i></button>
      <button class="gv-nav prev" type="button" data-gv="prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
      <button class="gv-nav next" type="button" data-gv="next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
      <div class="gv-stage" id="galleryViewerStage"></div>
      <div class="gv-meta"><strong id="gvTitle"></strong><small id="gvBy"></small>
        <div class="gv-actions">
          <button type="button" data-gv-act="like"><i class="fas fa-heart"></i></button>
          <button type="button" data-gv-act="save"><i class="fas fa-bookmark"></i></button>
          <button type="button" data-gv-act="share"><i class="fas fa-share"></i></button>
        </div>
      </div>
    </div>`;
})(typeof window !== 'undefined' ? window : this);
