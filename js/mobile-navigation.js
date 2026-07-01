
/* ============================================
   RESPONSIVE DESIGN - MOBILE FIRST APPROACH
   ============================================ */

/* ============================================
   MOBILE DEVICES (320px - 640px)
   ============================================ */

@media screen and (max-width: 640px) {
    
    /* ---- NAVIGATION ---- */
    .navbar {
        padding: 0.75rem 1rem;
        height: auto;
    }

    .navbar-container {
        flex-direction: column;
        gap: 0.75rem;
    }

    .logo {
        font-size: 1.2rem;
    }

    .logo span {
        display: none;
    }

    .search-container {
        display: none;
    }

    .nav-links {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--glass-bg);
        border-top: 1px solid var(--border-color);
        padding: 1rem;
        gap: 0.5rem;
    }

    .nav-links.mobile-visible {
        display: flex;
    }

    .nav-link {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        width: 100%;
        text-align: left;
    }

    .nav-link:hover {
        background: var(--bg-secondary);
    }

    .mobile-menu-toggle {
        display: block !important;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 1.5rem;
    }

    /* ---- HERO SECTION ---- */
    .hero {
        padding: 2rem 1rem;
        text-align: center;
    }

    .hero h1 {
        font-size: 1.8rem;
        line-height: 1.3;
    }

    .hero p {
        font-size: 0.95rem;
    }

    .hero-buttons {
        flex-direction: column;
        gap: 0.75rem;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        padding: 0.75rem;
    }

    /* ---- FEATURED GRID ---- */
    .featured-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }

    .featured-card {
        height: 300px;
        border-radius: 10px;
    }

    /* ---- STATS SECTION ---- */
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
    }

    .stat-card {
        padding: 1.5rem 1rem;
        text-align: center;
    }

    .stat-card h3 {
        font-size: 0.9rem;
    }

    .stat-card .number {
        font-size: 1.5rem;
    }

    /* ---- EVENTS SECTION ---- */
    .events-section {
        padding: 1rem;
    }

    .event-item {
        padding: 1rem;
        margin-bottom: 0.75rem;
    }

    /* ---- FOOTER ---- */
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 1.5rem;
    }

    .footer-section h4 {
        font-size: 0.95rem;
    }

    /* ---- CONTAINER & SPACING ---- */
    .container {
        padding: 1rem;
    }

    section {
        padding: 1.5rem 1rem;
    }

    /* ---- TYPOGRAPHY ---- */
    h1 {
        font-size: 1.5rem;
    }

    h2 {
        font-size: 1.3rem;
    }

    h3 {
        font-size: 1.1rem;
    }

    p {
        font-size: 0.95rem;
    }

    /* ---- BUTTONS ---- */
    .btn {
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
    }

    /* ---- FORMS ---- */
    .form-group {
        margin-bottom: 1rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
        padding: 0.75rem;
        font-size: 1rem;
    }

    /* ---- MODALS ---- */
    .modal-content {
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
    }

    /* ---- NOTIFICATIONS ---- */
    .notification-dropdown {
        position: fixed;
        top: 60px;
        right: 0;
        left: 0;
        width: 100%;
        max-height: 50vh;
        border-radius: 0;
    }

    .profile-dropdown {
        position: fixed;
        top: 60px;
        right: 0;
        left: 0;
        width: 100%;
        border-radius: 0;
    }
}

/* ============================================
   SMALL TABLETS (640px - 960px)
   ============================================ */

