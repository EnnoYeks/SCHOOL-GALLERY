(function () {
  if (window.__hshsPageSwipe) return;
  window.__hshsPageSwipe = true;

  var ORDER = [
    'index.html', 'gallery.html', 'spotlight.html', 'buzz.html',
    'photos.html', 'videos.html', 'trending.html', 'polls.html',
    'memories.html', 'chat.html'
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
  function addCss() {
    if (document.getElementById('hshs-page-swipe-css')) return;
    var guess = Array.from(document.querySelectorAll('script[src]'))
      .map(function (s) { return s.getAttribute('src') || ''; })
      .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
    var href = guess
      ? guess.replace(/js\/navigation\.js.*$/, 'css/page-swipe.css')
      : (location.pathname.indexOf('/index/') !== -1 ? '../css/page-swipe.css' : 'css/page-swipe.css');
    var link = document.createElement('link');
    link.id = 'hshs-page-swipe-css';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  function hints() {
    if (document.querySelector('.hshs-swipe-hint')) return;
    ['left', 'right'].forEach(function (side) {
      var el = document.createElement('div');
      el.className = 'hshs-swipe-hint is-' + side;
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    });
  }
  function flashHint(dir) {
    var side = dir > 0 ? 'right' : 'left';
    var el = document.querySelector('.hshs-swipe-hint.is-' + side);
    if (!el) return;
    el.classList.add('is-on');
    setTimeout(function () { el.classList.remove('is-on'); }, 280);
  }
  function playEnter(dir) {
    var page = document.getElementById('hshs-page');
    if (!page || !dir) return;
    flashHint(dir);
    page.classList.remove('hshs-page-in-left', 'hshs-page-in-right');
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

  function boot() {
    addCss();
    hints();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
