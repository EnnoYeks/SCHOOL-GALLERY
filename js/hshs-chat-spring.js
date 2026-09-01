(function () {
  if (window.__hshsChatSpring) return;
  window.__hshsChatSpring = true;

  var hold = { on: false, start: 0, startX: 0, cancelled: false, timer: null };

  function $(id) { return document.getElementById(id); }
  function ensureBar() {
    if ($('hshsRecBar')) return $('hshsRecBar');
    var form = $('hshsThreadForm');
    if (!form) return null;
    var bar = document.createElement('div');
    bar.id = 'hshsRecBar';
    bar.className = 'hshs-rec-bar';
    bar.innerHTML = '<span class="hshs-rec-dot"></span><span class="hshs-rec-time" id="hshsRecTime">0:00</span><span class="hshs-rec-slide">Slide left to cancel</span>';
    form.appendChild(bar);
    return bar;
  }
  function fmt(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return '0:' + String(s).padStart(2, '0');
  }
  function springY(el, from, to) {
    if (!el || !window.HshsSpring) return;
    window.HshsSpring.animate({
      from: from, to: to, k: 240, c: 18, m: 1,
      apply: function (y) { el.style.transform = 'translateY(' + y + 'px)'; },
      done: function () { if (!to) el.style.transform = ''; }
    });
  }
  function springScale(el, from, to) {
    if (!el || !window.HshsSpring) return;
    window.HshsSpring.animate({
      from: from, to: to, k: 280, c: 18, m: 1,
      apply: function (s) { el.style.transform = 'scale(' + s + ')'; },
      done: function () { if (to === 1) el.style.transform = ''; }
    });
  }
  function tapMic(btn) {
    if (typeof window.__hshsChatBeginRec === 'function' && !hold.closing) {
      window.__hshsChatBeginRec();
      return;
    }
    if (typeof window.__hshsChatEndRec === 'function' && hold.closing) {
      window.__hshsChatEndRec(!hold.cancelled);
      return;
    }
    if (typeof btn.onclick === 'function') btn.onclick();
  }
  function setUi(on) {
    var form = $('hshsThreadForm');
    var bar = ensureBar();
    var btn = $('hshsVoiceBtn');
    if (form) form.classList.toggle('is-recording', on);
    if (bar) {
      bar.classList.toggle('is-on', on);
      springY(bar, on ? 16 : 0, on ? 0 : 12);
    }
    if (btn) {
      btn.classList.toggle('is-rec', on);
      springScale(btn, on ? 1 : 1.2, on ? 1.2 : 1);
    }
    if (on) {
      if ($('hshsRecTime')) $('hshsRecTime').textContent = '0:00';
      clearInterval(hold.timer);
      hold.start = Date.now();
      hold.timer = setInterval(function () {
        if ($('hshsRecTime')) $('hshsRecTime').textContent = fmt(Date.now() - hold.start);
      }, 200);
    } else {
      clearInterval(hold.timer);
    }
  }
  function bind() {
    var btn = $('hshsVoiceBtn');
    if (!btn || btn.dataset.springBound === '1') return;
    btn.dataset.springBound = '1';
    ensureBar();
    btn.addEventListener('pointerdown', function (e) {
      if (e.button && e.button !== 0) return;
      e.preventDefault();
      hold.on = true;
      hold.closing = false;
      hold.cancelled = false;
      hold.startX = e.clientX;
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      setUi(true);
      tapMic(btn);
    });
    btn.addEventListener('pointermove', function (e) {
      if (!hold.on) return;
      hold.cancelled = e.clientX < hold.startX - 72;
      var bar = $('hshsRecBar');
      if (bar) bar.style.opacity = hold.cancelled ? '0.4' : '1';
    });
    function up() {
      if (!hold.on) return;
      hold.on = false;
      hold.closing = true;
      setUi(false);
      tapMic(btn);
    }
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
  }
  document.addEventListener('hshs:page', bind);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