@media screen and (min-width: 641px) and (max-width: 960px) {
    
    .navbar-container {
        justify-content: space-between;
    }

    .search-container {
        width: 60%;
    }

    .nav-links {
        gap: 0.5rem;
    }

    .featured-grid {
        grid-template-columns: repeat(2, 1fr);
        padding: 1.5rem;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .footer-content {
        grid-template-columns: repeat(2, 1fr);
    }

    .container {
        padding: 1.5rem;
    }
}

/* ============================================
   LARGE TABLETS & DESKTOPS (961px+)
   ============================================ */

@media screen and (min-width: 961px) {
    
    .navbar-container {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .search-container {
        width: auto;
        flex: 1;
        margin: 0 2rem;
    }

    .nav-links {
        flex-direction: row;
        display: flex;
        position: relative;
        top: 0;
        left: 0;
        right: 0;
        background: transparent;
        border: none;
        padding: 0;
    }

    .mobile-menu-toggle {
        display: none !important;
    }

    .featured-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
    }

    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
    }

    .footer-content {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ============================================
   GALLERY/FEED - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    /* Category Filter */
    .category-filter {
        display: flex;
        overflow-x: auto;
        gap: 0.75rem;
        padding: 1rem;
        margin-bottom: 1rem;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    }

    .category-btn {
        flex: 0 0 auto;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        white-space: nowrap;
        border-radius: 20px;
    }

    /* Story Bar */
    .story-bar {
        display: flex;
        overflow-x: auto;
        gap: 0.75rem;
        padding: 1rem;
        margin-bottom: 1rem;
        -webkit-overflow-scrolling: touch;
    }

    .story-item {
        flex: 0 0 70px;
        height: 70px;
        border-radius: 50%;
    }

    /* Post Card */
    .post-card {
        height: 100vh;
        width: 100vw;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .post-media {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .post-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent, rgba(0,0,0,0.7));
    }

    .post-info {
        position: absolute;
        bottom: 60px;
        left: 1rem;
        right: 1rem;
        color: white;
        z-index: 10;
    }

    .post-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        line-height: 1.3;
    }

    .post-description {
        font-size: 0.85rem;
        margin-bottom: 0.75rem;
        opacity: 0.95;
    }

    .post-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        opacity: 0.9;
    }

    /* Side Actions */
    .side-actions {
        position: absolute;
        right: 1rem;
        bottom: 80px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 20;
    }

    .action-btn {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 1.2rem;
        transition: all 0.3s ease;
    }

    .action-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }

    .action-count {
        font-size: 0.7rem;
        margin-top: 0.2rem;
    }
}

/* ============================================
   PHOTOS GALLERY - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    .masonry-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }

    .photo-card {
        height: 250px;
        border-radius: 10px;
        overflow: hidden;
    }

    .photo-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .photo-overlay {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1rem;
    }

    .photo-modal {
        width: 100%;
        height: 100%;
    }

    .modal-image {
        max-width: 100%;
        max-height: 60vh;
    }
}

@media screen and (min-width: 641px) and (max-width: 960px) {
    
    .masonry-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media screen and (min-width: 961px) {
    
    .masonry-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ============================================
   VIDEOS - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    #videosContainer {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }

    .video-card {
        border-radius: 10px;
        overflow: hidden;
    }

    .video-thumbnail {
        height: 200px;
        position: relative;
    }

    .thumbnail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .video-info {
        padding: 1rem;
    }

    .video-title {
        font-size: 0.95rem;
        font-weight: 600;
    }

    .video-player {
        width: 100%;
        max-height: 70vh;
    }

    .video-controls {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        flex-wrap: wrap;
    }

    .control-btn {
        padding: 0.5rem;
        font-size: 0.9rem;
    }

    .player-side-actions {
        position: fixed;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .player-action-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }
}

@media screen and (min-width: 641px) and (max-width: 960px) {
    
    #videosContainer {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media screen and (min-width: 961px) {
    
    #videosContainer {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ============================================
   TRENDING - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    .trending-tabs {
        display: flex;
        overflow-x: auto;
        gap: 0;
        -webkit-overflow-scrolling: touch;
    }

    .tab-btn {
        flex: 0 0 auto;
        padding: 1rem;
        font-size: 0.85rem;
        white-space: nowrap;
    }

    .featured-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
    }

    .trending-box {
        margin-bottom: 1.5rem;
    }

    .leaderboard-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
}

/* ============================================
   SPOTLIGHT - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    .spotlightGrid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 1rem;
        padding: 1rem;
    }

    #hallOfFameList {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    #achievementsList {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}

@media screen and (min-width: 641px) and (max-width: 960px) {
    
    .spotlightGrid {
        grid-template-columns: repeat(3, 1fr) !important;
    }
}

/* ============================================
   POLLS - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    #activePollsList,
    #closedPollsList {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .poll-item {
        padding: 1.5rem 1rem;
    }

    .poll-option {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .poll-option input {
        margin-right: 0.75rem;
    }
}

/* ============================================
   MEMORIES - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    #onThisDayGrid {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }

    .countdown {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }

    .countdown-item {
        padding: 1rem;
        text-align: center;
    }

    #schoolTimeline {
        padding: 1rem;
    }

    #archiveYears {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }

    #birthdayHighlights {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
}

/* ============================================
   ADMIN DASHBOARD - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    .admin-container {
        flex-direction: column;
    }

    .admin-sidebar {
        width: 100%;
        display: flex;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
        padding: 0.5rem 1rem;
    }

    .sidebar-menu {
        display: flex;
        gap: 0.5rem;
        flex-wrap: nowrap;
        overflow-x: auto;
    }

    .menu-item {
        flex: 0 0 auto;
        padding: 0.75rem;
        font-size: 0.85rem;
        white-space: nowrap;
    }

    .admin-main {
        width: 100%;
        padding: 1rem;
    }

    .admin-stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .admin-stat-card {
        padding: 1.5rem 1rem;
    }

    .admin-table {
        font-size: 0.85rem;
        overflow-x: auto;
    }

    .admin-table th,
    .admin-table td {
        padding: 0.75rem 0.5rem;
    }
}

@media screen and (min-width: 641px) and (max-width: 960px) {
    
    .admin-stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* ============================================
   PROFILE PAGE - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    .profile-header {
        padding: 2rem 1rem;
        text-align: center;
    }

    .profile-header img {
        width: 80px;
        height: 80px;
    }

    .profile-header h1 {
        font-size: 1.3rem;
    }

    .profile-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    .profile-stat {
        padding: 1rem 0.75rem;
        text-align: center;
    }

    .recent-posts {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}

/* ============================================
   SETTINGS PAGE - MOBILE RESPONSIVE
   ============================================ */

