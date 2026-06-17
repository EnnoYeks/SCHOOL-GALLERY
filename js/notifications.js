// ============================================
// NOTIFICATION SYSTEM
// ============================================

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadNotifications();
        this.updateBadge();
    }

    loadNotifications() {
        this.notifications = db.getNotifications(20);
    }

    // Create notification
    notify(type, title, message, data = {}) {
        const notification = {
            id: Utils.generateId(),
            type,
            title,
            message,
            data,
            createdAt: new Date().toISOString(),
            read: false
        };

        db.createNotification(notification);
        this.notifications.unshift(notification);
        this.updateBadge();
        this.showToastNotification(title, message);

        return notification;
    }

    // Like notification
    notifyLike(postId, likerName) {
        return this.notify(
            CONFIG.notificationTypes.LIKE,
            'New Like!',
            `${likerName} liked your post`,
            { postId, likerName }
        );
    }

    // Comment notification
    notifyComment(postId, commenterName, commentText) {
        return this.notify(
            CONFIG.notificationTypes.COMMENT,
            'New Comment!',
            `${commenterName}: ${Utils.truncateText(commentText, 50)}`,
            { postId, commenterName, commentText }
        );
    }

    // Share notification
    notifyShare(postId, sharedByName) {
        return this.notify(
            CONFIG.notificationTypes.SHARE,
            'Post Shared!',
            `${sharedByName} shared your post`,
            { postId, sharedByName }
        );
    }

    // Featured notification
    notifyFeatured(postId) {
        return this.notify(
            CONFIG.notificationTypes.FEATURED,
            '🎉 Featured!',
            'Your post has been featured!',
            { postId }
        );
    }

    // Poll notification
    notifyPoll(pollId, pollName) {
        return this.notify(
            CONFIG.notificationTypes.POLL,
            'New Poll',
            `Check out: ${pollName}`,
            { pollId, pollName }
        );
    }

    // Mention notification
    notifyMention(postId, mentionerName) {
        return this.notify(
            CONFIG.notificationTypes.MENTION,
            'You were mentioned!',
            `${mentionerName} mentioned you in a post`,
            { postId, mentionerName }
        );
    }

    // Show toast notification
    showToastNotification(title, message) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 2rem;
            background: white;
            border-left: 4px solid var(--primary-color);
            border-radius: 10px;
            padding: 1rem 1.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        `;

        toast.innerHTML = `
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                ${title}
            </div>
            <div style="font-size: 0.9rem; color: var(--text-secondary);">
                ${message}
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.remove();
        });
    }

    // Get unread notifications
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }

    // Mark as read
    markAsRead(notificationId) {
        db.markNotificationAsRead(notificationId);
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateBadge();
        }
    }

    // Mark all as read
    markAllAsRead() {
        this.notifications.forEach(n => {
            if (!n.read) {
                db.markNotificationAsRead(n.id);
                n.read = true;
            }
        });
        this.updateBadge();
    }

    // Update badge
    updateBadge() {
        const unreadCount = this.getUnreadNotifications().length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // Display notifications in dropdown
    displayNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        if (this.notifications.length === 0) {
            notificationsList.innerHTML = '<p class="empty-state">No notifications</p>';
            return;
        }

        notificationsList.innerHTML = this.notifications.map(n => `
            <div style="
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                background: ${n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'};
                transition: all 0.3s ease;
            " onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='${n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}'">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                            ${n.title}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                            ${n.message}
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-tertiary);">
                            ${Utils.formatDate(n.createdAt)}
                        </div>
                    </div>
                    ${!n.read ? '<div style="width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%;"></div>' : ''}
                </div>
            </div>
        `).join('');
    }

    // Request permissions (for push notifications)
    requestPermissions() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                return true;
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    return permission === 'granted';
                });
            }
        }
        return false;
    }

    // Send push notification
    sendPushNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: 'https://via.placeholder.com/128',
                badge: 'https://via.placeholder.com/128',
                ...options
            });
        }
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
