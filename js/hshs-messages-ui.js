(function(){
  'use strict';
  if (window.__hshsMessagesUi) return;
  var base = (location.pathname.indexOf('/index/') !== -1) ? '../' : '';
  var v = '260908pk6';
  Promise.all([0,1,2].map(function(i){
    return fetch(base + 'js/hshs-messages-ui.c' + i + '.js?v=' + v).then(function(r){ return r.text(); });
  })).then(function(parts){
    var s = document.createElement('script');
    s.textContent = parts.join('');
    document.head.appendChild(s);
  }).catch(function(e){ console.error('messages-ui', e); });
})();
