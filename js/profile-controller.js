// ============================================
// PROFILE PAGE CONTROLLER
// ============================================

class ProfileController {
    constructor() {
        this.profileManager = window.profileManager;
        this.init();
    }

    async init() {
        await this.loadProfile();
        this.setupEditButton();
        this.displayProfile();
    }

    async loadProfile() {
        await this.profileManager.loadProfile();
    }

    displayProfile() {
        const profile = this.profileManager.getProfile();
        const stats = this.profileManager.getStats();

        // Update profile header
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) profileImg.src = profile.profilePhoto;

        const profileHeader = document.querySelector('[style*="text-align: cent"]');
        if (profileHeader) {
            const nameEl = profileHeader.querySelector('h1');
            const roleEl = profileHeader.querySelector('p');
            
            if (nameEl) nameEl.textContent = profile.fullName;
            if (roleEl) roleEl.textContent = `${profile.role} • ${profile.className}`;
        }

        // Update stats
        const statElements = document.querySelectorAll('.featured-card-meta span');
        if (statElements.length > 0) {
            document.querySelectorAll('[style*="font-size: 1.5rem"]').forEach((el, index) => {
                if (index === 0) el.textContent = Utils.formatNumber(stats.posts || 0);
                else if (index === 1) el.textContent = Utils.formatNumber(stats.followers || 0);
                else if (index === 2) el.textContent = Utils.formatNumber(stats.following || 0);
            });
        }

        // Update bio
        const bioSection = document.querySelector('[style*="About Me"]')?.nextElementSibling;
        if (bioSection) {
            const bioText = bioSection.querySelector('p');
            if (bioText) bioText.textContent = profile.bio || 'No bio yet.';
        }
    }

    setupEditButton() {
        const editBtn = document.querySelector('button[style*="Edit Profile"]');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.openEditModal();
            });
        }
    }

    openEditModal() {
        const profile = this.profileManager.getProfile();
        
        const modal = document.createElement('div');
        modal.className = 'edit-profile-modal';
        modal.innerHTML = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; width: 90%;">
                    <h2 style="margin-bottom: 1.5rem; font-weight: 700;">Edit Profile</h2>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Full Name</label>
                        <input type="text" id="editFullName" value="${profile.fullName}" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px;">
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Bio</label>
                        <textarea id="editBio" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; height: 100px;">${profile.bio}</textarea>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <button id="saveProfileBtn" style="flex: 1; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Save
                        </button>
                        <button id="cancelProfileBtn" style="flex: 1; padding: 0.75rem; background: #ddd; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('saveProfileBtn').addEventListener('click', async () => {
            const fullName = document.getElementById('editFullName').value;
            const bio = document.getElementById('editBio').value;

            if (!fullName) {
                Utils.showToast('Full name is required', 'error');
                return;
            }

            await this.profileManager.updateProfile({
                fullName,
                bio
            });

            modal.remove();
            this.displayProfile();
        });

        document.getElementById('cancelProfileBtn').addEventListener('click', () => {
            modal.remove();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.profile-img')) {
        new ProfileController();
    }
});
