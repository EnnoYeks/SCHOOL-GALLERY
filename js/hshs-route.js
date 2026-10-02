(function (g) {
  'use strict';
  var ALIAS = { vibe: 'buzz', clips: 'buzz', shorts: 'buzz', studio: 'videos', contat: 'contact', '': 'home', index: 'home', 'index.html': 'home' };
  function name() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase().replace(/\.html$/, '');
    return ALIAS[file] || file || 'home';
  }
  function is(page) {
    var want = ALIAS[page] || page;
    if (name() === want) return true;
    return document.documentElement.getAttribute('data-hshs-page') === want;
  }
  function reveal() {
    if (typeof g.__hshsRevealPage === 'function') g.__hshsRevealPage();
    document.documentElement.classList.add('hshs-ready');
    document.documentElement.classList.remove('hshs-booting');
  }
  g.HshsRoute = { name: name, is: is, reveal: reveal };
})(window);
