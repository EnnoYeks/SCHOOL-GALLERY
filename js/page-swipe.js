(function () {
  if (window.__hshsPageSwipe) return;
  window.__hshsPageSwipe = true;

  var ORDER = [
    'index.html', 'buzz.html', 'gallery.html', 'photos.html', 'videos.html',
    'spotlight.html', 'trending.html', 'polls.html', 'memories.html', 'chat.html'
  ];
  var lastFile = fileOf();
  var pendingDir = 0;
  var driver = null;

  function fileOf(href) {
    var path = href || location.pathname;
    try { path = new URL(path, location.href).pathname; } catch (e) {}
    var f = (path.split('/').pop() || 'index.html').toLowerCase();
    if (!f || f === 'index.html') return 'index.html';
    if (f === 'clips.html' || f === 'shorts.html') return 'buzz.html';
    if (f === 'contact.html') return 'contat.html';
    return f;
  }
  function idx(file) {
    var i = ORDER.indexOf(file);
    return i < 0 ? 0 : i;
  }
  function deckOn() {
    return !!(document.getElementById('hshs-swipe-stage') && window.matchMedia('(max-width: 1024px)').matches);
  }
  function playEnter(dir) {
    var page = document.getElementById('hshs-page');
    if (!page || !dir) return;
    if (deckOn()) {
      page.style.transform = '';
      return;
    }
    var from = dir > 0 ? 16 : -16;
    if (driver) driver.stop();
    if (!window.HshsSpring) {
      page.classList.add(dir > 0 ? 'hshs-page-in-right' : 'hshs-page-in-left');
      return;
    }
    driver = window.HshsSpring.animate({
      from: from,
      to: 0,
      k: 160,
      c: 26,
      m: 1,
      apply: function (x) { page.style.transform = 'translateX(' + x + '%)'; },
      done: function () { page.style.transform = ''; }
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var next = fileOf(a.href);
    var prev = fileOf();
    if (next === prev) return;
    pendingDir = idx(next) >= idx(prev) ? 1 : -1;
  }, true);

  document.addEventListener('hshs:page', function () {
    var now = fileOf();
    var dir = pendingDir || (idx(now) >= idx(lastFile) ? 1 : -1);
    if (now === lastFile) dir = pendingDir;
    playEnter(dir);
    lastFile = now;
    pendingDir = 0;
    if (window.__hshsStagger) window.__hshsStagger(document.getElementById('hshs-page') || document);
  });
})();
