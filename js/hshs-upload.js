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
        link.href = (base || '') + 'css/hshs-studio.css?v=260910ig2';
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
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } }
            });
            return true;
        } catch (e) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                return true;
            } catch (e2) { return false; }
        }
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

    function showProgress() {
        var el = document.createElement('div');
        el.className = 'hshs-studio-progress';
        el.innerHTML = '<div class="hshs-studio-progress-card"><div class="hshs-studio-spinner"></div><strong>Sharing to campus…</strong><small>Pinning your moment</small></div>';
        document.body.appendChild(el);
        return el;
    }

    function pageMap() {
        var m = {};
        DESTINATIONS.forEach(function (d) { m[d.id] = d.page; });
        return m;
    }

    async function publish() {
        if (!draft.src || !draft.destinations.length) return;
        var title = (draft.title || draft.caption || '').trim() || 'Campus moment';
        var desc = (draft.description || draft.caption || '').trim();
        var progress = showProgress();
        var mediaUrl = draft.src;
        var mediaKey = '';
        var mediaProvider = 'local';
        try {
            if (window.HshsStorage && typeof window.HshsStorage.uploadFromUrl === 'function') {
                var up = await window.HshsStorage.uploadFromUrl(draft.src, { kind: draft.kind });
                if (up && up.url) {
                    mediaUrl = up.url;
                    mediaKey = up.key || '';
                    mediaProvider = up.provider || 'local';
                }
            }
        } catch (e) { console.warn('[studio] storage fallback', e); }

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

        try {
            if (window.db) {
                var dests = draft.destinations;
                var feedBoards = dests.filter(function (d) {
                    return d === 'gallery' || d === 'spotlight' || d === 'memories' || d === 'trending';
                });
                if (feedBoards.length && typeof window.db.createPost === 'function') {
                    await window.db.createPost(Object.assign({}, payload, { destinations: feedBoards }));
                }
                if (dests.indexOf('photos') !== -1 && draft.kind === 'photo' && typeof window.db.createPhoto === 'function') {
                    await window.db.createPhoto(payload);
                }
                if ((dests.indexOf('vibe') !== -1 || dests.indexOf('buzz') !== -1) && draft.kind === 'video' && typeof window.db.createVideo === 'function') {
                    await window.db.createVideo(payload);
                }
            }
        } catch (e) { console.warn('[studio] firestore', e); }

        try {
            if (window.HshsStore && typeof window.HshsStore.addLocal === 'function') {
                window.HshsStore.addLocal(payload);
            } else {
                var key = 'hshs_local_posts';
                var list = [];
                try { list = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
                list.unshift(Object.assign({ id: 'local_' + Date.now(), createdAt: Date.now() }, payload));
                localStorage.setItem(key, JSON.stringify(list.slice(0, 80)));
            }
        } catch (e) {}

        try { progress.remove(); } catch (e) {}
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

    function open(opts) {
        opts = opts || {};
        var preferVideo = opts.prefer === 'video' || opts.kind === 'video';
        var mode = opts.mode || (preferVideo ? 'vibe' : 'photo');
        draft = {
            mode: mode,
            kind: preferVideo ? 'video' : 'photo',
            src: '',
            filter: 'original',
            soundId: 'none',
            destinations: (opts.destinations && opts.destinations.length) ? opts.destinations.slice() : suggested(preferVideo ? 'video' : 'photo'),
            title: '',
            description: '',
            caption: '',
            link: '',
            classTag: defaultClassTag(),
            duration: 15,
            speed: 1,
            timer: 0
        };
        step = 'camera';
        flashOn = false;
        stopCam();
        var el = ensureRoot();
        el.hidden = false;
        document.body.classList.add('studio-open');
        startCam().then(function (ok) {
            render(ok ? '' : 'Camera unavailable — pick from gallery.');
        });
        render();
    }

    function close() {
        stopCam();
        if (audio) { try { audio.pause(); } catch (e) {} }
        if (root) root.hidden = true;
        document.body.classList.remove('studio-open');
        step = 'camera';
        draft = null;
    }

    function setMode(mode) {
        draft.mode = mode;
        if (mode === 'photo' || mode === 'post') {
            draft.kind = mode === 'post' ? draft.kind : 'photo';
            if (mode === 'photo') {
                draft.kind = 'photo';
                draft.destinations = suggested('photo');
            }
        } else {
            draft.kind = 'video';
            draft.destinations = suggested('video');
            if (mode === 'vibe') draft.duration = Math.min(draft.duration || 15, 30);
            if (mode === 'buzz') draft.duration = Math.max(draft.duration || 60, 30);
        }
        render();
    }

    function cycleDuration() {
        var i = DURATIONS.indexOf(draft.duration);
        draft.duration = DURATIONS[(i + 1) % DURATIONS.length];
        render();
    }

    function cycleSpeed() {
        var i = SPEEDS.indexOf(draft.speed);
        draft.speed = SPEEDS[(i + 1) % SPEEDS.length];
        render();
    }

    function cycleTimer() {
        var opts = [0, 3, 10];
        var i = opts.indexOf(draft.timer);
        draft.timer = opts[(i + 1) % opts.length];
        render();
    }

    function cycleFilter() {
        var i = FILTERS.findIndex(function (f) { return f.id === draft.filter; });
        draft.filter = FILTERS[(i + 1) % FILTERS.length].id;
        var v = document.getElementById('hshsCamVideo');
        if (v) v.style.filter = filterCss(draft.filter);
        render();
    }

    function renderCamera(msg) {
        var mode = draft.mode || 'photo';
        var isPhoto = mode === 'photo';
        var soundText = draft.soundId === 'none' ? 'Add sound' : soundLabel(draft.soundId);
        var html = '';
        html += '<div class="hshs-cam">';
        html += '<div class="hshs-cam-stage">';
        html += '<video id="hshsCamVideo" playsinline muted autoplay style="filter:' + filterCss(draft.filter) + '"></video>';
        html += '<div class="hshs-cam-recbar"><i id="hshsRecProgress"></i></div>';
        if (recording) html += '<div class="hshs-cam-rectime" id="hshsRecTime">0.0s</div>';
        if (msg) html += '<div class="hshs-cam-msg">' + msg + '</div>';
        html += '</div>';
        html += '<div class="hshs-cam-top">';
        html += '<button type="button" class="hshs-cam-icon" data-act="close" aria-label="Close"><i class="fas fa-xmark"></i></button>';
        html += '<button type="button" class="hshs-cam-sound" data-act="sounds"><i class="fas fa-music"></i> ' + soundText + '</button>';
        html += '<button type="button" class="hshs-cam-icon hshs-cam-fx" data-act="effects" aria-label="Effects"><i class="fas fa-wand-magic-sparkles"></i></button>';
        html += '</div>';
        html += '<div class="hshs-cam-rail">';
        html += '<button type="button" data-act="flip"><i class="fas fa-arrows-rotate"></i><span>Flip</span></button>';
        html += '<button type="button" data-act="timer"><i class="fas fa-clock"></i><span>' + (draft.timer ? draft.timer + 's' : 'Timer') + '</span></button>';
        if (!isPhoto) {
            html += '<button type="button" data-act="duration"><i class="fas fa-hourglass-half"></i><span>' + (draft.duration || 15) + 's</span></button>';
            html += '<button type="button" data-act="speed"><i class="fas fa-gauge-high"></i><span>' + (draft.speed || 1) + 'x</span></button>';
        }
        html += '<button type="button" data-act="filter"><i class="fas fa-circle-half-stroke"></i><span>Filters</span></button>';
        html += '<button type="button" data-act="flash"><i class="fas fa-bolt"></i><span>Flash</span></button>';
        html += '</div>';
        html += '<div class="hshs-cam-bottom">';
        html += '<label class="hshs-cam-gallery" title="Add from device">';
        html += '<input type="file" id="hshsUploadFile" accept="image/*,video/*" hidden>';
        html += '<i class="fas fa-images"></i><span>Add</span></label>';
        if (isPhoto) {
            html += '<button type="button" class="hshs-cam-shutter" data-act="snap" aria-label="Take photo"><span></span></button>';
        } else {
            html += '<button type="button" class="hshs-cam-shutter is-rec' + (recording ? ' is-on' : '') + '" data-act="record" aria-label="Record"><span></span></button>';
        }
        html += '<button type="button" class="hshs-cam-effects-btn" data-act="effects" aria-label="Effects"><i class="fas fa-sparkles"></i></button>';
        html += '</div>';
        html += '<div class="hshs-cam-modes">';
        html += '<button type="button" class="' + (mode === 'buzz' ? 'is-on' : '') + '" data-mode="buzz">Video</button>';
        html += '<button type="button" class="' + (mode === 'vibe' ? 'is-on' : '') + '" data-mode="vibe">Vibe</button>';
        html += '<button type="button" class="' + (mode === 'photo' ? 'is-on' : '') + '" data-mode="photo">Photo</button>';
        html += '<button type="button" class="' + (mode === 'post' ? 'is-on' : '') + '" data-mode="post">Post</button>';
        html += '</div></div>';
        return html;
    }

    function renderCompose() {
        var fcss = filterCss(draft.filter);
        var destCount = draft.destinations.length;
        var boardLabel = destCount === 1
            ? ((DESTINATIONS.find(function (d) { return d.id === draft.destinations[0]; }) || {}).label || 'Board')
            : destCount + ' boards';
        var html = '';
        html += '<div class="hshs-create">';
        html += '<header class="hshs-create-head">';
        html += '<button type="button" data-act="back-cam" aria-label="Back"><i class="fas fa-chevron-left"></i></button>';
        html += '<strong>Create Pin</strong><span></span></header>';
        html += '<div class="hshs-create-preview">';
        if (draft.kind === 'video') {
            html += '<video src="' + draft.src + '" muted playsinline loop autoplay style="filter:' + fcss + '"></video>';
        } else {
            html += '<img src="' + draft.src + '" alt="" style="filter:' + fcss + '">';
        }
        html += '<button type="button" class="hshs-create-edit" data-act="back-cam" aria-label="Edit"><i class="fas fa-pen"></i></button></div>';
        html += '<div class="hshs-create-form">';
        html += '<label class="hshs-field"><span>Title</span>';
        html += '<input id="hshsTitle" type="text" maxlength="100" placeholder="Tell everyone what your Pin is about" value="' + (draft.title || '').replace(/"/g, '"') + '">';
        html += '<em><i id="hshsTitleCount">' + (draft.title || '').length + '</i>/100</em></label>';
        html += '<label class="hshs-field"><span>Description</span>';
        html += '<textarea id="hshsDesc" maxlength="800" rows="3" placeholder="Describe your Pin">' + (draft.description || '') + '</textarea>';
        html += '<em><i id="hshsDescCount">' + (draft.description || '').length + '</i>/800</em></label>';
        html += '<label class="hshs-field"><span>Link</span>';
        html += '<input id="hshsLink" type="url" placeholder="Add your link here" value="' + (draft.link || '').replace(/"/g, '"') + '"></label>';
        html += '<button type="button" class="hshs-row" data-act="boards">';
        html += '<span>Pick a board</span><strong>' + boardLabel + ' <i class="fas fa-chevron-right"></i></strong></button>';
        html += '<button type="button" class="hshs-row" data-act="topics">';
        html += '<span>Tag topics</span><strong>' + (draft.classTag || 'Campus') + ' <i class="fas fa-chevron-right"></i></strong></button>';
        html += '<button type="button" class="hshs-row" data-act="sounds">';
        html += '<span>Sound</span><strong>' + soundLabel(draft.soundId) + ' <i class="fas fa-chevron-right"></i></strong></button>';
        html += '<button type="button" class="hshs-row" data-act="filter-sheet">';
        html += '<span>Filter</span><strong>' + (FILTERS.find(function (f) { return f.id === draft.filter; }) || {}).label + ' <i class="fas fa-chevron-right"></i></strong></button>';
        html += '</div>';
        html += '<div class="hshs-create-bar">';
        html += '<button type="button" class="hshs-create-draft" data-act="close" aria-label="Close"><i class="fas fa-folder"></i></button>';
        html += '<button type="button" class="hshs-create-go" id="hshsPublish"' + (destCount ? '' : ' disabled') + '>Create</button>';
        html += '</div></div>';
        return html;
    }

    function renderSounds() {
        var html = '<div class="hshs-sheet"><header><button type="button" data-act="sheet-back"><i class="fas fa-chevron-left"></i></button><strong>Add sound</strong><span></span></header><div class="hshs-sheet-list">';
        SOUNDS.forEach(function (s) {
            html += '<button type="button" class="hshs-sheet-item' + (draft.soundId === s.id ? ' is-on' : '') + '" data-sound="' + s.id + '" data-url="' + (s.url || '') + '">';
            html += '<i class="fas fa-music"></i><div><strong>' + s.label + '</strong><small>' + s.artist + '</small></div>';
            if (draft.soundId === s.id) html += '<i class="fas fa-check"></i>';
            html += '</button>';
        });
        html += '</div></div>';
        return html;
    }

    function renderBoards() {
        var html = '<div class="hshs-sheet"><header><button type="button" data-act="sheet-back"><i class="fas fa-chevron-left"></i></button><strong>Pick a board</strong>';
        html += '<button type="button" class="hshs-sheet-done" data-act="sheet-back">Done</button></header><div class="hshs-sheet-list">';
        DESTINATIONS.filter(function (d) { return d.kinds.indexOf(draft.kind) !== -1; }).forEach(function (d) {
            var on = draft.destinations.indexOf(d.id) !== -1;
            html += '<button type="button" class="hshs-sheet-item' + (on ? ' is-on' : '') + '" data-dest="' + d.id + '">';
            html += '<i class="fas ' + d.icon + '"></i><div><strong>' + d.label + '</strong><small>' + d.hint + '</small></div>';
            html += '<i class="fas ' + (on ? 'fa-circle-check' : 'fa-circle') + '"></i></button>';
        });
        html += '</div></div>';
        return html;
    }

    function renderTopics() {
        var html = '<div class="hshs-sheet"><header><button type="button" data-act="sheet-back"><i class="fas fa-chevron-left"></i></button><strong>Tag topics</strong>';
        html += '<button type="button" class="hshs-sheet-done" data-act="sheet-back">Done</button></header><div class="hshs-sheet-chips">';
        CLASS_TAGS.forEach(function (t) {
            html += '<button type="button" class="hshs-chip' + (draft.classTag === t ? ' is-on' : '') + '" data-class="' + t + '">' + t + '</button>';
        });
        html += '</div></div>';
        return html;
    }

    function renderFilters() {
        var html = '<div class="hshs-sheet"><header><button type="button" data-act="sheet-back"><i class="fas fa-chevron-left"></i></button><strong>Filters</strong>';
        html += '<button type="button" class="hshs-sheet-done" data-act="sheet-back">Done</button></header><div class="hshs-filter-row">';
        FILTERS.forEach(function (f) {
            html += '<button type="button" class="hshs-filter-thumb' + (draft.filter === f.id ? ' is-on' : '') + '" data-filter="' + f.id + '">';
            if (draft.src) {
                if (draft.kind === 'video') html += '<video src="' + draft.src + '" muted style="filter:' + f.css + '"></video>';
                else html += '<img src="' + draft.src + '" style="filter:' + f.css + '" alt="">';
            } else html += '<span class="hshs-filter-swatch" style="filter:' + f.css + '"></span>';
            html += '<em>' + f.label + '</em></button>';
        });
        html += '</div></div>';
        return html;
    }

    function render(msg) {
        var el = ensureRoot();
        if (!draft) { el.hidden = true; return; }
        if (step === 'camera') el.innerHTML = renderCamera(msg || '');
        else if (step === 'compose') el.innerHTML = renderCompose();
        else if (step === 'sounds') el.innerHTML = renderSounds();
        else if (step === 'boards') el.innerHTML = renderBoards();
        else if (step === 'topics') el.innerHTML = renderTopics();
        else if (step === 'filters') el.innerHTML = renderFilters();
        else el.innerHTML = renderCamera(msg || '');
        bind();
    }

    function bind() {
        if (!root) return;
        root.querySelectorAll('[data-act]').forEach(function (b) {
            b.onclick = function (e) {
                e.preventDefault();
                var act = b.getAttribute('data-act');
                if (act === 'close') { close(); return; }
                if (act === 'back-cam') {
                    draft.src = '';
                    step = 'camera';
                    startCam().then(function () { render(); });
                    render();
                    return;
                }
                if (act === 'sheet-back') { step = 'compose'; render(); return; }
                if (act === 'flip') {
                    facing = facing === 'environment' ? 'user' : 'environment';
                    startCam().then(function () { render(); });
                    return;
                }
                if (act === 'timer') { cycleTimer(); return; }
                if (act === 'duration') { cycleDuration(); return; }
                if (act === 'speed') { cycleSpeed(); return; }
                if (act === 'filter') { cycleFilter(); return; }
                if (act === 'filter-sheet') { step = 'filters'; render(); return; }
                if (act === 'flash') { toggleFlash(); return; }
                if (act === 'snap') {
                    if (draft.timer) {
                        var n = draft.timer;
                        var tick = setInterval(function () {
                            n -= 1;
                            if (n <= 0) { clearInterval(tick); captureStill(); }
                            else {
                                var m = document.querySelector('.hshs-cam-msg');
                                if (m) m.textContent = n;
                                else render(String(n));
                            }
                        }, 1000);
                        render(String(draft.timer));
                    } else captureStill();
                    return;
                }
                if (act === 'record') { toggleRecord(); return; }
                if (act === 'sounds') { step = 'sounds'; render(); return; }
                if (act === 'boards') { step = 'boards'; render(); return; }
                if (act === 'topics') { step = 'topics'; render(); return; }
                if (act === 'effects') { step = 'filters'; render(); return; }
            };
        });
        root.querySelectorAll('[data-mode]').forEach(function (b) {
            b.onclick = function () { setMode(b.getAttribute('data-mode')); };
        });
        root.querySelectorAll('[data-sound]').forEach(function (b) {
            b.onclick = function () {
                var sid = b.getAttribute('data-sound');
                var url = b.getAttribute('data-url');
                if (draft.soundId === sid) {
                    draft.soundId = 'none';
                    if (audio) audio.pause();
                } else {
                    draft.soundId = sid;
                    if (url) {
                        if (!audio) audio = new Audio();
                        audio.src = url;
                        audio.play().catch(function () {});
                    }
                }
                render();
            };
        });
        root.querySelectorAll('[data-dest]').forEach(function (b) {
            b.onclick = function () {
                var id = b.getAttribute('data-dest');
                var i = draft.destinations.indexOf(id);
                if (i >= 0) draft.destinations.splice(i, 1);
                else draft.destinations.push(id);
                render();
            };
        });
        root.querySelectorAll('[data-class]').forEach(function (b) {
            b.onclick = function () { draft.classTag = b.getAttribute('data-class'); render(); };
        });
        root.querySelectorAll('[data-filter]').forEach(function (b) {
            b.onclick = function () { draft.filter = b.getAttribute('data-filter'); render(); };
        });
        var file = document.getElementById('hshsUploadFile');
        if (file) file.onchange = function () {
            if (file.files && file.files[0]) handleFile(file.files[0]);
        };
        var title = document.getElementById('hshsTitle');
        if (title) {
            title.oninput = function () {
                draft.title = title.value;
                draft.caption = title.value;
                var c = document.getElementById('hshsTitleCount');
                if (c) c.textContent = title.value.length;
            };
        }
        var desc = document.getElementById('hshsDesc');
        if (desc) {
            desc.oninput = function () {
                draft.description = desc.value;
                var c = document.getElementById('hshsDescCount');
                if (c) c.textContent = desc.value.length;
            };
        }
        var link = document.getElementById('hshsLink');
        if (link) link.oninput = function () { draft.link = link.value; };
        var pub = document.getElementById('hshsPublish');
        if (pub) pub.onclick = publish;
        if (step === 'camera' && stream) {
            var video = document.getElementById('hshsCamVideo');
            if (video) { video.srcObject = stream; video.play().catch(function () {}); }
        }
    }

    window.__hshsOpenUpload = open;
    window.__hshsCloseUpload = close;

    document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-open-studio], .js-open-studio, #mobileUploadBtn, .tab-upload, a[href="#upload"]');
        if (!t) return;
        e.preventDefault();
        open();
    });
})();
