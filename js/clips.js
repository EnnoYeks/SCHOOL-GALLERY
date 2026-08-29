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
        document.getElementById(id).classList.add('open');
        document.getElementById('clipDim').classList.add('open');
    }
    function closeSheets() {
        document.querySelectorAll('.clip-sheet').forEach(function (el) { el.classList.remove('open'); });
        var dim = document.getElementById('clipDim');
        if (dim) dim.classList.remove('open');
    }
    function showComments(id) {
        activeId = id;
        const clip = CLIPS.find(function (c) { return c.id === id; });
        document.getElementById('commentList').innerHTML = clip.comments.map(function (text) {
            return '<div class="comment-item">' + text + '</div>';
        }).join('') || '<div class="comment-item">Be the first to comment.</div>';
        openSheet('commentSheet');
    }
    function showMusic(id) {
        activeId = id;
        const clip = CLIPS.find(function (c) { return c.id === id; });
        document.getElementById('musicList').innerHTML = MIX.map(function (track) {
            const on = clip.music === track.name;
            return '<div class="music-item"><span>' + track.name + '</span><button data-track="' + track.name + '">' + (on ? 'On' : 'Use') + '</button></div>';
        }).join('');
        openSheet('musicSheet');
    }
    function boot() {
        renderFeed();
        document.getElementById('clipFeed').addEventListener('click', function (e) {
            const like = e.target.closest('.like-btn');
            const comment = e.target.closest('.comment-btn');
            const music = e.target.closest('.music-btn');
            const mute = e.target.closest('.mute-btn');
            if (like) {
                const id = Number(like.getAttribute('data-id'));
                if (liked.has(id)) liked.delete(id); else liked.add(id);
                renderFeed();
            }
            if (comment) showComments(Number(comment.getAttribute('data-id')));
            if (music) showMusic(Number(music.getAttribute('data-id')));
            if (mute) {
                const icon = mute.querySelector('i');
                const label = mute.querySelector('span');
                const off = icon.classList.contains('fa-volume-xmark');
                icon.className = off ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
                label.textContent = off ? 'Sound' : 'Muted';
            }
        });
        document.getElementById('clipDim').addEventListener('click', closeSheets);
        document.getElementById('commentForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const input = document.getElementById('commentInput');
            const text = (input.value || '').trim();
            if (!text) return;
            CLIPS.find(function (c) { return c.id === activeId; }).comments.push(text);
            input.value = '';
            showComments(activeId);
            renderFeed();
        });
        document.getElementById('musicList').addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-track]');
            if (!btn) return;
            CLIPS.find(function (c) { return c.id === activeId; }).music = btn.getAttribute('data-track');
            renderFeed();
            closeSheets();
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
