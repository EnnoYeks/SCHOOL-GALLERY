(function () {
    if (window.__hshsEngage) return;
    window.__hshsEngage = true;

    function store() { return window.HshsStore; }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function heartBurst(el) {
        if (!el) return;
        var burst = document.createElement('span');
        burst.className = 'hshs-heart-burst';
        burst.innerHTML = '<i class="fas fa-heart"></i>';
        el.appendChild(burst);
        setTimeout(function () { if (burst.parentNode) burst.remove(); }, 700);
    }

    function bindCard(card) {
        if (!card || card.__hshsEngageBound) return;
        card.__hshsEngageBound = true;
        var postId = card.getAttribute('data-post-id') || card.getAttribute('data-id');
        if (!postId) return;
        var s = store();
        if (!s) return;

        var likeBtn = card.querySelector('.like-action, [data-action="like"], .hshs-like-btn');
        var saveBtn = card.querySelector('.save-action, [data-action="save"], .hshs-save-btn');
        var commentBtn = card.querySelector('.comment-action, [data-action="comment"], .hshs-comment-btn');

        function refreshLike() {
            if (!likeBtn) return;
            var liked = s.isLiked ? s.isLiked(postId) : false;
            var post = (s.listPosts() || []).find(function (p) { return p.id === postId; });
            var count = post ? (post.likes || 0) : 0;
            likeBtn.classList.toggle('is-on', liked);
            likeBtn.classList.toggle('liked', liked);
            var icon = likeBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fas', liked);
                icon.classList.toggle('far', !liked);
                icon.classList.add('fa-heart');
            }
            var countEl = likeBtn.querySelector('.action-count, .count, [data-count]');
            if (countEl) countEl.textContent = count;
        }

        function refreshSave() {
            if (!saveBtn) return;
            var saved = s.isSaved ? s.isSaved(postId) : false;
            saveBtn.classList.toggle('is-on', saved);
            var icon = saveBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fas', saved);
                icon.classList.toggle('far', !saved);
                icon.classList.add('fa-bookmark');
            }
        }

        if (likeBtn) {
            likeBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                var res = s.toggleLike(postId);
                if (res && res.ok) {
                    refreshLike();
                    if (res.liked) heartBurst(likeBtn);
                }
            };
            refreshLike();
        }

        if (saveBtn) {
            saveBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                var res = s.toggleSave(postId);
                if (res && res.ok) refreshSave();
            };
            refreshSave();
        }

        if (commentBtn) {
            commentBtn.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                openCommentSheet(postId, card);
            };
        }

        // Double-tap / double-click to like
        var media = card.querySelector('.post-media, img, video');
        if (media && !media.__hshsDbl) {
            media.__hshsDbl = true;
            var lastTap = 0;
            media.addEventListener('click', function (e) {
                var now = Date.now();
                if (now - lastTap < 320) {
                    e.preventDefault();
                    var res = s.toggleLike(postId);
                    if (res && res.ok && res.liked) {
                        refreshLike();
                        heartBurst(card);
                        var overlay = document.getElementById('doubleTapOverlay');
                        if (overlay) {
                            overlay.classList.add('active');
                            setTimeout(function () { overlay.classList.remove('active'); }, 600);
                        }
                    } else if (res && res.ok) refreshLike();
                }
                lastTap = now;
            });
        }
    }

    function openCommentSheet(postId, card) {
        var s = store();
        if (!s) return;
        var existing = document.getElementById('hshsCommentSheet');
        if (existing) existing.remove();

        var comments = (s.getState().comments || []).filter(function (c) { return c.postId === postId; });
        var sheet = document.createElement('div');
        sheet.id = 'hshsCommentSheet';
        sheet.className = 'hshs-comment-sheet';
        sheet.innerHTML =
            '<div class="hshs-comment-backdrop" data-close></div>' +
            '<div class="hshs-comment-panel">' +
            '<div class="hshs-comment-head"><strong>Comments</strong><button type="button" data-close aria-label="Close">×</button></div>' +
            '<div class="hshs-comment-list" id="hshsCommentList">' +
            (comments.length
                ? comments.map(function (c) {
                    return '<div class="hshs-comment-row"><b>' + escapeHtml(c.author) + '</b><p>' + escapeHtml(c.text) + '</p></div>';
                }).join('')
                : '<p class="hshs-comment-empty">No comments yet. Be the first.</p>') +
            '</div>' +
            '<form class="hshs-comment-form" id="hshsCommentForm">' +
            '<input type="text" maxlength="200" placeholder="School-safe comment…" required>' +
            '<button type="submit">Post</button></form></div>';

        document.body.appendChild(sheet);
        requestAnimationFrame(function () { sheet.classList.add('open'); });

        sheet.querySelectorAll('[data-close]').forEach(function (el) {
            el.onclick = function () {
                sheet.classList.remove('open');
                setTimeout(function () { sheet.remove(); }, 220);
            };
        });

        var form = document.getElementById('hshsCommentForm');
        form.onsubmit = function (e) {
            e.preventDefault();
            var input = form.querySelector('input');
            var res = s.addComment(postId, input.value);
            if (!res || !res.ok) {
                alert((res && res.error) || 'Could not comment');
                return;
            }
            var list = document.getElementById('hshsCommentList');
            var empty = list.querySelector('.hshs-comment-empty');
            if (empty) empty.remove();
            var row = document.createElement('div');
            row.className = 'hshs-comment-row';
            row.innerHTML = '<b>' + escapeHtml(res.comment.author) + '</b><p>' + escapeHtml(res.comment.text) + '</p>';
            list.prepend(row);
            input.value = '';
            var countEl = card && card.querySelector('.comment-action .action-count, [data-action="comment"] .count');
            if (countEl) {
                var post = (s.listPosts() || []).find(function (p) { return p.id === postId; });
                if (post) countEl.textContent = post.comments || 0;
            }
        };
    }

    function scan(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-post-id], .post-card, .hshs-profile-post, .featured-card').forEach(bindCard);
    }

    function boot() {
        scan(document);
        // Observe feed mutations (gallery infinite scroll)
        var feed = document.getElementById('galleryFeed') || document.getElementById('photosGrid');
        if (feed && !feed.__hshsEngageObs) {
            feed.__hshsEngageObs = true;
            var mo = new MutationObserver(function () { scan(feed); });
            mo.observe(feed, { childList: true, subtree: true });
        }
    }

    window.__hshsBindEngage = scan;
    window.__hshsOpenComment = openCommentSheet;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('hshs:page', boot);
})();
