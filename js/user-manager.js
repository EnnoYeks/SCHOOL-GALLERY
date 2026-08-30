// ============================================
// USER SETTINGS MANAGER
// ============================================

import { firestore, auth } from "./config.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

class UserSettingsManager {
    constructor() {
        this.userId = null;
        this.currentSettings = this.getDefaultSettings();
        this.isDirty = false;
        this.syncTimeout = null;
        this.init();
    }

    getDefaultSettings() {
        return {
            account: {
                fullName: "Guest User",
                email: "guest@hshs.edu",
                className: "N/A",
                bio: "",
                profilePhoto: "https://via.placeholder.com/120"
            },
            privacy: {
                publicProfile: true,
                showActivityStatus: true,
                allowDirectMessages: true
            },
            notifications: {
                postLikes: true,
                comments: true,
                shares: true,
                mentions: true,
                emailNotifications: false
            },
            theme: {
                mode: "light",
                theme: "default",
                animationSpeed: 50
            }
        };
    }

    async init() {
        // Load settings from localStorage first
        this.loadFromLocalStorage();
        
        // If user is authenticated, sync with Firebase
        if (auth?.currentUser) {
            this.userId = auth.currentUser.uid;
            await this.loadFromFirebase();
        }
    }

    loadFromLocalStorage() {
        const stored = Utils.getData("userSettings");
        if (stored) {
            this.currentSettings = { ...this.currentSettings, ...stored };
        }
    }

    async loadFromFirebase() {
        if (!this.userId) return;
        
        try {
            const userRef = doc(firestore, "users", this.userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const data = userSnap.data();
                this.currentSettings = { ...this.currentSettings, ...data.settings };
            }
        } catch (error) {
            console.error("Error loading settings from Firebase:", error);
        }
    }

    async updateSetting(category, key, value) {
        // Update in memory
        if (this.currentSettings[category]) {
            this.currentSettings[category][key] = value;
        }

        this.isDirty = true;

        // Debounce save to Firebase
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
            this.saveSettings();
        }, 1000);

        // Save to localStorage immediately
        Utils.setData("userSettings", this.currentSettings);
    }

    async updateAccountInfo(data) {
        Object.keys(data).forEach(key => {
            this.updateSetting("account", key, data[key]);
        });
    }

    async updatePrivacySettings(data) {
        Object.keys(data).forEach(key => {
            this.updateSetting("privacy", key, data[key]);
        });
    }

    async updateNotificationSettings(data) {
        Object.keys(data).forEach(key => {
            this.updateSetting("notifications", key, data[key]);
        });
    }

    async updateThemeSettings(data) {
        Object.keys(data).forEach(key => {
            this.updateSetting("theme", key, data[key]);
        });
    }

    async saveSettings() {
        if (!this.isDirty) return;

        if (this.userId) {
            try {
                const userRef = doc(firestore, "users", this.userId);
                await setDoc(userRef, {
                    settings: this.currentSettings,
                    updatedAt: serverTimestamp()
                }, { merge: true });

                this.isDirty = false;
                Utils.showToast("Settings saved successfully", "success");
            } catch (error) {
                console.error("Error saving settings:", error);
                Utils.showToast("Failed to save settings", "error");
            }
        } else {
            // Just save to localStorage if not authenticated
            Utils.setData("userSettings", this.currentSettings);
        }
    }

    getSetting(category, key) {
        return this.currentSettings[category]?.[key];
    }

    getAllSettings() {
        return this.currentSettings;
    }

    resetToDefaults() {
        this.currentSettings = this.getDefaultSettings();
        this.isDirty = true;
        this.saveSettings();
        Utils.showToast("Settings reset to defaults", "info");
    }
}

// ============================================
// USER PROFILE MANAGER
// ============================================

class UserProfileManager {
    constructor() {
        this.userId = null;
        this.profile = this.getDefaultProfile();
        this.init();
    }

