// ============================================
// DATABASE & FIREBASE INITIALIZATION
// ============================================

class Database {
    constructor() {
        this.initialized = false;
        this.posts = [];
        this.photos = [];
        this.videos = [];
        this.comments = [];
        this.likes = [];
        this.users = [];
        this.notifications = [];
        this.polls = [];
        this.init();
    }

    init() {
        // Initialize Firebase or local storage
        // For now, using localStorage as fallback
        this.loadFromStorage();
        this.initialized = true;
        console.log('Database initialized');
    }

    // Load data from localStorage
    loadFromStorage() {
        try {
            this.posts = JSON.parse(localStorage.getItem('posts')) || this.getSamplePosts();
            this.photos = JSON.parse(localStorage.getItem('photos')) || this.getSamplePhotos();
            this.videos = JSON.parse(localStorage.getItem('videos')) || this.getSampleVideos();
            this.comments = JSON.parse(localStorage.getItem('comments')) || [];
            this.likes = JSON.parse(localStorage.getItem('likes')) || [];
            this.users = JSON.parse(localStorage.getItem('users')) || this.getSampleUsers();
            this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            this.polls = JSON.parse(localStorage.getItem('polls')) || this.getSamplePolls();
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    // Save data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('posts', JSON.stringify(this.posts));
            localStorage.setItem('photos', JSON.stringify(this.photos));
            localStorage.setItem('videos', JSON.stringify(this.videos));
            localStorage.setItem('comments', JSON.stringify(this.comments));
            localStorage.setItem('likes', JSON.stringify(this.likes));
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
            localStorage.setItem('polls', JSON.stringify(this.polls));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // Posts Methods
    getPosts(limit = 10, offset = 0) {
        return this.posts.slice(offset, offset + limit);
    }

    getPostById(id) {
        return this.posts.find(post => post.id === id);
    }

    createPost(postData) {
        const post = {
            id: this.generateId(),
            ...postData,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0
        };
        this.posts.unshift(post);
        this.saveToStorage();
        return post;
    }

    updatePost(id, updates) {
        const post = this.getPostById(id);
        if (post) {
            Object.assign(post, updates);
            this.saveToStorage();
        }
        return post;
    }

    deletePost(id) {
        this.posts = this.posts.filter(post => post.id !== id);
        this.saveToStorage();
    }

    // Photos Methods
    getPhotos(limit = 20, offset = 0, category = null) {
        let filtered = this.photos;
        if (category && category !== 'all') {
            filtered = filtered.filter(photo => photo.category === category);
        }
        return filtered.slice(offset, offset + limit);
    }

    getPhotoById(id) {
        return this.photos.find(photo => photo.id === id);
    }

    createPhoto(photoData) {
        const photo = {
            id: this.generateId(),
            ...photoData,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            views: 0,
            saves: 0
        };
        this.photos.unshift(photo);
        this.saveToStorage();
        return photo;
    }

    // Videos Methods
    getVideos(limit = 12, offset = 0) {
        return this.videos.slice(offset, offset + limit);
    }

    getVideoById(id) {
        return this.videos.find(video => video.id === id);
    }

    createVideo(videoData) {
        const video = {
            id: this.generateId(),
            ...videoData,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            views: 0,
            saves: 0
        };
        this.videos.unshift(video);
        this.saveToStorage();
        return video;
    }

    // Comments Methods
    getComments(postId, limit = 10, offset = 0) {
        const postComments = this.comments.filter(c => c.postId === postId);
        return postComments.slice(offset, offset + limit);
    }

    createComment(postId, commentData) {
        const comment = {
            id: this.generateId(),
            postId,
            ...commentData,
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: []
        };
        this.comments.push(comment);
        
        // Update post comment count
        const post = this.getPostById(postId);
        if (post) {
            post.comments = (post.comments || 0) + 1;
        }
        
        this.saveToStorage();
        return comment;
    }

    // Likes Methods
    addLike(itemId, itemType = 'post') {
        const like = {
            id: this.generateId(),
            itemId,
            itemType,
            userId: this.getCurrentUserId(),
            createdAt: new Date().toISOString()
        };
        this.likes.push(like);
        
        // Update item count
        if (itemType === 'post') {
            const post = this.getPostById(itemId);
            if (post) post.likes = (post.likes || 0) + 1;
        }
        
        this.saveToStorage();
        return like;
    }

    removeLike(itemId) {
        const index = this.likes.findIndex(l => l.itemId === itemId && l.userId === this.getCurrentUserId());
        if (index !== -1) {
            this.likes.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    hasLiked(itemId) {
        return this.likes.some(l => l.itemId === itemId && l.userId === this.getCurrentUserId());
    }

    // Notifications Methods
    getNotifications(limit = 10) {
        return this.notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    createNotification(notificationData) {
        const notification = {
            id: this.generateId(),
            ...notificationData,
            createdAt: new Date().toISOString(),
            read: false
        };
        this.notifications.unshift(notification);
        this.saveToStorage();
        return notification;
    }

    markNotificationAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveToStorage();
        }
    }

    // Polls Methods
    getPolls(limit = 10, offset = 0) {
        return this.polls.slice(offset, offset + limit);
    }

    createPoll(pollData) {
        const poll = {
            id: this.generateId(),
            ...pollData,
            createdAt: new Date().toISOString(),
            votes: pollData.options.map(option => ({
                option,
                count: 0
            })),
            totalVotes: 0,
            userVote: null
        };
        this.polls.unshift(poll);
        this.saveToStorage();
        return poll;
    }

    votePoll(pollId, optionIndex) {
        const poll = this.polls.find(p => p.id === pollId);
        if (poll && poll.votes[optionIndex]) {
            poll.votes[optionIndex].count += 1;
            poll.totalVotes += 1;
            poll.userVote = optionIndex;
            this.saveToStorage();
            return poll;
        }
        return null;
    }

    // User Methods
    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'user-' + this.generateId();
    }

    getCurrentUser() {
        const userId = this.getCurrentUserId();
        return this.users.find(u => u.id === userId);
    }

    updateUser(updates) {
        const user = this.getCurrentUser();
        if (user) {
            Object.assign(user, updates);
            this.saveToStorage();
        }
        return user;
    }

    // Search Methods
    search(query, type = 'all') {
        const q = query.toLowerCase();
        let results = [];

        if (type === 'posts' || type === 'all') {
            results = results.concat(
                this.posts.filter(p => 
                    p.title.toLowerCase().includes(q) || 
                    p.description.toLowerCase().includes(q)
                )
            );
        }

        if (type === 'photos' || type === 'all') {
            results = results.concat(
                this.photos.filter(p => 
                    p.title.toLowerCase().includes(q) || 
                    p.category.toLowerCase().includes(q)
                )
            );
        }

        if (type === 'videos' || type === 'all') {
            results = results.concat(
                this.videos.filter(v => 
                    v.title.toLowerCase().includes(q) || 
                    v.description.toLowerCase().includes(q)
                )
            );
        }

        return results;
    }

    // Trending Methods
    getTrendingPosts(period = 'today', limit = 10) {
        // Sort by engagement (likes + comments + shares)
        const trending = this.posts
            .map(post => ({
                ...post,
                engagement: (post.likes || 0) + (post.comments || 0) + (post.shares || 0)
            }))
            .sort((a, b) => b.engagement - a.engagement)
            .slice(0, limit);
        
        return trending;
    }

    // Analytics Methods
    getAnalytics() {
        return {
            totalPosts: this.posts.length,
            totalPhotos: this.photos.length,
            totalVideos: this.videos.length,
            totalLikes: this.likes.length,
            totalComments: this.comments.length,
            totalNotifications: this.notifications.length,
            totalUsers: this.users.length,
            engagement: {
                avgLikesPerPost: this.posts.reduce((sum, p) => sum + (p.likes || 0), 0) / this.posts.length || 0,
                avgCommentsPerPost: this.posts.reduce((sum, p) => sum + (p.comments || 0), 0) / this.posts.length || 0,
                totalEngagement: this.likes.length + this.comments.length
            }
        };
    }

    // Helper Methods
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Sample Data
    getSamplePosts() {
        return [
            {
                id: '1',
                title: 'Amazing Sports Day 2026',
                description: 'Our school held an incredible sports day with amazing performances from all students!',
                image: 'https://via.placeholder.com/600x400/6366f1/ffffff?text=Sports+Day',
                category: 'sports',
                author: 'John Doe',
                authorAvatar: 'https://via.placeholder.com/40',
                createdAt: new Date().toISOString(),
                likes: 245,
                comments: 18,
                shares: 12,
                views: 1523
            },
            {
                id: '2',
                title: 'Science Fair Highlights',
                description: 'Students showcased their incredible science projects at the annual science fair.',
                image: 'https://via.placeholder.com/600x400/ec4899/ffffff?text=Science+Fair',
                category: 'science',
                author: 'Jane Smith',
                authorAvatar: 'https://via.placeholder.com/40',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                likes: 189,
                comments: 22,
                shares: 8,
                views: 1205
            }
        ];
    }

    getSamplePhotos() {
        return [
            {
                id: 'photo1',
                title: 'School Assembly',
                category: 'academics',
                image: 'https://via.placeholder.com/300x300',
                author: 'Photo Club',
                likes: 156,
                comments: 12,
                views: 890,
                createdAt: new Date().toISOString()
            },
            {
                id: 'photo2',
                title: 'Cultural Festival',
                category: 'community',
                image: 'https://via.placeholder.com/300x400',
                author: 'Culture Team',
                likes: 234,
                comments: 28,
                views: 1456,
                createdAt: new Date().toISOString()
            }
        ];
    }

    getSampleVideos() {
        return [
            {
                id: 'video1',
                title: 'Sports Highlights',
                description: 'Best moments from sports day',
                thumbnail: 'https://via.placeholder.com/320x180',
                duration: '3:45',
                author: 'Sports Club',
                likes: 312,
                comments: 45,
                views: 2341,
                createdAt: new Date().toISOString()
            }
        ];
    }

    getSamplePolls() {
        return [
            {
                id: 'poll1',
                title: 'What is your favorite school event?',
                options: ['Sports Day', 'Cultural Festival', 'Science Fair', 'Annual Picnic'],
                votes: [
                    { option: 'Sports Day', count: 245 },
                    { option: 'Cultural Festival', count: 189 },
                    { option: 'Science Fair', count: 156 },
                    { option: 'Annual Picnic', count: 198 }
                ],
                totalVotes: 788,
                createdAt: new Date().toISOString()
            }
        ];
    }

    getSampleUsers() {
        return [
            {
                id: this.getCurrentUserId(),
                name: 'John Doe',
                email: 'john.doe@school.edu',
                class: 'Senior Year',
                avatar: 'https://via.placeholder.com/100',
                bio: 'Passionate about photography and school events',
                followers: 1250,
                following: 856,
                posts: 245,
                joinedDate: new Date(Date.now() - 31536000000).toISOString()
            }
        ];
    }
}

// Initialize database
const db = new Database();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = db;
}
