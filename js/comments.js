
// ============================================
// COMMENT SYSTEM
// ============================================

class CommentManager {
    constructor(postId) {
        this.postId = postId;
        this.comments = [];
        this.loadComments();
    }

    loadComments() {
        this.comments = db.getComments(this.postId);
    }

    // Create comment
    createComment(text, authorName = 'Anonymous') {
        if (text.trim().length === 0) {
            Utils.showToast('Comment cannot be empty', 'error');
            return null;
        }

        const comment = db.createComment(this.postId, {
            text,
            author: authorName,
            authorAvatar: 'https://via.placeholder.com/40',
            userId: db.getCurrentUserId(),
            likes: 0,
            replies: []
        });

        this.comments.push(comment);
        notificationManager.notifyComment(this.postId, authorName, text);

        return comment;
    }

    // Delete comment
    deleteComment(commentId) {
        const index = this.comments.findIndex(c => c.id === commentId);
        if (index !== -1) {
            this.comments.splice(index, 1);
            db.saveToStorage();
            return true;
        }
        return false;
    }

    // Edit comment
    editComment(commentId, newText) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.text = newText;
            comment.edited = true;
            comment.editedAt = new Date().toISOString();
            db.saveToStorage();
            return comment;
        }
        return null;
    }

    // Like comment
    likeComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes = (comment.likes || 0) + 1;
            db.saveToStorage();
            return comment;
        }
        return null;
    }

    // Add reply
    addReply(commentId, replyText, authorName = 'Anonymous') {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            const reply = {
                id: Utils.generateId(),
                text: replyText,
                author: authorName,
                authorAvatar: 'https://via.placeholder.com/32',
                createdAt: new Date().toISOString(),
                likes: 0
            };

            if (!comment.replies) {
                comment.replies = [];
            }

            comment.replies.push(reply);
            db.saveToStorage();
            return reply;
        }
        return null;
    }

    // Get replies for a comment
    getReplies(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        return comment ? comment.replies || [] : [];
    }

    // Render comments
    renderComments(container) {
        if (!container) return;

        if (this.comments.length === 0) {
            container.innerHTML = '<p class="empty-state">No comments yet. Be the first!</p>';
            return;
        }

        container.innerHTML = this.comments.map(comment => `
            <div class="comment-item" style="
                padding: 1rem;
                border-left: 3px solid var(--primary-color);
                margin-bottom: 1rem;
                background: var(--bg-secondary);
                border-radius: 8px;
            ">
                <div style="display: flex; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <img src="${comment.authorAvatar}" alt="${comment.author}" style="
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        object-fit: cover;
                    ">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary);">
                            ${comment.author}
                            ${comment.edited ? '<span style="font-size: 0.75rem; color: var(--text-tertiary);">(edited)</span>' : ''}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-tertiary);">
                            ${Utils.formatDate(comment.createdAt)}
                        </div>
                    </div>
                </div>
                
                <div style="margin-left: 2.75rem; margin-bottom: 0.75rem; color: var(--text-primary);">
                    ${comment.text}
                </div>

                <div style="display: flex; gap: 1.5rem; margin-left: 2.75rem; font-size: 0.85rem;">
                    <button style="background: none; border: none; color: var(--text-secondary); cursor: pointer; transition: all 0.3s ease;" onclick="
                        const btn = this;
                        btn.style.color = btn.style.color === 'var(--primary-color)' ? 'var(--text-secondary)' : 'var(--primary-color)';
                    ">
                        <i class="far fa-heart"></i> Like (${comment.likes})
                    </button>
                    <button style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                </div>

                ${comment.replies && comment.replies.length > 0 ? `
                    <div style="margin-top: 1rem; margin-left: 2.75rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.75rem;">
                            ${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}
                        </div>
                        ${comment.replies.map(reply => `
                            <div style="
                                padding: 0.75rem;
                                background: var(--bg-primary);
                                border-radius: 6px;
                                margin-bottom: 0.5rem;
                                border-left: 2px solid var(--secondary-color);
                            ">
                                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem;">
                                    <img src="${reply.authorAvatar}" alt="${reply.author}" style="
                                        width: 24px;
                                        height: 24px;
                                        border-radius: 50%;
                                        object-fit: cover;
                                    ">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">
                                            ${reply.author}
                                        </div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                            ${reply.text}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentManager;
}
