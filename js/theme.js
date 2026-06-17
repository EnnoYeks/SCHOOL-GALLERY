
// ============================================
// THEME & DARK MODE MANAGEMENT
// ============================================

class ThemeManager {
    constructor() {
        this.currentTheme = Utils.getData('theme') || CONFIG.theme.defaultMode;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.loadCustomTheme();
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
        }

        this.currentTheme = theme;
        Utils.setData('theme', theme);
        this.updateThemeToggleIcon();
    }

    updateThemeToggleIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            if (this.currentTheme === 'dark') {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    }

    // Custom Theme Colors
    setCustomColors(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        Utils.setData('customColors', colors);
    }

    loadCustomTheme() {
        const customColors = Utils.getData('customColors');
        if (customColors) {
            this.setCustomColors(customColors);
        }
    }

    // Preset Themes
    applyPresetTheme(themeName) {
        const themes = {
            default: {
                'primary-color': '#6366f1',
                'secondary-color': '#ec4899',
                'accent-color': '#f59e0b'
            },
            ocean: {
                'primary-color': '#3b82f6',
                'secondary-color': '#8b5cf6',
                'accent-color': '#ec4899'
            },
            forest: {
                'primary-color': '#10b981',
                'secondary-color': '#14b8a6',
                'accent-color': '#f59e0b'
            }
        };

        if (themes[themeName]) {
            this.setCustomColors(themes[themeName]);
            Utils.setData('currentPresetTheme', themeName);
        }
    }

    // Animation Speed
    setAnimationSpeed(speed) {
        // speed: 0-100
        // Convert to 0.1s - 1s
        const duration = (100 - speed) / 100 * 0.9 + 0.1;
        document.documentElement.style.setProperty('--transition-duration', duration + 's');
        Utils.setData('animationSpeed', speed);
    }

    // Font Settings
    setFont(fontFamily) {
        const root = document.documentElement;
        root.style.fontFamily = fontFamily;
        Utils.setData('font', fontFamily);
    }

    // Accessibility
    setHighContrast(enable) {
        const body = document.body;
        if (enable) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        Utils.setData('highContrast', enable);
    }

    setReducedMotion(enable) {
        const body = document.body;
        if (enable) {
            body.classList.add('reduced-motion');
        } else {
            body.classList.remove('reduced-motion');
        }
        Utils.setData('reducedMotion', enable);
    }

    // Get Current Theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Reset to Default
    resetToDefault() {
        this.applyTheme(CONFIG.theme.defaultMode);
        this.applyPresetTheme('default');
        localStorage.removeItem('customColors');
        localStorage.removeItem('animationSpeed');
        localStorage.removeItem('font');
        Utils.showToast('Theme reset to default', 'success');
    }

    // Export Theme
    exportTheme() {
        const themeData = {
            currentTheme: this.currentTheme,
            customColors: Utils.getData('customColors'),
            animationSpeed: Utils.getData('animationSpeed'),
            font: Utils.getData('font'),
            highContrast: Utils.getData('highContrast'),
            reducedMotion: Utils.getData('reducedMotion')
        };

        const dataStr = JSON.stringify(themeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'theme-config.json';
        link.click();
    }

    // Import Theme
    importTheme(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const themeData = JSON.parse(e.target.result);
                
                if (themeData.currentTheme) {
                    this.applyTheme(themeData.currentTheme);
                }
                if (themeData.customColors) {
                    this.setCustomColors(themeData.customColors);
                }
                if (themeData.animationSpeed !== undefined) {
                    this.setAnimationSpeed(themeData.animationSpeed);
                }
                if (themeData.font) {
                    this.setFont(themeData.font);
                }
                if (themeData.highContrast) {
                    this.setHighContrast(themeData.highContrast);
                }
                if (themeData.reducedMotion) {
                    this.setReducedMotion(themeData.reducedMotion);
                }

                Utils.showToast('Theme imported successfully', 'success');
            } catch (error) {
                Utils.showToast('Error importing theme', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
