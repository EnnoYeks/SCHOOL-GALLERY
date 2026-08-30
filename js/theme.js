(function () {
    function readTheme() {
        try {
            var raw = localStorage.getItem('theme');
            if (!raw) return 'light';
            try {
                var parsed = JSON.parse(raw);
                if (parsed === 'dark' || parsed === 'light') return parsed;
            } catch (e) {}
            if (raw === 'dark' || raw === 'light') return raw;
        } catch (e) {}
        return 'light';
    }
    function writeTheme(theme) {
        try { localStorage.setItem('theme', JSON.stringify(theme)); } catch (e) {}
    }
    function syncHshsTheme() {
        if (!document.body) return;
        var theme = readTheme();
        document.body.classList.toggle('dark-mode', theme === 'dark');
        document.body.classList.toggle('light-mode', theme !== 'dark');
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#6366f1');
        var btn = document.getElementById('themeToggle');
        if (btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        return theme;
    }
    window.syncHshsTheme = syncHshsTheme;
    window.__hshsReadTheme = readTheme;
    if (document.body) syncHshsTheme();
    else document.addEventListener('DOMContentLoaded', syncHshsTheme);
    document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('#themeToggle');
        if (!btn) return;
        var next = readTheme() === 'dark' ? 'light' : 'dark';
        writeTheme(next);
        syncHshsTheme();
    });
})();

class ThemeManager {
    constructor() {
        this.currentTheme = window.__hshsReadTheme ? window.__hshsReadTheme() : 'light';
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
