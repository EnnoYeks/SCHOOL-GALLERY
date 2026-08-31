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
    function isPhone() {
        try { return window.matchMedia('(max-width: 1024px)').matches; }
        catch (e) { return window.innerWidth <= 1024; }
    }
    function lockDevice() {
        var phone = isPhone();
        var html = document.documentElement;
        html.classList.add('hshs-booting');
        html.classList.toggle('hshs-device-mobile', phone);
        html.classList.toggle('hshs-device-desktop', !phone);
        html.setAttribute('data-hshs-device', phone ? 'mobile' : 'desktop');
        var body = document.body;
        if (body) {
            body.classList.toggle('has-mobile-shell', phone);
            body.classList.toggle('hshs-device-mobile', phone);
            body.classList.toggle('hshs-device-desktop', !phone);
        }
        window.__hshsIsMobile = phone;
        return phone;
    }
    lockDevice();

    if (!document.getElementById('hshs-boot-critical')) {
        var st = document.createElement('style');
        st.id = 'hshs-boot-critical';
        st.textContent = 'html,html.hshs-booting,html:not(.hshs-ready){background:#071433!important}' +
            'html.hshs-booting body>*:not(#hshs-boot),html:not(.hshs-ready) body>*:not(#hshs-boot){opacity:0!important;pointer-events:none!important}' +
            'html.hshs-booting .nav-links,html:not(.hshs-ready) .nav-links{display:none!important}' +
            'html.hshs-device-mobile .navbar .nav-links,html.hshs-device-mobile .mobile-menu-toggle{display:none!important}' +
            'html.hshs-device-desktop .mobile-tabbar,html.hshs-device-desktop .more-sheet,html.hshs-device-desktop .more-backdrop{display:none!important}' +
            '@media(max-width:1024px){.brand-mark,.brand-mark img,.logo img{width:42px!important;height:42px!important;max-width:42px!important;max-height:42px!important}.particles-container,.floating-shapes,.parallax-shapes{display:none!important}}';
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

    function addJs(id, file) {
        if (document.getElementById(id)) return;
        var s = document.createElement('script');
        s.id = id;
        s.async = false;
        s.src = current.replace(/navigation\.js(\?.*)?$/, file);
        document.head.appendChild(s);
    }
    function addCss(id, file) {
        if (document.getElementById(id)) return;
        var l = document.createElement('link');
        l.id = id;
        l.rel = 'stylesheet';
        l.href = current.replace(/js\/navigation\.js(\?.*)?$/, 'css/' + file);
        document.head.appendChild(l);
    }

    addCss('hshs-boot-css', 'hshs-boot.css');
    addCss('hshs-mobile-shell-css', 'mobile-shell.css');
    addJs('hshs-device-js', 'hshs-device.js');
    addJs('hshs-boot-js', 'hshs-boot.js');
    addJs('hshs-perf-js', 'hshs-perf.js');
    addJs('hshs-mobile-shell-js', 'mobile-shell.js');
    addJs('hshs-search-btn-js', 'mobile-search-btn.js');
    addJs('hshs-brand-js', 'hshs-brand.js');
    addJs('hshs-swipe-js', 'hshs-swipe.js');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lockDevice, { once: true });
    } else {
        lockDevice();
    }
})();
