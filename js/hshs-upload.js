(function () {
    if (window.__hshsUpload) return;
    window.__hshsUpload = true;

    var DESTINATIONS = [
        { id: 'gallery', label: 'Gallery', hint: 'For You feed', kinds: ['photo', 'video'] },
        { id: 'photos', label: 'Photos', hint: 'Still library', kinds: ['photo'] },
        { id: 'vibe', label: 'Vibe', hint: 'School videos', kinds: ['video'] },
        { id: 'buzz', label: 'Buzz', hint: 'Short clips', kinds: ['video'] },
        { id: 'spotlight', label: 'Spotlight', hint: 'Featured wall', kinds: ['photo', 'video'] },
        { id: 'memories', label: 'Memories', hint: 'Keep this day', kinds: ['photo', 'video'] },
        { id: 'trending', label: 'Trending', hint: 'Push to hot', kinds: ['photo', 'video'] }
    ];

    var FILTERS = [
        { id: 'original', label: 'Original', css: 'none' },
        { id: 'film', label: 'Film', css: 'contrast(1.08) sepia(0.18) saturate(0.88)' },
        { id: 'cool', label: 'Cool', css: 'hue-rotate(-12deg) saturate(0.82) brightness(1.04)' },
        { id: 'warm', label: 'Warm', css: 'sepia(0.22) saturate(1.12) contrast(1.04)' },
        { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.12)' },
        { id: 'fade', label: 'Fade', css: 'contrast(0.9) brightness(1.08) saturate(0.68)' },
        { id: 'punch', label: 'Punch', css: 'contrast(1.22) saturate(1.18)' },
        { id: 'night', label: 'Night', css: 'brightness(0.82) contrast(1.18) saturate(0.75)' }
    ];

    var SOUNDS = [
        { id: 'none', label: 'Original', artist: 'No extra sound' },
        { id: 'courtyard', label: 'Courtyard Morning', artist: 'Campus Mix' },
        { id: 'bell', label: 'Assembly Bell', artist: 'HSHS Field' },
        { id: 'drumline', label: 'Sports Drumline', artist: 'House Band' },
        { id: 'choir', label: 'Choir Warmup', artist: 'Music Dept' },
        { id: 'study', label: 'Night Study', artist: 'Library Hours' },
        { id: 'friday', label: 'Friday Anthem', artist: 'Prefect Mix' },
        { id: 'rain', label: 'Campus Rain', artist: 'Field Recording' }
    ];

    var CLASS_TAGS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'Campus', 'Sports', 'Choir', 'STEM', 'Houses'];

    var draft = {
        kind: 'photo',
        src: '',
        filter: 'original',
        soundId: 'none',
        destinations: ['gallery', 'photos'],
        caption: '',
        classTag: ''
    };
    var step = 'source';
    var facing = 'environment';
    var stream = null;
    var recorder = null;
    var chunks = [];
    var recording = false;

    function ensureRoot() {
        var el = document.getElementById('hshsUploadStudio');
        if (el) return el;
        el = document.createElement('div');
        el.id = 'hshsUploadStudio';
        el.className = 'hshs-upload-studio';
        el.hidden = true;
        document.body.appendChild(el);
        return el;
    }

    function stopCam() {
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
        recorder = null;
        recording = false;
    }

    function filterCss(id) {
        var f = FILTERS.find(function (x) { return x.id === id; });
        return f ? f.css : 'none';
    }

    function suggested(kind) {
        return kind === 'video' ? ['vibe', 'buzz', 'gallery'] : ['gallery', 'photos'];
    }

    function defaultClassTag() {
        try {
            var u = window.HshsStore && window.HshsStore.currentUser && window.HshsStore.currentUser();
            return (u && u.classYear) || 'Campus';
        } catch (e) { return 'Campus'; }
    }

    function fileToDataUrl(file) {
        return new Promise(function (resolve, reject) {
            var kind = file.type.indexOf('video') === 0 ? 'video' : 'photo';
            if (kind === 'photo') {
                createImageBitmap(file).then(function (bitmap) {
                    var scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
                    var canvas = document.createElement('canvas');
                    canvas.width = Math.round(bitmap.width * scale);
                    canvas.height = Math.round(bitmap.height * scale);
                    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                    resolve({ kind: kind, src: canvas.toDataURL('image/jpeg', 0.78) });
                }).catch(reject);
                return;
            }
            var reader = new FileReader();
            reader.onload = function () { resolve({ kind: kind, src: String(reader.result) }); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function open() {
        step = 'source';
        draft = {
            kind: 'photo',
            src: '',
            filter: 'original',
            soundId: 'none',
            destinations: ['gallery', 'photos'],
            caption: '',
            classTag: defaultClassTag()
        };
        stopCam();
        var root = ensureRoot();
        root.hidden = false;
        document.body.classList.add('upload-open');
        render();
    }

    function close() {
        stopCam();
        var root = document.getElementById('hshsUploadStudio');
        if (root) root.hidden = true;
        document.body.classList.remove('upload-open');
    }

    async function startCamera(mode) {
        stopCam();
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1280 } },
                audio: mode === 'video'
            });
            draft.kind = mode === 'video' ? 'video' : 'photo';
            step = 'camera';
            render();
            var video = document.getElementById('hshsCamVideo');
            if (video) {
                video.srcObject = stream;
                video.play().catch(function () {});
            }
        } catch (err) {
            step = 'source';
            render('Camera is blocked here. Choose Library instead.');
        }
    }

    function captureStill() {
        var video = document.getElementById('hshsCamVideo');
        if (!video) return;
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 960;
        canvas.getContext('2d').drawImage(video, 0, 0);
        stopCam();
        draft.kind = 'photo';
        draft.src = canvas.toDataURL('image/jpeg', 0.8);
        draft.destinations = suggested('photo');
        step = 'compose';
        render();
    }

    function toggleRecord() {
        if (recording) {
            if (recorder) recorder.stop();
            recording = false;
            render();
            return;
        }
        if (!stream) return;
        chunks = [];
        try {
            recorder = new MediaRecorder(stream);
        } catch (e) {
            render('Recording is not supported on this device.');
            return;
        }
        recorder.ondataavailable = function (e) {
            if (e.data && e.data.size) chunks.push(e.data);
        };
        recorder.onstop = function () {
            var blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            var src = URL.createObjectURL(blob);
            var video = document.getElementById('hshsCamVideo');
            if (video) {
                var canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 720;
                canvas.height = video.videoHeight || 960;
                canvas.getContext('2d').drawImage(video, 0, 0);
                draft.src = canvas.toDataURL('image/jpeg', 0.7);
            } else {
                draft.src = src;
            }
            draft.kind = 'video';
            draft.destinations = suggested('video');
            stopCam();
            step = 'compose';
            render();
        };
        recorder.start();
        recording = true;
        render();
    }

    function publish() {
        if (!draft.src || !draft.destinations.length) return;
        var title = (draft.caption || '').trim() || 'Untitled moment';
        var payload = {
            type: draft.kind === 'video' ? 'video' : 'photo',
            title: title,
            description: draft.caption || '',
            category: 'events',
            classTag: draft.classTag || defaultClassTag(),
            image: draft.src,
            destinations: draft.destinations.slice(),
            filter: draft.filter,
            soundId: draft.soundId === 'none' ? undefined : draft.soundId
        };
        if (window.HshsStore && typeof window.HshsStore.addPost === 'function') {
            var res = window.HshsStore.addPost(payload);
            if (res && res.ok === false) {
                try {
                    var s = window.HshsStore.getState();
                    if (s && s.posts) {
                        var post = {
                            id: 'p-' + Date.now(),
                            type: payload.type,
                            title: payload.title,
                            description: payload.description,
                            category: payload.category,
                            classTag: payload.classTag,
                            image: payload.image,
                            imageUrl: payload.image,
                            thumbnailUrl: payload.image,
                            author: 'You',
                            authorId: 'guest',
                            likes: 0, views: 1, comments: 0, shares: 0,
                            destinations: payload.destinations,
                            filter: payload.filter,
                            soundId: payload.soundId,
                            createdAt: Date.now()
                        };
                        s.posts.unshift(post);
                        localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s));
                    }
                } catch (e) {}
            }
        }
        close();
        if (window.__hshsNavigate) {
            var first = draft.destinations[0];
            var map = {
                gallery: 'gallery.html',
                photos: 'photos.html',
                vibe: 'videos.html',
                buzz: 'buzz.html',
                spotlight: 'spotlight.html',
                memories: 'memories.html',
                trending: 'trending.html'
            };
            var file = map[first] || 'gallery.html';
            var inSub = location.pathname.indexOf('/index/') !== -1;
            window.__hshsNavigate(inSub ? file : ('index/' + file));
        }
    }

    function render(errorMsg) {
        var root = ensureRoot();
        var html = '';
        html += '<div class="hshs-upload-head">';
        html += '<button type="button" class="hshs-upload-icon" id="hshsUploadBack" aria-label="Back"><i class="fas fa-' + (step === 'source' ? 'times' : 'chevron-left') + '"></i></button>';
        html += '<strong>' + (step === 'source' ? 'Create' : step === 'camera' ? 'Capture' : 'Place it') + '</strong>';
        html += '<span class="hshs-upload-spacer"></span></div>';

        if (step === 'source') {
            html += '<div class="hshs-upload-body">';
            html += '<p class="hshs-upload-lead">Library, camera, or record — then tag class and pick pages.</p>';
            if (errorMsg) html += '<p class="hshs-upload-error">' + errorMsg + '</p>';
            html += '<button type="button" class="hshs-source-card" data-action="library"><span class="ico"><i class="fas fa-images"></i></span><span><b>Library</b><small>Photos and videos on this device</small></span></button>';
            html += '<button type="button" class="hshs-source-card" data-action="photo"><span class="ico"><i class="fas fa-camera"></i></span><span><b>Camera</b><small>Take a still right now</small></span></button>';
            html += '<button type="button" class="hshs-source-card" data-action="video"><span class="ico"><i class="fas fa-video"></i></span><span><b>Record</b><small>Clip for Vibe or Buzz</small></span></button>';
            html += '<input type="file" id="hshsUploadFile" accept="image/*,video/*" hidden>';
            html += '</div>';
        } else if (step === 'camera') {
            html += '<div class="hshs-upload-cam">';
            html += '<video id="hshsCamVideo" playsinline muted autoplay></video>';
            html += '<div class="hshs-cam-bar">';
            html += '<button type="button" class="hshs-cam-side" data-action="flip" aria-label="Flip"><i class="fas fa-sync-alt"></i></button>';
            if (draft.kind === 'video') {
                html += '<button type="button" class="hshs-cam-shutter ' + (recording ? 'is-rec' : '') + '" data-action="record" aria-label="Record"></button>';
            } else {
                html += '<button type="button" class="hshs-cam-shutter is-photo" data-action="snap" aria-label="Capture"></button>';
            }
            html += '<span class="hshs-cam-side"></span></div></div>';
        } else {
            html += '<div class="hshs-upload-body hshs-compose">';
            html += '<div class="hshs-preview"><img src="' + draft.src + '" alt="" style="filter:' + filterCss(draft.filter) + '"></div>';
            html += '<div class="hshs-section"><label>Filter</label><div class="hshs-chips">';
            FILTERS.forEach(function (f) {
                html += '<button type="button" class="hshs-chip' + (draft.filter === f.id ? ' on' : '') + '" data-filter="' + f.id + '">' + f.label + '</button>';
            });
            html += '</div></div>';
            html += '<div class="hshs-section"><label>Sound</label><div class="hshs-chips">';
            SOUNDS.forEach(function (s) {
                html += '<button type="button" class="hshs-chip sound' + (draft.soundId === s.id ? ' on' : '') + '" data-sound="' + s.id + '"><b>' + s.label + '</b><small>' + s.artist + '</small></button>';
            });
            html += '</div></div>';
            html += '<div class="hshs-section"><label>Class tag</label><p class="hshs-hint">Who this moment belongs to (S1–S6, club, or campus).</p><div class="hshs-chips">';
            CLASS_TAGS.forEach(function (c) {
                html += '<button type="button" class="hshs-chip' + (draft.classTag === c ? ' on' : '') + '" data-class="' + c + '">' + c + '</button>';
            });
            html += '</div></div>';
            html += '<div class="hshs-section"><label>Show this on</label><p class="hshs-hint">Pick every page that should carry this file.</p><div class="hshs-dest-grid">';
            DESTINATIONS.filter(function (d) { return d.kinds.indexOf(draft.kind) !== -1; }).forEach(function (d) {
                var on = draft.destinations.indexOf(d.id) !== -1;
                html += '<button type="button" class="hshs-dest' + (on ? ' on' : '') + '" data-dest="' + d.id + '"><span><b>' + d.label + '</b><small>' + d.hint + '</small></span>' + (on ? '<i class="fas fa-check"></i>' : '') + '</button>';
            });
            html += '</div></div>';
            html += '<div class="hshs-section"><label>Caption</label><textarea id="hshsCaption" rows="3" placeholder="What is this moment?">' + (draft.caption || '').replace(/</g, '<') + '</textarea></div>';
            html += '<button type="button" class="hshs-post-btn" id="hshsPublish"' + (!draft.destinations.length ? ' disabled' : '') + '>Post to ' + draft.destinations.length + ' page' + (draft.destinations.length === 1 ? '' : 's') + '</button>';
            html += '</div>';
        }

        root.innerHTML = html;

        var back = document.getElementById('hshsUploadBack');
        if (back) back.onclick = function () {
            if (step === 'source') close();
            else { stopCam(); step = 'source'; render(); }
        };

        root.querySelectorAll('[data-action="library"]').forEach(function (b) {
            b.onclick = function () { document.getElementById('hshsUploadFile').click(); };
        });
        root.querySelectorAll('[data-action="photo"]').forEach(function (b) {
            b.onclick = function () { startCamera('photo'); };
        });
        root.querySelectorAll('[data-action="video"]').forEach(function (b) {
            b.onclick = function () { startCamera('video'); };
        });
        var file = document.getElementById('hshsUploadFile');
        if (file) file.onchange = function (e) {
            var f = e.target.files && e.target.files[0];
            if (!f) return;
            fileToDataUrl(f).then(function (data) {
                draft.kind = data.kind;
                draft.src = data.src;
                draft.destinations = suggested(data.kind);
                if (!draft.classTag) draft.classTag = defaultClassTag();
                step = 'compose';
                render();
            }).catch(function () { render('Could not read that file.'); });
        };
        root.querySelectorAll('[data-action="flip"]').forEach(function (b) {
            b.onclick = function () {
                facing = facing === 'user' ? 'environment' : 'user';
                startCamera(draft.kind === 'video' ? 'video' : 'photo');
            };
        });
        root.querySelectorAll('[data-action="snap"]').forEach(function (b) {
            b.onclick = captureStill;
        });
        root.querySelectorAll('[data-action="record"]').forEach(function (b) {
            b.onclick = toggleRecord;
        });
        root.querySelectorAll('[data-filter]').forEach(function (b) {
            b.onclick = function () { draft.filter = b.getAttribute('data-filter'); render(); };
        });
        root.querySelectorAll('[data-sound]').forEach(function (b) {
            b.onclick = function () { draft.soundId = b.getAttribute('data-sound'); render(); };
        });
        root.querySelectorAll('[data-class]').forEach(function (b) {
            b.onclick = function () { draft.classTag = b.getAttribute('data-class'); render(); };
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
        var cap = document.getElementById('hshsCaption');
        if (cap) cap.oninput = function () { draft.caption = cap.value; };
        var pub = document.getElementById('hshsPublish');
        if (pub) pub.onclick = publish;

        if (step === 'camera' && stream) {
            var video = document.getElementById('hshsCamVideo');
            if (video) {
                video.srcObject = stream;
                video.play().catch(function () {});
            }
        }
    }

    window.__hshsOpenUpload = open;
    window.__hshsCloseUpload = close;
})();
