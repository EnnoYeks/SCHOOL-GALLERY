// ============================================
// NAVIGATION & UI INTERACTIONS
// ============================================

class Navigation {
    constructor() { this.init(); }
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
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });
});

(function loadHshsMobileShell() {
    if (!document.getElementById('hshs-boot-critical')) {
        var st = document.createElement('style');
        st.id = 'hshs-boot-critical';
        st.textContent = 'html.hshs-booting body>*:not(#hshs-boot),html:not(.hshs-ready) body>*:not(#hshs-boot){opacity:0!important}html.hshs-booting .nav-links,html:not(.hshs-ready) .nav-links{display:none!important}@media(max-width:1024px){.brand-mark,.brand-mark img,.logo img{width:42px!important;height:42px!important;max-width:42px!important;max-height:42px!important}}';
        document.documentElement.classList.add('hshs-booting');
        document.head.appendChild(st);
    }
    if (window.__hshsMobileShell) return;
    var current = document.currentScript && document.currentScript.src;
    if (!current) {
        var list = document.querySelectorAll('script[src*="navigation.js"]');
        for (var i = 0; i < list.length; i++) {
            if (list[i].src.indexOf('mobile-navigation') === -1) current = list[i].src;
        }
    }
    if (!current) return;

    function add(id, file) {
        if (document.getElementById(id)) return;
        var s = document.createElement('script');
        s.id = id;
        s.async = false;
        s.src = current.replace(/navigation\.js(\?.*)?$/, file);
        document.head.appendChild(s);
    }

    add('hshs-boot-js', 'hshs-boot.js');

    var script = document.createElement('script');
    script.id = 'hshs-mobile-shell-js';
    script.async = false;
    script.src = current.replace(/navigation\.js(\?.*)?$/, 'mobile-shell.js');
    document.head.appendChild(script);

    add('hshs-search-btn-js', 'mobile-search-btn.js');
    add('hshs-brand-js', 'hshs-brand.js');
})();
