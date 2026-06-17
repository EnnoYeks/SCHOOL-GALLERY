// ============================================
// UTILITY FUNCTIONS
// ============================================

class Utils {
    // Format Date
    static formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        // Less than a minute
        if (diff < 60000) {
            return 'just now';
        }
        
        // Less than an hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return mins + 'm ago';
        }
        
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return hours + 'h ago';
        }
        
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return days + 'd ago';
        }
        
        // Format as date
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    // Format Numbers
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    }

    // Format Time
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Truncate Text
    static truncateText(text, length = 100) {
        if (text.length > length) {
            return text.substring(0, length) + '...';
        }
        return text;
    }

    // Capitalize
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Generate Random Color
    static getRandomColor() {
        const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Check if Mobile
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Debounce Function
    static debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Throttle Function
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Get Query Parameters
    static getQueryParam(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    // Get File Size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Validate Email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate URL
    static validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Copy to Clipboard
    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Could not copy text:', err);
        });
    }

    // Show Toast Notification
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Lazy Load Images
    static lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // Scroll to Element
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    // Get Scroll Percentage
    static getScrollPercentage() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        return (scrolled / windowHeight) * 100;
    }

    // Add Event Listener (with remove option)
    static addEventListeners(selector, event, callback) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener(event, callback);
        });
    }

    // Remove Event Listener
    static removeEventListeners(selector, event) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.removeEventListener(event, null);
        });
    }

    // Animate Value Counter
    static animateCounter(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const interval = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(interval);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Get Initials from Name
    static getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    // Generate Random ID
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Get Device Type
    static getDeviceType() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'mobile';
        if (/tablet/i.test(ua)) return 'tablet';
        return 'desktop';
    }

    // Store Data
    static setData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Get Data
    static getData(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    // Remove Data
    static removeData(key) {
        localStorage.removeItem(key);
    }

    // Clear All Data
    static clearAllData() {
        localStorage.clear();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
