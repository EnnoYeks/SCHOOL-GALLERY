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
            link.addEventListener('click', () => {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    setupDropdowns() {
        const notificationIcon = document.querySelector('.notification-icon');
        const notificationDropdown = document.getElementById('notificationDropdown');

        if (notificationIcon && notificationDropdown) {
            notificationIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle('active');
            });
        }

        const profileIcon = document.querySelector('.profile-icon');
        const profileDropdown = document.getElementById('profileDropdown');

        if (profileIcon && profileDropdown) {
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });
        }

        document.addEventListener('click', () => {
            if (notificationDropdown) notificationDropdown.classList.remove('active');
            if (profileDropdown) profileDropdown.classList.remove('active');
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
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 100) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            });
        }
    }

    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

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
            const currentCount = parseInt(document.getElementById('notificationBadge').textContent) || 0;
            this.updateNotificationBadge(currentCount + 1);
        }
    }
}

const navigation = new Navigation();

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) selectedTab.classList.add('active');
    if (typeof event !== 'undefined' && event.target) event.target.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });
});

(function loadHshsMobileShell() {
    if (window.__hshsMobileShell) return;
    var current = document.currentScript && document.currentScript.src;
    if (!current) {
        var list = document.querySelectorAll('script[src*="navigation.js"]');
        for (var i = 0; i < list.length; i++) {
            if (list[i].src.indexOf('mobile-navigation') === -1) current = list[i].src;
        }
    }
    if (!current) return;
    var script = document.createElement('script');
    script.src = current.replace(/navigation\.js(\?.*)?$/, 'mobile-shell.js');
    document.head.appendChild(script);
    if (!document.getElementById('hshs-search-btn-js')) {
        var searchBtn = document.createElement('script');
        searchBtn.id = 'hshs-search-btn-js';
        searchBtn.src = current.replace(/navigation\.js(\?.*)?$/, 'mobile-search-btn.js');
        document.head.appendChild(searchBtn);
    }
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
