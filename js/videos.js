
// ============================================
// VIDEOS PAGE LOGIC
// ============================================

class VideosPage {
    constructor() {
        this.currentVideo = null;
        this.videoIndex = 0;
        this.videos = [];
        this.init();
    }

    async init() {
        await this.loadVideoCards();
        this.setupVideoPlayer();
        this.setupVideoControls();
        this.setupSwipeNavigation();
    }

    async loadVideoCards() {
        const container = document.getElementById('videosContainer');
        if (!container) return;

        this.videos = await db.getVideos(12, 0);

        container.innerHTML = this.videos.map((video, index) => `
            <div class="video-card" data-video-id="${video.id}" data-video-index="${index}">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail-image">
                    <div class="play-button-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-duration">${video.duration}</div>
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title}</div>
                    <div class="video-description">${Utils.truncateText(video.description, 80)}</div>
                    <div class="video-metadata">
                        <span>${video.author}</span>
                        <span>${Utils.formatDate(video.createdAt)}</span>
                    </div>
                    <div class="video-stats">
                        <div class="stat-item">
                            <i class="fas fa-eye"></i> ${Utils.formatNumber(video.views || 0)}
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-heart"></i> ${Utils.formatNumber(video.likes || 0)}
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-comment"></i> ${Utils.formatNumber(video.comments || 0)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        const cards = container.querySelectorAll('.video-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.getAttribute('data-video-index'));
                this.playVideo(index);
            });
        });
    }

    playVideo(index) {
        const video = this.videos[index];
        this.currentVideo = video;
        this.videoIndex = index;

        const modal = document.getElementById('videoPlayerModal');
        const player = document.getElementById('videoPlayer');
        const thumbnail = document.querySelector(`[data-video-index="${index}"] .thumbnail-image`);

        if (player && thumbnail) {
            player.src = 'https://via.placeholder.com/video.mp4'; // Replace with actual video
            player.poster = thumbnail.src;
        }

        if (modal) {
            modal.classList.add('active');
            player.play();
            this.updateVideoStats(video);
        }
    }

    setupVideoPlayer() {
        const playerClose = document.getElementById('playerClose');
        const modal = document.getElementById('videoPlayerModal');

        if (playerClose && modal) {
            playerClose.addEventListener('click', () => {
                const player = document.getElementById('videoPlayer');
                if (player) player.pause();
                modal.classList.remove('active');
            });
        }
    }

    setupVideoControls() {
        const player = document.getElementById('videoPlayer');
        if (!player) return;

        const playPauseBtn = document.getElementById('playPauseBtn');
        const progressBar = document.getElementById('progressBar');
        const volumeBtn = document.getElementById('volumeBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const currentTimeSpan = document.getElementById('currentTime');
        const durationSpan = document.getElementById('duration');

        // Play/Pause
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (player.paused) {
                    player.play();
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    player.pause();
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
        }

        // Progress bar
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                player.currentTime = percent * player.duration;
            });
        }

        // Update progress
        player.addEventListener('timeupdate', () => {
            const percent = (player.currentTime / player.duration) * 100;
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                progressFill.style.width = percent + '%';
            }
            if (currentTimeSpan) {
                currentTimeSpan.textContent = Utils.formatTime(player.currentTime);
            }
        });

        // Duration
        player.addEventListener('loadedmetadata', () => {
            if (durationSpan) {
                durationSpan.textContent = Utils.formatTime(player.duration);
            }
        });

        // Volume
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                player.muted = !player.muted;
                volumeBtn.innerHTML = player.muted ? 
                    '<i class="fas fa-volume-mute"></i>' : 
                    '<i class="fas fa-volume-up"></i>';
            });
        }

        // Fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                const container = document.getElementById('videoPlayerContainer');
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    container.requestFullscreen();
                }
            });
        }
    }

    setupSwipeNavigation() {
        const prevBtn = document.getElementById('prevVideo');
        const nextBtn = document.getElementById('nextVideo');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.videoIndex > 0) {
                    this.playVideo(this.videoIndex - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.videoIndex < this.videos.length - 1) {
                    this.playVideo(this.videoIndex + 1);
                }
            });
        }
    }

    updateVideoStats(video) {
        video.views = (video.views || 0) + 1;
        db.saveToStorage();
    }
}

// Initialize videos page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('videosContainer')) {
        new VideosPage();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideosPage;
}
