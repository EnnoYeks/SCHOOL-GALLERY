(function () {
  if (window.__hshsMotion) return;
  window.__hshsMotion = true;

  var SELECTOR = [
    '.photo-card',
    '.post-card',
    '.stat-card',
    '.featured-grid > *',
    '.masonry-grid > *',
    '#galleryFeed > *',
    '.trending-list > *',
    '.upcoming-events > *',
    '.vibe-card',
    '.clip-card',
    '.poll-card',
    '.memory-card',
    '.spotlight-card'
  ].join(',');

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function addCss() {
    if (document.getElementById('hshs-motion-css')) return;
    var guess = Array.from(document.querySelectorAll('script[src]'))
      .map(function (s) { return s.getAttribute('src') || ''; })
      .find(function (s) { return s.indexOf('navigation.js') !== -1 && s.indexOf('mobile-navigation') === -1; });
    var href = guess
      ? guess.replace(/js\/navigation\.js.*$/, 'css/gallery-transitions.css')
      : (location.pathname.indexOf('/index/') !== -1 ? '../css/gallery-transitions.css' : 'css/gallery-transitions.css');
    var link = document.createElement('link');
    link.id = 'hshs-motion-css';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function stagger(root) {
    if (reduced()) return;
    var scope = root || document;
    var nodes = scope.querySelectorAll(SELECTOR);
    var i = 0;
    nodes.forEach(function (el) {
      if (el.dataset.hshsEnter === '1') return;
      el.dataset.hshsEnter = '1';
      el.style.setProperty('--i', String(Math.min(i, 16)));
      el.classList.add('hshs-enter');
      i += 1;
    });
  }

  window.__hshsStagger = stagger;

  var timer = 0;
  function schedule(root) {
    clearTimeout(timer);
    timer = setTimeout(function () { stagger(root); }, 30);
  }

  function boot() {
    addCss();
    stagger(document);
    document.addEventListener('hshs:page', function () {
      schedule(document.getElementById('hshs-page') || document);
    });
    if (typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function (records) {
        for (var r = 0; r < records.length; r++) {
          if (records[r].addedNodes && records[r].addedNodes.length) {
            schedule(document.getElementById('hshs-page') || document);
            break;
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
