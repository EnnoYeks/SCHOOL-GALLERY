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
                <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-content"><div class="stat-number" id="totalStudents">0</div><div class="stat-label">Students</div></div></div>
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
                    <p class="quote-text" id="dailyQuote">Loading today's inspiration...</p>
                    <p class="quote-author" id="quoteAuthor">HSHS World</p>
                </div>
                <div class="trending-box">
                    <h3><i class="fas fa-calendar-alt"></i> Upcoming Events</h3>
                    <div class="upcoming-events" id="upcomingEvents">
                        <div class="loading-skeleton"></div>
                        <div class="loading-skeleton"></div>
                        <div class="loading-skeleton"></div>
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
