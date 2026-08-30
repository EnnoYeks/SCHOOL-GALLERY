// ============================================
// SETTINGS PAGE CONTROLLER
// ============================================

class SettingsController {
    constructor() {
        this.manager = window.settingsManager;
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupAccountForm();
        this.setupPrivacyForm();
        this.setupNotificationsForm();
        this.setupThemeForm();
        this.loadCurrentSettings();
    }

    // ========== TAB NAVIGATION ==========
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.getAttribute('data-tab');
                
                // Remove active from all
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active to clicked
                btn.classList.add('active');
                document.getElementById(tabName + 'Tab').classList.add('active');
            });
        });
    }

    // ========== ACCOUNT SETTINGS ==========
    setupAccountForm() {
        const form = document.getElementById('accountTab');
        if (!form) return;

        const fullNameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const classInput = form.querySelectorAll('input[type="text"]')[1];
        const bioInput = form.querySelector('textarea');
        const saveBtn = form.querySelector('button');

        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                // Validate inputs
                if (!fullNameInput.value || !emailInput.value) {
                    Utils.showToast('Please fill in all required fields', 'error');
                    return;
                }

                if (!Utils.validateEmail(emailInput.value)) {
                    Utils.showToast('Please enter a valid email', 'error');
                    return;
                }

                // Update settings
                await this.manager.updateAccountInfo({
                    fullName: fullNameInput.value,
                    email: emailInput.value,
                    className: classInput.value,
                    bio: bioInput.value
                });

                await this.manager.saveSettings();
            });
        }
    }

    // ========== PRIVACY SETTINGS ==========
    setupPrivacyForm() {
        const form = document.getElementById('privacyTab');
        if (!form) return;

        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        const saveBtn = form.querySelector('button');

        checkboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', () => {
                const labels = ['publicProfile', 'showActivityStatus', 'allowDirectMessages'];
                this.manager.currentSettings.privacy[labels[index]] = checkbox.checked;
            });
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.manager.saveSettings();
            });
        }
    }

    // ========== NOTIFICATIONS SETTINGS ==========
    setupNotificationsForm() {
        const form = document.getElementById('notificationsTab');
        if (!form) return;

        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        const saveBtn = form.querySelector('button');

        checkboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', () => {
                const settings = ['postLikes', 'comments', 'shares', 'mentions'];
                this.manager.currentSettings.notifications[settings[index]] = checkbox.checked;
            });
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.manager.saveSettings();
            });
        }
    }

    // ========== THEME SETTINGS ==========
    setupThemeForm() {
        const form = document.getElementById('themeTab');
        if (!form) return;

        // Preset Themes
        const presetThemes = form.querySelectorAll('.preset-theme');
        presetThemes.forEach(theme => {
            theme.addEventListener('click', () => {
                presetThemes.forEach(t => t.classList.remove('active'));
                theme.classList.add('active');
                
                const themeName = theme.querySelector('.theme-name').textContent.toLowerCase();
                this.manager.updateSetting('theme', 'theme', themeName);
                this.applyTheme(themeName);
            });
        });

        // Animation Speed
        const speedSlider = form.querySelector('.animation-speed-slider');
        const speedBtns = form.querySelectorAll('.speed-btn');

        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.manager.updateSetting('theme', 'animationSpeed', parseInt(e.target.value));
                speedBtns.forEach(btn => btn.classList.remove('active'));
                
                if (e.target.value < 33) speedBtns[0].classList.add('active');
                else if (e.target.value < 66) speedBtns[1].classList.add('active');
                else speedBtns[2].classList.add('active');
            });
        }

        speedBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const speeds = [0, 50, 100];
                speedSlider.value = speeds[index];
                this.manager.updateSetting('theme', 'animationSpeed', speeds[index]);
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Action Buttons
        const saveBtn = form.querySelector('.action-btn.save');
        const resetBtn = form.querySelector('.action-btn.reset');

        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.manager.saveSettings();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Reset to default theme?')) {
                    this.manager.resetToDefaults();
                    location.reload();
                }
            });
        }
    }

    applyTheme(themeName) {
        const themes = {
            'default': {
                '--primary-color': '#6366f1',
                '--secondary-color': '#ec4899',
                '--accent-color': '#f59e0b'
            },
            'ocean': {
                '--primary-color': '#3b82f6',
                '--secondary-color': '#8b5cf6',
                '--accent-color': '#ec4899'
            },
            'forest': {
                '--primary-color': '#10b981',
                '--secondary-color': '#14b8a6',
                '--accent-color': '#f59e0b'
            }
        };

        const theme = themes[themeName] || themes['default'];
        Object.keys(theme).forEach(key => {
            document.documentElement.style.setProperty(key, theme[key]);
        });
    }

    loadCurrentSettings() {
        const settings = this.manager.getAllSettings();

        // Load Account Settings
        const accountForm = document.getElementById('accountTab');
        if (accountForm) {
            const inputs = accountForm.querySelectorAll('input, textarea');
            if (inputs[0]) inputs[0].value = settings.account.fullName;
            if (inputs[1]) inputs[1].value = settings.account.email;
            if (inputs[2]) inputs[2].value = settings.account.className;
            if (inputs[3]) inputs[3].value = settings.account.bio;
        }

        // Load Privacy Settings
        const privacyForm = document.getElementById('privacyTab');
        if (privacyForm) {
            const checkboxes = privacyForm.querySelectorAll('input[type="checkbox"]');
            checkboxes[0].checked = settings.privacy.publicProfile;
            checkboxes[1].checked = settings.privacy.showActivityStatus;
            checkboxes[2].checked = settings.privacy.allowDirectMessages;
        }

        // Load Notification Settings
        const notifForm = document.getElementById('notificationsTab');
        if (notifForm) {
            const checkboxes = notifForm.querySelectorAll('input[type="checkbox"]');
            checkboxes[0].checked = settings.notifications.postLikes;
            checkboxes[1].checked = settings.notifications.comments;
            checkboxes[2].checked = settings.notifications.shares;
            checkboxes[3].checked = settings.notifications.mentions;
        }

        // Load Theme Settings
        const themeForm = document.getElementById('themeTab');
        if (themeForm) {
            const presets = themeForm.querySelectorAll('.preset-theme');
            const themeName = settings.theme.theme;
            presets.forEach(p => p.classList.remove('active'));
            presets.forEach(p => {
                if (p.querySelector('.theme-name').textContent.toLowerCase() === themeName) {
                    p.classList.add('active');
                }
            });

            const slider = themeForm.querySelector('.animation-speed-slider');
            if (slider) slider.value = settings.theme.animationSpeed;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('accountTab')) {
        new SettingsController();
    }
});
