// ============================================
// NAVIGATION & UI INTERACTIONS
// ============================================

class Navigation {
    constructor() { this.init(); }
    init() {
        this.setupDropdowns();
        this.setupMobileMenu();
        this.setupScrollEffects();
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
        if (!navbar) return;
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                navbar.classList.toggle('scrolled', window.pageYOffset > 100);
                ticking = false;
            });
        }, { passive: true });
    }
}

const navigation = new Navigation();

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) selectedTab.classList.add('active');
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
        st.textContent = 'html,html.hshs-booting,html:not(.hshs-ready){background:#071433!important}html.hshs-booting body>*:not(#hshs-boot),html:not(.hshs-ready) body>*:not(#hshs-boot){opacity:0!important}html.hshs-booting .nav-links,html:not(.hshs-ready) .nav-links{display:none!important}@media(max-width:1024px){.brand-mark,.brand-mark img,.logo img{width:42px!important;height:42px!important;max-width:42px!important;max-height:42px!important}.particles-container,.floating-shapes,.parallax-shapes{display:none!important}}';
        document.documentElement.classList.add('hshs-booting');
        document.head.appendChild(st);
    }
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
    function addCss(id, file) {
        if (document.getElementById(id)) return;
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = current.replace(/js\/navigation\.js(\?.*)?$/, 'css/' + file);
        document.head.appendChild(link);
    }
    addCss('hshs-tt-css', 'hshs-tt.css');
    addCss('hshs-social-css', 'hshs-social.css');
    addCss('hshs-motion-css', 'gallery-transitions.css');
    addCss('hshs-page-swipe-css', 'page-swipe.css');
    addCss('hshs-chat-spring-css', 'hshs-chat-spring.css');
    add('hshs-tt-js', 'hshs-tt.js');
    add('hshs-boot-js', 'hshs-boot.js');
    add('hshs-perf-js', 'hshs-perf.js');
    add('hshs-store-js', 'hshs-store.js');
    add('hshs-social-js', 'hshs-social.js');
    add('hshs-notify-js', 'hshs-notify.js');
    add('hshs-mobile-shell-js', 'mobile-shell.js');
    add('hshs-upload-js', 'hshs-upload.js');
    add('hshs-search-btn-js', 'mobile-search-btn.js');
    add('hshs-brand-js', 'hshs-brand.js');
    add('hshs-spring-js', 'hshs-spring.js');
    add('hshs-motion-js', 'hshs-motion.js');
    add('hshs-gallery-transitions-js', 'gallery-transitions.js');
    add('hshs-swipe-js', 'hshs-swipe.js');
    add('hshs-page-swipe-js', 'page-swipe.js');
    add('hshs-chat-spring-js', 'hshs-chat-spring.js');
})();
