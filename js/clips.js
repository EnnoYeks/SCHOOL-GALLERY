(function () {
    const CLIPS = [
        { id: 1, user: 'Sports Club', title: 'Sports day final sprint', likes: 128, comments: ['So fast!', 'Go HSHS!'], music: 'Victory Drum' },
        { id: 2, user: 'Choir', title: 'Morning assembly warmup', likes: 86, comments: ['Beautiful'], music: 'Choir Warmup' },
        { id: 3, user: 'Science Club', title: 'Lab demo in 15 seconds', likes: 64, comments: ['Teach us next'], music: 'Campus Walk' },
        { id: 4, user: 'Drama', title: 'Behind the scenes, one take', likes: 91, comments: ['Need part 2'], music: 'Stage Lights' }
    ];
    const MIX = [
        { id: 'none', name: 'Original sound' },
        { id: 'drum', name: 'Victory Drum' },
        { id: 'choir', name: 'Choir Warmup' },
        { id: 'walk', name: 'Campus Walk' },
        { id: 'stage', name: 'Stage Lights' }
    ];
    let activeId = CLIPS[0].id;
    const liked = new Set();

    function renderFeed() {
        const feed = document.getElementById('clipFeed');
        if (!feed) return;
        feed.innerHTML = CLIPS.map(function (clip) {
            return '<article class="clip-card" data-id="' + clip.id + '">' +
                '<div class="clip-stage"><div class="clip-poster"><i class="fas fa-play"></i></div></div>' +
                '<div class="clip-fade"></div>' +
                '<div class="clip-side">' +
                    '<button class="clip-action like-btn' + (liked.has(clip.id) ? ' liked' : '') + '" data-id="' + clip.id + '"><i class="fas fa-heart"></i><span>' + (clip.likes + (liked.has(clip.id) ? 1 : 0)) + '</span></button>' +
                    '<button class="clip-action comment-btn" data-id="' + clip.id + '"><i class="fas fa-comment-dots"></i><span>' + clip.comments.length + '</span></button>' +
                    '<button class="clip-action music-btn" data-id="' + clip.id + '"><i class="fas fa-music"></i><span>Mix</span></button>' +
                    '<button class="clip-action mute-btn"><i class="fas fa-volume-high"></i><span>Sound</span></button>' +
                '</div>' +
                '<div class="clip-meta">' +
                    '<div class="clip-user">@' + clip.user + '</div>' +
                    '<div class="clip-title">' + clip.title + '</div>' +
                    '<div class="clip-music"><i class="fas fa-compact-disc"></i><span>' + clip.music + '</span></div>' +
                '</div></article>';
        }).join('');
    }

    function openSheet(id) {
        closeSheets();
        var sheet = document.getElementById(id);
        var dim = document.getElementById('clipDim');
        if (sheet) sheet.classList.add('open');
        if (dim) dim.classList.add('open');
    }
    function closeSheets() {
        document.querySelectorAll('.clip-sheet').forEach(function (el) { el.classList.remove('open'); });
        var dim = document.getElementById('clipDim');
        if (dim) dim.classList.remove('open');
    }
    function showComments(id) {
        activeId = id;
        var clip = CLIPS.find(function (c) { return c.id === id; });
        var list = document.getElementById('commentList');
        if (!clip || !list) return;
        list.innerHTML = clip.comments.map(function (text) {
            return '<div class="comment-item">' + text + '</div>';
        }).join('') || '<div class="comment-item">Be the first to comment.</div>';
        openSheet('commentSheet');
    }
    function showMusic(id) {
        activeId = id;
        var clip = CLIPS.find(function (c) { return c.id === id; });
        var list = document.getElementById('musicList');
        if (!clip || !list) return;
        list.innerHTML = MIX.map(function (track) {
            var on = clip.music === track.name;
            return '<div class="music-item"><span>' + track.name + '</span><button data-track="' + track.name + '">' + (on ? 'On' : 'Use') + '</button></div>';
        }).join('');
        openSheet('musicSheet');
    }

    function bindOnce() {
        if (window.__hshsClipsBound) return;
        window.__hshsClipsBound = true;
        document.addEventListener('click', function (e) {
            if (!document.getElementById('clipFeed')) return;
            var like = e.target.closest('.like-btn');
            var comment = e.target.closest('.comment-btn');
            var music = e.target.closest('.music-btn');
            var mute = e.target.closest('.mute-btn');
            if (like) {
                var id = Number(like.getAttribute('data-id'));
                if (liked.has(id)) liked.delete(id); else liked.add(id);
                renderFeed();
            }
            if (comment) showComments(Number(comment.getAttribute('data-id')));
            if (music) showMusic(Number(music.getAttribute('data-id')));
            if (mute) {
                var icon = mute.querySelector('i');
                var label = mute.querySelector('span');
                var off = icon.classList.contains('fa-volume-xmark');
                icon.className = off ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
                label.textContent = off ? 'Sound' : 'Muted';
            }
            if (e.target.id === 'clipDim' || e.target.closest('#clipDim')) closeSheets();
            var trackBtn = e.target.closest('#musicList button[data-track]');
            if (trackBtn) {
                var clip = CLIPS.find(function (c) { return c.id === activeId; });
                if (clip) clip.music = trackBtn.getAttribute('data-track');
                renderFeed();
                closeSheets();
            }
        });
        document.addEventListener('submit', function (e) {
            if (e.target.id !== 'commentForm') return;
            e.preventDefault();
            var input = document.getElementById('commentInput');
            var text = (input && input.value || '').trim();
            if (!text) return;
            var clip = CLIPS.find(function (c) { return c.id === activeId; });
            if (!clip) return;
            clip.comments.push(text);
            input.value = '';
            showComments(activeId);
            renderFeed();
        });
    }

    function initHshsClips() {
        bindOnce();
        renderFeed();
    }
    window.initHshsClips = initHshsClips;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHshsClips);
    else initHshsClips();
})();
