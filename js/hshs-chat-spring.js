(function () {
  if (window.__hshsChatSpring) return;
  window.__hshsChatSpring = true;

  function $(id) { return document.getElementById(id); }

  function toastSoon(msg) {
    var el = $('hshsChatToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hshsChatToast';
      el.className = 'hshs-chat-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg || 'Coming soon';
    el.classList.add('is-on');
    clearTimeout(toastSoon._t);
    toastSoon._t = setTimeout(function () { el.classList.remove('is-on'); }, 1600);
  }

  function bind() {
    var btn = $('hshsMicBtn');
    if (!btn || btn.dataset.springBound === '1') return;
    btn.dataset.springBound = '1';
    btn.setAttribute('title', 'Coming Soon');
    btn.setAttribute('aria-label', 'Voice note, coming soon');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toastSoon('Coming soon');
    });
    var bar = $('hshsRecordBar');
    if (bar) {
      bar.hidden = true;
      bar.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('hshs:page', bind);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
