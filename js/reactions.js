
// ============================================
// REACTIONS & ENGAGEMENT SYSTEM
// ============================================

class ReactionManager {
    constructor() {
        this.userReactions = {};
        this.loadReactions();
    }

    loadReactions() {
        this.userReactions = Utils.getData('userReactions') || {};
    }

    saveReactions() {
        Utils.setData('userReactions', this.userReactions);
    }

    // Like/Unlike
    async toggleLike(itemId, itemType = 'post') {
        const key = `${itemType}-${itemId}`;
        const liked = await db.hasLiked(itemId, itemType);

        if (liked) {
            await db.removeLike(itemId, itemType);
            delete this.userReactions[key];
        } else {
            await db.addLike(itemId, itemType);
            this.userReactions[key] = 'like';
        }

        this.saveReactions();
        return !liked;
    }

    // Add reaction (emoji)
    addReaction(itemId, emoji, itemType = 'post') {
        const key = `${itemType}-${itemId}-${emoji}`;
        this.userReactions[key] = {
            emoji,
            timestamp: new Date().toISOString()
        };
        this.saveReactions();

        // Show celebration effect
        this.showReactionAnimation(itemId, emoji);
    }

    // Get user's reaction
    getUserReaction(itemId, itemType = 'post') {
        const key = `${itemType}-${itemId}`;
        return this.userReactions[key];
    }

    // Show reaction animation
    showReactionAnimation(itemId, emoji) {
        const element = document.querySelector(`[data-post-id="${itemId}"]`);
        if (!element) return;

        const animation = document.createElement('div');
        animation.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 10000;
            animation: floatUp 1.5s ease-out forwards;
        `;
        animation.textContent = emoji;

        const rect = element.getBoundingClientRect();
        animation.style.left = rect.left + rect.width / 2 + 'px';
        animation.style.top = rect.top + rect.height / 2 + 'px';

        document.body.appendChild(animation);

        setTimeout(() => animation.remove(), 1500);
    }

    // Get reactions count
    getReactionCount(itemId) {
        const count = {};
        CONFIG.reactions.forEach(reaction => {
            count[reaction.emoji] = Math.floor(Math.random() * 50); // Mock count
        });
        return count;
    }

    // Show reaction picker
    showReactionPicker(itemId, onSelect) {
        const picker = document.createElement('div');
        picker.className = 'reaction-picker';
        picker.style.cssText = `
            position: absolute;
            background: white;
            border-radius: 50px;
            padding: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            gap: 0.25rem;
            z-index: 1000;
            animation: slideUp 0.2s ease;
        `;

        CONFIG.reactions.forEach(reaction => {
            const btn = document.createElement('button');
            btn.textContent = reaction.emoji;
            btn.style.cssText = `
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.2s ease;
            `;
            btn.onmouseover = () => btn.style.transform = 'scale(1.3)';
            btn.onmouseout = () => btn.style.transform = 'scale(1)';
            btn.onclick = () => {
                if (onSelect) onSelect(reaction);
                this.addReaction(itemId, reaction.emoji);
                picker.remove();
            };
            picker.appendChild(btn);
        });

        return picker;
    }

    // Save post
    toggleSave(itemId) {
        const saved = Utils.getData('savedPosts') || [];
        const index = saved.indexOf(itemId);

        if (index > -1) {
            saved.splice(index, 1);
        } else {
            saved.push(itemId);
        }

        Utils.setData('savedPosts', saved);
        return saved.length > index;
    }

    // Get saved posts
    getSavedPosts() {
        return Utils.getData('savedPosts') || [];
    }

    // Share post
    sharePost(post) {
        const shareData = {
            title: post.title,
            text: post.description,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(err => console.log(err));
        } else {
            // Fallback: copy to clipboard
            const text = `${post.title}\n${post.description}\n${window.location.href}`;
            Utils.copyToClipboard(text);
        }
    }

    // Render reaction buttons
    async renderReactionButtons(itemId, container) {
        if (!container) return;

        const isLiked = await db.hasLiked(itemId);
        const isSaved = this.getSavedPosts().includes(itemId);

        container.innerHTML = `
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="reaction-btn like-btn" data-item-id="${itemId}" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 25px;
                    background: ${isLiked ? 'var(--danger-color)' : 'transparent'};
                    color: ${isLiked ? 'white' : 'var(--text-primary)'};
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                ">
                    <i class="fas fa-heart"></i> Like
                </button>

                <button class="reaction-btn comment-btn" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 25px;
                    background: transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                ">
                    <i class="fas fa-comment"></i> Comment
                </button>

                <button class="reaction-btn save-btn" data-item-id="${itemId}" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 25px;
                    background: ${isSaved ? 'var(--primary-color)' : 'transparent'};
                    color: ${isSaved ? 'white' : 'var(--text-primary)'};
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                ">
                    <i class="fas fa-bookmark"></i> Save
                </button>

                <button class="reaction-btn share-btn" style="
                    padding: 0.75rem 1.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 25px;
                    background: transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                ">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        `;
    }
}

// Initialize reaction manager
const reactionManager = new ReactionManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReactionManager;
}