@media screen and (max-width: 640px) {
    
    .settings-tabs {
        display: flex;
        overflow-x: auto;
        gap: 0;
        -webkit-overflow-scrolling: touch;
    }

    .settings-tabs button {
        flex: 0 0 auto;
        padding: 0.75rem;
        font-size: 0.8rem;
        white-space: nowrap;
    }

    .admin-form {
        display: flex;
        flex-direction: column;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .preset-themes {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}

/* ============================================
   UTILITY - MOBILE HELPERS
   ============================================ */

@media screen and (max-width: 640px) {
    
    /* Hide on mobile */
    .hide-mobile {
        display: none !important;
    }

    /* Show only on mobile */
    .show-mobile {
        display: block !important;
    }

    /* Mobile spacing */
    .mobile-margin {
        margin: 1rem;
    }

    .mobile-padding {
        padding: 1rem;
    }

    /* Mobile text sizes */
    .mobile-h1 {
        font-size: 1.5rem;
    }

    .mobile-h2 {
        font-size: 1.25rem;
    }

    .mobile-p {
        font-size: 0.95rem;
    }
}

/* ============================================
   LANDSCAPE MODE - MOBILE
   ============================================ */

@media screen and (max-height: 500px) and (orientation: landscape) {
    
    .navbar {
        padding: 0.5rem 1rem;
    }

    .hero {
        padding: 1rem;
    }

    .hero h1 {
        font-size: 1.3rem;
    }

    section {
        padding: 1rem;
    }

    .post-card {
        height: 85vh;
    }
}

/* ============================================
   ANIMATION PERFORMANCE - MOBILE
   ============================================ */

@media screen and (max-width: 640px) and (prefers-reduced-motion: reduce) {
    
    * {
        animation: none !important;
        transition: none !important;
    }
}

/* ============================================
   HIGH DPI DISPLAYS (RETINA)
   ============================================ */

@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
    
    .navbar,
    .footer,
    .modal-content {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
}

/* ============================================
   TOUCH DEVICES - LARGER TOUCH TARGETS
   ============================================ */

@media (hover: none) and (pointer: coarse) {
    
    button,
    a,
    input {
        min-height: 44px;
        min-width: 44px;
    }

    .action-btn,
    .control-btn {
        min-height: 50px;
        min-width: 50px;
    }

    .nav-link {
        padding: 1rem;
    }
}

/* ============================================
   PRINT STYLES
   ============================================ */

@media print {
    
    .navbar,
    .footer,
    .sidebar,
    .notifications-dropdown,
    .profile-dropdown {
        display: none !important;
    }

    .container {
        width: 100%;
        margin: 0;
        padding: 0;
    }

    body {
        background: white;
        color: black;
    }
}
