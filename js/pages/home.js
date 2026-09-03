import { getPhotos, getVideos, getPosts } from '../services/page-data.js';

function go(path) {
  if (window.App && typeof window.App.loadRoute === 'function') window.App.loadRoute(path);
  else location.assign(path);
}

export function render() {
  return `
    <section class="hero">
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="hero-title">HSHS WORLD</h1>
                <p class="hero-subtitle">Your school. One world. Photos, Vibe, Buzz and memories.</p>
                <div class="hero-description">The HSHS home for school moments, achievements and community.</div>
                <div class="hero-buttons">
                    <button class="btn btn-primary" id="exploreBtn"><i class="fas fa-play"></i> Explore Feed</button>
                    <button class="btn btn-secondary" id="learnMoreBtn"><i class="fas fa-info-circle"></i> Learn More</button>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-image-container">
                    <img src="https://via.placeholder.com/600x400" alt="HSHS World" class="hero-image">
                    <div class="hero-overlay"></div>
                </div>
            </div>
        </div>
        <div class="parallax-shapes">
            <div class="parallax-item" style="--speed: 0.5"><i class="fas fa-camera"></i></div>
            <div class="parallax-item" style="--speed: 0.7"><i class="fas fa-video"></i></div>
            <div class="parallax-item" style="--speed: 0.3"><i class="fas fa-heart"></i></div>
            <div class="parallax-item" style="--speed: 0.6"><i class="fas fa-share"></i></div>
        </div>
    </section>

    <section class="featured-section">
        <div class="container">
            <h2 class="section-title"><i class="fas fa-crown"></i> Featured Today</h2>
            <div class="featured-grid" id="featuredGrid">
                <div class="loading-skeleton"></div>
                <div class="loading-skeleton"></div>
                <div class="loading-skeleton"></div>
                <div class="loading-skeleton"></div>
            </div>
        </div>
    </section>

    <section class="quick-stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-images"></i></div><div class="stat-content"><div class="stat-number" id="totalPhotos">0</div><div class="stat-label">Photos</div></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-video"></i></div><div class="stat-content"><div class="stat-number" id="totalVideos">0</div><div class="stat-label">Videos</div></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-content"><div class="stat-number" id="totalStudents">0</div><div class="stat-label">Moments</div></div></div>
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-heart"></i></div><div class="stat-content"><div class="stat-number" id="totalLikes">0</div><div class="stat-label">Likes</div></div></div>
            </div>
        </div>
    </section>

    <section class="trending-sections">
        <div class="container">
            <div class="trending-row">
                <div class="trending-box">
                    <h3><i class="fas fa-fire"></i> Trending Today</h3>
                    <div class="trending-list" id="trendingToday">
                        <div class="loading-skeleton"></div>
                        <div class="loading-skeleton"></div>
                        <div class="loading-skeleton"></div>
                    </div>
                </div>
                <div class="daily-quote-box">
                    <i class="fas fa-quote-left"></i>
                    <p class="quote-text" id="dailyQuote">Educate. Engage. Empower.</p>
                    <p class="quote-author" id="quoteAuthor">HSHS World</p>
                </div>
                <div class="trending-box">
                    <h3><i class="fas fa-calendar-alt"></i> Upcoming Events</h3>
                    <div class="upcoming-events" id="upcomingEvents">
                        <div class="event-item"><strong>School Anniversary</strong><span>Coming soon</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="cta-content">
            <h2>Ready to share your story?</h2>
            <p>Upload photos and videos to HSHS World</p>
            <button class="btn btn-primary" id="uploadBtn"><i class="fas fa-cloud-upload-alt"></i> Start Uploading</button>
        </div>
    </section>
  `;
}

function cardHtml(item = {}, kind = 'photo') {
  const title = item.title || item.caption || item.name || 'HSHS moment';
  const img = item.image || item.thumb || item.cover || item.url || 'https://via.placeholder.com/400x280';
  const safeTitle = String(title).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  return `<article class="featured-card"><img src="${img}" alt="${safeTitle}"><div class="featured-card-copy"><span>${kind}</span><h3>${safeTitle}</h3></div></article>`;
}

export async function init({ root } = {}) {
  const scope = root || document;
  scope.querySelector('#exploreBtn')?.addEventListener('click', () => go('/index/gallery.html'));
  scope.querySelector('#learnMoreBtn')?.addEventListener('click', () => go('/index/about.html'));
  scope.querySelector('#uploadBtn')?.addEventListener('click', () => {
    if (window.HshsUpload && typeof window.HshsUpload.open === 'function') window.HshsUpload.open();
    else go('/index/photos.html');
  });

  try {
    const [photos, videos, posts] = await Promise.all([
      getPhotos(8, 0),
      getVideos(8, 0),
      getPosts(8, 0)
    ]);
    const photosEl = document.getElementById('totalPhotos');
    const videosEl = document.getElementById('totalVideos');
    const momentsEl = document.getElementById('totalStudents');
    const likesEl = document.getElementById('totalLikes');
    if (photosEl) photosEl.textContent = String(photos.length);
    if (videosEl) videosEl.textContent = String(videos.length);
    if (momentsEl) momentsEl.textContent = String(posts.length + photos.length + videos.length);
    const likes = [...photos, ...videos, ...posts].reduce((sum, item) => sum + Number(item.likes || item.likesCount || 0), 0);
    if (likesEl) likesEl.textContent = String(likes);

    const featured = document.getElementById('featuredGrid');
    const featuredItems = (photos.length ? photos : posts).slice(0, 4);
    if (featured && featuredItems.length) {
      featured.innerHTML = featuredItems.map(item => cardHtml(item, item.type || 'photo')).join('');
    } else if (featured) {
      featured.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><h3>No featured moments yet</h3><p>New HSHS photos will land here.</p></div>';
    }

    const trending = document.getElementById('trendingToday');
    const trendItems = (posts.length ? posts : photos).slice(0, 3);
    if (trending && trendItems.length) {
      trending.innerHTML = trendItems.map(item => `<div class="trending-item">${String(item.title || item.caption || 'School moment').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))}</div>`).join('');
    } else if (trending) {
      trending.innerHTML = '<p>Fresh school moments will show here.</p>';
    }
  } catch (e) {
    console.warn('Home data fill failed', e);
  }
}
