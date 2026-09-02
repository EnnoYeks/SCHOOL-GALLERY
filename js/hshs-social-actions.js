(function () {
    if (window.__hshsSocialActions) return;
    window.__hshsSocialActions = true;

    function store() { return window.HshsStore; }
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>\"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[ch];
        });
    }
    function formatCount(n) {
        n = Number(n || 0);
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
        return String(n);
    }

    function postFor(card) {
        var s = store();
        return s && s.getState ? (s.getState().posts || []).find(function (p) {
            return p.id === card.getAttribute('data-post-id');
        }) : null;
    }

    function setAction(button, active, iconOn, iconOff, label) {
        if (!button) return;
        button.classList.toggle('is-active', !!active);
        var icon = button.querySelector('i');
        if (icon) icon.className = (active ? iconOn : iconOff);
        if (label !== undefined) {
            var count = button.querySelector('.action-count');
            if (count) count.textContent = formatCount(label);
        }
    }

    function ensureComments(card, post) {
        if (!card || card.querySelector('.hshs-comments-panel')) return;
        var panel = document.createElement('div');
        panel.className = 'hshs-comments-panel';
        panel.hidden = true;
        panel.innerHTML = '<div class="hshs-comments-head"><strong>Comments</strong><button type="button" class="hshs-comments-close" aria-label="Close comments">×</button></div>' +
            '<div class="hshs-comments-list"></div>' +
            '<form class="hshs-comment-form"><input type="text" maxlength="240" placeholder="Write a school-safe comment…" autocomplete="off"><button type="submit"><i class="fas fa-paper-plane"></i></button></form>';
        card.appendChild(panel);

        function render() {
            var s = store();
            var rows = s && s.getState ? (s.getState().comments || []).filter(function (c) { return c.postId === post.id; }).slice(0, 30) : [];
            var list = panel.querySelector('.hshs-comments-list');
            list.innerHTML = rows.length ? rows.map(function (c) {
                return '<div class="hshs-comment-row"><b>' + escapeHtml(c.author || 'Student') + '</b><span>' + escapeHtml(c.text) + '</span></div>';
            }).join('') : '<div class="hshs-comments-empty">No comments yet. Start the conversation.</div>';
        }

        panel.querySelector('.hshs-comments-close').onclick = function () { panel.hidden = true; };
        panel.querySelector('.hshs-comment-form').onsubmit = function (e) {
            e.preventDefault();
            var input = panel.querySelector('input');
            var s = store();
            if (!s || !s.addComment) return;
            var result = s.addComment(post.id, input.value);
            if (!result.ok) { if (window.Utils && Utils.showToast) Utils.showToast(result.error, 'info'); return; }
            input.value = '';
            post.comments = Number(post.comments || 0) + 1;
            var count = card.querySelector('.comment-action .action-count');
            if (count) count.textContent = formatCount(post.comments);
            render();
        };
        panel.__render = render;
        render();
    }

    function wireCard(card) {
        var s = store();
        var post = postFor(card);
        if (!s || !post || card.__hshsActionsWired) return;
        card.__hshsActionsWired = true;

        var actions = card.querySelector('.side-actions');
        if (!actions) return;

        var like = actions.querySelector('.like-action');
        var comment = actions.querySelector('.comment-action');
        var save = actions.querySelector('.save-action');

        if (like) {
            like.removeAttribute('onclick');
            like.onclick = function (e) {
                e.preventDefault(); e.stopPropagation();
                var result = s.toggleLike(post.id);
                if (!result.ok) return;
                setAction(like, result.liked, 'fas fa-heart', 'far fa-heart', result.likes);
            };
            setAction(like, s.isLiked(post.id), 'fas fa-heart', 'far fa-heart', post.likes);
        }

        if (save) {
            save.removeAttribute('onclick');
            save.onclick = function (e) {
                e.preventDefault(); e.stopPropagation();
                var result = s.toggleSave(post.id);
                if (!result.ok) return;
                setAction(save, result.saved, 'fas fa-bookmark', 'far fa-bookmark');
                save.setAttribute('aria-label', result.saved ? 'Remove from saved' : 'Save post');
            };
            setAction(save, s.isSaved(post.id), 'fas fa-bookmark', 'far fa-bookmark');
        }

        if (comment) {
            comment.onclick = function (e) {
                e.preventDefault(); e.stopPropagation();
                ensureComments(card, post);
                var panel = card.querySelector('.hshs-comments-panel');
                panel.hidden = false;
                if (panel.__render) panel.__render();
                var input = panel.querySelector('input');
                if (input) setTimeout(function () { input.focus(); }, 30);
            };
        }
        ensureComments(card, post);
    }

    function wirePeople(root) {
        var s = store();
        if (!s) return;
        (root || document).querySelectorAll('.hshs-people-card').forEach(function (card) {
            var uid = card.getAttribute('data-uid');
            var actions = card.querySelector('.hshs-people-actions');
            if (!uid || !actions || actions.querySelector('[data-follow]')) return;
            var user = s.getUser(uid);
            if (!user) return;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hshs-follow-btn hshs-follow-person';
            btn.setAttribute('data-follow', uid);
            btn.textContent = s.isFollowing(uid) ? 'Following' : 'Follow';
            btn.classList.toggle('is-on', s.isFollowing(uid));
            actions.insertBefore(btn, actions.firstChild);
            btn.onclick = function (e) {
                e.preventDefault(); e.stopPropagation();
                var result = s.toggleFollow(uid);
                if (!result.ok) { if (window.Utils && Utils.showToast) Utils.showToast(result.error, 'info'); return; }
                btn.textContent = result.following ? 'Following' : 'Follow';
                btn.classList.toggle('is-on', result.following);
            };
        });
    }

    function scan(root) {
        var scope = root || document;
        scope.querySelectorAll('.post-card[data-post-id], [data-post-id].media-card, [data-post-id].video-card, [data-post-id].buzz-card').forEach(wireCard);
        wirePeople(scope);
    }

    function init() {
        scan(document);
        var observer = new MutationObserver(function (records) {
            records.forEach(function (record) {
                record.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) scan(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        document.addEventListener('hshs:storechange', function () { scan(document); });
        document.addEventListener('hshs:notify', function () { scan(document); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
