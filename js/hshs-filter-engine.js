/**
 * HSHS Studio · real-time canvas filters
 * Upgrades live camera: preview + photos + recorded video bake in the selected filter.
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

  var FILTER_ORDER = ['original','film','cool','warm','mono','fade','punch','night','campus','gold','sky','vivid'];
  var FILTER_LABELS = {
    original:'Original', film:'Film', cool:'Cool', warm:'Warm', mono:'Mono', fade:'Fade',
    punch:'Punch', night:'Night', campus:'Campus', gold:'Gold', sky:'Sky', vivid:'Vivid'
  };

  var state = {
    filter: 'original',
    raf: 0,
    video: null,
    canvas: null,
    ctx: null,
    stream: null,
    tray: null
  };

  function css(id) { return FILTERS[id] || 'none'; }

  function stopLoop() {
    if (state.raf) { cancelAnimationFrame(state.raf); state.raf = 0; }
  }

  function draw() {
    if (!state.video || !state.ctx || !state.canvas) return;
    var v = state.video;
    if (v.videoWidth && (state.canvas.width !== v.videoWidth || state.canvas.height !== v.videoHeight)) {
      state.canvas.width = v.videoWidth;
      state.canvas.height = v.videoHeight;
    }
    if (!state.canvas.width) return;
    try {
      state.ctx.filter = css(state.filter);
      state.ctx.drawImage(v, 0, 0, state.canvas.width, state.canvas.height);
    } catch (e) {}
  }

  function loop() {
    draw();
    state.raf = requestAnimationFrame(loop);
  }

  function ensureTray(parent) {
    var existing = parent.querySelector('.hshs-live-filters');
    if (existing) {
      state.tray = existing;
      return existing;
    }
    var tray = document.createElement('div');
    tray.className = 'hshs-live-filters';
    FILTER_ORDER.forEach(function (id) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hshs-live-filter' + (state.filter === id ? ' is-on' : '');
      btn.setAttribute('data-live-filter', id);
      btn.innerHTML = '<span class="hshs-live-swatch" style="filter:' + css(id) + '"></span><em>' + (FILTER_LABELS[id] || id) + '</em>';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setFilter(id);
      };
      tray.appendChild(btn);
    });
    parent.appendChild(tray);
    state.tray = tray;
    return tray;
  }

  function setFilter(id) {
    state.filter = id || 'original';
    if (state.tray) {
      state.tray.querySelectorAll('[data-live-filter]').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-live-filter') === state.filter);
      });
    }
    var name = document.getElementById('hshsFilterName');
    if (!name) {
      var stage = document.querySelector('.hshs-cam-stage');
      if (stage) {
        name = document.createElement('div');
        name.id = 'hshsFilterName';
        name.className = 'hshs-filter-name';
        stage.appendChild(name);
      }
    }
    if (name) {
      name.textContent = FILTER_LABELS[state.filter] || state.filter;
      name.classList.add('is-flash');
      clearTimeout(setFilter._t);
      setFilter._t = setTimeout(function () { name.classList.remove('is-flash'); }, 700);
    }
  }

  function upgradeCamera() {
    var stage = document.querySelector('.hshs-cam-stage, .hshs-upload-cam');
    if (!stage) return false;

    var video = stage.querySelector('video');
    if (!video || !video.srcObject) return false;

    var canvas = stage.querySelector('#hshsCamCanvas');
    if (canvas && state.video === video && state.raf) {
      ensureTray(stage.parentElement || stage);
      return true;
    }

    stopLoop();
    state.stream = video.srcObject;
    state.video = video;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'hshsCamCanvas';
      canvas.className = 'hshs-cam-canvas';
      stage.appendChild(canvas);
    }
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d', { alpha: false });

    video.classList.add('hshs-cam-raw');
    video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px';

    function ready() {
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      stopLoop();
      loop();
    }
    if (video.videoWidth) ready();
    else video.onloadedmetadata = ready;

    ensureTray(stage.parentElement || document.querySelector('.hshs-cam') || stage);

    if (!document.getElementById('hshsFilterName')) {
      var n = document.createElement('div');
      n.id = 'hshsFilterName';
      n.className = 'hshs-filter-name';
      stage.appendChild(n);
    }

    return true;
  }

  var NativeMR = window.MediaRecorder;
  if (NativeMR && !NativeMR.__hshsPatched) {
    function PatchedMR(stream, opts) {
      var use = stream;
      if (state.canvas && state.stream && stream === state.stream && typeof state.canvas.captureStream === 'function') {
        try {
          draw();
          var cs = state.canvas.captureStream(30);
          state.stream.getAudioTracks().forEach(function (t) {
            try { cs.addTrack(t); } catch (e) {}
          });
          use = cs;
        } catch (e) {}
      }
      return new NativeMR(use, opts);
    }
    PatchedMR.prototype = NativeMR.prototype;
    PatchedMR.isTypeSupported = NativeMR.isTypeSupported.bind(NativeMR);
    PatchedMR.__hshsPatched = true;
    window.MediaRecorder = PatchedMR;
  }

  document.addEventListener('click', function (e) {
    var filterBtn = e.target.closest('[data-filter], [data-live-filter], [data-act="filter"]');
    if (filterBtn) {
      var id = filterBtn.getAttribute('data-live-filter') || filterBtn.getAttribute('data-filter');
      if (id) setFilter(id);
      else if (filterBtn.getAttribute('data-act') === 'filter') {
        var i = FILTER_ORDER.indexOf(state.filter);
        setFilter(FILTER_ORDER[(i + 1) % FILTER_ORDER.length]);
      }
    }
  }, true);

  var obs = new MutationObserver(function () {
    if (document.body.classList.contains('studio-open') || document.body.classList.contains('upload-open')) {
      upgradeCamera();
    } else {
      stopLoop();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });

  setInterval(function () {
    if (document.body.classList.contains('studio-open') || document.body.classList.contains('upload-open')) {
      upgradeCamera();
    }
  }, 800);

  window.__hshsSetLiveFilter = setFilter;
  window.__hshsGetLiveFilter = function () { return state.filter; };
})();
