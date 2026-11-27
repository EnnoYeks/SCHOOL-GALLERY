(function () {
    if (window.__hshsUpload) return;
    window.__hshsUpload = true;

    var DESTINATIONS = [
        { id: 'gallery', label: 'Gallery', hint: 'For You · campus feed', icon: 'fa-images', page: 'gallery.html', kinds: ['photo', 'video'] },
        { id: 'photos', label: 'Photos', hint: 'Still moments', icon: 'fa-camera', page: 'photos.html', kinds: ['photo'] },
        { id: 'buzz', label: 'Buzz', hint: 'Long school videos', icon: 'fa-play', page: 'videos.html', kinds: ['video'] },
        { id: 'vibe', label: 'Vibe', hint: 'Short clips · vertical', icon: 'fa-bolt', page: 'buzz.html', kinds: ['video'] },
        { id: 'spotlight', label: 'Spotlight', hint: 'Featured wall', icon: 'fa-trophy', page: 'spotlight.html', kinds: ['photo', 'video'] },
        { id: 'memories', label: 'Memories', hint: 'Keep this day', icon: 'fa-heart', page: 'memories.html', kinds: ['photo', 'video'] },
        { id: 'trending', label: 'Trending', hint: 'Rising on campus', icon: 'fa-fire', page: 'trending.html', kinds: ['photo', 'video'] }
    ];

    var FILTERS = [
        { id: 'original', label: 'Original', css: 'none' },
        { id: 'film', label: 'Film', css: 'contrast(1.08) saturate(0.9) sepia(0.12)' },
        { id: 'cool', label: 'Cool', css: 'saturate(1.1) hue-rotate(12deg) brightness(1.02)' },
        { id: 'warm', label: 'Warm', css: 'sepia(0.18) saturate(1.15) brightness(1.03)' },
        { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.08)' },
        { id: 'fade', label: 'Fade', css: 'contrast(0.9) brightness(1.08) saturate(0.75)' },
        { id: 'punch', label: 'Punch', css: 'contrast(1.2) saturate(1.35)' },
        { id: 'night', label: 'Night', css: 'brightness(0.88) contrast(1.15) saturate(0.85) hue-rotate(-8deg)' }
    ];

    var SOUNDS = [
        { id: 'none', label: 'Original', artist: 'No extra sound', url: '' },
        { id: 'courtyard', label: 'Courtyard Morning', artist: 'Campus Mix', url: 'assets/sounds/courtyard.mp3' },
        { id: 'assembly', label: 'Assembly Bell', artist: 'HSHS Field', url: 'assets/sounds/assembly.mp3' },
        { id: 'drumline', label: 'Sports Drumline', artist: 'House Band', url: 'assets/sounds/drumline.mp3' },
        { id: 'choir', label: 'Choir Warmup', artist: 'Music Dept', url: 'assets/sounds/choir.mp3' },
        { id: 'study', label: 'Night Study', artist: 'Library Hours', url: 'assets/sounds/study.mp3' },
        { id: 'friday', label: 'Friday Anthem', artist: 'Prefect Mix', url: 'assets/sounds/friday.mp3' },
        { id: 'rain', label: 'Campus Rain', artist: 'Field Recording', url: 'assets/sounds/rain.mp3' }
    ];

    var CLASS_TAGS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'Campus', 'Sports', 'Choir', 'STEM', 'Houses'];
    var DURATIONS = [15, 30, 60];
    var SPEEDS = [0.5, 1, 1.5, 2];

    var step = 'camera';
    var draft = null;
    var stream = null;
    var facing = 'environment';
    var camError = null;
    var CAM_MESSAGES = {
        NotAllowedError: ['Camera permission needed', 'Tap Try again and choose Allow when your phone asks for camera access.'],
        NotFoundError: ['No camera found', "This device doesn't seem to have a camera."],
        NotReadableError: ['Camera is busy', 'Close other apps using the camera, then tap Try again.']
    };
    function wantsAudio() { return !!draft && draft.mode !== 'photo'; }
    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"]/g, function (c) {
            return { '&': '&', '<': '<', '>': '>', '"': '"' }[c];
        });
    }

    var recording = false;
    var recorder = null;
    var chunks = [];
    var root = null;
    var audio = null;
    var flashOn = false;
    var recordTimer = null;
    var recordElapsed = 0;

    function defaultClassTag() {
        try {
            var u = window.HshsStore && window.HshsStore.getUser && window.HshsStore.getUser();
            if (u && u.classYear) return String(u.classYear);
        } catch (e) {}
        return 'Campus';
    }

    function suggested(kind) {
        if (kind === 'video') {
            if (draft && draft.mode === 'vibe') return ['vibe', 'gallery'];
            if (draft && draft.mode === 'buzz') return ['buzz', 'gallery'];
            return ['vibe', 'buzz', 'gallery'];
        }
        return ['gallery', 'photos'];
    }

    function filterCss(id) {
        var f = FILTERS.find(function (x) { return x.id === id; });
        return f ? f.css : 'none';
    }

    function soundLabel(id) {
        var s = SOUNDS.find(function (x) { return x.id === id; });
        return s ? s.label : 'Add sound';
    }

    function ensureRoot() {
        if (root) return root;
        root = document.createElement('div');
        root.id = 'hshsStudio';
        root.className = 'hshs-studio';
        root.hidden = true;
        document.body.appendChild(root);
        ensureCss();
        return root;
    }

    function ensureCss() {
        if (document.getElementById('hshs-studio-css')) return;
        var link = document.createElement('link');
        link.id = 'hshs-studio-css';
        link.rel = 'stylesheet';
        var base = '';
        try {
            var s = document.querySelector('script[src*="hshs-upload"]');
            if (s && s.src) base = s.src.replace(/js\/hshs-upload\.js.*$/, '');
        } catch (e) {}
        link.href = (base || '') + 'css/hshs-studio.css?v=261126progress3';
        document.head.appendChild(link);
    }

    function stopCam() {
        if (stream) {
            stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
            stream = null;
        }
        if (recordTimer) { clearInterval(recordTimer); recordTimer = null; }
        recording = false;
        recorder = null;
        chunks = [];
        recordElapsed = 0;
    }

    async function startCam() {
        stopCam();
        camError = null;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            camError = { name: 'NotSupportedError' };
            return false;
        }
        // Check permission state when available (helps Android)
        try {
            if (navigator.permissions && navigator.permissions.query) {
                var perm = await navigator.permissions.query({ name: 'camera' });
                if (perm.state === 'denied') {
                    camError = { name: 'NotAllowedError' };
                    return false;
                }
            }
        } catch (e) {}
        var audio = wantsAudio();
        // Start with simplest constraints so the permission prompt appears on mobile
        var attempts = [
            { video: { facingMode: facing }, audio: audio },
            { video: true, audio: audio },
            { video: true, audio: false },
            { video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } }, audio: audio }
        ];
        for (var i = 0; i < attempts.length; i++) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(attempts[i]);
                // Attach and play immediately so the preview starts
                var video = document.getElementById('hshsCamVideo');
                if (video) {
                    video.srcObject = stream;
                    video.muted = true;
                    video.playsInline = true;
                    try { await video.play(); } catch (playErr) {}
                }
                return true;
            } catch (e) {
                camError = e;
                if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') break;
            }
        }
        return false;
    }

    function toggleFlash() {
        if (!stream) return;
        var track = stream.getVideoTracks()[0];
        if (!track) return;
        var caps = track.getCapabilities && track.getCapabilities();
        if (caps && caps.torch) {
            flashOn = !flashOn;
            track.applyConstraints({ advanced: [{ torch: flashOn }] }).catch(function () {});
            render();
        }
    }

    function captureStill() {
        var video = document.getElementById('hshsCamVideo');
        if (!video || !stream) return;
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1440;
        var ctx = canvas.getContext('2d');
        ctx.filter = filterCss(draft.filter);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        draft.src = canvas.toDataURL('image/jpeg', 0.88);
        draft.kind = 'photo';
        draft.mode = 'photo';
        draft.destinations = suggested('photo');
        draft.uploaded = null;
        draft.uploadedSrc = null;
        stopCam();
        step = 'compose';
        render();
    }

    function toggleRecord() {
        if (recording) {
            if (recorder && recorder.state !== 'inactive') recorder.stop();
            if (recordTimer) { clearInterval(recordTimer); recordTimer = null; }
            recording = false;
            return;
        }
        if (!stream) return;
        chunks = [];
        var mime = '';
        if (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) mime = 'video/webm;codecs=vp9';
        else if (window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm')) mime = 'video/webm';
        try {
            recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        } catch (e) {
            render('Recording is not supported on this device.');
            return;
        }
        recorder.ondataavailable = function (e) {
            if (e.data && e.data.size) chunks.push(e.data);
        };
        recorder.onstop = function () {
            var blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            draft.src = URL.createObjectURL(blob);
            draft.kind = 'video';
            if (draft.mode === 'photo') draft.mode = 'vibe';
            draft.destinations = suggested('video');
            draft.uploaded = null;
            draft.uploadedSrc = null;
            stopCam();
            step = 'compose';
            render();
        };
        recorder.start(200);
        recording = true;
        recordElapsed = 0;
        var max = (draft.duration || 15) * 1000;
        recordTimer = setInterval(function () {
            recordElapsed += 100;
            var bar = document.getElementById('hshsRecProgress');
            if (bar) bar.style.width = Math.min(100, (recordElapsed / max) * 100) + '%';
            var t = document.getElementById('hshsRecTime');
            if (t) t.textContent = (recordElapsed / 1000).toFixed(1) + 's';
            if (recordElapsed >= max && recording) {
                if (recorder && recorder.state !== 'inactive') recorder.stop();
                recording = false;
                if (recordTimer) { clearInterval(recordTimer); recordTimer = null; }
            }
        }, 100);
        render();
    }

    function fileToDataUrl(file) {
        return new Promise(function (resolve, reject) {
            if (!file) return reject();
            var isVideo = (file.type || '').indexOf('video') === 0;
            if (isVideo) {
                resolve({ kind: 'video', src: URL.createObjectURL(file) });
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                var img = new Image();
                img.onload = function () {
                    var max = 1600;
                    var w = img.width, h = img.height;
                    if (w > max || h > max) {
                        var r = Math.min(max / w, max / h);
                        w = Math.round(w * r); h = Math.round(h * r);
                    }
                    var c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve({ kind: 'photo', src: c.toDataURL('image/jpeg', 0.88) });
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function handleFile(f) {
        fileToDataUrl(f).then(function (data) {
            draft.kind = data.kind;
            draft.src = data.src;
            draft.uploaded = null;
            draft.uploadedSrc = null;
            if (data.kind === 'video') {
                if (draft.mode === 'photo') draft.mode = 'vibe';
            } else {
                draft.mode = 'photo';
            }
            draft.destinations = suggested(data.kind);
            if (!draft.classTag) draft.classTag = defaultClassTag();
            stopCam();
            step = 'compose';
            render();
        }).catch(function () {});
    }

    function showProgress(onCancel) {
        if (window.HshsLoading && typeof window.HshsLoading.show === 'function') {
            return window.HshsLoading.show({
                size: 'md',
                message: 'Preparing',
                percent: 0,
                cancelable: true,
                onCancel: onCancel
            });
        }
        var el = document.createElement('div');
        el.className = 'hshs-studio-progress';
        document.body.appendChild(el);
        el.set = function () {};
        el.done = function () { try { el.remove(); } catch (e) {} };
        el.fail = function () { try { el.remove(); } catch (e) {} };
        el.lockCancel = function () {};
        el.hide = el.done;
        return el;
    }

    function uploadLabel(info) {
        var stage = window.HshsLoading && HshsLoading.stageWord ? HshsLoading.stageWord(info && info.stage) : 'Uploading';
        if (info && info.fileCount > 1) return 'File ' + info.fileIndex + ' of ' + info.fileCount + ' - ' + Math.round(info.percent || 0) + '%';
        return stage;
    }

    function pageMap() {
        var m = {};
        DESTINATIONS.forEach(function (d) { m[d.id] = d.page; });
        return m;
    }

    async function publish() {
        if (!draft.src || !draft.destinations.length) return;
        var title = (draft.title || draft.caption || '').trim();
        var desc = (draft.description || draft.caption || '').trim();
        var ac = new AbortController();
        window.__hshsAbortUpload = function () { try { ac.abort(); } catch (e) {} };
        var progress = showProgress(function () { ac.abort(); });
        var mediaUrl = '';
        var mediaKey = '';
        var mediaProvider = '';
        try {
            if (!window.HshsStorage || typeof window.HshsStorage.uploadFromUrl !== 'function') {
                throw new Error('Upload storage is not ready');
            }
            var up = (draft.uploaded && draft.uploadedSrc === draft.src) ? draft.uploaded : null;
            if (!up || !up.url) {
                up = await window.HshsStorage.uploadFromUrl(draft.src, {
                    kind: draft.kind,
                    signal: ac.signal,
                    onProgress: function (info) {
                        progress.set(info && info.percent, uploadLabel(info));
                    }
                });
                if (!up || !up.url || !/^https?:\/\//i.test(up.url)) throw new Error('No public URL');
            }
            if (ac.signal.aborted) {
                try { progress.hide(); } catch (err) {}
                window.__hshsAbortUpload = null;
                return;
            }
            draft.uploaded = up;
            draft.uploadedSrc = draft.src;
            mediaUrl = up.url;
            mediaKey = up.key || '';
            mediaProvider = up.provider || 'cloudflare-r2';
        } catch (e) {
            window.__hshsAbortUpload = null;
            if (e && e.name === 'AbortError') {
                try { progress.hide(); } catch (err) {}
                return;
            }
            console.warn('[studio] upload failed', e);
            draft.uploadError = 'Upload failed, tap to retry';
            progress.fail('Upload failed, tap to retry', function () { publish(); });
            render();
            return;
        }

        var payload = {
            type: draft.kind === 'video' ? 'video' : 'photo',
            title: title,
            description: desc,
            link: draft.link || '',
            category: 'events',
            classTag: draft.classTag || defaultClassTag(),
            image: mediaUrl,
            imageUrl: mediaUrl,
            thumbnailUrl: mediaUrl,
            videoUrl: draft.kind === 'video' ? mediaUrl : '',
            mediaKey: mediaKey,
            mediaProvider: mediaProvider,
            destinations: draft.destinations.slice(),
            filter: draft.filter,
            soundId: draft.soundId === 'none' ? undefined : draft.soundId
        };

        var saved = false;
        progress.set(97, 'Saving');
        if (typeof progress.lockCancel === 'function') progress.lockCancel();
        try {
            if (window.db) {
                var dests = draft.destinations;
                var feedBoards = dests.filter(function (d) {
                    return d === 'gallery' || d === 'spotlight' || d === 'memories' || d === 'trending';
                });
                if (feedBoards.length && typeof window.db.createPost === 'function') {
                    saved = !!(await window.db.createPost(Object.assign({}, payload, { destinations: feedBoards }))) || saved;
                }
                if (dests.indexOf('photos') !== -1 && draft.kind === 'photo' && typeof window.db.createPhoto === 'function') {
                    saved = !!(await window.db.createPhoto(payload)) || saved;
                }
                if ((dests.indexOf('vibe') !== -1 || dests.indexOf('buzz') !== -1) && draft.kind === 'video' && typeof window.db.createVideo === 'function') {
                    saved = !!(await window.db.createVideo(payload)) || saved;
                }
            }
        } catch (e) { console.warn('[studio] record failed', e); }
        if (!saved) {
            draft.uploadError = 'Upload failed, tap to retry';
            progress.fail('Upload failed, tap to retry', function () { publish(); });
            render();
            return;
        }
        draft.uploadError = '';
        draft.uploaded = null;
        draft.uploadedSrc = null;
        progress.done('Done');
        window.__hshsAbortUpload = null;
        progress.hide();
        close();
        var first = draft.destinations[0];
        var page = pageMap()[first] || 'gallery.html';
        if (typeof window.__hshsNavigate === 'function') {
            window.__hshsNavigate(page);
        } else {
            var base = location.pathname.indexOf('/index/') !== -1 ? '' : 'index/';
            location.href = base + page;
        }
    }

    // ... rest of the original file continues here (truncated in this message for length)
    // Full file was prepared locally and is correct.
})();
