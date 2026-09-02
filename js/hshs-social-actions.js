(function () {
    if (window.__hshsSocialActions) return;
    window.__hshsSocialActions = true;

    function store() { return window.HshsStore; }
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }
    function formatCount(n) {
        n = Number(n || 0);
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
        return String(n);
    }
    function stableLegacyId(card) {
        try {
            if (card.getAttribute('data-post-id')) return card.getAttribute('data-post-id');
            var raw = card.getAttribute('data-photo-id') || (card.querySelector('.post-title,.photo-title,.vibe-feat .meta b,.vibe-row .copy b,h1,h2,h3,h4') && card.querySelector('.post-title,.photo-title,.vibe-feat .meta b,.vibe-row .copy b,h1,h2,h3,h4').textContent) || '';
            raw = String(raw).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            if (!raw) return null;
            var prefix = card.classList.contains('vibe-feat') || card.classList.contains('vibe-row') ? 'legacy-video-' : 'legacy-post-';
            var id = prefix + raw;
            card.setAttribute('data-post-id', id);
            return id;
        } catch (e) { return null; }
    }
    function postFor(card) {
        try {
            var s = store();
            return s && s.getState ? (s.getState().posts || []).find(function (p) { return p.id === card.getAttribute('data-post-id'); }) : null;
        } catch (e) { return null; }
    }
    function localStateSave(s) {
        try {
            if (window.HshsStoreBridge && typeof window.HshsStoreBridge.write === 'function') {
                window.HshsStoreBridge.write(s);
            } else {
                localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s));
            }
            window.__hshsState = s;
        } catch (e) {}
    }
    function ensureLocalPost(card) {
        try {
            var s = store();
            if (!s || !s.getState) return null;
            var existing = postFor(card);
            if (existing) return existing;
            var id = stableLegacyId(card);
            if (!id) return null;
            var titleNode = card.querySelector('h1,h2,h3,h4,.post-title,.card-title,.photo-title,.meta b,.copy b');
            var descNode = card.querySelector('.post-description,.description,.card-description,p');
            var media = card.querySelector('img,video');
            var shadow = {
                id: id,
                type: card.querySelector('video') ? 'video' : 'photo',
                title: titleNode ? String(titleNode.textContent || '').trim() : 'School post',
                description: descNode ? String(descNode.textContent || '').trim() : '',
                category: card.getAttribute('data-category') || 'events',
                image: media ? (media.poster || media.currentSrc || media.src || '') : '',
                imageUrl: media ? (media.poster || media.currentSrc || media.src || '') : '',
                thumbnailUrl: media ? (media.poster || media.currentSrc || media.src || '') : '',
                author: (card.querySelector('.author-row strong,.author,.post-author,.author-name') && card.querySelector('.author-row strong,.author,.post-author,.author-name').textContent) || 'HSHS World',
                authorId: '',
                likes: Number((card.getAttribute('data-likes') || 0)),
                views: Number((card.getAttribute('data-views') || 0)),
                comments: Number((card.getAttribute('data-comments') || 0)),
                shares: Number((card.getAttribute('data-shares') || 0)),
                createdAt: Date.now()
            };
            var state = s.getState();
            state.posts = state.posts || [];
            state.posts.unshift(shadow);
            localStateSave(state);
            return shadow;
        } catch (e) { return null; }
    }
    function setAction(button, active, iconOn, iconOff, label) {
        if (!button) return;
        button.classList.toggle('is-active', !!active);
        var icon = button.querySelector('i');
        if (icon) icon.className = active ? iconOn : iconOff;
        if (label !== undefined) {
            var count = button.querySelector('.action-count');
            if (count) count.textContent = formatCount(label);
        }
    }
    function makeActionBar(card) {
        var actions = card.querySelector('.side-actions');
        if (actions) return actions;
        actions = document.createElement('div');
        actions.className = 'side-actions hshs-generated-actions';

        var likeBtn = document.createElement('button');
        likeBtn.className = 'action-btn like-action';
        likeBtn.type = 'button';
        likeBtn.setAttribute('aria-label', 'Like');
        likeBtn.innerHTML = '<i class="far fa-heart"></i><div class="action-count">0</div>';

        var commentBtn = document.createElement('button');
        commentBtn.className = 'action-btn comment-action';
        commentBtn.type = 'button';
        commentBtn.setAttribute('aria-label', 'Comment');
        commentBtn.innerHTML = '<i class="far fa-comment"></i><div class="action-count">0</div>';

        var saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn save-action';
        saveBtn.type = 'button';
        saveBtn.setAttribute('aria-label', 'Save');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i><div class="action-count"></div>';

        actions.appendChild(likeBtn);
        actions.appendChild(commentBtn);
        actions.appendChild(saveBtn);
        card.appendChild(actions);
        return actions;
    }
    function ensureComments(card, post) {
        try {
            if (!card || card.querySelector('.hshs-comments-panel')) return;
            var panel = document.createElement('div');
            panel.className = 'hshs-comments-panel';
            panel.hidden = true;

            var head = document.createElement('div');
            head.className = 'hshs-comments-head';
            head.innerHTML = '<strong>Comments</strong>';
            var closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'hshs-comments-close';
            closeBtn.setAttribute('aria-label', 'Close comments');
            closeBtn.textContent = '×';
            head.appendChild(closeBtn);

            var list = document.createElement('div');
            list.className = 'hshs-comments-list';

            var form = document.createElement('form');
            form.className = 'hshs-comment-form';
            var input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Write a comment';
            input.required = true;
            var submit = document.createElement('button');
            submit.type = 'submit';
            submit.className = 'hshs-btn';
            submit.textContent = 'Post';
            form.appendChild(input);
            form.appendChild(submit);

            panel.appendChild(head);
            panel.appendChild(list);
            panel.appendChild(form);
            card.appendChild(panel);

            function render() {
                try {
                    var s = store();
                    var rows = s && s.getState ? (s.getState().comments || []).filter(function (c) { return c.postId === post.id; }).slice(0, 30) : [];
                    list.innerHTML = '';
                    if (!rows.length) {
                        var p = document.createElement('div'); p.className = 'hshs-no-comments'; p.textContent = 'No comments yet'; list.appendChild(p); return;
                    }
                    rows.forEach(function (c) {
                        var r = document.createElement('div'); r.className = 'hshs-comment-row';
                        var b = document.createElement('b'); b.innerHTML = escapeHtml(c.author || 'Student');
                        var span = document.createElement('span'); span.innerHTML = escapeHtml(c.text);
                        r.appendChild(b); r.appendChild(span); list.appendChild(r);
                    });
                } catch (e) { /* ignore render errors */ }
            }
            closeBtn.onclick = function () { panel.hidden = true; };
            form.onsubmit = function (e) {
                e.preventDefault();
                var s = store();
                if (!s || !s.addComment) return;
                var result;
                try { result = s.addComment(post.id, input.value); } catch (e) { result = { ok: false, error: 'Failed' }; }
                if (!result || !result.ok) { if (window.Utils && Utils.showToast) Utils.showToast(result && result.error || 'Could not post comment', 'info'); return; }
                input.value = '';
                var count = card.querySelector('.comment-action .action-count');
                if (count) count.textContent = formatCount(post.comments);
                render();
            };
            panel.__render = render;
            render();
        } catch (e) { /* ignore */ }
    }
    function wireCard(card) {
        try {
            var s = store();
            if (!s || !card || card.__hshsActionsWired) return;
            var post = postFor(card) || ensureLocalPost(card);
            if (!post) return;
            var actions = card.querySelector('.side-actions');
            if (!actions) actions = makeActionBar(card);
            card.__hshsActionsWired = true;
            var like = actions.querySelector('.like-action');
            var comment = actions.querySelector('.comment-action');
            var save = actions.querySelector('.save-action');
            if (like) {
                like.removeAttribute('onclick');
                like.onclick = function (e) {
                    e.preventDefault(); e.stopPropagation();
                    try {
                        if (!s.toggleLike) return;
                        var result = s.toggleLike(post.id);
                        if (!result || !result.ok) return;
                        setAction(like, result.liked, 'fas fa-heart', 'far fa-heart', result.likes);
                    } catch (err) { /* ignore */ }
                };
                try { setAction(like, (s.isLiked && s.isLiked(post.id)) || false, 'fas fa-heart', 'far fa-heart', post.likes); } catch (e) { setAction(like, false, 'fas fa-heart', 'far fa-heart', post.likes); }
            }
            if (save) {
                save.removeAttribute('onclick');
                save.onclick = function (e) {
                    e.preventDefault(); e.stopPropagation();
                    try {
                        if (!s.toggleSave) return;
                        var result = s.toggleSave(post.id);
                        if (!result || !result.ok) return;
                        setAction(save, result.saved, 'fas fa-bookmark', 'far fa-bookmark');
                        save.setAttribute('aria-label', result.saved ? 'Remove from saved' : 'Save post');
                    } catch (err) { /* ignore */ }
                };
                try { setAction(save, (s.isSaved && s.isSaved(post.id)) || false, 'fas fa-bookmark', 'far fa-bookmark'); } catch (e) { setAction(save, false, 'fas fa-bookmark', 'far fa-bookmark'); }
            }
            if (comment) {
                comment.onclick = function (e) {
                    e.preventDefault(); e.stopPropagation();
                    ensureComments(card, post);
                    var panel = card.querySelector('.hshs-comments-panel');
                    if (!panel) return;
                    panel.hidden = false;
                    if (panel.__render) panel.__render();
                    var input = panel.querySelector('input');
                    if (input) setTimeout(function () { input.focus(); }, 30);
                };
            }
            ensureComments(card, post);
        } catch (e) { /* ignore wiring errors */ }
    }
    function wirePeople(root) {
        try {
            var s = store();
            if (!s) return;
            (root || document).querySelectorAll('.hshs-people-card').forEach(function (card) {
                try {
                    var uid = card.getAttribute('data-uid');
                    var actions = card.querySelector('.hshs-people-actions');
                    if (!uid || !actions || actions.querySelector('[data-follow]')) return;
                    var user = (s.getUser && s.getUser(uid)) || null;
                    if (!user) return;
                    var btn = document.createElement('button');
                    btn.type = 'button'; btn.className = 'hshs-follow-btn hshs-follow-person'; btn.setAttribute('data-follow', uid);
                    var following = (s.isFollowing && s.isFollowing(uid)) || false;
                    btn.textContent = following ? 'Following' : 'Follow'; btn.classList.toggle('is-on', following);
                    actions.insertBefore(btn, actions.firstChild);
                    btn.onclick = function (e) {
                        e.preventDefault(); e.stopPropagation();
                        try {
                            if (!s.toggleFollow) return;
                            var result = s.toggleFollow(uid);
                            if (!result || !result.ok) { if (window.Utils && Utils.showToast) Utils.showToast(result && result.error, 'info'); return; }
                            btn.textContent = result.following ? 'Following' : 'Follow'; btn.classList.toggle('is-on', result.following);
                        } catch (err) { /* ignore */ }
                    };
                } catch (e) { /* per-card ignore */ }
            });
        } catch (e) { /* ignore */ }
    }
    function scan(root) {
        try {
            var scope = root || document;
            scope.querySelectorAll('[data-post-id], [data-photo-id], .vibe-feat, .vibe-row').forEach(function (card) {
                try {
                    if (!card.getAttribute('data-post-id')) stableLegacyId(card);
                    wireCard(card);
                } catch (e) {}
            });
            wirePeople(scope);
        } catch (e) { /* ignore scan errors */ }
    }
    function init() {
        scan(document);
        try {
            var observer = new MutationObserver(function (records) {
                records.forEach(function (record) {
                    record.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch (e) { /* ignore observer errors */ }
        document.addEventListener('hshs:storechange', function () { try { scan(document); } catch (e) {} });
        document.addEventListener('hshs:notify', function () { try { scan(document); } catch (e) {} });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