    getDefaultProfile() {
        return {
            id: null,
            fullName: "Guest User",
            email: "guest@hshs.edu",
            className: "N/A",
            role: "student",
            bio: "",
            profilePhoto: "https://via.placeholder.com/120",
            stats: {
                posts: 0,
                followers: 0,
                following: 0,
                likes: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async init() {
        if (auth?.currentUser) {
            this.userId = auth.currentUser.uid;
            await this.loadProfile();
        }
    }

    async loadProfile() {
        if (!this.userId) return;

        try {
            const userRef = doc(firestore, "users", this.userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                this.profile = { ...this.profile, ...userSnap.data().profile };
            } else {
                // Create new profile for first time users
                await this.createProfile();
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    async createProfile() {
        if (!this.userId) return;

        try {
            const userRef = doc(firestore, "users", this.userId);
            const profileData = {
                ...this.profile,
                id: this.userId,
                email: auth.currentUser.email,
                fullName: auth.currentUser.displayName || "User"
            };

            await setDoc(userRef, {
                profile: profileData,
                createdAt: serverTimestamp()
            }, { merge: true });

            this.profile = profileData;
            Utils.showToast("Profile created", "success");
        } catch (error) {
            console.error("Error creating profile:", error);
        }
    }

    async updateProfile(data) {
        if (!this.userId) {
            // Just update locally if not authenticated
            this.profile = { ...this.profile, ...data };
            Utils.setData("userProfile", this.profile);
            return;
        }

        try {
            const userRef = doc(firestore, "users", this.userId);
            await updateDoc(userRef, {
                "profile": { ...this.profile, ...data, updatedAt: new Date().toISOString() }
            });

            this.profile = { ...this.profile, ...data };
            Utils.showToast("Profile updated successfully", "success");
        } catch (error) {
            console.error("Error updating profile:", error);
            Utils.showToast("Failed to update profile", "error");
        }
    }

    async updateStats(statsData) {
        const currentStats = this.profile.stats || {};
        const newStats = { ...currentStats, ...statsData };
        
        if (this.userId) {
            try {
                const userRef = doc(firestore, "users", this.userId);
                await updateDoc(userRef, {
                    "profile.stats": newStats
                });
            } catch (error) {
                console.error("Error updating stats:", error);
            }
        }

        this.profile.stats = newStats;
    }

    getProfile() {
        return this.profile;
    }

    getStats() {
        return this.profile.stats;
    }
}

// ============================================
// REACTION MANAGER
// ============================================

class ReactionManager {
    constructor() {
        this.userLikes = new Set();
        this.loadUserLikes();
    }

    loadUserLikes() {
        const likes = Utils.getData("userLikes") || [];
        this.userLikes = new Set(likes);
    }

    saveUserLikes() {
        Utils.setData("userLikes", Array.from(this.userLikes));
    }

    async toggleLike(itemId) {
        if (this.userLikes.has(itemId)) {
            this.userLikes.delete(itemId);
        } else {
            this.userLikes.add(itemId);
        }

        this.saveUserLikes();
        this.updateLikeUI(itemId);
    }

    updateLikeUI(itemId) {
        const card = document.querySelector(`[data-post-id="${itemId}"]`);
        if (card) {
            const likeBtn = card.querySelector(".like-action");
            const isLiked = this.userLikes.has(itemId);
            
            if (likeBtn) {
                if (isLiked) {
                    likeBtn.classList.add("liked");
                    likeBtn.querySelector("i").classList.remove("far");
                    likeBtn.querySelector("i").classList.add("fas");
                } else {
                    likeBtn.classList.remove("liked");
                    likeBtn.querySelector("i").classList.add("far");
                    likeBtn.querySelector("i").classList.remove("fas");
                }
            }
        }
    }

    isLiked(itemId) {
        return this.userLikes.has(itemId);
    }

    async sharePost(postId) {
        if (navigator.share) {
            try {
                const post = document.querySelector(`[data-post-id="${postId}"]`);
                const title = post?.querySelector(".post-title")?.textContent || "HSHS Post";
                
                await navigator.share({
                    title: "HSHS Gallery",
                    text: title,
                    url: window.location.href
                });
            } catch (error) {
                console.log("Share cancelled");
            }
        } else {
            Utils.copyToClipboard(window.location.href);
            Utils.showToast("Link copied to clipboard", "success");
        }
    }
}

// ============================================
// EXPORT
// ============================================

window.settingsManager = new UserSettingsManager();
window.profileManager = new UserProfileManager();
window.reactionManager = new ReactionManager();

export { UserSettingsManager, UserProfileManager, ReactionManager };
