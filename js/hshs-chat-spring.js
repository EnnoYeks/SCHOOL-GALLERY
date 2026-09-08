(function () {
  if (window.__hshsChatSpring) return;
  window.__hshsChatSpring = true;

  function $(id) { return document.getElementById(id); }
  function springScale(el, from, to) {
    if (!el || !window.HshsSpring) return;
    window.HshsSpring.animate({
      from: from, to: to, k: 280, c: 18, m: 1,
      apply: function (s) { el.style.transform = 'scale(' + s + ')'; },
      done: function () { if (to === 1) el.style.transform = ''; }
    });
  }
  function bind() {
    var btn = $('hshsMicBtn');
    if (!btn || btn.dataset.springBound === '1') return;
    btn.dataset.springBound = '1';
    btn.addEventListener('pointerdown', function () { springScale(btn, 1, 1.18); });
    btn.addEventListener('pointerup', function () { springScale(btn, 1.18, 1); });
    btn.addEventListener('pointercancel', function () { springScale(btn, 1.18, 1); });
  }
  document.addEventListener('hshs:page', bind);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
