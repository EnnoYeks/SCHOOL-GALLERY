// ============================================
// NAVIGATION & UI INTERACTIONS
// ============================================

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupDropdowns();
        this.setupMobileMenu();
        this.setupScrollEffects();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');
            });
        });
    }

    setupDropdowns() {
        // Notification dropdown
        const notificationIcon = document.querySelector('.notification-icon');
        const notificationDropdown = document.getElementById('notificationDropdown');

        if (notificationIcon && notificationDropdown) {
            notificationIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('active');
            });
        }

        // Profile dropdown
        const profileIcon = document.querySelector('.profile-icon');
        const profileDropdown = document.getElementById('profileDropdown');

        if (profileIcon && profileDropdown) {
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            if (notificationDropdown) {
                notificationDropdown.classList.remove('active');
            }
            if (profileDropdown) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('mobile-visible');
                mobileMenuToggle.classList.toggle('active');
            });

            // Close menu when a link is clicked
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('mobile-visible');
                    mobileMenuToggle.classList.remove('active');
                });
            });
        }
    }

    setupScrollEffects() {
        let lastScroll = 0;
        const navbar = document.querySelector('.navbar');

        if (navbar) {
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                lastScroll = currentScroll;
            });
        }
    }

    // Update Notification Badge
    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Add Notification
    addNotification(notification) {
        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList) {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `
                <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
                        ${notification.title}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${notification.message}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.5rem;">
                        ${Utils.formatDate(notification.createdAt)}
                    </div>
                </div>
            `;
            notificationsList.insertBefore(item, notificationsList.firstChild);
            
            // Update badge
            const currentCount = parseInt(document.getElementById('notificationBadge').textContent) || 0;
            this.updateNotificationBadge(currentCount + 1);
        }
    }
}

// Initialize navigation
const navigation = new Navigation();

// Tab Switching Function
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Tab Button Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
