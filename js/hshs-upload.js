/**
 * HSHS Upload - compose first.
 * Pick a photo or video, then title, caption, category, and class.
 * File goes to R2. The record goes to Supabase.
 */
(function () {
  if (window.__hshsUpload && window.__hshsUpload.compose) return;

  var CATEGORIES = [
    { id: 'events', label: 'Events' },
    { id: 'sports', label: 'Sports' },
    { id: 'academics', label: 'Academics' },
    { id: 'arts', label: 'Arts' },
    { id: 'clubs', label: 'Clubs' },
    { id: 'campus', label: 'Campus' }
  ];
  var CLASSES = ['Campus', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  var DEST_NAMES = {
    gallery: 'Gallery', photos: 'Photos', vibe: 'Vibe', buzz: 'Studio',
    spotlight: 'Spotlight', memories: 'Memories', trending: 'Trending'
  };
  var DEST_CYCLE = ['gallery', 'photos', 'buzz', 'spotlight', 'memories'];

  var state = emptyState();
  var objectUrl = '';

  function emptyState() {
    return {
      file: null, kind: 'photo', title: '', caption: '', category: 'events',
      classTag: 'Campus', destinations: ['gallery'], locked: false, busy: false, error: ''
    };
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

  function signedIn() {
    return !!(window.hshsAuthUser && !window.hshsAuthUser.isAnonymous);
  }

  function loginHref() {
    return location.pathname.indexOf('/index/') !== -1 ? 'login.html' : '/index/login.html';
  }

  function ensureCss() {
    if (document.getElementById('hshs-compose-css')) return;
    var style = document.createElement('style');
    style.id = 'hshs-compose-css';
    style.textContent = [
      '#hshsStudio.hshs-studio{position:fixed;inset:0;z-index:12000;background:#071433;color:#fff;font-family:Nunito,sans-serif;}',
      '#hshsStudio .hshs-create{display:flex;flex-direction:column;height:100%;}',
      '#hshsStudio .hshs-create-head{display:flex;align-items:center;justify-content:space-between;min-height:58px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08);}',
      '#hshsStudio .hshs-create-head strong{font-size:1.05rem;}',
      '#hshsStudio .hshs-create-head button{border:0;background:rgba(255,255,255,.08);color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;}',
      '#hshsStudio .hshs-create-body{display:flex;flex-direction:column;min-height:0;flex:1;overflow:auto;}',
      '#hshsStudio .hshs-create-preview{position:relative;margin:14px;min-height:220px;border-radius:18px;background:#0b1a3a;overflow:hidden;display:flex;align-items:center;justify-content:center;}',
      '#hshsStudio .hshs-create-preview img,#hshsStudio .hshs-create-preview video{width:100%;height:100%;max-height:420px;object-fit:cover;display:block;}',
      '#hshsStudio .hshs-pick{display:flex;flex-direction:column;align-items:center;gap:8px;color:#94a3b8;padding:28px;text-align:center;}',
      '#hshsStudio .hshs-pick button{border:0;border-radius:12px;background:#2563eb;color:#fff;font:800 .95rem Nunito,sans-serif;min-height:44px;padding:0 16px;cursor:pointer;}',
      '#hshsStudio .hshs-create-form{display:flex;flex-direction:column;gap:12px;padding:4px 16px 16px;}',
      '#hshsStudio .hshs-field{display:flex;flex-direction:column;gap:6px;}',
      '#hshsStudio .hshs-field span{font-size:.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#94a3b8;}',
      '#hshsStudio .hshs-field em{font-style:normal;font-size:.75rem;color:#64748b;text-align:right;}',
      '#hshsStudio input,#hshsStudio textarea,#hshsStudio select{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.12);background:#0b1a3a;color:#fff;border-radius:12px;padding:12px 14px;font:600 1rem Nunito,sans-serif;}',
      '#hshsStudio textarea{min-height:96px;resize:vertical;}',
      '#hshsStudio .hshs-row{display:flex;align-items:center;justify-content:space-between;width:100%;border:1px solid rgba(255,255,255,.1);background:transparent;color:#fff;border-radius:12px;min-height:48px;padding:0 14px;cursor:pointer;font:700 .95rem Nunito,sans-serif;}',
      '#hshsStudio .hshs-row-locked{cursor:default;}',
      '#hshsStudio .hshs-create-bar{display:flex;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,.08);}',
      '#hshsStudio .hshs-create-draft{flex:0 0 auto;border:1px solid rgba(255,255,255,.16);background:transparent;color:#fff;border-radius:12px;min-height:48px;padding:0 16px;font:800 .95rem Nunito,sans-serif;cursor:pointer;}',
      '#hshsStudio .hshs-create-go{flex:1;border:0;border-radius:12px;min-height:48px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font:800 1rem Nunito,sans-serif;cursor:pointer;}',
      '#hshsStudio .hshs-create-go:disabled{opacity:.45;cursor:not-allowed;}',
      '#hshsStudio .hshs-note{margin:0 16px 8px;color:#fbbf24;font-size:.9rem;}',
      '#hshsStudio .hshs-error{margin:0 16px 8px;color:#fca5a5;font-size:.9rem;}',
      'body.studio-open{overflow:hidden;}'
    ].join('');
    document.head.appendChild(style);
  }

  function rootEl() {
    var root = document.getElementById('hshsStudio');
    if (!root) {
      root = document.createElement('div');
      root.id = 'hshsStudio';
      root.className = 'hshs-studio';
      root.hidden = true;
      document.body.appendChild(root);
    }
    return root;
  }

  function canPublish() {
    return !!(state.file && state.title.trim() && state.caption.trim() && signedIn() && !state.busy);
  }

  function readForm() {
    var title = document.getElementById('hshsTitle');
    var caption = document.getElementById('hshsDesc');
    var category = document.getElementById('hshsCategory');
    var klass = document.getElementById('hshsClass');
    if (title) state.title = title.value.slice(0, 100);
    if (caption) state.caption = caption.value.slice(0, 500);
    if (category) state.category = category.value || 'events';
    if (klass) state.classTag = klass.value || 'Campus';
  }

  function previewHtml() {
    if (!state.file || !objectUrl) {
      return '<div class="hshs-pick"><i class="fas fa-cloud-arrow-up"></i><strong>Add a school photo or video</strong><p>Then write a title and caption before it is shared.</p><button type="button" data-act="pick">Choose file</button></div>';
    }
    if (state.kind === 'video') return '<video src="' + esc(objectUrl) + '" controls playsinline></video>';
    return '<img src="' + esc(objectUrl) + '" alt="Preview">';
  }

  function options(list, current, labelKey, valueKey) {
    return list.map(function (item) {
      var value = valueKey ? item[valueKey] : item;
      var label = labelKey ? item[labelKey] : item;
      return '<option value="' + esc(value) + '"' + (value === current ? ' selected' : '') + '>' + esc(label) + '</option>';
    }).join('');
  }

  function destLabel() {
    var id = (state.destinations && state.destinations[0]) || 'gallery';
    return DEST_NAMES[id] || 'Gallery';
  }

  function render() {
    ensureCss();
    var root = rootEl();
    var destRow = state.locked
      ? '<div class="hshs-row hshs-row-locked"><span>Posting to</span><strong>' + esc(destLabel()) + '</strong></div>'
      : '<button type="button" class="hshs-row" data-act="boards"><span>Post to</span><strong>' + esc(destLabel()) + '</strong></button>';
    root.hidden = false;
    root.innerHTML =
      '<div class="hshs-create">' +
        '<header class="hshs-create-head">' +
          '<button type="button" data-act="close" aria-label="Close"><i class="fas fa-xmark"></i></button>' +
          '<strong>New post</strong><span></span>' +
        '</header>' +
        '<div class="hshs-create-body">' +
          '<div class="hshs-create-preview">' + previewHtml() + '</div>' +
          (signedIn() ? '' : '<p class="hshs-note">Sign in before sharing.</p>') +
          (state.error ? '<p class="hshs-error">' + esc(state.error) + '</p>' : '') +
          '<form class="hshs-create-form" id="hshsComposeForm">' +
            '<label class="hshs-field"><span>Title</span><input id="hshsTitle" maxlength="100" required placeholder="Give this moment a title" value="' + esc(state.title) + '"><em><i id="hshsTitleCount">' + state.title.length + '</i>/100</em></label>' +
            '<label class="hshs-field"><span>Caption</span><textarea id="hshsDesc" maxlength="500" rows="3" required placeholder="Write a caption">' + esc(state.caption) + '</textarea><em><i id="hshsDescCount">' + state.caption.length + '</i>/500</em></label>' +
            '<label class="hshs-field"><span>Category</span><select id="hshsCategory">' + options(CATEGORIES, state.category, 'label', 'id') + '</select></label>' +
            '<label class="hshs-field"><span>Class</span><select id="hshsClass">' + options(CLASSES, state.classTag) + '</select></label>' +
            destRow +
            '<input id="hshsUploadFile" type="file" accept="image/*,video/*" hidden>' +
          '</form>' +
        '</div>' +
        '<div class="hshs-create-bar">' +
          '<button type="button" class="hshs-create-draft" data-act="close">Close</button>' +
          (signedIn()
            ? '<button type="button" class="hshs-create-go" id="hshsPublish"' + (canPublish() ? '' : ' disabled') + '>' + (state.busy ? 'Sharing…' : 'Share to campus') + '</button>'
            : '<a class="hshs-create-go" href="' + esc(loginHref()) + '" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;">Sign in</a>') +
        '</div>' +
      '</div>';
    document.body.classList.add('studio-open');
    bind();
  }

  function setFile(file) {
    if (!file) return;
    var type = file.type || '';
    if (type.indexOf('image/') !== 0 && type.indexOf('video/') !== 0) {
      state.error = 'Choose a photo or a video.';
      render();
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    state.file = file;
    state.kind = type.indexOf('video/') === 0 ? 'video' : 'photo';
    state.error = '';
    objectUrl = URL.createObjectURL(file);
    render();
  }

  function cycleDest() {
    if (state.locked) return;
    var current = (state.destinations && state.destinations[0]) || 'gallery';
    var index = DEST_CYCLE.indexOf(current);
    var next = DEST_CYCLE[(index + 1) % DEST_CYCLE.length];
    state.destinations = [next];
    render();
  }

  async function publish() {
    readForm();
    if (!signedIn()) { state.error = 'Sign in to share a post.'; render(); return; }
    if (!state.file) { state.error = 'Choose a photo or video first.'; render(); return; }
    if (!state.title.trim() || !state.caption.trim()) { state.error = 'A title and a caption are required.'; render(); return; }
    if (!window.HshsStorage || !window.db) { state.error = 'Storage is not ready yet. Refresh and try again.'; render(); return; }
    state.busy = true;
    state.error = '';
    render();
    try {
      var uploaded = await window.HshsStorage.upload(state.file, { kind: state.kind });
      if (!uploaded || !uploaded.url || String(uploaded.url).indexOf('data:') === 0 || String(uploaded.url).indexOf('blob:') === 0) {
        throw new Error('The file did not reach the media bucket.');
      }
      var dest = (state.destinations && state.destinations[0]) || 'gallery';
      var common = {
        type: state.kind,
        title: state.title.trim(),
        description: state.caption.trim(),
        caption: state.caption.trim(),
        category: state.category,
        classTag: state.classTag,
        image: uploaded.url,
        imageUrl: uploaded.url,
        thumbnailUrl: uploaded.url,
        videoUrl: state.kind === 'video' ? uploaded.url : '',
        mediaKey: uploaded.key || '',
        mediaProvider: uploaded.provider || 'cloudflare-r2',
        destinations: state.destinations.slice()
      };
      var saved = null;
      if (dest === 'photos' || (state.kind === 'photo' && dest === 'gallery')) {
        saved = await window.db.createPhoto(common);
      } else if ((dest === 'buzz' || dest === 'vibe') && state.kind === 'video') {
        saved = await window.db.createVideo(common);
      } else if (state.kind === 'video') {
        saved = await window.db.createVideo(common);
      } else if (dest === 'photos') {
        saved = await window.db.createPhoto(common);
      } else {
        saved = await window.db.createPost(common);
      }
      if (!saved) throw new Error('The post was not saved.');
      state.busy = false;
      close();
      try {
        var t = document.createElement('div');
        t.setAttribute('role', 'status');
        t.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:13000;background:#16a34a;color:#fff;font:800 .95rem Nunito,sans-serif;padding:12px 18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35)';
        t.textContent = 'Shared to campus';
        document.body.appendChild(t);
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2200);
      } catch (e1) {}
      try { if (window.HshsGallery && window.HshsGallery.refresh) window.HshsGallery.refresh(); } catch (e2) {}
      try { document.dispatchEvent(new CustomEvent('hshs:content-created', { detail: { item: saved } })); } catch (e3) {}
    } catch (err) {
      state.busy = false;
      state.error = (err && err.message) || 'Could not share this post.';
      render();
    }
  }

  function bind() {
    var root = document.getElementById('hshsStudio');
    if (!root || root.__composeBound) return;
    root.__composeBound = true;
    root.addEventListener('click', function (e) {
      var act = e.target.closest('[data-act]');
      if (!act || !root.contains(act)) return;
      var name = act.getAttribute('data-act');
      if (name === 'close') { e.preventDefault(); close(); }
      else if (name === 'pick') { e.preventDefault(); var input = document.getElementById('hshsUploadFile'); if (input) input.click(); }
      else if (name === 'boards') { e.preventDefault(); readForm(); cycleDest(); }
    });
    root.addEventListener('input', function (e) {
      if (e.target && (e.target.id === 'hshsTitle' || e.target.id === 'hshsDesc' || e.target.id === 'hshsCategory' || e.target.id === 'hshsClass')) {
        readForm();
        var go = document.getElementById('hshsPublish');
        if (go) go.disabled = !canPublish();
        var titleCount = document.getElementById('hshsTitleCount');
        var captionCount = document.getElementById('hshsDescCount');
        if (titleCount) titleCount.textContent = String(state.title.length);
        if (captionCount) captionCount.textContent = String(state.caption.length);
      }
    });
    root.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'hshsUploadFile' && e.target.files && e.target.files[0]) {
        readForm();
        setFile(e.target.files[0]);
      }
    });
    root.addEventListener('submit', function (e) {
      if (e.target && e.target.id === 'hshsComposeForm') { e.preventDefault(); publish(); }
    });
    root.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'hshsPublish') { e.preventDefault(); publish(); }
    });
  }

  function open(opts) {
    opts = opts || {};
    window.__hshsUploadClosed = false;
    if (!state.file) state = emptyState();
    if (opts.destinations && opts.destinations.length) state.destinations = opts.destinations.slice();
    if (opts.fromPage && (!opts.destinations || !opts.destinations.length)) state.destinations = [opts.fromPage];
    state.locked = !!(opts.lockDestinations || opts.fromPage);
    if (opts.prefer === 'video') state.kind = state.file ? state.kind : 'video';
    render();
    return true;
  }

  function close() {
    window.__hshsUploadClosed = true;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = '';
    state = emptyState();
    var root = document.getElementById('hshsStudio');
    if (root) {
      root.hidden = true;
      root.innerHTML = '';
      root.__composeBound = false;
    }
    document.body.classList.remove('studio-open', 'upload-open');
    document.documentElement.classList.remove('hshs-desk-studio');
    document.body.style.overflow = '';
  }

  window.__hshsOpenUpload = open;
  window.__hshsCloseUpload = close;
  window.__hshsUpload = { compose: true, open: open, close: close };
})();
