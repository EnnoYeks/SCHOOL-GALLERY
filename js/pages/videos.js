import { renderPage } from '../components/page-templates.js';

export function render() {
  return renderPage('videos', `
    <main class="vibe-page" id="vibePage">
      <section class="vibe-hero-card"><div class="vibe-hero-copy"><span class="vibe-kicker"><i class="fas fa-play"></i> HSHS MEDIA</span><h1>School <em>Vibe</em></h1><p>Big moments, real memories and the stories happening around HSHS.</p><button class="vibe-upload" id="uploadVideoBtn" type="button"><i class="fas fa-plus"></i> Upload Video</button></div><div class="vibe-dots"><span class="on"></span><span></span><span></span><span></span><span></span></div></section>
      <div class="vibe-tabs video-tabs" role="tablist" aria-label="Vibe categories"><button class="vibe-tab video-tab active" data-filter="all"><i class="fas fa-th"></i> All</button><button class="vibe-tab video-tab" data-filter="trending"><i class="fas fa-fire"></i> Trending</button><button class="vibe-tab video-tab" data-filter="latest"><i class="fas fa-bolt"></i> Latest</button><button class="vibe-tab video-tab" data-filter="sports"><i class="fas fa-futbol"></i> Sports</button><button class="vibe-tab video-tab" data-filter="events"><i class="fas fa-calendar"></i> Events</button><button class="vibe-tab video-tab" data-filter="academics"><i class="fas fa-book"></i> Academics</button></div>
      <section class="featured-video-section" id="featuredVideoSection"><div class="vibe-row-head"><h2>Featured</h2><button type="button" data-filter-jump="all">View all →</button></div><div class="vibe-featured" id="featuredVideo"></div></section>
      <section class="video-library-section"><div class="vibe-row-head"><h2 id="videoSectionTitle">Latest Videos</h2><button type="button" data-filter-jump="latest">View all →</button></div><div class="vibe-list videos-container" id="videosContainer"><div class="vibe-skel-row"><div class="frame vibe-shine"><span class="play"></span></div><div class="lines"><div class="line vibe-shine"></div><div class="line short vibe-shine"></div></div></div></div><button class="load-more-videos" id="loadMoreVideos" hidden>Load more <i class="fas fa-arrow-down"></i></button></section>
    </main>
    <div class="video-player-modal" id="videoPlayerModal" role="dialog" aria-modal="true" aria-label="Video player"><div class="video-player-container"><button class="player-close" id="playerClose" aria-label="Close player"><i class="fas fa-times"></i></button><video class="video-player" id="videoPlayer" playsinline preload="metadata"></video><div class="player-side-actions"><button class="player-action-btn" type="button" id="prevVideo"><i class="fas fa-chevron-left"></i></button><button class="player-action-btn" type="button" id="nextVideo"><i class="fas fa-chevron-right"></i></button></div><div class="video-controls"><button class="control-btn" id="playPauseBtn"><i class="fas fa-play"></i></button><span class="time-display" id="currentTime">0:00</span><div class="progress-bar" id="progressBar"><div class="progress-fill" id="progressFill"></div></div><span class="time-display" id="durationTime">0:00</span><button class="control-btn" id="fullscreenBtn"><i class="fas fa-expand"></i></button></div></div></div>`);
}

export async function init({ root } = {}) {
  if (window.hshsNavigation?.init) window.hshsNavigation.init();
  try {
    const { VideosPage } = await import('../videos.js');
    if (document.getElementById('videosContainer') && !window.__hshsVideosInstance) window.__hshsVideosInstance = new VideosPage();
  } catch (e) { console.warn('Videos feature module failed to load', e); }
}