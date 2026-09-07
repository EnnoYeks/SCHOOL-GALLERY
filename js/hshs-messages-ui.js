(function(){
  'use strict';
  if (window.__hshsMessagesUi) return;
  var base = (location.pathname.indexOf('/index/') !== -1) ? '../' : '';
  var v = '260908pk6';
  function load(src) {
    return fetch(src).then(function(r){ return r.text(); });
  }
  Promise.all([
    load(base + 'js/hshs-messages-ui.p1.js?v=' + v),
    load(base + 'js/hshs-messages-ui.p2.js?v=' + v)
  ]).then(function(parts){
    var s = document.createElement('script');
    s.textContent = parts[0] + parts[1];
    document.head.appendChild(s);
  }).catch(function(err){
    console.error('HSHS messages-ui load failed', err);
  });
})();
