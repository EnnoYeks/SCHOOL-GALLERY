
// ============================================
// ANALYTICS & TRACKING SYSTEM
// ============================================

class Analytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.pageViewTime = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
        this.trackUserBehavior();
    }

    // Generate Session ID
    generateSessionId() {
        let sessionId = Utils.getData('sessionId');
        if (!sessionId) {
            sessionId = 'session-' + Utils.generateId();
            Utils.setData('sessionId', sessionId);
        }
        return sessionId;
    }

    // Track Page View
    trackPageView() {
        const event = {
            type: 'pageview',
            page: window.location.pathname,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            userAgent: navigator.userAgent
        };

        this.logEvent(event);
    }

    // Track Click Event
    trackClick(elementId, elementType) {
        const event = {
            type: 'click',
            elementId,
            elementType,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        this.logEvent(event);
    }

    // Track Form Submission
    trackFormSubmit(formName) {
        const event = {
            type: 'form_submit',
            formName,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        this.logEvent(event);
    }

    // Track Video Play
    trackVideoPlay(videoId, videoTitle) {
        const event = {
            type: 'video_play',
            videoId,
            videoTitle,
            timestamp: new Date().toISOString()
        };

        this.logEvent(event);
    }

    // Track Search
    trackSearch(query, resultsCount) {
        const event = {
            type: 'search',
            query,
            resultsCount,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        this.logEvent(event);
    }

    // Track Like/Reaction
    trackEngagement(engagementType, itemId, itemType) {
        const event = {
            type: 'engagement',
            engagementType, // like, comment, share, save
            itemId,
            itemType,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        this.logEvent(event);
    }

    // Track User Behavior
    trackUserBehavior() {
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercentage = Utils.getScrollPercentage();
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
                
                if (maxScroll % 25 === 0) {
                    this.logEvent({
                        type: 'scroll',
                        scrollPercentage,
                        page: window.location.pathname,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = (Date.now() - this.pageViewTime) / 1000;
            this.logEvent({
                type: 'page_leave',
                timeOnPage,
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        });
    }

    // Setup Event Tracking
    setupEventTracking() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const buttonId = e.target.id || 'unnamed-button';
                const buttonText = e.target.textContent;
                this.trackClick(buttonId, 'button');
            }

            if (e.target.tagName === 'A') {
                const linkId = e.target.id || 'unnamed-link';
                this.trackClick(linkId, 'link');
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const formName = e.target.id || e.target.name || 'unnamed-form';
            this.trackFormSubmit(formName);
        });
    }

    // Log Event
    logEvent(event) {
        const eventWithSession = {
            ...event,
            sessionId: this.sessionId,
            userId: db.getCurrentUserId()
        };

        this.events.push(eventWithSession);
        this.saveEvents();

        if (CONFIG.debug) {
            console.log('Event tracked:', eventWithSession);
        }
    }

    // Save Events to Storage
    saveEvents() {
        Utils.setData('analytics_events', this.events);
    }

    // Get Events
    getEvents(limit = 100) {
        return this.events.slice(-limit);
    }

    // Get Analytics Report
    getReport() {
        const events = this.events;
        
        return {
            totalEvents: events.length,
            totalPageViews: events.filter(e => e.type === 'pageview').length,
            totalClicks: events.filter(e => e.type === 'click').length,
            totalSearches: events.filter(e => e.type === 'search').length,
            totalEngagements: events.filter(e => e.type === 'engagement').length,
            averageScrollDepth: this.getAverageScrollDepth(),
            mostVisitedPages: this.getMostVisitedPages(),
            topSearchQueries: this.getTopSearchQueries(),
            engagementBreakdown: this.getEngagementBreakdown()
        };
    }

    // Get Average Scroll Depth
    getAverageScrollDepth() {
        const scrollEvents = this.events.filter(e => e.type === 'scroll');
        if (scrollEvents.length === 0) return 0;

        const total = scrollEvents.reduce((sum, e) => sum + (e.scrollPercentage || 0), 0);
        return Math.round(total / scrollEvents.length);
    }

    // Get Most Visited Pages
    getMostVisitedPages() {
        const pages = {};
        
        this.events.forEach(event => {
            if (event.page) {
                pages[event.page] = (pages[event.page] || 0) + 1;
            }
        });

        return Object.entries(pages)
            .map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    // Get Top Search Queries
    getTopSearchQueries() {
        const searches = {};
        
        this.events
            .filter(e => e.type === 'search')
            .forEach(event => {
                const query = event.query;
                searches[query] = (searches[query] || 0) + 1;
            });

        return Object.entries(searches)
            .map(([query, count]) => ({ query, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    // Get Engagement Breakdown
    getEngagementBreakdown() {
        const breakdown = {};
        
        this.events
            .filter(e => e.type === 'engagement')
            .forEach(event => {
                const type = event.engagementType;
                breakdown[type] = (breakdown[type] || 0) + 1;
            });

        return breakdown;
    }

    // Export Analytics
    exportAnalytics() {
        const report = this.getReport();
        const reportStr = JSON.stringify(report, null, 2);
        const blob = new Blob([reportStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        Utils.showToast('Analytics exported', 'success');
    }

    // Clear Analytics
    clearAnalytics() {
        if (confirm('Are you sure you want to clear all analytics data?')) {
            this.events = [];
            this.saveEvents();
            Utils.showToast('Analytics cleared', 'success');
        }
    }

    // Get User Insights
    getUserInsights() {
        const userId = db.getCurrentUserId();
        const userEvents = this.events.filter(e => e.userId === userId);

        return {
            totalInteractions: userEvents.length,
            likesGiven: userEvents.filter(e => e.type === 'engagement' && e.engagementType === 'like').length,
            commentsGiven: userEvents.filter(e => e.type === 'engagement' && e.engagementType === 'comment').length,
            postsShared: userEvents.filter(e => e.type === 'engagement' && e.engagementType === 'share').length,
            itemsSaved: userEvents.filter(e => e.type === 'engagement' && e.engagementType === 'save').length,
            searchesPerformed: userEvents.filter(e => e.type === 'search').length,
            videosWatched: userEvents.filter(e => e.type === 'video_play').length
        };
    }

    // Get Heatmap Data
    getHeatmapData() {
        const clicks = this.events.filter(e => e.type === 'click');
        const heatmap = {};

        clicks.forEach(click => {
            heatmap[click.elementId] = (heatmap[click.elementId] || 0) + 1;
        });

        return heatmap;
    }
}

// Initialize analytics
const analytics = new Analytics();

// Automatically track common user interactions
document.addEventListener('DOMContentLoaded', () => {
    // Track like button clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-action') || e.target.closest('.like-btn')) {
            const postId = e.target.closest('[data-post-id]')?.getAttribute('data-post-id');
            if (postId) {
                analytics.trackEngagement('like', postId, 'post');
            }
        }

        // Track save button clicks
        if (e.target.closest('.save-action') || e.target.closest('.save-btn')) {
            const postId = e.target.closest('[data-post-id]')?.getAttribute('data-post-id');
            if (postId) {
                analytics.trackEngagement('save', postId, 'post');
            }
        }

        // Track share button clicks
        if (e.target.closest('.share-action') || e.target.closest('.share-btn')) {
            const postId = e.target.closest('[data-post-id]')?.getAttribute('data-post-id');
            if (postId) {
                analytics.trackEngagement('share', postId, 'post');
            }
        }
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
