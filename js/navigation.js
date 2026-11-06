var HSHS_ASSET_VER = '261106glass1';
window.__hshsAssetVer = HSHS_ASSET_VER;

(function markGlassCapability() {
    var root = document.documentElement;
    var supports = !!(window.CSS && CSS.supports && (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)')));
    var memory = Number(navigator.deviceMemory);
    var cores = Number(navigator.hardwareConcurrency);
    var constrained = (Number.isFinite(memory) && memory <= 2) || (!Number.isFinite(memory) && Number.isFinite(cores) && cores <= 2);
    if (!supports || constrained) root.classList.add('hshs-no-backdrop');
})();

class Navigation {
    constructor() { this.init(); }
    init() { this.setupDropdowns(); this.setupMobileMenu(); this.setupScrollEffects(); }
    setupDropdowns() {
        const notificationIcon = document.querySelector('.notification-icon');
        const notificationDropdown = document.getElementById('notificationDropdown');
        if (notificationIcon && notificationDropdown) notificationIcon.addEventListener('click', (e) => { if (window.matchMedia('(max-width: 1024px)').matches) return; e.stopPropagation(); notificationDropdown.classList.toggle('active'); });
        const profileIcon = document.querySelector('.profile-icon');
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileIcon && profileDropdown) profileIcon.addEventListener('click', (e) => { if (window.matchMedia('(max-width: 1024px)').matches) return; e.stopPropagation(); profileDropdown.classList.toggle('active'); });
        document.addEventListener('click', () => { if (notificationDropdown) notificationDropdown.classList.remove('active'); if (profileDropdown) profileDropdown.classList.remove('active'); });
    }
    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle'); const navLinks = document.querySelector('.nav-links');
        if (mobileMenuToggle && navLinks) mobileMenuToggle.addEventListener('click', () => { navLinks.classList.toggle('mobile-visible'); mobileMenuToggle.classList.toggle('active'); });
    }
    setupScrollEffects() {
        const navbar = document.querySelector('.navbar'); if (!navbar) return; var ticking = false;
        window.addEventListener('scroll', function () { if (ticking) return; ticking = true; requestAnimationFrame(function () { navbar.classList.toggle('scrolled', window.pageYOffset > 100); ticking = false; }); }, { passive: true });
    }
}
const navigation = new Navigation();
function switchTab(tabName) { document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); const selectedTab = document.getElementById(tabName + 'Tab'); if (selectedTab) selectedTab.classList.add('active'); }
document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('.tab-btn').forEach(btn => { btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')); }); });
(function recoverStaleBoot() {
    function reveal() { var root = document.documentElement; root.classList.remove('hshs-booting'); root.classList.add('hshs-ready'); var boot = document.getElementById('hshs-boot'); if (boot && boot.parentNode) boot.remove(); var cover = document.getElementById('hshs-tt-overlay'); if (cover && cover.parentNode) cover.parentNode.removeChild(cover); }
    window.addEventListener('pageshow', function (e) { if (e.persisted) reveal(); });
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) navigator.serviceWorker.getRegistrations().then(function (regs) { regs.forEach(function (reg) { reg.unregister(); }); }).catch(function () {});
    if (window.caches && caches.keys) caches.keys().then(function (keys) { keys.forEach(function (key) { caches.delete(key); }); }).catch(function () {});
})();
(function loadHshsMobileShell() {
    if (!document.getElementById('hshs-boot-critical')) { var st = document.createElement('style'); st.id = 'hshs-boot-critical'; st.textContent = 'html,body{background:#071433}#hshs-page,.mobile-tabbar,.navbar{opacity:1;visibility:visible}'; document.documentElement.classList.add('hshs-ready'); document.documentElement.classList.remove('hshs-booting'); var mobile = window.matchMedia('(max-width: 1024px)').matches; document.documentElement.classList.toggle('hshs-device-mobile', mobile); document.documentElement.classList.toggle('hshs-device-desktop', !mobile); document.head.appendChild(st); }
    var current = document.currentScript && document.currentScript.src;
    if (!current) { var list = document.querySelectorAll('script[src*="navigation.js"]'); for (var i = 0; i < list.length; i++) if (list[i].src.indexOf('mobile-navigation') === -1) current = list[i].src; }
    if (!current) return;
    function bust(url) { return url.replace(/(\?.*)?$/, '') + '?v=' + HSHS_ASSET_VER; }
    function add(id, file) { if (document.getElementById(id)) return; var s = document.createElement('script'); s.id = id; s.async = false; s.src = bust(current.replace(/navigation\.js(\?.*)?$/, file)); document.head.appendChild(s); }
    function addCss(id, file) { if (document.getElementById(id)) return; var link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; link.href = bust(current.replace(/js\/navigation\.js(\?.*)?$/, 'css/' + file)); document.head.appendChild(link); }
    ['hshs-boot.css','hshs-no-flicker.css','hshs-tt.css','hshs-social.css','hshs-social-loop.css','hshs-social-actions.css','gallery-transitions.css','page-swipe.css','hshs-chat-spring.css','hshs-account.css','hshs-settings.css','hshs-school.css','hshs-desktop.css','hshs-desktop-upload.css','hshs-topbar.css','hshs-official.css','hshs-glass.css','hshs-desktop-flex.css','hshs-chrome.css','hshs-system.css','hshs-stable.css'].forEach(function (file) { addCss('hshs-' + file.replace(/[^a-z0-9]/gi, '-') , file); });
    ['core/paint.js','hshs-lock.js','hshs-tt.js','hshs-boot.js','hshs-perf.js','hshs-store-bridge.js','hshs-store.js','hshs-local-social.js','hshs-people.js','hshs-social.js','hshs-social-actions.js','hshs-notify.js','mobile-shell.js','hshs-upload.js','hshs-upload-context.js','mobile-search-btn.js','hshs-brand.js','hshs-spring.js','hshs-motion.js','gallery-transitions.js','hshs-swipe.js','page-swipe.js','hshs-chat-spring.js','hshs-account.js','hshs-auth-bridge.js','hshs-analytics.js','hshs-analytics-hooks.js','hshs-profile-edit-link.js','hshs-settings.js','hshs-school.js','hshs-desktop.js','hshs-desktop-upload.js','hshs-topbar.js','hshs-chrome.js','hshs-stable.js','hshs-final-guard.js','hshs-nodemo-hard.js'].forEach(function (file) { add('hshs-' + file.replace(/[^a-z0-9]/gi, '-') , file); });
})();
(function forceAuthHardNav() {
  function fileOf(url) { try { var u = new URL(url, location.href); return (u.pathname.split('/').pop() || '').toLowerCase().replace(/\.html$/, ''); } catch (e) { return String(url || '').toLowerCase(); } }
  function isAuth(url) { var f = fileOf(url); return f === 'login' || f === 'edit-profile'; }
  function dest(url) { var f = fileOf(url) === 'edit-profile' ? 'edit-profile' : 'login', q = ''; try { q = new URL(url, location.href).search || ''; } catch (e) {} return (window.HshsPaths ? HshsPaths.href(f) : ('/' + f + '/')) + q; }
  function go(url) { location.assign(dest(url || 'login.html')); }
  document.addEventListener('click', function (e) { var t = e.target; if (!t || !t.closest) return; var a = t.closest('a[href]'); if (!a) return; var href = a.getAttribute('href') || ''; if (!isAuth(href)) return; e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); go(href); }, true);
  function wrap() { if (!window.__hshsNavigate || window.__hshsNavigate.__authHard) return; var orig = window.__hshsNavigate; function wrapped(url, fromHistory) { if (isAuth(url)) { go(url); return; } return orig(url, fromHistory); } wrapped.__authHard = true; window.__hshsNavigate = wrapped; }
  wrap(); var n = 0; var iv = setInterval(function () { wrap(); if (++n > 40) clearInterval(iv); }, 250);
  function recover() { if (!isAuth(location.href)) return; if (document.body && document.body.classList.contains('hshs-auth-body') && document.getElementById('hshsAuthRoot')) return; location.replace(dest(location.href)); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', recover); else recover();
})();
