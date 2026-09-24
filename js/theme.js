(function () {
    function readTheme() {
        try {
            var raw = localStorage.getItem('theme');
            if (!raw) return 'dark';
            try {
                var parsed = JSON.parse(raw);
                if (parsed === 'dark' || parsed === 'light') return parsed;
            } catch (e) {}
            if (raw === 'dark' || raw === 'light') return raw;
        } catch (e) {}
        return 'dark';
    }
    function writeTheme(theme) {
        try { localStorage.setItem('theme', JSON.stringify(theme)); } catch (e) {}
    }
    function paintRoot(theme) {
        var dark = theme === 'dark';
        var root = document.documentElement;
        root.classList.toggle('dark-mode', dark);
        root.classList.toggle('light-mode', !dark);
        root.setAttribute('data-theme', theme);
        if (document.body) {
            document.body.classList.toggle('dark-mode', dark);
            document.body.classList.toggle('light-mode', !dark);
        }
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', dark ? '#071433' : '#e8eefc');
    }
    function officialHref() {
        var guess = '';
        try {
            var scripts = document.querySelectorAll('script[src]');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].getAttribute('src') || '';
                if (src.indexOf('navigation.js') !== -1 && src.indexOf('mobile-navigation') === -1) {
                    guess = src;
                    break;
                }
            }
        } catch (e) {}
        var ver = window.__hshsAssetVer || '260924look1';
        var href = guess
            ? guess.replace(/js\/navigation\.js.*$/, 'css/hshs-official.css')
            : (location.pathname.indexOf('/index/') !== -1 ? '../css/hshs-official.css' : 'css/hshs-official.css');
        if (href.indexOf('?') === -1) href += '?v=' + ver;
        return href;
    }
    function ensureOfficialCss() {
        var href = officialHref();
        var link = document.getElementById('hshs-official-css');
        if (!link) {
            link = document.createElement('link');
            link.id = 'hshs-official-css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        if (link.getAttribute('href') !== href) link.href = href;
        if (link.parentNode === document.head) document.head.appendChild(link);
    }
    function syncHshsTheme() {
        var theme = readTheme();
        paintRoot(theme);
        ensureOfficialCss();
        var btn = document.getElementById('themeToggle');
        if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        try { document.dispatchEvent(new CustomEvent('hshs:theme', { detail: { theme: theme } })); } catch (e) {}
        return theme;
    }
    window.syncHshsTheme = syncHshsTheme;
    window.__hshsReadTheme = readTheme;
    window.__hshsEnsureOfficialCss = ensureOfficialCss;
    paintRoot(readTheme());
    if (document.head) ensureOfficialCss();
    if (document.body) syncHshsTheme();
    else document.addEventListener('DOMContentLoaded', syncHshsTheme);
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('#themeToggle');
        if (!btn) return;
        var next = readTheme() === 'dark' ? 'light' : 'dark';
        writeTheme(next);
        syncHshsTheme();
    });
    document.addEventListener('hshs:page', function () {
        ensureOfficialCss();
        syncHshsTheme();
    });
})();

class ThemeManager {
    constructor() {
        this.currentTheme = window.__hshsReadTheme ? window.__hshsReadTheme() : 'dark';
        this.init();
    }
    init() {
        if (window.syncHshsTheme) this.currentTheme = window.syncHshsTheme();
        this.loadCustomTheme();
    }
    toggleTheme() {
        const next = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(next);
    }
    applyTheme(theme) {
        try { localStorage.setItem('theme', JSON.stringify(theme)); } catch (e) {}
        this.currentTheme = theme;
        if (window.syncHshsTheme) window.syncHshsTheme();
    }
    updateThemeToggleIcon() {
        if (window.syncHshsTheme) window.syncHshsTheme();
    }
    setCustomColors(colors) {
        const root = document.documentElement;
        Object.entries(colors || {}).forEach(([key, value]) => root.style.setProperty('--' + key, value));
        if (window.Utils && Utils.setData) Utils.setData('customColors', colors);
    }
    loadCustomTheme() {
        if (!window.Utils || !Utils.getData) return;
        const customColors = Utils.getData('customColors');
        if (customColors) this.setCustomColors(customColors);
    }
    getCurrentTheme() { return this.currentTheme; }
}

document.addEventListener('DOMContentLoaded', function () {
    window.themeManager = new ThemeManager();
    if (window.syncHshsTheme) window.syncHshsTheme();
});
