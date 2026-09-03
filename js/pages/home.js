import { getPhotos, getVideos, getPosts } from '../services/page-data.js';

const BADGE = 'https://hawthorne-scribner.ac.ug/wp-content/uploads/2024/12/Hawthorne-Scribner-Badge-png-768x771.png';

function go(path) {
  if (window.App && typeof window.App.loadRoute === 'function') window.App.loadRoute(path);
  else location.assign(path);
}

export function render() {
  return `
    <section class="hshs-campus-home">
      <article class="welcome-card">
        <img class="welcome-crest" src="${BADGE}" alt="">
        <span class="welcome-kicker">WELCOME TO</span>
        <h1>HSHS WORLD</h1>
        <p class="lead">Your school. One world.<br>Photos, Vibe, Buzz and memories.</p>
        <p class="sub">The HSHS home for school moments, achievements and community.</p>
        <div class="welcome-actions">
          <button class="btn btn-primary" id="exploreBtn" type="button"><i class="fas fa-play"></i> Explore Feed</button>
          <button class="btn btn-secondary" id="learnMoreBtn" type="button"><i class="fas fa-info-circle"></i> Learn More</button>
        </div>
      </article>
      <div class="featured-head">
        <h2><i class="fas fa-crown"></i> Featured Today</h2>
        <a href="/index/gallery.html" id="viewAllFeatured">View all &gt;</a>
      </div>
      <div class="home-tiles">
        <a class="home-tile" href="/index/photos.html" id="photosTile">
          <span class="ico"><i class="fas fa-image"></i></span>
          <span><b id="totalPhotos">0</b><small>Photos</small></span>
          <i class="fas fa-chevron-right go"></i>
        </a>
        <a class="home-tile" href="/index/videos.html" id="vibeTile">
          <span class="ico"><i class="fas fa-video"></i></span>
          <span><b id="totalVideos">0</b><small>Vibe</small></span>
          <i class="fas fa-chevron-right go"></i>
        </a>
      </div>
    </section>
  `;
}

export async function init({ root } = {}) {
  document.body.classList.add('dark-mode', 'has-mobile-shell');
  document.body.classList.remove('light-mode');
  document.documentElement.classList.add('hshs-device-mobile');
  if (window.matchMedia('(min-width: 1025px)').matches) {
    document.documentElement.classList.remove('hshs-device-mobile');
    document.documentElement.classList.add('hshs-device-desktop');
  }

  const scope = root || document;
  scope.querySelector('#exploreBtn')?.addEventListener('click', () => go('/index/gallery.html'));
  scope.querySelector('#learnMoreBtn')?.addEventListener('click', () => go('/index/about.html'));
  scope.querySelector('#viewAllFeatured')?.addEventListener('click', ev => { ev.preventDefault(); go('/index/gallery.html'); });
  scope.querySelector('#photosTile')?.addEventListener('click', ev => { ev.preventDefault(); go('/index/photos.html'); });
  scope.querySelector('#vibeTile')?.addEventListener('click', ev => { ev.preventDefault(); go('/index/videos.html'); });

  try {
    const [photos, videos, posts] = await Promise.all([getPhotos(20, 0), getVideos(20, 0), getPosts(20, 0)]);
    const photosEl = document.getElementById('totalPhotos');
    const videosEl = document.getElementById('totalVideos');
    if (photosEl) photosEl.textContent = String(photos.length || 0);
    if (videosEl) videosEl.textContent = String(videos.length || 0);
    window.__hshsPageData = { photos, videos, posts };
  } catch (e) {
    console.warn('Home data fill failed', e);
  }

  document.dispatchEvent(new CustomEvent('hshs:page'));
}
