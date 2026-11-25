/**
 * HSHS Studio · stable real-time filters
 * - Live CSS filter on video (instant, no black canvas)
 * - Canvas only used when recording so the filter is baked in
 * - Does NOT tear down the camera on mode switches
 */
(function () {
  if (window.__hshsFilterEngine) return;
  window.__hshsFilterEngine = true;

  var FILTERS = {
    original: 'none',
    film: 'contrast(1.12) saturate(0.82) sepia(0.22) brightness(1.02)',
    cool: 'saturate(0.95) hue-rotate(18deg) brightness(1.04) contrast(1.05)',
    warm: 'sepia(0.28) saturate(1.2) brightness(1.05) contrast(1.04)',
    mono: 'grayscale(1) contrast(1.15) brightness(1.02)',
    fade: 'contrast(0.88) brightness(1.1) saturate(0.65)',
    punch: 'contrast(1.28) saturate(1.45) brightness(1.03)',
    night: 'brightness(0.78) contrast(1.22) saturate(0.7) hue-rotate(-12deg)',
    campus: 'contrast(1.1) saturate(1.15) brightness(1.04) sepia(0.08)',
    gold: 'sepia(0.45) saturate(1.35) contrast(1.08) brightness(1.06)',
    sky: 'hue-rotate(-25deg) saturate(1.2) contrast(1.08) brightness(1.05)',
    vivid: 'saturate(1.6) contrast(1.18) brightness(1.02)'
  };

  var ORDER = ['original','film','cool','warm','mono','fade','punch','night','campus','gold','sky','vivid'];
  var LABELS = {
    original:'Original', film:'Film', cool:'Cool', warm:'Warm', mono:'Mono', fade:'Fade',
    punch:'Punch', night:'Night', campus:'Campus', gold:'Gold', sky:'Sky', vivid:'Vivid'
  };

  var state = {
    filter: 'original',
    video: null,
    canvas: null,
    ctx: null,
    raf: 0,
    recording: false,
    trayBuilt: false
  };

  function css(id) { return FILTERS[id] || 'none'; }

  function findVideo() {
    return document.getElementById('hshsCamVideo') ||
      document.querySelector('.hshs-cam-stage video, .hshs-upload-cam video');
  }

  function findStage() {
    return document.querySelector('.hshs-cam-stage, .hshs-upload-cam');
  }

  function applyPreviewFilter() {
    var v = findVideo();
    if (!v) return;
    state.video = v;
    v.style.filter = css(state.filter);
    v.style.opacity = '1';
    v.style.position = '';
    v.style.width = '';
    v.style.height = '';
    v.style.left = '';
    v.style.pointerEvents = '';
    v.classList.remove('hshs-cam-raw');
  }

  function ensureTray() {
    var cam = document.querySelector('.hshs-cam') || findStage();
    if (!cam) return;
    var tray = cam.querySelector('.hshs-live-filters');
    if (tray) {
      tray.querySelectorAll('[data-live-filter]').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-live-filter') === state.filter);
      });
      return;
    }
    tray = document.createElement('div');
    tray.className = 'hshs-live-filters';
    tray.setAttribute('aria-label', 'Filters');
    ORDER.forEach(function (id) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hshs-live-filter' + (state.filter === id ? ' is-on' : '');
      btn.setAttribute('data-live-filter', id);
      btn.innerHTML = '<span class="hshs-live-swatch" style="filter:' + css(id) + '"></span><em>' + (LABELS[id] || id) + '</em>';
      tray.appendChild(btn);
    });
    var bottom = cam.querySelector('.hshs-cam-bottom');
    if (bottom && bottom.parentNode) bottom.parentNode.insertBefore(tray, bottom);
    else cam.appendChild(tray);
    state.trayBuilt = true;
  }

  function flashName() {
    var stage = findStage();
    if (!stage) return;
    var name = document.getElementById('hshsFilterName');
    if (!name) {
      name = document.createElement('div');
      name.id = 'hshsFilterName';
      name.className = 'hshs-filter-name';
      stage.appendChild(name);
    }
    name.textContent = LABELS[state.filter] || state.filter;
    name.classList.add('is-flash');
    clearTimeout(flashName._t);
    flashName._t = setTimeout(function () { name.classList.remove('is-flash'); }, 650);
  }

  function setFilter(id) {
    if (!FILTERS[id]) return;
    state.filter = id;
    applyPreviewFilter();
    ensureTray();
    flashName();
  }

  function getBakeCanvas() {
    if (!state.canvas) {
      state.canvas = document.createElement('canvas');
      state.canvas.width = 720;
      state.canvas.height = 1280;
      state.ctx = state.canvas.getContext('2d', { alpha: false });
    }
    return state.canvas;
  }

  function drawCover(ctx, video, cw, ch) {
    var vw = video.videoWidth || cw;
    var vh = video.videoHeight || ch;
    if (!vw || !vh) return;
    var scale = Math.max(cw / vw, ch / vh);
    var dw = vw * scale;
    var dh = vh * scale;
    var dx = (cw - dw) / 2;
    var dy = (ch - dh) / 2;
    ctx.filter = css(state.filter);
    ctx.drawImage(video, dx, dy, dw, dh);
  }

  function startBakeLoop() {
    stopBakeLoop();
    var video = findVideo();
    if (!video) return;
    var canvas = getBakeCanvas();
    function tick() {
      if (!state.recording) return;
      var w = video.videoWidth || 720;
      var h = video.videoHeight || 1280;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      try {
        state.ctx.fillStyle = '#000';
        state.ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawCover(state.ctx, video, canvas.width, canvas.height);
      } catch (e) {}
      state.raf = requestAnimationFrame(tick);
    }
    state.recording = true;
    state.raf = requestAnimationFrame(tick);
  }

  function stopBakeLoop() {
    state.recording = false;
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
  }

  var NativeMR = window.MediaRecorder;
  if (NativeMR && !NativeMR.__hshsPatched) {
    function PatchedMR(stream, opts) {
      var use = stream;
      var video = findVideo();
      var camStream = video && video.srcObject;
      if (camStream && stream === camStream && typeof HTMLCanvasElement !== 'undefined') {
        try {
          startBakeLoop();
          var canvas = getBakeCanvas();
          if (video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            drawCover(state.ctx, video, canvas.width, canvas.height);
          }
          var cs = canvas.captureStream(30);
          stream.getAudioTracks().forEach(function (t) {
            try { cs.addTrack(t); } catch (e) {}
          });
          use = cs;
          var rec = new NativeMR(use, opts);
          var origStop = rec.stop.bind(rec);
          rec.stop = function () {
            try { origStop(); } finally { stopBakeLoop(); }
          };
          return rec;
        } catch (e) {
          stopBakeLoop();
        }
      }
      return new NativeMR(use, opts);
    }
    PatchedMR.prototype = NativeMR.prototype;
    PatchedMR.isTypeSupported = NativeMR.isTypeSupported.bind(NativeMR);
    PatchedMR.__hshsPatched = true;
    window.MediaRecorder = PatchedMR;
  }

  document.addEventListener('click', function (e) {
    var live = e.target.closest('[data-live-filter]');
    if (live) {
      e.preventDefault();
      e.stopPropagation();
      setFilter(live.getAttribute('data-live-filter'));
      return;
    }
    var sheet = e.target.closest('[data-filter]');
    if (sheet) {
      setFilter(sheet.getAttribute('data-filter'));
      return;
    }
    if (e.target.closest('[data-act="filter"]')) {
      var i = ORDER.indexOf(state.filter);
      setFilter(ORDER[(i + 1) % ORDER.length]);
    }
  }, true);

  function softAttach() {
    if (!document.body.classList.contains('studio-open') &&
        !document.body.classList.contains('upload-open')) {
      stopBakeLoop();
      return;
    }
    var v = findVideo();
    if (!v || !v.srcObject) return;
    applyPreviewFilter();
    ensureTray();
  }

  var t = null;
  var obs = new MutationObserver(function () {
    clearTimeout(t);
    t = setTimeout(softAttach, 120);
  });
  obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  setInterval(softAttach, 2000);

  window.__hshsSetLiveFilter = setFilter;
  window.__hshsGetLiveFilter = function () { return state.filter; };
})();
