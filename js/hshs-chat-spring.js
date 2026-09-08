(function () {
  if (window.__hshsChatSpring) return;
  window.__hshsChatSpring = true;

  var hold = { on: false, start: 0, startX: 0, startY: 0, cancelled: false, sendUp: false, timer: null, raf: 0, levels: [] };

  function $(id) { return document.getElementById(id); }

  function fmt(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function drawWave() {
    var canvas = $('hshsWaveCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var n = 28;
    var t = Date.now() / 180;
    ctx.fillStyle = '#93c5fd';
    for (var i = 0; i < n; i++) {
      var live = hold.levels[hold.levels.length - n + i] || (0.25 + 0.55 * Math.abs(Math.sin(t + i * 0.45)));
      var bh = Math.max(4, live * (h - 8));
      var x = 4 + i * ((w - 8) / n);
      ctx.fillRect(x, (h - bh) / 2, 3, bh);
    }
  }

  function pulseLevels() {
    if (!hold.on) return;
    hold.levels.push(0.2 + Math.random() * 0.8);
    if (hold.levels.length > 64) hold.levels.shift();
    drawWave();
    hold.raf = requestAnimationFrame(pulseLevels);
  }

  function setUi(on) {
    var form = $('hshsThreadForm');
    var wrap = $('hshsComposeWrap');
    var bar = $('hshsRecordBar');
    var btn = $('hshsMicBtn');
    if (form) form.classList.toggle('is-recording', on);
    if (wrap) wrap.hidden = !!on;
    if (bar) {
      bar.hidden = !on;
      bar.classList.toggle('is-on', on);
      bar.classList.toggle('is-cancel', false);
      bar.style.opacity = '1';
    }
    if (btn) btn.classList.toggle('is-rec', on);
    if (on) {
      if ($('hshsRecTime')) $('hshsRecTime').textContent = '0:00';
      clearInterval(hold.timer);
      hold.start = Date.now();
      hold.levels = [];
      hold.timer = setInterval(function () {
        if ($('hshsRecTime')) $('hshsRecTime').textContent = fmt(Date.now() - hold.start);
      }, 200);
      cancelAnimationFrame(hold.raf);
      hold.raf = requestAnimationFrame(pulseLevels);
      if (typeof window.__hshsChatBeginRec === 'function') window.__hshsChatBeginRec();
    } else {
      clearInterval(hold.timer);
      cancelAnimationFrame(hold.raf);
    }
  }

  function finish(send) {
    var ms = Date.now() - hold.start;
    setUi(false);
    if (typeof window.__hshsChatEndRec === 'function') {
      window.__hshsChatEndRec(!!send && !hold.cancelled, ms);
    }
  }

  function bind() {
    var btn = $('hshsMicBtn');
    if (!btn || btn.dataset.springBound === '1') return;
    btn.dataset.springBound = '1';
    btn.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      e.preventDefault();
      hold.on = true;
      hold.cancelled = false;
      hold.sendUp = false;
      hold.startX = e.clientX;
      hold.startY = e.clientY;
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      setUi(true);
    });
    btn.addEventListener('pointermove', function (e) {
      if (!hold.on) return;
      hold.cancelled = e.clientX < hold.startX - 64;
      hold.sendUp = e.clientY < hold.startY - 56;
      var bar = $('hshsRecordBar');
      if (bar) {
        bar.classList.toggle('is-cancel', hold.cancelled);
        bar.style.opacity = hold.cancelled ? '0.45' : '1';
      }
    });
    function up() {
      if (!hold.on) return;
      hold.on = false;
      finish(!hold.cancelled);
    }
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);

    var cancel = $('hshsRecCancel');
    if (cancel && !cancel.dataset.springBound) {
      cancel.dataset.springBound = '1';
      cancel.onclick = function () {
        if (!$('hshsRecordBar') || $('hshsRecordBar').hidden) return;
        hold.cancelled = true;
        hold.on = false;
        finish(false);
      };
    }
    var send = $('hshsRecSend');
    if (send && !send.dataset.springBound) {
      send.dataset.springBound = '1';
      send.onclick = function () {
        if (!$('hshsRecordBar') || $('hshsRecordBar').hidden) return;
        hold.cancelled = false;
        hold.on = false;
        finish(true);
      };
    }
  }

  document.addEventListener('hshs:page', bind);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
