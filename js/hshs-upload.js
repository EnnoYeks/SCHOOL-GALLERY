(function () {
    if (window.__hshsUpload) return;
    window.__hshsUpload = true;

    var DESTINATIONS = [
        { id: 'gallery', label: 'Gallery', hint: 'For You · whole campus feed', icon: 'fa-images', page: 'gallery.html', kinds: ['photo', 'video'] },
        { id: 'photos', label: 'Photos', hint: 'Still moments library', icon: 'fa-camera', page: 'photos.html', kinds: ['photo'] },
        { id: 'buzz', label: 'Buzz', hint: 'Long school videos', icon: 'fa-play', page: 'videos.html', kinds: ['video'] },
        { id: 'vibe', label: 'Vibe', hint: 'Short clips · vertical', icon: 'fa-bolt', page: 'buzz.html', kinds: ['video'] },
        { id: 'spotlight', label: 'Spotlight', hint: 'Featured student wall', icon: 'fa-trophy', page: 'spotlight.html', kinds: ['photo', 'video'] },
        { id: 'memories', label: 'Memories', hint: 'Keep this campus day', icon: 'fa-clock-rotate-left', page: 'memories.html', kinds: ['photo', 'video'] },
        { id: 'trending', label: 'Trending', hint: 'Rising on campus', icon: 'fa-fire', page: 'trending.html', kinds: ['photo', 'video'] }
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
        { id: 'courtyard', label: 'Courtyard Morning', artist: 'Campus Mix', url: '/assets/sounds/courtyard.mp3' },
        { id: 'bell', label: 'Assembly Bell', artist: 'HSHS Field', url: '/assets/sounds/bell.mp3' },
        { id: 'drumline', label: 'Sports Drumline', artist: 'House Band', url: '/assets/sounds/drumline.mp3' },
        { id: 'choir', label: 'Choir Warmup', artist: 'Music Dept', url: '/assets/sounds/choir.mp3' },
        { id: 'study', label: 'Night Study', artist: 'Library Hours', url: '/assets/sounds/study.mp3' },
        { id: 'friday', label: 'Friday Anthem', artist: 'Prefect Mix', url: '/assets/sounds/friday.mp3' },
        { id: 'rain', label: 'Campus Rain', artist: 'Field Recording', url: '/assets/sounds/rain.mp3' }
    ];

    var CLASS_TAGS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'Campus', 'Sports', 'Choir', 'STEM', 'Houses'];

    function escapeHtml(s) {
        return (window.HshsUtils && window.HshsUtils.escapeHtml)
            ? window.HshsUtils.escapeHtml(s)
            : String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
    }

    var draft = {
        kind: 'photo', src: '', filter: 'original', soundId: 'none',
        destinations: ['gallery', 'photos'], caption: '', classTag: ''
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
        stream = null; recorder = null; recording = false;
    }

    function filterCss(id) {
        var f = FILTERS.find(function (x) { return x.id === id; });
        return f ? f.css : 'none';
    }

    function suggested(kind) {
        return kind === 'video' ? ['buzz', 'vibe', 'gallery'] : ['gallery', 'photos'];
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
                    var scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
                    var canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
                    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
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
            kind: 'photo', src: '', filter: 'original', soundId: 'none',
            destinations: ['gallery', 'photos'], caption: '', classTag: defaultClassTag()
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
            if (video) { video.srcObject = stream; video.play().catch(function () {}); }
        } catch (err) {
            step = 'source';
            render('Camera is blocked on this device. Use From device instead.');
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
        try { recorder = new MediaRecorder(stream); }
        catch (e) { render('Recording is not supported on this device.'); return; }
        recorder.ondataavailable = function (e) {
            if (e.data && e.data.size) chunks.push(e.data);
        };
        recorder.onstop = function () {
            var blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            draft.src = URL.createObjectURL(blob);
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

    function pageMap() {
        var m = {};
        DESTINATIONS.forEach(function (d) { m[d.id] = d.page; });
        return m;
    }

    async function publish() {
        if (!draft.src || !draft.destinations.length) return;
        var title = (draft.caption || '').trim() || 'Campus moment';
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
            description: draft.caption || '',
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
                var dests = payload.destinations;
                var feedDests = ['gallery', 'spotlight', 'memories', 'trending'];
                var needsPost = dests.some(function (d) { return feedDests.indexOf(d) !== -1; }) || dests.indexOf('photos') === -1;
                if (needsPost || dests.indexOf('gallery') !== -1) await window.db.createPost(payload);
                if (dests.indexOf('photos') !== -1 && payload.type === 'photo') await window.db.createPhoto(payload);
                if ((dests.indexOf('vibe') !== -1 || dests.indexOf('buzz') !== -1) && payload.type === 'video') {
                    await window.db.createVideo(payload);
                }
            }
        } catch (e) { console.warn('[studio] Firestore write failed', e); }

        try {
            if (window.HshsStore && typeof window.HshsStore.addPost === 'function') {
                var res = window.HshsStore.addPost(payload);
                if (res && typeof res.then === 'function') res.catch(function () { fallbackLocalSave(payload); });
                else if (res && res.ok === false) fallbackLocalSave(payload);
            } else fallbackLocalSave(payload);
        } catch (e) { fallbackLocalSave(payload); }

        hideProgress(progress);
        close();

        if (window.__hshsNavigate) {
            var first = draft.destinations[0];
            var file = pageMap()[first] || 'gallery.html';
            var inSub = location.pathname.indexOf('/index/') !== -1;
            window.__hshsNavigate(inSub ? file : ('index/' + file));
        }
    }

    function fallbackLocalSave(payload) {
        try {
            var s = (window.HshsStore && window.HshsStore.getState && window.HshsStore.getState()) ||
                (window.HshsStoreBridge && window.HshsStoreBridge.read ? window.HshsStoreBridge.read() : {}) || {};
            s.posts = s.posts || [];
            var post = Object.assign({
                id: 'p-local-' + Date.now(), author: 'You', authorId: 'guest',
                likes: 0, views: 1, comments: 0, shares: 0, createdAt: Date.now()
            }, payload);
            post.imageUrl = post.image;
            post.thumbnailUrl = post.image;
            s.posts.unshift(post);
            if (window.HshsStoreBridge && typeof window.HshsStoreBridge.write === 'function') window.HshsStoreBridge.write(s);
            else localStorage.setItem('hshsWorldStore_v2', JSON.stringify(s));
            try { document.dispatchEvent(new Event('hshs:storechange')); } catch (e) {}
        } catch (e) {}
    }

    function showProgress() {
        var id = 'hshsUploadProgress';
        var el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.className = 'hshs-upload-progress';
            el.innerHTML = '<div class="bar"><div class="fill" style="width:0%"></div></div><div class="label">Sharing to campus…</div>';
            document.body.appendChild(el);
        }
        var fill = el.querySelector('.fill');
        var pct = 0;
        var iv = setInterval(function () {
            pct = Math.min(98, pct + Math.round(Math.random() * 10));
            if (fill) fill.style.width = pct + '%';
        }, 380);
        return { el: el, iv: iv, fill: fill };
    }

    function hideProgress(progress) {
        try {
            if (!progress) return;
            clearInterval(progress.iv);
            if (progress.fill) progress.fill.style.width = '100%';
            setTimeout(function () {
                if (progress.el && progress.el.parentNode) progress.el.parentNode.removeChild(progress.el);
            }, 400);
        } catch (e) {}
    }

    function render(errorMsg) {
        var root = ensureRoot();
        var html = '';
        html += '<div class="hshs-upload-head">';
        html += '<button type="button" class="hshs-upload-icon" id="hshsUploadBack" aria-label="Back"><i class="fas fa-' + (step === 'source' ? 'times' : 'chevron-left') + '"></i></button>';
        html += '<div class="hshs-studio-brand"><strong>HSHS Studio</strong><small>' +
            (step === 'source' ? 'Share a campus moment' : step === 'camera' ? 'Capture on campus' : 'Pin it on the boards') +
            '</small></div>';
        html += '<span class="hshs-upload-spacer"></span></div>';

        if (step === 'source') {
            html += '<div class="hshs-upload-body">';
            html += '<div class="hshs-studio-hero"><span class="hshs-studio-badge">Campus</span>';
            html += '<p class="hshs-upload-lead">Drop a moment from the field, classroom, or yard — then tag your class and pin the boards.</p></div>';
            if (errorMsg) html += '<p class="hshs-upload-error">' + escapeHtml(errorMsg) + '</p>';
            html += '<div class="hshs-source-grid">';
            html += '<button type="button" class="hshs-source-card" data-action="library"><span class="ico"><i class="fas fa-images"></i></span><span><b>From device</b><small>Photos &amp; videos already on this phone</small></span></button>';
            html += '<button type="button" class="hshs-source-card" data-action="photo"><span class="ico"><i class="fas fa-camera"></i></span><span><b>Snap</b><small>Still shot on campus right now</small></span></button>';
            html += '<button type="button" class="hshs-source-card" data-action="video"><span class="ico"><i class="fas fa-video"></i></span><span><b>Record</b><small>Clip for Buzz or Vibe</small></span></button>';
            html += '</div>';
            html += '<div class="hshs-drag-drop" id="hshsUploadDrop">Drop a campus file here · or use From device</div>';
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
            html += '<div class="hshs-compose-left">';
            html += '<div class="hshs-preview"><img id="hshsPreviewImg" src="' + escapeHtml(draft.src) + '" alt="preview" style="filter:' + filterCss(draft.filter) + '"></div>';
            html += '<div class="hshs-section"><label>Filter</label><div class="hshs-filter-row" id="hshsFilterRow">';
            FILTERS.forEach(function (f) {
                html += '<button type="button" class="hshs-filter-thumb' + (draft.filter === f.id ? ' on' : '') + '" data-filter="' + f.id + '" aria-label="' + escapeHtml(f.label) + '"><img src="' + escapeHtml(draft.src) + '" style="filter:' + f.css + '"><small>' + escapeHtml(f.label) + '</small></button>';
            });
            html += '</div></div>';
            html += '<div class="hshs-section"><label>Campus sound</label><div class="hshs-sound-row" id="hshsSoundRow">';
            SOUNDS.forEach(function (s) {
                html += '<button type="button" class="hshs-sound' + (draft.soundId === s.id ? ' on' : '') + '" data-sound="' + s.id + '" data-url="' + (s.url || '') + '"><b>' + escapeHtml(s.label) + '</b><small>' + escapeHtml(s.artist) + '</small>' + (s.url ? ' <i class="fas fa-play"></i>' : '') + '</button>';
            });
            html += '</div></div></div>';

            html += '<div class="hshs-compose-right">';
            html += '<div class="hshs-section"><label>Class / house</label><p class="hshs-hint">Tag the form, house, or club this moment belongs to.</p><div class="hshs-chips">';
            CLASS_TAGS.forEach(function (c) {
                html += '<button type="button" class="hshs-chip' + (draft.classTag === c ? ' on' : '') + '" data-class="' + c + '">' + c + '</button>';
            });
            html += '</div></div>';

            html += '<div class="hshs-section hshs-dest-section"><label>Pin on campus boards</label>';
            html += '<p class="hshs-hint">Choose every board that should carry this moment. At least one is required.</p>';
            html += '<div class="hshs-dest-toolbar">';
            html += '<button type="button" class="hshs-dest-tool" data-dest-action="all">Select all</button>';
            html += '<button type="button" class="hshs-dest-tool" data-dest-action="clear">Clear</button>';
            html += '<span class="hshs-dest-count">' + draft.destinations.length + ' selected</span></div>';
            html += '<div class="hshs-dest-grid">';
            DESTINATIONS.filter(function (d) { return d.kinds.indexOf(draft.kind) !== -1; }).forEach(function (d) {
                var on = draft.destinations.indexOf(d.id) !== -1;
                html += '<button type="button" class="hshs-dest' + (on ? ' on' : '') + '" data-dest="' + d.id + '" aria-pressed="' + (on ? 'true' : 'false') + '">';
                html += '<span class="hshs-dest-ico"><i class="fas ' + (d.icon || 'fa-file') + '"></i></span>';
                html += '<span class="hshs-dest-copy"><b>' + escapeHtml(d.label) + '</b><small>' + escapeHtml(d.hint) + '</small></span>';
                html += (on ? '<i class="fas fa-check-circle hshs-dest-check"></i>' : '<i class="far fa-circle hshs-dest-check"></i>');
                html += '</button>';
            });
            html += '</div>';
            if (!draft.destinations.length) {
                html += '<p class="hshs-upload-error">Pick at least one board so classmates can find this moment.</p>';
            } else {
                html += '<p class="hshs-dest-summary">Pinned on: <strong>' + draft.destinations.map(function (id) {
                    var row = DESTINATIONS.find(function (x) { return x.id === id; });
                    return row ? row.label : id;
                }).join(', ') + '</strong></p>';
            }
            html += '</div>';

            html += '<div class="hshs-section"><label>Caption</label><textarea id="hshsCaption" rows="3" placeholder="What is happening on campus?">' + escapeHtml(draft.caption || '') + '</textarea></div>';
            html += '<div class="hshs-compose-actions"><button type="button" class="hshs-post-btn" id="hshsPublish"' +
                (!draft.destinations.length ? ' disabled' : '') +
                '>Share to ' + draft.destinations.length + ' campus board' + (draft.destinations.length === 1 ? '' : 's') + '</button></div>';
            html += '</div></div>';
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
        root.querySelectorAll('[data-action="flip"]').forEach(function (b) {
            b.onclick = function () {
                facing = facing === 'environment' ? 'user' : 'environment';
                startCamera(draft.kind === 'video' ? 'video' : 'photo');
            };
        });
        root.querySelectorAll('[data-action="snap"]').forEach(function (b) { b.onclick = captureStill; });
        root.querySelectorAll('[data-action="record"]').forEach(function (b) { b.onclick = toggleRecord; });

        var fileInput = document.getElementById('hshsUploadFile');
        if (fileInput) fileInput.onchange = function () {
            var f = fileInput.files && fileInput.files[0];
            if (f) handleFile(f);
        };
        var drop = document.getElementById('hshsUploadDrop');
        if (drop) {
            drop.ondragover = function (e) { e.preventDefault(); drop.classList.add('on'); };
            drop.ondragleave = function () { drop.classList.remove('on'); };
            drop.ondrop = function (e) {
                e.preventDefault(); drop.classList.remove('on');
                var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) handleFile(f);
            };
        }

        root.querySelectorAll('.hshs-filter-thumb').forEach(function (btn) {
            btn.addEventListener('click', function () { draft.filter = btn.getAttribute('data-filter'); render(); });
        });

        var audio = document.getElementById('hshsSoundPreview');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'hshsSoundPreview';
            audio.style.display = 'none';
            document.body.appendChild(audio);
        }
        root.querySelectorAll('[data-sound]').forEach(function (b) {
            b.onclick = function () {
                var sid = b.getAttribute('data-sound');
                var url = b.getAttribute('data-url');
                if (draft.soundId === sid) {
                    draft.soundId = 'none';
                    if (audio) { audio.pause(); audio.currentTime = 0; }
                } else {
                    draft.soundId = sid;
                    if (audio && url) { audio.src = url; audio.play().catch(function () {}); }
                }
                render();
            };
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
        root.querySelectorAll('[data-dest-action]').forEach(function (b) {
            b.onclick = function () {
                var action = b.getAttribute('data-dest-action');
                var allowed = DESTINATIONS.filter(function (d) { return d.kinds.indexOf(draft.kind) !== -1; }).map(function (d) { return d.id; });
                if (action === 'all') draft.destinations = allowed.slice();
                else if (action === 'clear') draft.destinations = [];
                render();
            };
        });

        var cap = document.getElementById('hshsCaption');
        if (cap) cap.oninput = function () { draft.caption = cap.value; };
        var pub = document.getElementById('hshsPublish');
        if (pub) pub.onclick = publish;

        if (step === 'camera' && stream) {
            var video = document.getElementById('hshsCamVideo');
            if (video) { video.srcObject = stream; video.play().catch(function () {}); }
        }
    }

    function handleFile(f) {
        fileToDataUrl(f).then(function (data) {
            draft.kind = data.kind;
            draft.src = data.src;
            draft.destinations = suggested(data.kind);
            if (!draft.classTag) draft.classTag = defaultClassTag();
            step = 'compose';
            render();
        }).catch(function () { render('Could not read that file.'); });
    }

    window.__hshsOpenUpload = open;
    window.__hshsCloseUpload = close;
})();
