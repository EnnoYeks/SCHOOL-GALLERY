
// ============================================
// ENNOYEKS SCHOOL GALLERY - CONFIGURATION
// ============================================

// API Configuration
const CONFIG = {
    // Firebase Configuration (Replace with your credentials)
    firebase: {
    apiKey: "AIzaSyCoFBtKrk7ZRvV1mZe5hN9tRCPKsuQBlgo",
    authDomain: "school-gallery-62032.firebaseapp.com",
    projectId: "school-gallery-62032",
    storageBucket: "school-gallery-62032.firebasestorage.app",
    messagingSenderId: "931689210926",
    appId: "1:931689210926:web:fd2daf8495d6e6f3e42bbf"
},
    },

    // App Settings
    app: {
        name: "HSHS School Gallery",
        version: "1.0.0",
        school: "HAWTHORNE SCRIBNER HIGH SCHOOL",
        schoolMotto: "Educate Engage Empower.",
        schoolEmail: "info@hshs.ac.ug",
        schoolPhone: "+256 200 946933",
        schoolAddress: "Bududa Kikholo",
        schoolAnniversaryDate: "2026-08-15"
    },

    // Theme Configuration
    theme: {
        defaultMode: "light", // light or dark
        defaultTheme: "default",
        animationSpeed: 0.3, // seconds
        enableParticles: true,
        particleCount: 50
    },

    // Storage Configuration
    storage: {
        maxFileSize: 104857600, // 100MB in bytes
        maxPhotoSize: 52428800, // 50MB for photos
        maxVideoSize: 104857600, // 100MB for videos
        allowedImageFormats: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        allowedVideoFormats: ["video/mp4", "video/webm", "video/ogg"]
    },

    // Pagination
    pagination: {
        postsPerPage: 10,
        photosPerPage: 20,
        videosPerPage: 12,
        commentsPerPage: 10
    },

    // Feature Flags
    features: {
        enableComments: true,
        enableLikes: true,
        enableSharing: true,
        enableSaving: true,
        enableReactions: true,
        enablePolls: true,
        enableSearch: true,
        enableNotifications: true,
        enableAnalytics: true
    },

    // Categories
    categories: [
        { id: "all", name: "All", icon: "fas fa-th" },
        { id: "academics", name: "Academics", icon: "fas fa-book" },
        { id: "sports", name: "Sports", icon: "fas fa-basketball-ball" },
        { id: "clubs", name: "Clubs", icon: "fas fa-users" },
        { id: "trips", name: "Trips", icon: "fas fa-bus" },
        { id: "graduation", name: "Graduation", icon: "fas fa-graduation-cap" },
        { id: "arts", name: "Arts", icon: "fas fa-palette" },
        { id: "music", name: "Music", icon: "fas fa-music" },
        { id: "ict", name: "ICT", icon: "fas fa-laptop" },
        { id: "science", name: "Science", icon: "fas fa-flask" },
        { id: "competitions", name: "Competitions", icon: "fas fa-trophy" },
        { id: "community", name: "Community", icon: "fas fa-heart" }
    ],

    // Reactions
    reactions: [
        { emoji: "❤️", label: "Love", color: "#ff4458" },
        { emoji: "🔥", label: "Awesome", color: "#ff9500" },
        { emoji: "👏", label: "Clap", color: "#6366f1" },
        { emoji: "🎉", label: "Celebration", color: "#ec4899" },
        { emoji: "⭐", label: "Favorite", color: "#f59e0b" }
    ],

    // Achievements/Badges
    achievements: [
        { id: "featured", name: "Featured", icon: "fas fa-star", color: "#f59e0b" },
        { id: "topContributor", name: "Top Contributor", icon: "fas fa-trophy", color: "#ec4899" },
        { id: "trendingPost", name: "Trending Post", icon: "fas fa-fire", color: "#ef4444" },
        { id: "academicExcellence", name: "Academic Excellence", icon: "fas fa-book", color: "#6366f1" },
        { id: "sportsStar", name: "Sports Star", icon: "fas fa-star", color: "#10b981" },
        { id: "clubChampion", name: "Club Champion", icon: "fas fa-medal", color: "#f59e0b" }
    ],

    // Notification Types
    notificationTypes: {
        LIKE: "like",
        COMMENT: "comment",
        REPLY: "reply",
        SHARE: "share",
        FEATURED: "featured",
        POLL: "poll",
        MENTION: "mention",
        FOLLOW: "follow"
    },

    // API Endpoints (if using backend)
    api: {
        baseURL: "https://api.ennoyeks.edu",
        endpoints: {
            posts: "/posts",
            photos: "/photos",
            videos: "/videos",
            comments: "/comments",
            likes: "/likes",
            notifications: "/notifications",
            search: "/search",
            analytics: "/analytics"
        }
    },

    // Social Media Links
    social: {
        facebook: "https://facebook.com/ennoyeks",
        instagram: "https://instagram.com/ennoyeks",
        twitter: "https://twitter.com/ennoyeks",
        tiktok: "https://tiktok.com/@ennoyeks"
    },

    // Debug Mode
    debug: false
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
