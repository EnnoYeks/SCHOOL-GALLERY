// ============================================
// NAVIGATION & UI INTERACTIONS
// ============================================

var HSHS_ASSET_VER = '260902k';
window.__hshsAssetVer = HSHS_ASSET_VER;

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

(function recoverStaleBoot() {
    function reveal() {
        var root = document.documentElement;
        root.classList.remove('hshs-booting');
        root.classList.add('hshs-ready');
        var boot = document.getElementById('hshs-boot');
        if (boot && boot.parentNode) boot.remove();
        var cover = document.getElementById('hshs-tt-overlay');
        if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
    }
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) reveal();
    });
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
            regs.forEach(function (reg) { reg.unregister(); });
        }).catch(function () {});
    }
    if (window.caches && caches.keys) {
        caches.keys().then(function (keys) {
            keys.forEach(function (key) { caches.delete(key); });
        }).catch(function () {});
    }
})();

(function loadHshsMobileShell() {
    if (!document.getElementById('hshs-boot-critical')) {
        var st = document.createElement('style');
        st.id = 'hshs-boot-critical';
        st.textContent = 'html.hshs-booting,html.hshs-booting body{background:#050d1c!important}html.hshs-booting .animated-bg,html.hshs-booting .gradient-bg,html.hshs-booting .navbar,html.hshs-booting .hero,#hshs-tt-overlay{display:none!important}html.hshs-booting body>*:not(#hshs-boot){opacity:0!important;visibility:hidden!important}html.hshs-booting .nav-links{display:none!important}@media(max-width:1024px){.particles-container,.floating-shapes,.parallax-shapes{display:none!important}}';
        document.documentElement.classList.add('hshs-booting');
        var mobile = window.matchMedia('(max-width: 1024px)').matches;
        document.documentElement.classList.toggle('hshs-device-mobile', mobile);
        document.documentElement.classList.toggle('hshs-device-desktop', !mobile);
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
    function bust(url) {
        return url.replace(/(\?.*)?$/, '') + '?v=' + HSHS_ASSET_VER;
    }
    function add(id, file) {
        if (document.getElementById(id)) return;
        var s = document.createElement('script');
        s.id = id;
        s.async = false;
        s.src = bust(current.replace(/navigation\.js(\?.*)?$/, file));
        document.head.appendChild(s);
    }
    function addCss(id, file) {
        if (document.getElementById(id)) return;
        var link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = bust(current.replace(/js\/navigation\.js(\?.*)?$/, 'css/' + file));
        document.head.appendChild(link);
    }
    addCss('hshs-boot-css', 'hshs-boot.css');
    addCss('hshs-no-flicker-css', 'hshs-no-flicker.css');
    addCss('hshs-tt-css', 'hshs-tt.css');
    addCss('hshs-social-css', 'hshs-social.css');
    addCss('hshs-social-loop-css', 'hshs-social-loop.css');
    addCss('hshs-social-actions-css', 'hshs-social-actions.css');
    addCss('hshs-motion-css', 'gallery-transitions.css');
    addCss('hshs-page-swipe-css', 'page-swipe.css');
    addCss('hshs-chat-spring-css', 'hshs-chat-spring.css');
    addCss('hshs-account-css', 'hshs-account.css');
    addCss('hshs-settings-css', 'hshs-settings.css');
    addCss('hshs-school-css', 'hshs-school.css');
    add('hshs-lock-js', 'hshs-lock.js');
    add('hshs-tt-js', 'hshs-tt.js');
    add('hshs-boot-js', 'hshs-boot.js');
    add('hshs-perf-js', 'hshs-perf.js');
    add('hshs-store-js', 'hshs-store.js');
    add('hshs-social-js', 'hshs-social.js');
    add('hshs-social-actions-js', 'hshs-social-actions.js');
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
    add('hshs-account-js', 'hshs-account.js');
    add('hshs-settings-js', 'hshs-settings.js');
    add('hshs-school-js', 'hshs-school.js');
})();